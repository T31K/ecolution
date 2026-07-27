import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Briefcase, MapPin } from "lucide-react";
import { Container } from "@/components/container";
import { JobCard } from "@/components/job-card";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { IMPACT_ICONS, IMPACT_LABELS, ROLE_LABELS } from "@/lib/job-view";
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

  const now = new Date().getTime();

  // A company's facts and blurb live on its listings, which all share them.
  const sample = jobs[0];
  const company = sample.company;
  const impactArea = sample.impactArea;
  const ImpactIcon = impactArea ? IMPACT_ICONS[impactArea] : Briefcase;

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

  const roleTypes = [...new Set(jobs.map((job) => job.roleType))];
  const remoteCount = jobs.filter((job) => job.remote).length;

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
                  {impactArea && (
                    <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-secondary-container/50 px-3 py-1 text-label-sm text-on-secondary-container">
                      <ImpactIcon className="h-4 w-4" />
                      {IMPACT_LABELS[impactArea]}
                    </span>
                  )}
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

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="lg:order-2 lg:col-span-8">
              <h2 className="mb-stack-md font-display text-headline-md text-primary">
                Open roles
              </h2>
              <div className="grid grid-cols-1 gap-stack-md">
                {jobs.slice(0, 10).map((job) => (
                  <JobCard key={job.id} job={job} now={now} />
                ))}
              </div>

              {jobs.length > 10 && (
                <div className="mt-stack-md text-center">
                  <Link
                    href={`/browse?q=${encodeURIComponent(company)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-secondary px-6 py-3 text-label-md text-secondary transition-all hover:bg-secondary/5"
                  >
                    View the other {jobs.length - 10} roles
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              )}
            </div>

            <aside className="flex flex-col gap-stack-lg lg:order-1 lg:col-span-4">
              <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
                <h2 className="mb-stack-md font-display text-body-lg font-bold text-primary">
                  Company Profile
                </h2>
                <dl className="space-y-stack-md">
                  {sample.companyFacts.map((fact, index, all) => (
                    <div
                      key={fact.label}
                      className={`flex items-center justify-between py-2 ${
                        index < all.length - 1
                          ? "border-b border-outline-variant/10"
                          : ""
                      }`}
                    >
                      <dt className="text-body-sm text-on-surface-variant">
                        {fact.label}
                      </dt>
                      <dd className="font-semibold text-primary">
                        {fact.value}
                      </dd>
                    </div>
                  ))}
                  <div className="flex items-center justify-between border-t border-outline-variant/10 py-2">
                    <dt className="text-body-sm text-on-surface-variant">
                      Open roles
                    </dt>
                    <dd className="font-semibold text-primary">{jobs.length}</dd>
                  </div>
                  <div className="flex items-center justify-between py-2">
                    <dt className="text-body-sm text-on-surface-variant">
                      Remote roles
                    </dt>
                    <dd className="font-semibold text-primary">{remoteCount}</dd>
                  </div>
                </dl>
              </section>

              <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
                <h2 className="mb-stack-md flex items-center gap-2 font-display text-body-lg font-bold text-primary">
                  <MapPin className="h-5 w-5 text-secondary" />
                  Hiring in
                </h2>
                <div className="space-y-stack-sm">
                  {continents.map(([continent, cities]) => (
                    <div key={continent}>
                      <p className="mb-1.5 text-label-sm font-semibold tracking-wide text-outline uppercase">
                        {continent}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {cities.map((city) => (
                          <Link
                            key={city}
                            href={`/browse?q=${encodeURIComponent(city)}`}
                            className="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant transition-colors hover:bg-secondary-container hover:text-on-secondary-container"
                          >
                            {city}
                          </Link>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
                <h2 className="mb-stack-md font-display text-body-lg font-bold text-primary">
                  Teams hiring
                </h2>
                <div className="flex flex-wrap gap-2">
                  {roleTypes.map((role) => (
                    <Link
                      key={role}
                      href={`/browse?role=${role}&q=${encodeURIComponent(company)}`}
                      className="rounded-full bg-surface-container px-3 py-1 text-label-sm text-on-surface-variant transition-colors hover:bg-secondary-container hover:text-on-secondary-container"
                    >
                      {ROLE_LABELS[role]}
                    </Link>
                  ))}
                </div>
              </section>
            </aside>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
