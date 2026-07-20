import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { JobBulletList } from "@/components/job-bullet-list";
import { JobHeader } from "@/components/job-header";
import { JobImpact } from "@/components/job-impact";
import { JobSidebar } from "@/components/job-sidebar";
import { JOBS, getJob } from "./job-data";

type JobPageProps = {
  params: Promise<{ id: string }>;
};

export function generateStaticParams() {
  return Object.keys(JOBS).map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: JobPageProps): Promise<Metadata> {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    return { title: "Job not found | Ecolution" };
  }

  return {
    title: `${job.title} at ${job.company} | Ecolution`,
    description: job.about,
  };
}

export default async function JobPage({ params }: JobPageProps) {
  const { id } = await params;
  const job = getJob(id);

  if (!job) {
    notFound();
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-stack-lg">
          <JobHeader job={job} />

          <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
            <div className="flex flex-col gap-stack-lg lg:col-span-8">
              <article className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card md:p-stack-lg">
                <h2 className="mb-stack-sm font-display text-headline-md text-primary">
                  About the Role
                </h2>
                <p className="leading-relaxed text-on-surface-variant">
                  {job.about}
                </p>
              </article>

              <JobImpact
                summary={job.impactSummary}
                stats={job.impactStats}
              />

              <JobBulletList
                title="Responsibilities"
                items={job.responsibilities}
                icon="check"
              />

              <JobBulletList
                title="Requirements"
                items={job.requirements}
                icon="star"
              />
            </div>

            <JobSidebar job={job} />
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
