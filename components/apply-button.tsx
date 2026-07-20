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

  // Real vacancies belong to real employers. Applying here would go nowhere,
  // so send people to the original posting instead of faking a submission.
  if (job.source === "real" && job.sourceUrl) {
    return (
      <div className="flex w-full flex-col items-stretch gap-2 md:w-auto md:items-end">
        <Button
          variant="brand"
          size="pill"
          render={
            <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer" />
          }
        >
          Apply on climatechangejobs.com
          <ExternalLink className="h-4 w-4" />
        </Button>
        <span className="text-label-sm text-on-surface-variant md:text-right">
          Live vacancy — applications handled by the employer
        </span>
      </div>
    );
  }
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
                <dd className="font-semibold text-on-surface">{session.name}</dd>
              </div>
              <div className="mt-1 flex justify-between">
                <dt className="text-on-surface-variant">Email</dt>
                <dd className="font-semibold text-on-surface">
                  {session.email}
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
