import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { CompanyJobs } from "@/components/company-jobs";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { listJobs } from "@/lib/api";
import type { Job } from "@/lib/types";

type CompanyPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * There is no companies endpoint — a company page is derived from its
 * listings. `id` is the company name slug (e.g. "too-good-to-go"), so the
 * URL works for scraped listings too, which have no poster account.
 */
function companySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function getCompanyJobs(id: string): Promise<Job[]> {
  const { jobs } = await listJobs({ perPage: 50, page: 1 });
  return jobs
    .filter(
      (job) => companySlug(job.company) === id || job.posterId === id,
    )
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export async function generateMetadata({
  params,
}: CompanyPageProps): Promise<Metadata> {
  const { id } = await params;
  const jobs = await getCompanyJobs(id);
  const company = jobs[0]?.company;

  if (!company) return { title: "Company not found | Ecolution" };

  return {
    title: `${company} — open roles | Ecolution`,
    description: `Climate tech roles open at ${company}.`,
  };
}

export default async function CompanyPage({ params }: CompanyPageProps) {
  const { id } = await params;
  const jobs = await getCompanyJobs(id);

  // Without listings there is nothing to derive the company from.
  if (jobs.length === 0) notFound();

  // A company's facts and blurb live on its listings, which all share them.
  const sample = jobs[0];
  const company = sample.company;

  // "Hiring in" grouped by continent, resolved from each job's country code.
  const CONTINENTS: Record<string, string> = {
    // Europe
    AT: "Europe", BE: "Europe", CH: "Europe", CZ: "Europe", DE: "Europe",
    DK: "Europe", ES: "Europe", FI: "Europe", FR: "Europe", GB: "Europe",
    IE: "Europe", IT: "Europe", NL: "Europe", NO: "Europe", PL: "Europe",
    PT: "Europe", SE: "Europe", UK: "Europe",
    // North America
    CA: "North America", MX: "North America", US: "North America",
    // South America
    AR: "South America", BR: "South America", CL: "South America",
    CO: "South America", PE: "South America",
    // Asia
    CN: "Asia", HK: "Asia", ID: "Asia", IN: "Asia", JP: "Asia", KR: "Asia",
    MY: "Asia", PH: "Asia", SG: "Asia", TH: "Asia", TW: "Asia", VN: "Asia",
    // Oceania
    AU: "Oceania", NZ: "Oceania",
    // Africa
    EG: "Africa", KE: "Africa", MA: "Africa", NG: "Africa", ZA: "Africa",
    // Middle East
    AE: "Middle East", IL: "Middle East", SA: "Middle East", TR: "Middle East",
  };
  const citiesByContinent = new Map<string, string[]>();
  for (const job of jobs) {
    if (!job.city) continue;
    const continent = CONTINENTS[job.country?.toUpperCase()] ?? "Elsewhere";
    const list = citiesByContinent.get(continent) ?? [];
    if (!list.includes(job.city)) list.push(job.city);
    citiesByContinent.set(continent, list);
  }
  const continents = [...citiesByContinent.entries()].sort(
    (a, b) => b[1].length - a[1].length,
  );


  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-stack-lg">
          <section className="mb-stack-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-stack-md shadow-card md:p-stack-lg">
            <div className="flex flex-col gap-stack-md md:flex-row md:items-center md:justify-between">
              <div className="flex items-center gap-stack-md">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container">
                  <Image
                    src={sample.companyLogo}
                    alt={`${company} logo`}
                    width={80}
                    height={80}
                    className="h-full w-full object-cover"
                    priority
                  />
                </div>
                <div>
                  <h1 className="font-display text-headline-lg text-primary">
                    {company}
                  </h1>
                </div>
              </div>

              <Link
                href={`/browse?q=${encodeURIComponent(company)}`}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-label-md text-on-secondary transition-all hover:brightness-110 active:scale-95"
              >
                See all {jobs.length} roles
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {sample.about && (
              <p className="mt-stack-md border-t border-outline-variant/20 pt-stack-md text-body-lg leading-relaxed text-on-surface-variant">
                {sample.about}
              </p>
            )}
          </section>

          <CompanyJobs
            jobs={jobs}
            facts={sample.companyFacts}
            continents={continents}
          />
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
