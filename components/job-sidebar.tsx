import Link from "next/link";
import { ArrowRight, Brain } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLE_LABELS, formatPostedAgo } from "@/lib/job-view";
import { getSeedNow } from "@/lib/seed";
import type { Job } from "@/lib/types";

export function JobSidebar({
  job,
  similarJobs,
}: {
  job: Job;
  similarJobs: Job[];
}) {
  return (
    <aside className="flex flex-col gap-stack-lg lg:col-span-4">
      <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
        <h2 className="mb-stack-md font-display text-body-lg font-bold text-primary">
          Company Profile
        </h2>
        <dl className="space-y-stack-md">
          {job.companyFacts.map((fact, index) => (
            <div
              key={fact.label}
              className={`flex items-center justify-between py-2 ${
                index < job.companyFacts.length - 1
                  ? "border-b border-outline-variant/10"
                  : ""
              }`}
            >
              <dt className="text-body-sm text-on-surface-variant">
                {fact.label}
              </dt>
              <dd className="font-semibold text-primary">{fact.value}</dd>
            </div>
          ))}
        </dl>

        <Link
          href={`/companies/${job.posterId}`}
          className="mt-stack-md flex items-center gap-1 text-label-md text-secondary hover:underline"
        >
          View Company Page
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </section>

      <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
        <h2 className="mb-stack-md font-display text-body-lg font-bold text-primary">
          Similar Opportunities
        </h2>
        {similarJobs.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">
            Nothing comparable open right now.
          </p>
        ) : (
          <div className="space-y-stack-md">
            {similarJobs.map((similar) => (
              <Link
                key={similar.id}
                href={`/jobs/${similar.id}`}
                className="group block rounded-lg p-stack-sm transition-colors hover:bg-surface-container"
              >
                <h3 className="font-bold text-on-surface group-hover:text-secondary">
                  {similar.title}
                </h3>
                <p className="text-body-sm text-on-surface-variant">
                  {similar.company} • {similar.city}
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold text-on-surface-variant uppercase">
                    {similar.remote ? "Remote" : "On-site"}
                  </span>
                  <span className="text-[10px] font-medium text-outline">
                    {formatPostedAgo(similar.postedAt, getSeedNow())}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
        <Link
          href={`/browse?role=${job.roleType}`}
          className="mt-stack-md block w-full rounded-full border border-outline-variant py-2 text-center text-label-md text-on-surface-variant transition-all hover:bg-surface-container"
        >
          Browse all {ROLE_LABELS[job.roleType]} jobs
        </Link>
      </section>

      <div className="group relative overflow-hidden rounded-xl bg-primary-container p-stack-md text-on-primary-container">
        <div className="relative z-10">
          <p className="mb-2 text-label-md">Need help with your application?</p>
          <p className="mb-stack-md text-body-sm opacity-80">
            Our climate talent scouts offer free resume reviews for senior
            engineering roles.
          </p>
          <Button
            variant="link"
            size="sm"
            className="h-auto p-0 text-label-md font-bold text-secondary-container no-underline"
          >
            Connect with a Scout
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
        <Brain
          className="pointer-events-none absolute -right-4 -bottom-4 h-[120px] w-[120px] rotate-12 opacity-10"
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}
