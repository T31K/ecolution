"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Clock,
  Eye,
  Lightbulb,
  Loader2,
  MapPin,
  Plus,
  Users,
  Zap,
} from "lucide-react";
import { employerOverview, type EmployerApplication } from "@/lib/api";
import { useSession } from "@/lib/session";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { IMPACT_LABELS, formatPostedAgo } from "@/lib/job-view";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import type { Job } from "@/lib/types";

export type EmployerOverviewData = {
  jobs: Job[];
  applications: EmployerApplication[];
};

/**
 * One fetch feeds the whole employer area: dashboard stats, the listings
 * page, and each job's applicant list all derive from this response.
 * Mutations either refetch (retry) or patch local state via setData.
 */
export function useEmployerOverview() {
  const { session } = useSession();
  const token = session?.token ?? null;
  const [data, setData] = useState<EmployerOverviewData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    employerOverview(token)
      .then((result) => {
        if (cancelled) return;
        setData({ jobs: result.jobs, applications: result.applications });
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : "Something went wrong loading your data.",
        );
      });
    return () => {
      cancelled = true;
    };
  }, [token, reloadKey]);

  const retry = useCallback(() => {
    setError(null);
    setReloadKey((key) => key + 1);
  }, []);

  const loading = data === null && error === null;

  return { session, token, data, setData, error, retry, loading };
}

/** Shared loading / error panel so every employer pane reads the same. */
export function OverviewStatus({
  loading,
  error,
  retry,
  label,
}: {
  loading: boolean;
  error: string | null;
  retry: () => void;
  label: string;
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      {error ? (
        <div className="flex flex-col items-center gap-3 text-center">
          <p className="text-body-md text-on-surface-variant">{error}</p>
          <Button variant="brandOutline" size="pill-sm" onClick={retry}>
            Try again
          </Button>
        </div>
      ) : loading ? (
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-body-md">{label}</span>
        </div>
      ) : null}
    </div>
  );
}

export function EmployerDashboard() {
  const { data, error, retry, loading } = useEmployerOverview();

  if (loading || error || !data) {
    return (
      <OverviewStatus
        loading={loading}
        error={error}
        retry={retry}
        label="Loading your dashboard…"
      />
    );
  }

  const jobs = [...data.jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  const applications = [...data.applications].sort((a, b) =>
    b.appliedAt.localeCompare(a.appliedAt),
  );

  const totalViews = jobs.reduce((sum, job) => sum + job.views, 0);
  const activeListings = jobs.length;
  const totalApplicants = applications.length;
  const awaitingReview = applications.filter(
    (application) => application.status === "new",
  ).length;
  const slotsUsed = Math.min(activeListings, 15);

  const applicantCountFor = (jobId: string) =>
    applications.filter((application) => application.jobId === jobId).length;

  const stats = [
    {
      label: "Total Listing Views",
      value: totalViews.toLocaleString(),
      caption: `across ${activeListings} listings`,
      icon: Eye,
    },
    {
      label: "Active Listings",
      value: activeListings.toLocaleString(),
      caption: "all currently open",
      icon: Plus,
    },
    {
      label: "Total Applicants",
      value: totalApplicants.toLocaleString(),
      caption: awaitingReview
        ? `${awaitingReview} awaiting review`
        : "no new applications yet",
      icon: Users,
    },
  ];

  return (
    <main className="flex flex-col gap-stack-lg p-4 md:p-8">
      <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {stats.map((stat) => (
          <Card
            key={stat.label}
            className="border-outline-variant/30 bg-surface-container-lowest shadow-card"
          >
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-body-sm font-medium text-on-surface-variant">
                <stat.icon className="h-4 w-4 text-outline" />
                {stat.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <span className="font-display text-headline-lg text-secondary">
                {stat.value}
              </span>
              <p className="mt-1 text-label-sm text-on-surface-variant">
                {stat.caption}
              </p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section>
        <div className="mb-stack-md flex items-center justify-between">
          <h2 className="font-display text-headline-md text-primary">
            Active Listings
          </h2>
          <Button
            variant="link"
            size="sm"
            render={<Link href="/employer/jobs" />}
            className="text-label-md text-secondary"
          >
            View all {activeListings}
          </Button>
        </div>

        <div className="flex flex-col gap-stack-md">
          {jobs.slice(0, 5).map((listing) => (
            <Card
              key={listing.id}
              className="gap-0 border-outline-variant/30 bg-surface-container-lowest py-0 shadow-card"
            >
              <CardContent className="flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <h3 className="text-body-lg font-bold text-secondary">
                      <Link
                        href={`/employer/jobs/${listing.id}`}
                        className="hover:underline"
                      >
                        {listing.title}
                      </Link>
                    </h3>
                    {listing.source === "posted" && (
                      <Badge className="bg-secondary text-label-sm text-on-secondary">
                        Posted by you
                      </Badge>
                    )}
                    <Badge className="bg-secondary-container/60 text-label-sm text-on-secondary-container">
                      {IMPACT_LABELS[listing.impactArea]}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
                    <span className="flex items-center gap-1 text-body-sm">
                      <MapPin className="h-4 w-4 text-outline" />
                      {listing.locationDisplay}
                    </span>
                    <span className="flex items-center gap-1 text-body-sm">
                      <Clock className="h-4 w-4 text-outline" />
                      {formatPostedAgo(listing.postedAt)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <p className="text-label-sm text-on-surface-variant">
                      Views
                    </p>
                    <p className="text-body-md font-bold text-on-surface">
                      {listing.views.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-label-sm text-on-surface-variant">
                      Applicants
                    </p>
                    <p className="text-body-md font-bold text-on-surface">
                      {applicantCountFor(listing.id)}
                    </p>
                  </div>
                  <Button
                    variant="brandOutline"
                    size="pill-sm"
                    render={<Link href={`/employer/jobs/${listing.id}`} />}
                  >
                    Review
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 gap-gutter lg:grid-cols-3">
        <Card className="border-outline-variant/30 bg-surface-container-lowest shadow-card lg:col-span-2">
          <CardHeader>
            <CardTitle className="font-display text-headline-md text-primary">
              Recent Applicant Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {applications.length === 0 ? (
              <p className="text-body-md text-on-surface-variant">
                No applications yet.
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-outline-variant/30">
                    <TableHead className="text-on-surface-variant">
                      Applicant
                    </TableHead>
                    <TableHead className="text-on-surface-variant">
                      Applied For
                    </TableHead>
                    <TableHead className="text-on-surface-variant">
                      Status
                    </TableHead>
                    <TableHead className="text-right text-on-surface-variant">
                      Action
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {applications.slice(0, 8).map((application) => (
                    <TableRow
                      key={application.id}
                      className="border-outline-variant/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-sm font-bold text-on-surface-variant">
                            {application.seeker.name
                              .split(" ")
                              .map((part) => part[0])
                              .slice(0, 2)
                              .join("")}
                          </span>
                          <div>
                            <p className="text-body-sm font-semibold text-on-surface">
                              {application.seeker.name}
                            </p>
                            <p className="text-label-sm text-on-surface-variant">
                              {application.seeker.headline ??
                                application.seeker.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-body-sm text-on-surface-variant">
                        {application.jobTitle}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${STATUS_STYLES[application.status]} rounded-full px-3`}
                        >
                          {STATUS_LABELS[application.status]}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="link"
                          size="sm"
                          render={
                            <Link href={`/employer/jobs/${application.jobId}`} />
                          }
                          className="text-label-md text-secondary"
                        >
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col gap-gutter">
          <Card className="border-transparent bg-primary-container text-on-primary shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-body-lg text-on-primary">
                Performance Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
              <div className="flex gap-3">
                <span className="h-fit rounded-lg bg-white/10 p-2">
                  <Lightbulb className="h-5 w-5 text-secondary-fixed" />
                </span>
                <div>
                  <p className="mb-1 text-body-sm font-bold text-on-primary">
                    Optimize your listings
                  </p>
                  <p className="text-label-sm text-on-primary-container">
                    Listings naming a specific climate outcome receive
                    noticeably more qualified applicants.
                  </p>
                </div>
              </div>
              <Separator className="bg-white/15" />
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-label-sm text-on-primary-container">
                    <Zap className="h-4 w-4 text-secondary-fixed" />
                    Applicants per listing
                  </span>
                  <span className="text-label-md font-bold text-on-primary">
                    {activeListings
                      ? (totalApplicants / activeListings).toFixed(1)
                      : "0"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-outline-variant/30 bg-surface-container-lowest shadow-card">
            <CardHeader>
              <CardTitle className="font-display text-body-lg text-primary">
                Subscription Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-label-sm text-on-surface-variant">
                Current Plan
              </p>
              <p className="mb-4 text-body-lg font-bold text-secondary">
                Starter
              </p>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-label-sm text-on-surface-variant">
                  {slotsUsed} of 15 featured slots used
                </span>
              </div>
              <Progress
                value={(slotsUsed / 15) * 100}
                className="h-1.5 bg-surface-container-high [&>div]:bg-secondary"
              />
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
