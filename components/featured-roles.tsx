import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Container } from "./container";
import { JobCard } from "@/components/job-card";
import { formatPostedAgo, jobChips } from "@/lib/job-view";
import type { Job } from "@/lib/types";

/**
 * The bento grid needs one hero role, six supporting ones, and five list rows. Picking the
 * most-viewed recent listings keeps the front page looking active without
 * needing an editorial "featured" flag.
 */
function pickFeatured(jobs: Job[]): { hero: Job; rest: Job[] } {
  // Real, live postings lead — they are the strongest thing on the board.
  const real = jobs
    .filter((job) => job.source === "real")
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const generated = jobs
    .filter((job) => job.source !== "real")
    .sort((a, b) => b.views - a.views || b.postedAt.localeCompare(a.postedAt));
  const ranked = [...real, ...generated];

  const chosen: Job[] = [];
  const seenCompanies = new Set<string>();

  // One per company, so the grid does not show seven roles at one employer.
  for (const job of ranked) {
    if (seenCompanies.has(job.company)) continue;
    seenCompanies.add(job.company);
    chosen.push(job);
    if (chosen.length === 12) break;
  }

  // Not enough companies to fill the grid — allow repeats rather than gaps.
  if (chosen.length < 12) {
    for (const job of ranked) {
      if (chosen.includes(job)) continue;
      chosen.push(job);
      if (chosen.length === 12) break;
    }
  }

  return { hero: chosen[0], rest: chosen.slice(1) };
}

/** Compact horizontal card used beside and below the hero. */
function CompactRoleCard({ job }: { job: Job }) {
  return (
    <article className="group relative flex gap-4 rounded-xl border border-transparent bg-surface-container-lowest p-stack-md shadow-card transition-all hover:border-secondary">
      <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container">
        <Image
          src={job.companyLogo}
          alt={job.companyLogoAlt}
          width={48}
          height={48}
          className="h-full w-full object-cover"
        />
      </div>
      <div className="min-w-0">
        <h3 className="mb-0.5 line-clamp-2 text-body-md font-bold text-secondary group-hover:underline">
          <Link
            href={`/jobs/${job.id}`}
            className="after:absolute after:inset-0 focus:outline-none"
          >
            {job.title}
          </Link>
        </h3>
        <p className="mb-2 truncate text-body-sm text-on-surface-variant">
          {job.company} • {job.locationDisplay}
        </p>
        <p className="flex items-center gap-2 text-label-sm text-on-surface-variant">
          <span className="font-semibold text-on-surface">
            {job.salaryDisplay}
          </span>
          <span className="flex items-center gap-0.5 text-secondary transition-transform group-hover:translate-x-1">
            Details
            <ChevronRight className="h-3.5 w-3.5" />
          </span>
        </p>
      </div>
    </article>
  );
}

export function FeaturedRoles({
  jobs,
  totalJobs,
}: {
  jobs: Job[];
  totalJobs: number;
}) {
  const now = new Date();
  const { hero, rest } = pickFeatured(jobs);

  if (!hero) return null;

  const side = rest.slice(0, 2);
  const bottom = rest.slice(2, 6);
  const rows = rest.slice(6);

  return (
    <section className="bg-surface py-stack-lg">
      <Container>
        <div className="mb-stack-lg flex items-end justify-between">
          <div>
            <h2 className="mb-2 font-display text-headline-lg text-primary">
              Featured Impact Roles
            </h2>
            <p className="text-body-md text-on-surface-variant">
              High-priority positions with direct climate impact.
            </p>
          </div>
          <Link
            className="hidden items-center gap-1 font-bold text-secondary hover:underline md:flex"
            href="/browse"
          >
            View all {totalJobs.toLocaleString()} jobs
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <article className="group relative overflow-hidden rounded-xl border-2 border-secondary/30 bg-surface-container-lowest p-stack-lg shadow-card transition-all hover:border-secondary md:col-span-8">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex gap-stack-md">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-outline-variant/40 bg-surface-container">
                  <Image
                    src={hero.companyLogo}
                    alt={hero.companyLogoAlt}
                    width={64}
                    height={64}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="mb-1 font-display text-headline-md text-secondary group-hover:underline">
                    <Link
                      href={`/jobs/${hero.id}`}
                      className="after:absolute after:inset-0 focus:outline-none"
                    >
                      {hero.title}
                    </Link>
                  </h3>
                  <p className="text-body-md font-semibold text-on-surface-variant">
                    {hero.company} • {hero.locationDisplay}
                  </p>
                </div>
              </div>
            </div>

            <p className="mb-stack-lg line-clamp-4 max-w-xl text-body-md text-on-surface-variant">
              {hero.about}
            </p>

            <div className="mb-stack-md flex flex-wrap gap-2">
              {jobChips(hero).map((chip) => (
                <span
                  key={chip}
                  className="rounded bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant"
                >
                  {chip}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-6">
              <span className="text-label-sm text-on-surface-variant">
                {formatPostedAgo(hero.postedAt, now)}
              </span>
              <span className="relative z-10 rounded-full bg-primary px-6 py-2 text-label-md text-on-primary transition-colors group-hover:bg-secondary">
                View role
              </span>
            </div>
          </article>

          <div className="flex flex-col gap-gutter md:col-span-4 [&>article]:flex-1">
            {side.map((job) => (
              <CompactRoleCard key={job.id} job={job} />
            ))}
          </div>

          <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 md:col-span-12 lg:grid-cols-4">
            {bottom.map((job) => (
              <CompactRoleCard key={job.id} job={job} />
            ))}
          </div>
        </div>

        {rows.length > 0 && (
          <div className="mt-gutter grid grid-cols-1 gap-gutter">
            {rows.map((job) => (
              <JobCard key={job.id} job={job} now={now.getTime()} />
            ))}
          </div>
        )}

        <div className="mt-stack-lg flex justify-center">
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-10 py-4 text-body-md font-bold text-on-primary shadow-raised transition-all hover:bg-secondary hover:shadow-lg active:scale-95"
          >
            View all {totalJobs.toLocaleString()} jobs
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </Container>
    </section>
  );
}
