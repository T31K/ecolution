import Image from "next/image";
import { ArrowRight, Brain } from "lucide-react";
import type { Job } from "@/app/jobs/[id]/job-data";

export function JobSidebar({ job }: { job: Job }) {
  return (
    <aside className="flex flex-col gap-stack-lg lg:col-span-4">
      {/* Company profile */}
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

        <div className="mt-stack-md">
          <Image
            src={job.officePhoto}
            alt={job.officePhotoAlt}
            width={512}
            height={279}
            className="mb-stack-sm h-32 w-full rounded-lg object-cover grayscale transition-all duration-500 hover:grayscale-0"
          />
          <a
            href="#"
            className="flex items-center gap-1 text-label-md text-secondary hover:underline"
          >
            View Company Page
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </section>

      {/* Similar opportunities */}
      <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
        <h2 className="mb-stack-md font-display text-body-lg font-bold text-primary">
          Similar Opportunities
        </h2>
        <div className="space-y-stack-md">
          {job.similarJobs.map((similar) => (
            <a
              key={similar.title}
              href="#"
              className="group block rounded-lg p-stack-sm transition-colors hover:bg-surface-container"
            >
              <h3 className="font-bold text-on-surface group-hover:text-secondary">
                {similar.title}
              </h3>
              <p className="text-body-sm text-on-surface-variant">
                {similar.company} • {similar.location}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="rounded bg-surface-container-high px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant">
                  {similar.tag}
                </span>
                <span className="text-[10px] font-medium text-outline">
                  {similar.postedAgo}
                </span>
              </div>
            </a>
          ))}
        </div>
        <button className="mt-stack-md w-full rounded-full border border-outline-variant py-2 text-label-md text-on-surface-variant transition-all hover:bg-surface-container">
          {job.similarJobsCta}
        </button>
      </section>

      {/* Talent scout prompt */}
      <div className="group relative overflow-hidden rounded-xl bg-primary-container p-stack-md text-on-primary-container">
        <div className="relative z-10">
          <p className="mb-2 text-label-md">Need help with your application?</p>
          <p className="mb-stack-md text-body-sm opacity-80">
            Our climate talent scouts offer free resume reviews for senior
            engineering roles.
          </p>
          <button className="flex items-center gap-1 text-label-md font-bold text-secondary-container transition-all group-hover:gap-2">
            Connect with a Scout
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <Brain
          className="pointer-events-none absolute -bottom-4 -right-4 h-[120px] w-[120px] rotate-12 opacity-10"
          aria-hidden="true"
        />
      </div>
    </aside>
  );
}
