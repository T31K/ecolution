import { Companies } from "@/components/companies";
import { FeaturedRoles } from "@/components/featured-roles";
import { Hero } from "@/components/hero";
import { getSeed } from "@/lib/seed";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhyClimateTech } from "@/components/why-climate-tech";

export default function Home() {
  const seed = getSeed();
  const countries = [...new Set(seed.jobs.map((job) => job.country))].sort();
  return (
    <>
      <SiteHeader />
      <main>
        <Hero countries={countries} totalJobs={seed.jobs.length} />
        <FeaturedRoles />
        <Companies />
        <WhyClimateTech />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
