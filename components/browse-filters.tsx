"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
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
            <button
              onClick={() => router.push("/browse", { scroll: false })}
              className="text-label-sm text-secondary hover:underline"
            >
              Clear all
            </button>
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
                <label
                  key={role}
                  className="group flex cursor-pointer items-center gap-3"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() =>
                      apply({ roles: toggle(filters.roles, role) })
                    }
                    className="h-5 w-5 rounded border-outline accent-secondary"
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
                </label>
              );
            })}
          </div>
        </fieldset>

        <div className="mb-6">
          <label
            htmlFor="filter-country"
            className="mb-3 block text-label-md text-on-surface"
          >
            Location
          </label>
          <div className="relative">
            <MapPin className="absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2 text-outline" />
            <select
              id="filter-country"
              value={filters.remote ? "remote" : (filters.countries[0] ?? "")}
              onChange={(event) => {
                const value = event.target.value;
                if (value === "") apply({ countries: [], remote: false });
                else if (value === "remote")
                  apply({ countries: [], remote: true });
                else apply({ countries: [value], remote: false });
              }}
              className="w-full cursor-pointer rounded-lg border border-outline-variant py-2 pr-4 pl-10 text-body-sm focus:border-secondary focus:ring-2 focus:ring-secondary/20 focus:outline-none"
            >
              <option value="">Anywhere</option>
              <option value="remote">Remote only</option>
              {countries.map((country) => (
                <option key={country} value={country}>
                  {COUNTRY_NAMES[country] ?? country}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mb-6">
          <label
            htmlFor="filter-salary"
            className="mb-3 block text-label-md text-on-surface"
          >
            Minimum salary
          </label>
          <input
            id="filter-salary"
            type="range"
            min={SALARY_FLOOR}
            max={SALARY_CEILING}
            step={10000}
            value={filters.salaryMin}
            onChange={(event) =>
              apply({ salaryMin: Number(event.target.value) })
            }
            className="h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-highest accent-secondary"
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
                <button
                  key={area}
                  aria-pressed={active}
                  onClick={() =>
                    apply({ impactAreas: toggle(filters.impactAreas, area) })
                  }
                  className={
                    active
                      ? "rounded border border-secondary/20 bg-surface-container-highest px-3 py-1.5 text-label-sm text-secondary"
                      : "rounded border border-outline-variant/30 bg-surface-container-low px-3 py-1.5 text-label-sm text-on-surface-variant hover:border-secondary/50"
                  }
                >
                  {IMPACT_LABELS[area]}
                </button>
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
};
