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
 * listings. `id` is the posterId that every job carries.
 */
async function getCompanyJobs(posterId: string): Promise<Job[]> {
  const { jobs } = await listJobs({ perPage: 50, page: 1 });
  return jobs
    .filter((job) => job.posterId === posterId)
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

  const cities = [...new Set(jobs.map((job) => job.city))];
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
                <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container p-3">
                  <Image
                    src={sample.companyLogo}
                    alt={`${company} logo`}
                    width={80}
                    height={80}
                    className="h-full w-full object-contain"
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

            <p className="mt-stack-md border-t border-outline-variant/20 pt-stack-md text-body-lg leading-relaxed text-on-surface-variant">
              {company} is{" "}
              {sample.about
                .replace(`${company} is `, "")
                .split(". As ")[0]
                .replace(/\.$/, "")}
              .
            </p>
          </section>

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="lg:col-span-8">
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

            <aside className="flex flex-col gap-stack-lg lg:col-span-4">
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
