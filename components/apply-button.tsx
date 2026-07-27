"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ExternalLink, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError, applyToJob } from "@/lib/api";
import { useSession } from "@/lib/session";
import type { Job } from "@/lib/types";

/**
 * Applications are submitted to the backend. The endpoint upserts, so a
 * resubmission is safe and both success and "already applied" (409) land in
 * the same applied state.
 */
export function ApplyButton({ job }: { job: Job }) {
  const router = useRouter();
  const { session } = useSession();
  const [open, setOpen] = useState(false);
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [applied, setApplied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signedInAsSeeker = session?.user.role === "seeker";

  // Scraped vacancies belong to real employers. Applying here would go
  // nowhere, so send people to the original application page instead.
  const externalUrl =
    job.applyUrl ?? (job.source === "real" ? job.sourceUrl : undefined);
  if (externalUrl) {
    return (
      <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
        <Button
          variant="brand"
          size="pill"
          render={
            <a href={externalUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          Apply on company site
          <ExternalLink className="h-4 w-4" />
        </Button>
        <span className="text-label-sm text-on-surface-variant md:text-right">
          Live vacancy — applications handled by the employer
        </span>
      </div>
    );
  }

  if (applied) {
    return (
      <div className="flex w-full items-center gap-stack-sm md:w-auto">
        <span className="flex flex-1 items-center justify-center gap-2 rounded-full bg-secondary-container px-6 py-2.5 text-label-md font-bold text-on-secondary-container md:flex-none">
          <Check className="h-4 w-4" />
          Applied
        </span>
        <Button
          variant="brandOutline"
          size="pill"
          render={<Link href="/account" />}
          className="flex-1 md:flex-none"
        >
          View application
        </Button>
      </div>
    );
  }

  const submit = async () => {
    if (!session) return;
    setSubmitting(true);
    setError(null);

    try {
      await applyToJob(session.token, job.id, coverNote.trim());
    } catch (err) {
      // 409 means an application already exists — that's the applied state.
      if (!(err instanceof ApiError && err.status === 409)) {
        setSubmitting(false);
        setError(
          err instanceof ApiError
            ? err.message
            : "Something went wrong. Please try again.",
        );
        return;
      }
    }

    setSubmitting(false);
    setApplied(true);
    setOpen(false);
    router.push("/account");
  };

  return (
    <div className="flex w-full items-center gap-stack-sm md:w-auto">
      <Button variant="brandOutline" size="pill" className="flex-1 md:flex-none">
        Save Job
      </Button>

      {signedInAsSeeker ? (
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger
            render={
              <Button variant="brand" size="pill" className="flex-1 md:flex-none">
                Apply Now
              </Button>
            }
          />
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="font-display text-headline-md text-primary">
                Apply to {job.title}
              </DialogTitle>
              <DialogDescription>
                {job.company} • {job.locationDisplay}
              </DialogDescription>
            </DialogHeader>

            <dl className="rounded-lg bg-surface-container p-4 text-body-sm">
              <div className="flex justify-between">
                <dt className="text-on-surface-variant">Applying as</dt>
                <dd className="font-semibold text-on-surface">
                  {session.user.name}
                </dd>
              </div>
              <div className="mt-1 flex justify-between">
                <dt className="text-on-surface-variant">Email</dt>
                <dd className="font-semibold text-on-surface">
                  {session.user.email}
                </dd>
              </div>
            </dl>

            <div className="grid gap-2">
              <Label htmlFor="cover-note">
                Why this role?{" "}
                <span className="font-normal text-on-surface-variant">
                  (optional)
                </span>
              </Label>
              <Textarea
                id="cover-note"
                rows={5}
                value={coverNote}
                onChange={(event) => setCoverNote(event.target.value)}
                placeholder="A short note to the hiring team…"
              />
            </div>

            {error && (
              <p role="alert" className="text-body-sm text-error">
                {error}
              </p>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                size="pill"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="brand"
                size="pill"
                onClick={submit}
                disabled={submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit application
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : (
        <Button
          variant="brand"
          size="pill"
          render={<Link href="/auth" />}
          className="flex-1 md:flex-none"
        >
          {session ? "Switch account to apply" : "Sign in to apply"}
        </Button>
      )}
    </div>
  );
}
