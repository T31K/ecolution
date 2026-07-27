"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { updateApplicationStatus } from "@/lib/api";
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
import {
  OverviewStatus,
  useEmployerOverview,
} from "@/components/employer-dashboard";
import { STATUS_LABELS, STATUS_ORDER, STATUS_STYLES } from "@/lib/status";
import type { AppStatus } from "@/lib/types";

export function EmployerJobApplicants({ jobId }: { jobId: string }) {
  const { token, data, setData, error, retry, loading } = useEmployerOverview();
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  if (loading || error || !data) {
    return (
      <OverviewStatus
        loading={loading}
        error={error}
        retry={retry}
        label="Loading applicants…"
      />
    );
  }

  const job = data.jobs.find((candidate) => candidate.id === jobId);
  const title = job?.title ?? jobId;

  const applications = data.applications
    .filter((application) => application.jobId === jobId)
    .sort((a, b) => b.appliedAt.localeCompare(a.appliedAt));

  const changeStatus = async (applicationId: string, status: AppStatus) => {
    if (!token || savingId) return;
    const previous = data;
    // Optimistic: flip the pill immediately, roll back if the server refuses.
    setData((current) =>
      current
        ? {
            ...current,
            applications: current.applications.map((application) =>
              application.id === applicationId
                ? { ...application, status }
                : application,
            ),
          }
        : current,
    );
    setSavingId(applicationId);
    setSaveError(null);
    try {
      await updateApplicationStatus(token, applicationId, status);
    } catch (err: unknown) {
      setData(previous);
      setSaveError(
        err instanceof Error ? err.message : "Could not update the status.",
      );
    } finally {
      setSavingId(null);
    }
  };

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

      {saveError && (
        <p className="text-body-sm text-error" role="alert">
          {saveError}
        </p>
      )}

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
            const name = application.seeker.name || "Applicant";

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
                        {application.seeker.headline && (
                          <p className="text-body-sm text-on-surface-variant">
                            {application.seeker.headline}
                          </p>
                        )}
                        <p className="text-label-sm text-outline">
                          {application.seeker.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {savingId === application.id && (
                        <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant" />
                      )}
                      <Badge
                        className={`${STATUS_STYLES[application.status]} rounded-full px-3`}
                      >
                        {STATUS_LABELS[application.status]}
                      </Badge>
                      <Select
                        value={application.status}
                        onValueChange={(value) =>
                          void changeStatus(application.id, value as AppStatus)
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
