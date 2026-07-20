import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, ExternalLink } from "lucide-react";
import { Container } from "./container";
import { IMPACT_LABELS, formatPostedAgo, jobChips } from "@/lib/job-view";
import { getSeed, getSeedNow } from "@/lib/seed";
import type { Job } from "@/lib/types";

/**
 * The bento grid needs one hero role and four supporting ones. Picking the
 * most-viewed recent listings keeps the front page looking active without
 * needing an editorial "featured" flag in the seed.
 */
function pickFeatured(jobs: Job[]): { hero: Job; rest: Job[] } {
  // Real, live postings lead — they are the strongest thing on the board.
  // Generated listings fill the remaining slots.
  const real = jobs
    .filter((job) => job.source === "real")
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const generated = jobs
    .filter((job) => job.source !== "real")
    .sort((a, b) => b.views - a.views || b.postedAt.localeCompare(a.postedAt));
  const ranked = [...real, ...generated];

  const chosen: Job[] = [];
  const seenCompanies = new Set<string>();

  // One per company, so the grid does not show five roles at one employer.
  for (const job of ranked) {
    if (seenCompanies.has(job.company)) continue;
    seenCompanies.add(job.company);
    chosen.push(job);
    if (chosen.length === 5) break;
  }

  return { hero: chosen[0], rest: chosen.slice(1) };
}

export function FeaturedRoles() {
  const seed = getSeed();
  const now = getSeedNow();
  const { hero, rest } = pickFeatured(seed.jobs);

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
            View all {seed.jobs.length.toLocaleString()} jobs
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <article className="group relative overflow-hidden rounded-xl border border-transparent bg-surface-container-lowest p-stack-lg shadow-card transition-all hover:border-secondary md:col-span-8">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex gap-stack-md">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container p-2">
                  <Image
                    src={hero.companyLogo}
                    alt={hero.companyLogoAlt}
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
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
              <div className="flex flex-col items-end gap-2">
                {hero.source === "real" && (
                  <span className="flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-label-sm font-semibold text-on-secondary">
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live posting
                  </span>
                )}
                <span className="climate-pulse rounded-full bg-secondary-container/50 px-3 py-1 text-label-sm text-secondary">
                  {IMPACT_LABELS[hero.impactArea]}
                </span>
              </div>
            </div>

            <p className="mb-stack-lg max-w-xl text-body-md text-on-surface-variant">
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

          {rest.map((job) => (
            <article
              key={job.id}
              className="group relative rounded-xl border border-transparent bg-surface-container-lowest p-stack-md shadow-card transition-all hover:border-secondary md:col-span-4"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container p-1.5">
                <Image
                  src={job.companyLogo}
                  alt={job.companyLogoAlt}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <h3 className="mb-1 text-body-lg font-bold text-secondary group-hover:underline">
                <Link
                  href={`/jobs/${job.id}`}
                  className="after:absolute after:inset-0 focus:outline-none"
                >
                  {job.title}
                </Link>
              </h3>
              <p className="mb-4 text-body-sm text-on-surface-variant">
                {job.company}
                {job.source === "real" && (
                  <span className="ml-2 rounded bg-secondary/10 px-1.5 py-0.5 text-[10px] font-bold text-secondary uppercase">
                    Live
                  </span>
                )}
              </p>
              <div className="mb-stack-md flex flex-wrap gap-2">
                <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant uppercase">
                  {job.city}
                </span>
                <span className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold text-on-surface-variant uppercase">
                  {job.remote ? "Remote" : "On-site"}
                </span>
              </div>
              <span className="flex items-center gap-1 text-label-md text-secondary transition-transform group-hover:translate-x-1">
                Details
                <ChevronRight className="h-4 w-4" />
              </span>
            </article>
          ))}
        </div>

        <div className="mt-stack-lg flex justify-center md:hidden">
          <Link
            href="/browse"
            className="rounded-full bg-surface-container-high px-8 py-3 text-label-md text-secondary"
          >
            View all jobs
          </Link>
        </div>
      </Container>
    </section>
  );
}
