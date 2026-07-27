"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";
import { ApiError, myApplications, type MyApplication } from "@/lib/api";
import { useSession } from "@/lib/session";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";

export function AccountSummary() {
  const { session } = useSession();

  const [applications, setApplications] = useState<MyApplication[] | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);

  const token = session?.token;

  useEffect(() => {
    if (!token) return;
    let cancelled = false;

    myApplications(token)
      .then((result) => {
        if (cancelled) return;
        setError(null);
        setApplications(result.applications);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Could not load your applications.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const sorted = applications
    ? [...applications].sort((a, b) => b.appliedAt.localeCompare(a.appliedAt))
    : [];

  return (
    <>
      <header className="mb-stack-lg">
        <h1 className="mb-2 font-display text-headline-lg text-primary">
          My Applications
        </h1>
        <p className="text-body-lg text-on-surface-variant">
          Signed in as {session?.user.name} ({session?.user.email})
        </p>
      </header>

      {error ? (
        <p role="alert" className="text-body-md font-semibold text-error">
          {error}
        </p>
      ) : applications === null ? (
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-body-md">Loading your applications…</span>
        </div>
      ) : sorted.length === 0 ? (
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
        <>
          <p className="mb-stack-md text-body-md text-on-surface-variant">
            <span className="font-bold text-on-surface">{sorted.length}</span>{" "}
            {sorted.length === 1 ? "application" : "applications"}
          </p>
          <ul className="flex flex-col gap-stack-md">
            {sorted.map((application) => {
              const job = application.job;
              return (
                <li
                  key={application.id}
                  className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-card"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-container-high p-1.5">
                      <Image
                        src={job.companyLogo}
                        alt={`${job.company} logo`}
                        width={40}
                        height={40}
                        className="h-full w-full object-contain"
                      />
                    </div>

                    <div className="grow">
                      <h2 className="text-body-lg font-bold text-secondary">
                        <Link
                          href={`/jobs/${job.id}`}
                          className="hover:underline"
                        >
                          {job.title}
                        </Link>
                      </h2>
                      <p className="text-body-sm text-on-surface-variant">
                        {job.company} • {job.locationDisplay} •{" "}
                        {job.salaryDisplay}
                      </p>
                      <p className="mt-1 text-label-sm text-on-surface-variant">
                        Applied{" "}
                        {new Date(application.appliedAt).toLocaleDateString(
                          "en-GB",
                          { day: "numeric", month: "short", year: "numeric" },
                        )}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-4 py-1.5 text-label-sm font-semibold ${STATUS_STYLES[application.status]}`}
                    >
                      {STATUS_LABELS[application.status]}
                    </span>
                  </div>

                  {application.coverNote && (
                    <p className="mt-4 border-t border-outline-variant/20 pt-4 text-body-sm text-on-surface-variant italic">
                      &ldquo;{application.coverNote}&rdquo;
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </>
  );
}
