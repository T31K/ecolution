"use client";

import { useMemo, useState } from "react";
import { Banknote, Building2, MapPin } from "lucide-react";
import { JobCard } from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { ROLE_LABELS } from "@/lib/job-view";
import type { CompanyFact, Job, RoleType } from "@/lib/types";

type CompanyJobsProps = {
  jobs: Job[];
  facts: CompanyFact[];
  /** [continent, cities[]] pairs, largest group first. */
  continents: [string, string[]][];
};

/**
 * Client half of the company page: checkbox filters (multi-select) on the
 * left, the filtered role list on the right.
 */
export function CompanyJobs({ jobs, facts, continents }: CompanyJobsProps) {
  const [cities, setCities] = useState<Set<string>>(new Set());
  const [departments, setDepartments] = useState<Set<RoleType>>(new Set());
  const [salaryMin, setSalaryMin] = useState(0);
  // Snapshotted once so every card agrees on "now" across re-renders.
  const [now] = useState(() => Date.now());

  const roleTypes = useMemo(
    () => [...new Set(jobs.map((job) => job.roleType))],
    [jobs],
  );

  const toggle = <T,>(set: Set<T>, value: T): Set<T> => {
    const next = new Set(set);
    if (next.has(value)) next.delete(value);
    else next.add(value);
    return next;
  };

  const filtered = jobs.filter(
    (job) =>
      (cities.size === 0 || cities.has(job.city)) &&
      (departments.size === 0 || departments.has(job.roleType)) &&
      // Top of band clears the bar; salary 0 means undisclosed and only
      // shows when no salary floor is set.
      (salaryMin === 0 || job.salaryMax >= salaryMin),
  );

  const remoteCount = jobs.filter((job) => job.remote).length;
  const hasFilters = cities.size > 0 || departments.size > 0 || salaryMin > 0;

  return (
    <div className="grid grid-cols-1 gap-gutter lg:grid-cols-12">
      <aside className="flex flex-col gap-stack-lg lg:col-span-4">
        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
          <h2 className="mb-stack-md font-display text-body-lg font-bold text-primary">
            Company Profile
          </h2>
          <dl className="space-y-1">
            {facts.map((fact) => (
              <div
                key={fact.label}
                className="flex items-center justify-between border-b border-outline-variant/10 py-2 last:border-0"
              >
                <dt className="text-body-sm text-on-surface-variant">
                  {fact.label}
                </dt>
                <dd className="font-semibold text-primary">{fact.value}</dd>
              </div>
            ))}
            <div className="flex items-center justify-between border-t border-outline-variant/10 py-2">
              <dt className="text-body-sm text-on-surface-variant">
                Open roles
              </dt>
              <dd className="font-semibold text-primary">{jobs.length}</dd>
            </div>
            <div className="flex items-center justify-between py-2">
              <dt className="text-body-sm text-on-surface-variant">
                Remote roles
              </dt>
              <dd className="font-semibold text-primary">{remoteCount}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
          <h2 className="mb-stack-md flex items-center gap-2 font-display text-body-lg font-bold text-primary">
            <MapPin className="h-5 w-5 text-secondary" />
            Hiring in
          </h2>
          <div className="space-y-stack-md">
            {continents.map(([continent, continentCities]) => (
              <div key={continent}>
                <p className="mb-2 text-label-sm font-semibold tracking-wide text-outline uppercase">
                  {continent}
                </p>
                <div className="space-y-2">
                  {continentCities.map((city) => (
                    <Label
                      key={city}
                      className="flex cursor-pointer items-center gap-2.5 text-body-sm font-normal text-on-surface-variant hover:text-on-surface"
                    >
                      <Checkbox
                        checked={cities.has(city)}
                        onCheckedChange={() =>
                          setCities((current) => toggle(current, city))
                        }
                      />
                      {city}
                    </Label>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
          <h2 className="mb-stack-md flex items-center gap-2 font-display text-body-lg font-bold text-primary">
            <Building2 className="h-5 w-5 text-secondary" />
            Department
          </h2>
          <div className="space-y-2">
            {roleTypes.map((role) => (
              <Label
                key={role}
                className="flex cursor-pointer items-center gap-2.5 text-body-sm font-normal text-on-surface-variant hover:text-on-surface"
              >
                <Checkbox
                  checked={departments.has(role)}
                  onCheckedChange={() =>
                    setDepartments((current) => toggle(current, role))
                  }
                />
                {ROLE_LABELS[role]}
              </Label>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-stack-md shadow-card">
          <h2 className="mb-stack-md flex items-center gap-2 font-display text-body-lg font-bold text-primary">
            <Banknote className="h-5 w-5 text-secondary" />
            Salary
          </h2>
          <Slider
            value={[salaryMin]}
            onValueChange={(value) =>
              setSalaryMin(Array.isArray(value) ? value[0] : value)
            }
            max={300000}
            step={10000}
            aria-label="Minimum salary"
          />
          <p className="mt-3 text-body-sm text-on-surface-variant">
            {salaryMin === 0
              ? "Any salary"
              : `$${Math.round(salaryMin / 1000)}k+ (hides undisclosed)`}
          </p>
        </section>

      </aside>

      <div className="lg:col-span-8">
        <div className="mb-stack-md flex items-center justify-between">
          <h2 className="font-display text-headline-md text-primary">
            Open roles{" "}
            <span className="text-body-md font-normal text-on-surface-variant">
              ({filtered.length}
              {hasFilters ? ` of ${jobs.length}` : ""})
            </span>
          </h2>
          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setCities(new Set());
                setDepartments(new Set());
                setSalaryMin(0);
              }}
            >
              Clear filters
            </Button>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-stack-lg text-center shadow-card">
            <p className="mb-2 text-body-lg font-semibold text-on-surface">
              No roles match those filters
            </p>
            <p className="text-body-md text-on-surface-variant">
              Try unticking a city or department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-stack-md">
            {filtered.map((job) => (
              <JobCard key={job.id} job={job} now={now} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
