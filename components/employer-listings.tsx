"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Clock, Loader2, MapPin, Plus } from "lucide-react";
import { getEmployerData, type EmployerData } from "@/app/employer/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { IMPACT_LABELS, formatPostedAgo } from "@/lib/job-view";
import { mergeApplications } from "@/lib/overlay";
import { useOverlay } from "@/lib/store";

export function EmployerListings() {
  const { overlay } = useOverlay();
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
          <span className="text-body-md">Loading listings…</span>
        </div>
      </div>
    );
  }

  const localListings = overlay.listings.filter(
    (job) => job.posterId === session?.userId,
  );
  const seededIds = new Set(data.listings.map((listing) => listing.id));

  const applications = mergeApplications(
    data.applicants.map((row) => row.application),
    overlay,
  );

  const countFor = (jobId: string) =>
    applications.filter((application) => application.jobId === jobId).length;

  const all = [...localListings, ...data.listings];

  return (
    <main className="flex flex-col gap-stack-lg p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-headline-lg text-primary">
            My Jobs
          </h2>
          <p className="mt-1 text-body-md text-on-surface-variant">
            {all.length} {all.length === 1 ? "listing" : "listings"} at{" "}
            {data.company}
          </p>
        </div>
        <Button variant="brand" size="pill" render={<Link href="/employer/post" />}>
          <Plus className="h-4 w-4" />
          Post a Job
        </Button>
      </div>

      <div className="flex flex-col gap-stack-md">
        {all.map((listing) => (
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
                  {!seededIds.has(listing.id) && (
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
