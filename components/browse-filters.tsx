"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  ROLE_LABELS,
  IMPACT_LABELS,
} from "@/lib/job-view";
import {
  SALARY_CEILING,
  SALARY_FLOOR,
  filtersToQuery,
  hasActiveFilters,
  parseFilters,
  type JobFilters,
} from "@/lib/filters";
import type { ImpactArea, RoleType } from "@/lib/types";

const ROLE_TYPES = Object.keys(ROLE_LABELS) as RoleType[];

/** Label lookup so the trigger shows "Germany", not "DE". */
const LOCATION_LABELS = (countries: string[]): Record<string, string> => ({
  any: "Anywhere",
  remote: "Remote only",
  ...Object.fromEntries(
    countries.map((country) => [country, COUNTRY_NAMES[country] ?? country]),
  ),
});
const IMPACT_AREAS = Object.keys(IMPACT_LABELS) as ImpactArea[];

export function BrowseFilters({ countries }: { countries: string[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(Object.fromEntries(searchParams.entries()));

  /**
   * All filter state lives in the URL, so the server can do the filtering and
   * links stay shareable. Every control writes through this.
   */
  const apply = (patch: Partial<JobFilters>) => {
    const next = { ...filters, ...patch, page: 1 };
    const query = filtersToQuery(next);
    router.push(query ? `/browse?${query}` : "/browse", { scroll: false });
  };

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value)
      ? list.filter((item) => item !== value)
      : [...list, value];

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="sticky top-24 rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-6 shadow-sm">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-headline-md text-on-surface">
            Filters
          </h2>
          {hasActiveFilters(filters) && (
            <Button
              variant="link"
              size="sm"
              onClick={() => router.push("/browse", { scroll: false })}
              className="h-auto p-0 text-label-sm text-secondary"
            >
              Clear all
            </Button>
          )}
        </div>

        <fieldset className="mb-6">
          <legend className="mb-3 block text-label-md text-on-surface">
            Role Type
          </legend>
          <div className="space-y-2">
            {ROLE_TYPES.map((role) => {
              const checked = filters.roles.includes(role);
              return (
                <Label
                  key={role}
                  htmlFor={`role-${role}`}
                  className="group flex cursor-pointer items-center gap-3 font-normal"
                >
                  <Checkbox
                    id={`role-${role}`}
                    checked={checked}
                    onCheckedChange={() =>
                      apply({ roles: toggle(filters.roles, role) })
                    }
                  />
                  <span
                    className={
                      checked
                        ? "text-body-sm font-semibold text-secondary"
                        : "text-body-sm text-on-surface-variant group-hover:text-secondary"
                    }
                  >
                    {ROLE_LABELS[role]}
                  </span>
                </Label>
              );
            })}
          </div>
        </fieldset>

        <div className="mb-6">
          <Label htmlFor="filter-country" className="mb-3 text-label-md">
            Location
          </Label>
          <Select
            value={filters.remote ? "remote" : (filters.countries[0] ?? "any")}
            onValueChange={(value) => {
              if (value === "any") apply({ countries: [], remote: false });
              else if (value === "remote")
                apply({ countries: [], remote: true });
              else apply({ countries: [value as string], remote: false });
            }}
          >
            <SelectTrigger
              id="filter-country"
              className="h-10 w-full text-body-sm"
            >
              <MapPin className="h-4 w-4 shrink-0 text-outline" />
              <SelectValue>
                {(value) => LOCATION_LABELS(countries)[value as string]}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="any">Anywhere</SelectItem>
              <SelectItem value="remote">Remote only</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country} value={country}>
                  {COUNTRY_NAMES[country] ?? country}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="mb-6">
          <Label htmlFor="filter-salary" className="mb-3 text-label-md">
            Minimum salary
          </Label>
          <Slider
            id="filter-salary"
            min={SALARY_FLOOR}
            max={SALARY_CEILING}
            step={10000}
            value={filters.salaryMin}
            onValueCommitted={(value) =>
              apply({ salaryMin: Array.isArray(value) ? value[0] : value })
            }
          />
          <div className="mt-2 flex justify-between">
            <span className="text-label-sm text-on-surface-variant">Any</span>
            <span className="text-label-sm font-semibold text-secondary">
              {filters.salaryMin > SALARY_FLOOR
                ? `${Math.round(filters.salaryMin / 1000)}k+`
                : "No minimum"}
            </span>
            <span className="text-label-sm text-on-surface-variant">300k+</span>
          </div>
        </div>

        <div>
          <span className="mb-3 block text-label-md text-on-surface">
            Impact Area
          </span>
          <div className="flex flex-wrap gap-2">
            {IMPACT_AREAS.map((area) => {
              const active = filters.impactAreas.includes(area);
              return (
                <Button
                  key={area}
                  size="sm"
                  variant={active ? "secondary" : "outline"}
                  aria-pressed={active}
                  onClick={() =>
                    apply({ impactAreas: toggle(filters.impactAreas, area) })
                  }
                  className="text-label-sm"
                >
                  {IMPACT_LABELS[area]}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </aside>
  );
}

export const COUNTRY_NAMES: Record<string, string> = {
  US: "United States",
  GB: "United Kingdom",
  DE: "Germany",
  DK: "Denmark",
  NO: "Norway",
  NL: "Netherlands",
  CH: "Switzerland",
  CA: "Canada",
  ES: "Spain",
  IT: "Italy",
  FR: "France",
  PT: "Portugal",
  PL: "Poland",
  SE: "Sweden",
  IE: "Ireland",
  BE: "Belgium",
  AT: "Austria",
  IN: "India",
  TW: "Taiwan",
  MN: "Mongolia",
  MX: "Mexico",
  BR: "Brazil",
  AU: "Australia",
  AE: "United Arab Emirates",
  UM: "U.S. Outlying Islands",
};
