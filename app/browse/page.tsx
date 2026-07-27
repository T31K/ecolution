import type { Metadata } from "next";
import { Suspense } from "react";
import { ActiveFilterChips } from "@/components/active-filter-chips";
import { BrowseFilters } from "@/components/browse-filters";
import { BrowsePagination } from "@/components/browse-pagination";
import { Container } from "@/components/container";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SALARY_FLOOR, hasActiveFilters, parseFilters } from "@/lib/filters";
import { listJobs } from "@/lib/api";

export const metadata: Metadata = {
  title: "Browse Green Tech Jobs | Decarbon Jobs",
  description:
    "Connect with leading climate tech firms and mission-driven startups engineering a sustainable world.",
};

const PER_PAGE = 12;

type BrowsePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function BrowsePage({ searchParams }: BrowsePageProps) {
  const filters = parseFilters(await searchParams);
  const now = new Date().getTime();

  const response = await listJobs({
    search: filters.q || undefined,
    roleType: filters.roles.join(",") || undefined,
    impactArea: filters.impactAreas.join(",") || undefined,
    country: filters.countries.join(",") || undefined,
    remote: filters.remote || undefined,
    salaryMin: filters.salaryMin > SALARY_FLOOR ? filters.salaryMin : undefined,
    sort: "newest",
    page: filters.page,
    perPage: PER_PAGE,
  });

  const { jobs: items, total, page: current } = response;
  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  // Options for the location filter come from the results on screen, plus any
  // country already selected so its checkbox never vanishes mid-filter.
  const countries = [
    ...new Set([...items.map((job) => job.country), ...filters.countries]),
  ].sort();

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
