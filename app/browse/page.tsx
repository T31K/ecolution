import type { Metadata } from "next";
import { Suspense } from "react";
import { ActiveFilterChips } from "@/components/active-filter-chips";
import { BrowseFilters } from "@/components/browse-filters";
import { BrowsePagination } from "@/components/browse-pagination";
import { Container } from "@/components/container";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import {
  filterJobs,
  hasActiveFilters,
  paginate,
  parseFilters,
} from "@/lib/filters";
import { getSeed, getSeedNow } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Browse Green Tech Jobs | Ecolution",
  description:
    "Connect with leading climate tech firms and mission-driven startups engineering a sustainable world.",
};

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const filters = parseFilters(await searchParams);
  const now = getSeedNow().getTime();
  const seed = getSeed();

  const countries = [...new Set(seed.jobs.map((job) => job.country))].sort();

  const matched = filterJobs(seed.jobs, filters).sort((a, b) =>
    b.postedAt.localeCompare(a.postedAt),
  );
  const { items, current, totalPages, total } = paginate(matched, filters.page);
  const active = hasActiveFilters(filters);

  return (
    <>
      <SiteHeader />
      <Container className="py-stack-lg">
        <header className="mb-stack-lg">
          <h1 className="mb-4 font-display text-display-mobile text-primary md:text-display">
            Find your role in the{" "}
            <span className="text-secondary">Green Revolution</span>
          </h1>
          <p className="max-w-2xl text-body-lg text-on-surface-variant">
            Connect with leading climate tech firms and mission-driven startups
            engineering a sustainable world.
          </p>
        </header>

        <div className="flex flex-col gap-gutter lg:flex-row">
          <Suspense fallback={<div className="w-full lg:w-72" />}>
            <BrowseFilters countries={countries} />
          </Suspense>

          <section className="grow">
            <div className="mb-stack-md flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-body-md text-on-surface-variant">
                <span className="font-bold text-on-surface">
                  {total.toLocaleString()}
                </span>{" "}
                {total === 1 ? "role" : "roles"} found
              </p>
              <div className="flex items-center gap-2">
                <span className="text-body-sm text-on-surface-variant">
                  Sorted by:
                </span>
                <span className="text-label-md text-on-surface">
                  Most recent
                </span>
              </div>
            </div>

            <Suspense fallback={null}>
              <ActiveFilterChips />
            </Suspense>

            {items.length === 0 ? (
              <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-stack-lg text-center shadow-card">
                <p className="mb-2 text-body-lg font-semibold text-on-surface">
                  No roles match those filters
                </p>
                <p className="text-body-md text-on-surface-variant">
                  {active
                    ? "Try removing a filter above, or widen your salary range."
                    : "There are no listings right now."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-stack-md">
                {items.map((job) => (
                  <JobCard key={job.id} job={job} now={now} />
                ))}
              </div>
            )}

            {totalPages > 1 && (
              <Suspense fallback={null}>
                <BrowsePagination current={current} totalPages={totalPages} />
              </Suspense>
            )}
          </section>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
