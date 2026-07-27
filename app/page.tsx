import { connection } from "next/server";
import { FeaturedRoles } from "@/components/featured-roles";
import { Hero } from "@/components/hero";
import { listJobs } from "@/lib/api";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhyClimateTech } from "@/components/why-climate-tech";

export default async function Home() {
  // Listings are live data — render at request time, never at build.
  await connection();
  // One fetch feeds the hero count, the featured grid, and the company strip.
  // Sorted by views so the pool already leads with what people are opening.
  const { jobs, total } = await listJobs({ sort: "views", perPage: 50 });
  const countries = [...new Set(jobs.map((job) => job.country))].sort();
  return (
    <>
      <SiteHeader />
      <main>
        <Hero countries={countries} />
        <FeaturedRoles jobs={jobs} totalJobs={total} />
        <WhyClimateTech />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
