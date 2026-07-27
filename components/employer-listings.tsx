"use client";

import Link from "next/link";
import { ArrowRight, Clock, MapPin, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  OverviewStatus,
  useEmployerOverview,
} from "@/components/employer-dashboard";
import { IMPACT_LABELS, formatPostedAgo } from "@/lib/job-view";

export function EmployerListings() {
  const { session, data, error, retry, loading } = useEmployerOverview();

  if (loading || error || !data) {
    return (
      <OverviewStatus
        loading={loading}
        error={error}
        retry={retry}
        label="Loading listings…"
      />
    );
  }

  const jobs = [...data.jobs].sort((a, b) => b.postedAt.localeCompare(a.postedAt));

  const countFor = (jobId: string) =>
    data.applications.filter((application) => application.jobId === jobId)
      .length;

  const company =
    session?.user.company ?? session?.user.name ?? "your company";

  return (
    <main className="flex flex-col gap-stack-lg p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-headline-lg text-primary">
            My Jobs
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {jobs.length} {jobs.length === 1 ? "listing" : "listings"} at{" "}
            {company}
          </p>
        </div>
        <Button variant="brand" size="pill" render={<Link href="/employer/post" />}>
          <Plus className="h-4 w-4" />
          Post a Job
        </Button>
      </div>

      <div className="flex flex-col gap-stack-md">
        {jobs.map((listing) => (
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
                  <span className="text-body-sm">{listing.salaryDisplay}</span>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant">Views</p>
                  <p className="text-body-md font-bold text-on-surface">
                    {listing.views.toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-label-sm text-on-surface-variant">
                    Applicants
                  </p>
                  <p className="text-body-md font-bold text-on-surface">
                    {countFor(listing.id)}
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
    </main>
  );
}
