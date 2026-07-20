"use server";

import { getJobsByPoster, getSeed } from "@/lib/seed";
import type { Application, Job, Seeker } from "@/lib/types";

export type EmployerListing = {
  id: string;
  title: string;
  locationDisplay: string;
  postedAt: string;
  views: number;
  salaryDisplay: string;
  impactArea: Job["impactArea"];
  seededApplicationCount: number;
};

export type ApplicantRow = {
  application: Application;
  seeker: Pick<Seeker, "id" | "name" | "headline" | "yearsExperience" | "email">;
  jobId: string;
  jobTitle: string;
};

export type EmployerData = {
  company: string;
  plan: string;
  listings: EmployerListing[];
  /** Seeded applications across all of this poster's listings. */
  applicants: ApplicantRow[];
  totalViews: number;
};

/**
 * Everything the employer dashboard needs, resolved on the server so the
 * 500-job catalogue and the seeker table never reach the browser.
 *
 * Locally-created listings and locally-submitted applications live in the
 * client's overlay and are merged on top of this.
 */
export async function getEmployerData(
  posterId: string,
): Promise<EmployerData | null> {
  const seed = getSeed();
  const poster = seed.posters.find((candidate) => candidate.id === posterId);
  if (!poster) return null;

  const jobs = getJobsByPoster(posterId);
  const jobIds = new Set(jobs.map((job) => job.id));
  const seekersById = new Map(seed.seekers.map((seeker) => [seeker.id, seeker]));
  const jobsById = new Map(jobs.map((job) => [job.id, job]));

  const relevant = seed.applications.filter((application) =>
    jobIds.has(application.jobId),
  );

  const perJob = new Map<string, number>();
  for (const application of relevant) {
    perJob.set(application.jobId, (perJob.get(application.jobId) ?? 0) + 1);
  }

  const applicants: ApplicantRow[] = relevant
    .map((application) => {
      const seeker = seekersById.get(application.seekerId);
      const job = jobsById.get(application.jobId);
      if (!seeker || !job) return null;
      return {
        application,
        seeker: {
          id: seeker.id,
          name: seeker.name,
          headline: seeker.headline,
          yearsExperience: seeker.yearsExperience,
          email: seeker.email,
        },
        jobId: job.id,
        jobTitle: job.title,
      };
    })
    .filter((row): row is ApplicantRow => row !== null)
    .sort((a, b) =>
      b.application.appliedAt.localeCompare(a.application.appliedAt),
    );

  const listings: EmployerListing[] = jobs
    .slice()
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt))
    .map((job) => ({
      id: job.id,
      title: job.title,
      locationDisplay: job.locationDisplay,
      postedAt: job.postedAt,
      views: job.views,
      salaryDisplay: job.salaryDisplay,
      impactArea: job.impactArea,
      seededApplicationCount: perJob.get(job.id) ?? 0,
    }));

  return {
    company: poster.company,
    plan: poster.plan,
    listings,
    applicants,
    totalViews: jobs.reduce((sum, job) => sum + job.views, 0),
  };
}
