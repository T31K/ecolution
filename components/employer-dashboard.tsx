"use client";

import { useEffect, useState } from "react";
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
import { getEmployerData, type EmployerData } from "@/app/employer/actions";
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
import { mergeApplications } from "@/lib/overlay";
import { STATUS_LABELS, STATUS_STYLES } from "@/lib/status";
import { useOverlay } from "@/lib/store";

export function EmployerDashboard() {
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
          <span className="text-body-md">Loading your dashboard…</span>
        </div>
      </div>
    );
  }

  // Listings this poster created in-session sit on top of the seeded ones.
  const localListings = overlay.listings.filter(
    (job) => job.posterId === session?.userId,
  );

  const seededJobIds = new Set(data.listings.map((listing) => listing.id));
  const ownedJobIds = new Set([
    ...seededJobIds,
    ...localListings.map((job) => job.id),
  ]);

  // Seeded applications plus anything submitted in this browser, with status
  // patches applied — this is what makes the seeker round trip visible.
  const allApplications = mergeApplications(
    data.applicants.map((row) => row.application),
    overlay,
  ).filter((application) => ownedJobIds.has(application.jobId));

  const seekerByApplication = new Map(
    data.applicants.map((row) => [row.application.id, row]),
  );

  const totalApplicants = allApplications.length;
  const newThisSession = overlay.applications.filter((application) =>
    ownedJobIds.has(application.jobId),
  ).length;

  const activeListings = data.listings.length + localListings.length;
  const slotsUsed = Math.min(activeListings, 15);

  const stats = [
    {
      label: "Total Listing Views",
      value: data.totalViews.toLocaleString(),
      caption: `across ${activeListings} listings`,
      icon: Eye,
    },
    {
      label: "Active Listings",
      value: activeListings.toLocaleString(),
      caption: localListings.length
        ? `${localListings.length} posted this session`
        : "all currently open",
      icon: Plus,
    },
    {
      label: "Total Applicants",
      value: totalApplicants.toLocaleString(),
      caption: newThisSession
        ? `+${newThisSession} new this session`
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
          {[...localListings, ...data.listings].slice(0, 5).map((listing) => {
            const applicationCount = allApplications.filter(
              (application) => application.jobId === listing.id,
            ).length;
            const isLocal = !seededJobIds.has(listing.id);

            return (
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
                      {isLocal && (
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
                        {applicationCount}
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
            );
          })}
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
            {allApplications.length === 0 ? (
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
                  {allApplications.slice(0, 8).map((application) => {
                    const row = seekerByApplication.get(application.id);
                    const isLocal = !row;
                    const name = row?.seeker.name ?? session?.name ?? "Applicant";
                    const title =
                      row?.jobTitle ??
                      localListings.find((job) => job.id === application.jobId)
                        ?.title ??
                      data.listings.find(
                        (listing) => listing.id === application.jobId,
                      )?.title ??
                      application.jobId;

                    return (
                      <TableRow
                        key={application.id}
                        className="border-outline-variant/30"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-sm font-bold text-on-surface-variant">
                              {name
                                .split(" ")
                                .map((part) => part[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <div>
                              <p className="text-body-sm font-semibold text-on-surface">
                                {name}
                              </p>
                              <p className="text-label-sm text-on-surface-variant">
                                {isLocal
                                  ? "Applied just now"
                                  : `${row.seeker.yearsExperience} years exp.`}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-body-sm text-on-surface-variant">
                          {title}
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
                              <Link
                                href={`/employer/jobs/${application.jobId}`}
                              />
                            }
                            className="text-label-md text-secondary"
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
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
                {data.plan}
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
