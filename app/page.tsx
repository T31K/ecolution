import { Companies } from "@/components/companies";
import { FeaturedRoles } from "@/components/featured-roles";
import { Hero } from "@/components/hero";
import { Newsletter } from "@/components/newsletter";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WhyClimateTech } from "@/components/why-climate-tech";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main>
        <Hero />
        <FeaturedRoles />
        <Companies />
        <WhyClimateTech />
        <Newsletter />
      </main>
      <SiteFooter />
    </>
  );
}
