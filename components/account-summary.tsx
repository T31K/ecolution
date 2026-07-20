"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useOverlay } from "@/lib/store";

/**
 * Stage 2 renders identity and an empty state only. Stage 3 replaces the
 * placeholder below with the seeker's real application list once the apply
 * flow can write to the overlay.
 */
export function AccountSummary() {
  const { overlay } = useOverlay();
  const session = overlay.session;
  const applications = overlay.applications.filter(
    (application) => application.seekerId === session?.userId,
  );

  return (
    <>
      <header className="mb-stack-lg">
        <h1 className="mb-2 font-display text-headline-lg text-primary">
          My Applications
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Signed in as {session?.name} ({session?.email})
        </p>
      </header>

      {applications.length === 0 ? (
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-stack-lg text-center shadow-card">
          <p className="mb-2 text-body-lg font-semibold text-on-surface">
            You haven&rsquo;t applied to anything yet
          </p>
          <p className="mb-stack-md text-body-md text-on-surface-variant">
            Browse open climate roles and apply — applications you submit will
            appear here.
          </p>
          <Link
            href="/browse"
            className="inline-flex items-center gap-2 rounded-full bg-secondary px-6 py-3 text-label-md text-on-secondary transition-all hover:brightness-110 active:scale-95"
          >
            <Search className="h-4 w-4" />
            Browse jobs
          </Link>
        </div>
      ) : (
        <ul className="flex flex-col gap-stack-md">
          {applications.map((application) => (
            <li
              key={application.id}
              className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-card"
            >
              <p className="text-body-md font-semibold text-on-surface">
                {application.jobId}
              </p>
              <p className="text-label-sm text-on-surface-variant">
                Status: {application.status}
              </p>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
