"use server";

import { getSeed } from "@/lib/seed";
import type { Application } from "@/lib/types";

export type JobSummary = {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  locationDisplay: string;
  salaryDisplay: string;
};

export type SeekerApplications = {
  seeded: Application[];
  jobs: JobSummary[];
};

function summarise(id: string): JobSummary | null {
  const job = getSeed().jobs.find((candidate) => candidate.id === id);
  if (!job) return null;
  return {
    id: job.id,
    title: job.title,
    company: job.company,
    companyLogo: job.companyLogo,
    locationDisplay: job.locationDisplay,
    salaryDisplay: job.salaryDisplay,
  };
}

/**
 * The seeker's pre-seeded applications plus summaries for every job they have
 * applied to, seeded or local. Runs on the server so the client never needs
 * the full catalogue to render a handful of rows.
 */
export async function getSeekerApplications(
  seekerId: string,
  localJobIds: string[],
): Promise<SeekerApplications> {
  const seeded = getSeed().applications.filter(
    (application) => application.seekerId === seekerId,
  );

  const ids = new Set([
    ...seeded.map((application) => application.jobId),
    ...localJobIds,
  ]);

  const jobs = [...ids]
    .map(summarise)
    .filter((job): job is JobSummary => job !== null);

  return { seeded, jobs };
}
