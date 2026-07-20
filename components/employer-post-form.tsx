"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { IMPACT_LABELS, ROLE_LABELS, SENIORITY_LABELS } from "@/lib/job-view";
import { addListing } from "@/lib/overlay";
import { useOverlay } from "@/lib/store";
import type { ImpactArea, Job, RoleType, Seniority } from "@/lib/types";

const ROLE_TYPES = Object.keys(ROLE_LABELS) as RoleType[];
const IMPACT_AREAS = Object.keys(IMPACT_LABELS) as ImpactArea[];
const SENIORITIES = Object.keys(SENIORITY_LABELS) as Seniority[];

function slugify(input: string) {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function EmployerPostForm() {
  const router = useRouter();
  const { overlay, update } = useOverlay();
  const session = overlay.session;

  const [title, setTitle] = useState("");
  const [city, setCity] = useState("");
  const [salaryMin, setSalaryMin] = useState("90000");
  const [salaryMax, setSalaryMax] = useState("130000");
  const [roleType, setRoleType] = useState<RoleType>("engineering");
  const [seniority, setSeniority] = useState<Seniority>("mid");
  const [impactArea, setImpactArea] = useState<ImpactArea>("renewable-energy");
  const [remote, setRemote] = useState("no");
  const [about, setAbout] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const canSubmit = title.trim() && city.trim() && about.trim();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!session || !canSubmit) return;
    setSubmitting(true);

    const min = Number(salaryMin) || 0;
    const max = Number(salaryMax) || min;
    const isRemote = remote === "yes";

    const job: Job = {
      id: `${slugify(title)}-${slugify(session.name)}-${Date.now()}`,
      title: title.trim(),
      posterId: session.userId,
      company: session.name,
      companyLogo: `/img/companies/${session.userId}.jpg`,
      companyLogoAlt: `${session.name} logo`,
      salaryMin: min,
      salaryMax: max,
      currency: "USD",
      city: city.trim(),
      country: "US",
      remote: isRemote,
      roleType,
      seniority,
      impactArea,
      postedAt: new Date().toISOString(),
      views: 0,
      salaryDisplay: `$${Math.round(min / 1000)}k – $${Math.round(max / 1000)}k`,
      locationDisplay: isRemote
        ? `${city.trim()} (Remote)`
        : `${city.trim()} (On-site)`,
      about: about.trim(),
      impactSummary: `This role contributes directly to ${session.name}'s climate targets.`,
      impactStats: [
        { value: "New", label: "Listing" },
        { value: "0", label: "Applicants" },
        { value: IMPACT_LABELS[impactArea], label: "Focus" },
      ],
      responsibilities: [
        "Responsibilities will be discussed during the first interview.",
      ],
      requirements: [`${SENIORITY_LABELS[seniority]} experience in this field.`],
      companyFacts: [{ label: "Company", value: session.name }],
    };

    update((current) => addListing(current, job));
    setSubmitting(false);
    router.push("/employer");
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
        <h2 className="font-display text-headline-lg text-primary">
          Post a role
        </h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          It appears on the board immediately.
        </p>
      </div>

      <Card className="max-w-3xl border-outline-variant/30 bg-surface-container-lowest shadow-card">
        <CardContent className="p-6">
          <form onSubmit={submit} className="flex flex-col gap-stack-md">
            <div className="grid gap-2">
              <Label htmlFor="job-title">Role title</Label>
              <Input
                id="job-title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Senior Grid Software Engineer"
                required
              />
            </div>

            <div className="grid gap-stack-md sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="job-city">City</Label>
                <Input
                  id="job-city"
                  value={city}
                  onChange={(event) => setCity(event.target.value)}
                  placeholder="Berlin"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="job-remote">Remote</Label>
                <Select value={remote} onValueChange={(v) => setRemote(v as string)}>
                  <SelectTrigger id="job-remote" className="h-10 w-full">
                    <SelectValue>
                      {(value) => (value === "yes" ? "Remote" : "On-site")}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="no">On-site</SelectItem>
                    <SelectItem value="yes">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-stack-md sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="job-salary-min">Salary from (USD)</Label>
                <Input
                  id="job-salary-min"
                  type="number"
                  step={1000}
                  value={salaryMin}
                  onChange={(event) => setSalaryMin(event.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="job-salary-max">Salary to (USD)</Label>
                <Input
                  id="job-salary-max"
                  type="number"
                  step={1000}
                  value={salaryMax}
                  onChange={(event) => setSalaryMax(event.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-stack-md sm:grid-cols-3">
              <div className="grid gap-2">
                <Label htmlFor="job-role">Team</Label>
                <Select
                  value={roleType}
                  onValueChange={(v) => setRoleType(v as RoleType)}
                >
                  <SelectTrigger id="job-role" className="h-10 w-full">
                    <SelectValue>
                      {(value) => ROLE_LABELS[value as RoleType]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_TYPES.map((role) => (
                      <SelectItem key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="job-seniority">Seniority</Label>
                <Select
                  value={seniority}
                  onValueChange={(v) => setSeniority(v as Seniority)}
                >
                  <SelectTrigger id="job-seniority" className="h-10 w-full">
                    <SelectValue>
                      {(value) => SENIORITY_LABELS[value as Seniority]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {SENIORITIES.map((level) => (
                      <SelectItem key={level} value={level}>
                        {SENIORITY_LABELS[level]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="job-impact">Impact area</Label>
                <Select
                  value={impactArea}
                  onValueChange={(v) => setImpactArea(v as ImpactArea)}
                >
                  <SelectTrigger id="job-impact" className="h-10 w-full">
                    <SelectValue>
                      {(value) => IMPACT_LABELS[value as ImpactArea]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {IMPACT_AREAS.map((area) => (
                      <SelectItem key={area} value={area}>
                        {IMPACT_LABELS[area]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="job-about">About the role</Label>
              <Textarea
                id="job-about"
                rows={5}
                value={about}
                onChange={(event) => setAbout(event.target.value)}
                placeholder="What will this person work on, and what climate outcome does it serve?"
                required
              />
            </div>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                size="pill"
                render={<Link href="/employer" />}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="pill"
                disabled={!canSubmit || submitting}
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Publish listing
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
