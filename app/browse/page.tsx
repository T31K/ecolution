import type { Metadata } from "next";
import { BrowseFilters } from "@/components/browse-filters";
import { BrowsePagination } from "@/components/browse-pagination";
import { Container } from "@/components/container";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { getSeed, getSeedNow } from "@/lib/seed";

export const metadata: Metadata = {
  title: "Browse Green Tech Jobs | Ecolution",
  description:
    "Connect with leading climate tech firms and mission-driven startups engineering a sustainable world.",
};

const PAGE_SIZE = 20;

export default function BrowsePage() {
  const now = getSeedNow().getTime();
  // Stage 5 replaces this with URL-param filtering; for now the newest
  // listings are shown so the page reflects real seed data end to end.
  const all = getSeed()
    .jobs.slice()
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const jobs = all.slice(0, PAGE_SIZE);

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
          <BrowseFilters />

          <section className="grow">
            <div className="mb-stack-md flex flex-col items-center justify-between gap-4 md:flex-row">
              <p className="text-body-md text-on-surface-variant">
                <span className="font-bold text-on-surface">
                  {all.length.toLocaleString()}
                </span>{" "}
                climate tech roles found
              </p>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="sort-by"
                  className="text-body-sm text-on-surface-variant"
                >
                  Sort by:
                </label>
                <select
                  id="sort-by"
                  className="cursor-pointer border-none bg-transparent text-label-md text-on-surface focus:outline-none"
                >
                  <option>Most Recent</option>
                  <option>Salary: High to Low</option>
                  <option>Impact Rating</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-stack-md">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} now={now} />
              ))}
            </div>

            <BrowsePagination
              current={1}
              totalPages={Math.ceil(all.length / PAGE_SIZE)}
            />
          </section>
        </div>
      </Container>
      <SiteFooter />
    </>
  );
}
