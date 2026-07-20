import {
  ArrowRight,
  Bell,
  Clock,
  Lightbulb,
  MapPin,
  MoreVertical,
  Plus,
  TrendingUp,
  Zap,
} from "lucide-react";
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
import { SidebarTrigger } from "@/components/ui/sidebar";
import { APPLICANTS, LISTINGS, STATS } from "@/lib/employer-data";

const STATUS_STYLES: Record<string, string> = {
  Active: "bg-secondary-container/50 text-on-secondary-container",
  Draft: "bg-surface-container-high text-on-surface-variant",
  Promoted: "bg-secondary text-on-secondary",
  New: "bg-secondary-container/50 text-on-secondary-container",
  Interviewing: "bg-secondary text-on-secondary",
  Reviewing: "bg-surface-container-high text-on-surface-variant",
};

export default function EmployerDashboardPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface px-4 py-3 md:px-8">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-on-surface-variant" />
          <h1 className="text-body-md font-semibold text-on-surface">
            Employer Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button className="rounded-full bg-secondary text-on-secondary hover:bg-secondary/90">
            <Plus />
            Post a Job
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="text-on-surface-variant hover:text-secondary"
          >
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </header>

      <main className="flex flex-col gap-stack-lg p-4 md:p-8">
        <section className="grid grid-cols-1 gap-gutter md:grid-cols-3">
          {STATS.map((stat) => (
            <Card
              key={stat.label}
              className="border-outline-variant/30 bg-surface-container-lowest shadow-card"
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-body-sm font-medium text-on-surface-variant">
                  {stat.label}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="font-display text-headline-lg text-secondary">
                    {stat.value}
                  </span>
                  {stat.delta && (
                    <span className="flex items-center gap-0.5 text-label-sm font-semibold text-secondary">
                      <TrendingUp className="h-3.5 w-3.5" />
                      {stat.delta}
                    </span>
                  )}
                </div>
                {stat.caption && (
                  <p className="mt-1 text-label-sm text-on-surface-variant">
                    {stat.caption}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </section>

        <section>
          <div className="mb-stack-md flex items-center justify-between">
            <h2 className="font-display text-headline-md text-primary">
              Active Listings
            </h2>
            <a
              href="#"
              className="text-label-md text-secondary hover:underline"
            >
              View All
            </a>
          </div>

          <div className="flex flex-col gap-stack-md">
            {LISTINGS.map((listing) => (
              <Card
                key={listing.id}
                className={
                  listing.highImpact
                    ? "border-secondary/40 bg-surface-container-lowest shadow-card"
                    : "border-outline-variant/30 bg-surface-container-lowest shadow-card"
                }
              >
                <CardContent className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <h3 className="text-body-lg font-bold text-secondary">
                        {listing.title}
                      </h3>
                      {listing.highImpact && (
                        <Badge className="bg-secondary-container/60 text-label-sm text-on-secondary-container">
                          High Impact
                        </Badge>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-on-surface-variant">
                      <span className="flex items-center gap-1 text-body-sm">
                        <MapPin className="h-4 w-4 text-outline" />
                        {listing.location}
                      </span>
                      <span className="flex items-center gap-1 text-body-sm">
                        <Clock className="h-4 w-4 text-outline" />
                        {listing.posted}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-label-sm text-on-surface-variant">
                        Views
                      </p>
                      <p className="text-body-md font-bold text-on-surface">
                        {listing.views}
                      </p>
                    </div>
                    <div className="text-center">
                      <p className="text-label-sm text-on-surface-variant">
                        Apps
                      </p>
                      <p className="text-body-md font-bold text-on-surface">
                        {listing.apps}
                      </p>
                    </div>
                    <Badge
                      className={`${STATUS_STYLES[listing.status]} rounded-full px-3`}
                    >
                      {listing.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      aria-label={`More options for ${listing.title}`}
                      className="text-on-surface-variant hover:text-secondary"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </Button>
                  </div>
                </CardContent>

                <Separator className="bg-outline-variant/30" />

                <CardContent className="flex flex-wrap items-center justify-between gap-2 pt-0">
                  <p className="text-label-sm text-on-surface-variant">
                    {listing.footnote ?? " "}
                  </p>
                  <a
                    href="#"
                    className="flex items-center gap-1 text-label-md text-secondary hover:underline"
                  >
                    {listing.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
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
                  {APPLICANTS.map((applicant) => (
                    <TableRow
                      key={applicant.name}
                      className="border-outline-variant/30"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface-container-high text-label-sm font-bold text-on-surface-variant">
                            {applicant.initials}
                          </span>
                          <div>
                            <p className="text-body-sm font-semibold text-on-surface">
                              {applicant.name}
                            </p>
                            <p className="text-label-sm text-on-surface-variant">
                              {applicant.experience}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-body-sm text-on-surface-variant">
                        {applicant.appliedFor}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={`${STATUS_STYLES[applicant.status]} rounded-full px-3`}
                        >
                          {applicant.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <a
                          href="#"
                          className="text-label-md text-secondary hover:underline"
                        >
                          View
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
                      Listings with specific &ldquo;Climate Impact&rdquo; goals
                      receive 40% more qualified applicants.
                    </p>
                  </div>
                </div>
                <a
                  href="#"
                  className="text-label-md text-secondary-fixed hover:underline"
                >
                  Learn how to write impact roles
                </a>
                <Separator className="bg-white/15" />
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-label-sm text-on-primary-container">
                      <Zap className="h-4 w-4 text-secondary-fixed" />
                      EcoScore
                    </span>
                    <span className="text-label-md font-bold text-on-primary">
                      88/100
                    </span>
                  </div>
                  <Progress
                    value={88}
                    className="h-1.5 bg-white/15 [&>div]:bg-secondary-fixed"
                  />
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
                  Impact Pro
                </p>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-label-sm text-on-surface-variant">
                    5 of 15 active slots used
                  </span>
                </div>
                <Progress
                  value={33}
                  className="h-1.5 bg-surface-container-high [&>div]:bg-secondary"
                />
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
