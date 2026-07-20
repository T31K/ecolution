"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, Loader2 } from "lucide-react";
import { addApplication, hasApplied } from "@/lib/overlay";
import { useOverlay } from "@/lib/store";
import type { Application, Job } from "@/lib/types";

/**
 * Applications are written to the localStorage overlay rather than a server,
 * per the PoC storage design. The poster dashboard reads the same overlay,
 * which is what makes the seeker -> poster round trip work in one browser.
 */
export function ApplyButton({ job }: { job: Job }) {
  const router = useRouter();
  const { overlay, update } = useOverlay();
  const [open, setOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const session = overlay.session;
  const signedInAsSeeker = session?.role === "seeker";
  const applied = session
    ? hasApplied(overlay.applications, session.userId, job.id)
    : false;

  if (applied) {
    return (
      <div className="flex w-full items-center gap-stack-sm md:w-auto">
        <span className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-container px-6 py-2.5 text-label-md font-bold text-on-secondary-container md:flex-none">
          <Check className="h-4 w-4" />
          Applied
        </span>
        <Link
          href="/account"
          className="flex-1 rounded-full border border-secondary px-6 py-2.5 text-center text-label-md text-secondary transition-all hover:bg-secondary/5 md:flex-none"
        >
          View application
        </Link>
      </div>
    );
  }

  const submit = () => {
    if (!session) return;
    setSubmitting(true);

    const application: Application = {
      id: `app-local-${job.id}-${session.userId}`,
      jobId: job.id,
      seekerId: session.userId,
      status: "new",
      coverNote: coverNote.trim(),
      appliedAt: new Date().toISOString(),
    };

    update((current) => addApplication(current, application));
    setSubmitting(false);
    setOpen(false);
    router.push("/account");
  };

  return (
    <>
      <div className="flex w-full items-center gap-stack-sm md:w-auto">
        <button className="flex-1 rounded-full border border-secondary px-6 py-2.5 text-label-md text-secondary transition-all hover:bg-secondary/5 md:flex-none">
          Save Job
        </button>
        {signedInAsSeeker ? (
          <button
            onClick={() => setOpen(true)}
            className="flex-1 rounded-full bg-secondary px-8 py-2.5 text-label-md text-on-secondary shadow-md transition-all hover:opacity-90 active:scale-95 md:flex-none"
          >
            Apply Now
          </button>
        ) : (
          <Link
            href="/auth"
            className="flex-1 rounded-full bg-secondary px-8 py-2.5 text-center text-label-md text-on-secondary shadow-md transition-all hover:opacity-90 active:scale-95 md:flex-none"
          >
            {session ? "Switch account to apply" : "Sign in to apply"}
          </Link>
        )}
      </div>

      {open && session && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-4 backdrop-blur-sm"
          onClick={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div className="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-stack-lg shadow-raised">
            <h2
              id="apply-title"
              className="mb-2 font-display text-headline-md text-primary"
            >
              Apply to {job.title}
            </h2>
            <p className="mb-stack-md text-body-sm text-on-surface-variant">
              {job.company} • {job.locationDisplay}
            </p>

            <dl className="mb-stack-md rounded-lg bg-surface-container p-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Applying as</dt>
                <dd className="font-semibold text-on-surface">{session.name}</dd>
              </div>
              <div className="mt-1 flex justify-between">
                <dt className="text-on-surface-variant">Email</dt>
                <dd className="font-semibold text-on-surface">{session.email}</dd>
              </div>
            </dl>

            <label
              htmlFor="cover-note"
              className="mb-2 block text-label-md text-on-surface-variant"
            >
              Why this role? <span className="font-normal">(optional)</span>
            </label>
            <textarea
              id="cover-note"
              rows={5}
              value={coverNote}
              onChange={(event) => setCoverNote(event.target.value)}
              placeholder="A short note to the hiring team…"
              className="mb-stack-md w-full rounded-lg border border-outline-variant bg-white p-4 text-body-md outline-none transition-all focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />

            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <button
                onClick={submit}
                disabled={submitting}
                className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary px-6 py-3 text-label-md text-on-secondary transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit application
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-full border border-outline-variant px-6 py-3 text-label-md text-on-surface-variant transition-all hover:bg-surface-container"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
