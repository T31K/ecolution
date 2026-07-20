import Image from "next/image";
import Link from "next/link";
import { Banknote, BadgeCheck, Clock } from "lucide-react";
import type { BrowseJob } from "@/lib/jobs";

export function JobCard({ job }: { job: BrowseJob }) {
  const ImpactIcon = job.impact.icon;

  return (
    <article className="group relative rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 transition-all duration-300 hover:border-secondary/40 hover:shadow-raised focus-within:border-secondary/40">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-high">
          <Image
            src={job.logo}
            alt={`${job.company} logo: ${job.logoAlt}`}
            width={40}
            height={40}
            className="h-10 w-10 object-contain"
          />
        </div>

        <div className="grow">
          <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
            {/* Stretched link: covers the whole card so any dead space opens
                the job. Interactive children below need `relative z-10`. */}
            <h2 className="font-display text-headline-md text-secondary transition-colors group-hover:text-primary group-hover:underline">
              <Link
                href={`/jobs/${job.id}`}
                className="after:absolute after:inset-0 after:rounded-xl focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-secondary"
              >
                {job.title}
              </Link>
            </h2>
            <div
              className={
                job.impact.highlighted
                  ? "flex items-center gap-1.5 rounded border border-secondary/10 bg-secondary-container/30 px-3 py-1 text-secondary"
                  : "flex items-center gap-1.5 rounded border border-outline-variant/30 bg-surface-container-highest px-3 py-1 text-on-surface-variant"
              }
            >
              <ImpactIcon className="h-4 w-4" />
              <span className="text-label-sm">{job.impact.label}</span>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-body-md font-semibold text-on-surface">
              {job.company}
            </span>
            <span className="h-1 w-1 rounded-full bg-outline" />
            <span className="text-body-md text-on-surface-variant">
              {job.location}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1">
              <Banknote className="h-5 w-5 text-outline" />
              <span className="text-body-sm">{job.salary}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5 text-outline" />
              <span className="text-body-sm">{job.posted}</span>
            </div>
            {job.verified && (
              <div className="flex items-center gap-1">
                <BadgeCheck className="h-5 w-5 text-outline" />
                <span className="text-body-sm">Climate Impact Verified</span>
              </div>
            )}
            {job.isNew && (
              <span className="rounded bg-secondary px-2 py-0.5 text-[10px] font-bold tracking-wider text-on-secondary uppercase">
                New
              </span>
            )}
          </div>
        </div>

        <div className="relative z-10 flex justify-end gap-3 pt-4 sm:flex-col sm:pt-0">
          <Link
            href={`/jobs/${job.id}`}
            tabIndex={-1}
            aria-hidden="true"
            className="rounded-full border border-secondary px-6 py-2 text-center text-body-sm font-bold text-secondary transition-all hover:bg-secondary/5 active:scale-95 sm:w-full"
          >
            Details
          </Link>
          <button className="rounded-full bg-secondary px-6 py-2 text-body-sm font-bold text-on-secondary transition-all hover:shadow-md active:scale-95 sm:w-full">
            Apply
          </button>
        </div>
      </div>
    </article>
  );
}
