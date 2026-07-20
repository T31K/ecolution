import Image from "next/image";
import Link from "next/link";
import { Banknote, BadgeCheck, Clock } from "lucide-react";
import { IMPACT_ICONS, IMPACT_LABELS, formatPostedAgo } from "@/lib/job-view";
import type { Job } from "@/lib/types";

const RECENT_THRESHOLD_MS = 3 * 24 * 60 * 60 * 1000;

/** `now` is passed in rather than read during render: it keeps every card in
 *  a list consistent, and reading the clock mid-render is impure. */
export function JobCard({ job, now }: { job: Job; now: number }) {
  const ImpactIcon = IMPACT_ICONS[job.impactArea];
  const isNew = now - new Date(job.postedAt).getTime() < RECENT_THRESHOLD_MS;
  const verified = job.views > 1500;

  return (
    <article className="group relative rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 transition-all duration-300 focus-within:border-secondary/40 hover:border-secondary/40 hover:shadow-raised">
      <div className="flex flex-col gap-6 sm:flex-row">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-surface-container-high p-2">
          <Image
            src={job.companyLogo}
            alt={job.companyLogoAlt}
            width={48}
            height={48}
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
            <div className="flex items-center gap-1.5 rounded border border-outline-variant/30 bg-surface-container-highest px-3 py-1 text-on-surface-variant">
              <ImpactIcon className="h-4 w-4" />
              <span className="text-label-sm">
                {IMPACT_LABELS[job.impactArea]}
              </span>
            </div>
          </div>

          <div className="mb-4 flex items-center gap-2">
            <span className="text-body-md font-semibold text-on-surface">
              {job.company}
            </span>
            <span className="h-1 w-1 rounded-full bg-outline" />
            <span className="text-body-md text-on-surface-variant">
              {job.locationDisplay}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
            <div className="flex items-center gap-1">
              <Banknote className="h-5 w-5 text-outline" />
              <span className="text-body-sm">{job.salaryDisplay}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-5 w-5 text-outline" />
              <span className="text-body-sm">
                {formatPostedAgo(job.postedAt, new Date(now))}
              </span>
            </div>
            {verified && (
              <div className="flex items-center gap-1">
                <BadgeCheck className="h-5 w-5 text-outline" />
                <span className="text-body-sm">Climate Impact Verified</span>
              </div>
            )}
            {isNew && (
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
          <Link
            href={`/jobs/${job.id}`}
            className="rounded-full bg-secondary px-6 py-2 text-center text-body-sm font-bold text-on-secondary transition-all hover:shadow-md active:scale-95 sm:w-full"
          >
            Apply
          </Link>
        </div>
      </div>
    </article>
  );
}
