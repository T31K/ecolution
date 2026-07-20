"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getEmployerData, type EmployerData } from "@/app/employer/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mergeApplications, setStatus } from "@/lib/overlay";
import { STATUS_LABELS, STATUS_ORDER, STATUS_STYLES } from "@/lib/status";
import { useOverlay } from "@/lib/store";
import type { AppStatus } from "@/lib/types";

export function EmployerJobApplicants({ jobId }: { jobId: string }) {
  const { overlay, update } = useOverlay();
  const session = overlay.session;
  const [data, setData] = useState<EmployerData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!session) return;
    let cancelled = false;
    getEmployerData(session.userId).then((result) => {
      if (cancelled) return;
      setData(result);
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [session]);

  if (loading || !data) {
    return (
      <div className="flex flex-1 items-center justify-center p-8">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-body-md">Loading applicants…</span>
        </div>
      </div>
    );
  }

  const localListing = overlay.listings.find((job) => job.id === jobId);
  const seededListing = data.listings.find((listing) => listing.id === jobId);
  const title = localListing?.title ?? seededListing?.title ?? jobId;

  const applications = mergeApplications(
    data.applicants.map((row) => row.application),
    overlay,
  ).filter((application) => application.jobId === jobId);

  const seekerByApplication = new Map(
    data.applicants.map((row) => [row.application.id, row.seeker]),
  );

  return (
    <main className="flex flex-col gap-stack-lg p-4 md:p-8">
      <div>
        <Button
          variant="link"
          size="sm"
          render={<Link href="/employer" />}
          className="mb-2 h-auto p-0 text-label-md text-on-surface-variant"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Button>
        <h2 className="font-display text-headline-lg text-primary">{title}</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          {applications.length}{" "}
          {applications.length === 1 ? "applicant" : "applicants"}
        </p>
      </div>

      {applications.length === 0 ? (
        <Card className="border-outline-variant/30 bg-surface-container-lowest shadow-card">
          <CardContent className="py-stack-lg text-center">
            <p className="mb-2 text-body-lg font-semibold text-on-surface">
              No applications yet
            </p>
            <p className="text-body-md text-on-surface-variant">
              Applications submitted for this role will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-stack-md">
          {applications.map((application) => {
            const seeker = seekerByApplication.get(application.id);
            const name = seeker?.name ?? session?.name ?? "Applicant";

            return (
              <Card
                key={application.id}
                className="gap-0 border-outline-variant/30 bg-surface-container-lowest py-0 shadow-card"
              >
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center gap-3">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-body-sm font-bold text-on-surface-variant">
                        {name
                          .split(" ")
                          .map((part) => part[0])
                          .slice(0, 2)
                          .join("")}
                      </span>
                      <div>
                        <p className="text-body-lg font-bold text-on-surface">
                          {name}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {seeker
                            ? `${seeker.headline} • ${seeker.yearsExperience} years`
                            : "Applied in this session"}
                        </p>
                        <p className="text-label-sm text-outline">
                          {seeker?.email ?? session?.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge
                        className={`${STATUS_STYLES[application.status]} rounded-full px-3`}
                      >
                        {STATUS_LABELS[application.status]}
                      </Badge>
                      <Select
                        value={application.status}
                        onValueChange={(value) =>
                          update((current) =>
                            setStatus(current, application.id, value as AppStatus),
                          )
                        }
                      >
                        <SelectTrigger
                          className="h-10 w-44 text-body-sm"
                          aria-label={`Change status for ${name}`}
                        >
                          <SelectValue>
                            {(value) => STATUS_LABELS[value as AppStatus]}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {STATUS_ORDER.map((status) => (
                            <SelectItem key={status} value={status}>
                              {STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {application.coverNote && (
                    <p className="border-t border-outline-variant/20 pt-4 text-body-sm text-on-surface-variant italic">
                      &ldquo;{application.coverNote}&rdquo;
                    </p>
                  )}

                  <p className="text-label-sm text-outline">
                    Applied{" "}
                    {new Date(application.appliedAt).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </main>
  );
}
