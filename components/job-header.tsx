import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { ApplyButton } from "@/components/apply-button";
import { IMPACT_LABELS, formatPostedAgo, jobChips } from "@/lib/job-view";
import type { Job } from "@/lib/types";

export function JobHeader({ job }: { job: Job }) {
  const chips = jobChips(job);

  return (
    <section className="mb-stack-lg rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-stack-md shadow-card md:p-stack-lg">
      <div className="flex flex-col items-start justify-between gap-stack-md md:flex-row md:items-center">
        <div className="flex items-center gap-stack-md">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/20 bg-surface-container p-2">
            <Image
              src={job.companyLogo}
              alt={job.companyLogoAlt}
              width={64}
              height={64}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div>
            <h1 className="font-display text-headline-lg text-primary">
              {job.title}
            </h1>
            <div className="mt-1 flex flex-wrap items-center gap-stack-sm">
              <Link
                href={`/companies/${job.posterId}`}
                className="font-semibold text-secondary hover:underline"
              >
                {job.company}
              </Link>
              <span className="text-label-sm text-outline">•</span>
              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                <MapPin className="h-[18px] w-[18px]" aria-hidden="true" />
                {job.locationDisplay}
              </span>
              <span className="flex items-center gap-1 text-body-sm text-on-surface-variant">
                <Clock className="h-[18px] w-[18px]" aria-hidden="true" />
                {formatPostedAgo(job.postedAt)}
              </span>
            </div>
          </div>
        </div>

        <ApplyButton job={job} />
      </div>

      <div className="mt-stack-md flex flex-wrap gap-stack-sm border-t border-outline-variant/30 pt-stack-md">
        {chips.map((chip) => (
          <span
            key={chip}
            className="rounded-sm bg-surface-container-low px-3 py-1 text-label-sm font-medium text-on-surface-variant"
          >
            {chip}
          </span>
        ))}
        <span className="flex items-center gap-1 rounded-sm bg-secondary-container px-3 py-1 text-label-sm font-bold text-on-secondary-container">
          <span
            className="h-2 w-2 animate-pulse rounded-full bg-secondary"
            aria-hidden="true"
          />
          {IMPACT_LABELS[job.impactArea]}
        </span>
      </div>
    </section>
  );
}
