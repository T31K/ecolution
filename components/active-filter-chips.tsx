"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { COUNTRY_NAMES } from "./browse-filters";
import { IMPACT_LABELS, ROLE_LABELS } from "@/lib/job-view";
import {
  SALARY_FLOOR,
  filtersToQuery,
  hasActiveFilters,
  parseFilters,
  type JobFilters,
} from "@/lib/filters";

/**
 * Mirrors whatever is in the URL so an active filter is never invisible —
 * the failure mode is a user staring at three results wondering why.
 */
export function ActiveFilterChips() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const filters = parseFilters(Object.fromEntries(searchParams.entries()));

  if (!hasActiveFilters(filters)) return null;

  const go = (next: JobFilters) => {
    const query = filtersToQuery({ ...next, page: 1 });
    router.push(query ? `/browse?${query}` : "/browse", { scroll: false });
  };

  const chips: { key: string; label: string; clear: () => void }[] = [];

  if (filters.q) {
    chips.push({
      key: "q",
      label: `“${filters.q}”`,
      clear: () => go({ ...filters, q: "" }),
    });
  }

  if (filters.remote) {
    chips.push({
      key: "remote",
      label: "Remote only",
      clear: () => go({ ...filters, remote: false }),
    });
  }

  for (const country of filters.countries) {
    chips.push({
      key: `country-${country}`,
      label: COUNTRY_NAMES[country] ?? country,
      clear: () =>
        go({
          ...filters,
          countries: filters.countries.filter((item) => item !== country),
        }),
    });
  }

  for (const role of filters.roles) {
    chips.push({
      key: `role-${role}`,
      label: ROLE_LABELS[role],
      clear: () =>
        go({ ...filters, roles: filters.roles.filter((item) => item !== role) }),
    });
  }

  for (const area of filters.impactAreas) {
    chips.push({
      key: `impact-${area}`,
      label: IMPACT_LABELS[area],
      clear: () =>
        go({
          ...filters,
          impactAreas: filters.impactAreas.filter((item) => item !== area),
        }),
    });
  }

  if (filters.salaryMin > SALARY_FLOOR) {
    chips.push({
      key: "salary",
      label: `${Math.round(filters.salaryMin / 1000)}k+`,
      clear: () => go({ ...filters, salaryMin: SALARY_FLOOR }),
    });
  }

  return (
    <div className="mb-stack-md flex flex-wrap items-center gap-2">
      {chips.map((chip) => (
        <Button
          key={chip.key}
          size="sm"
          variant="outline"
          onClick={chip.clear}
          aria-label={`Remove filter ${chip.label}`}
          className="rounded-full border-secondary/30 bg-secondary/5 text-label-sm text-secondary hover:bg-secondary/10"
        >
          {chip.label}
          <X className="h-3.5 w-3.5" />
        </Button>
      ))}
      <Button
        variant="link"
        size="sm"
        onClick={() => router.push("/browse", { scroll: false })}
        className="h-auto p-0 text-label-sm text-on-surface-variant hover:text-secondary"
      >
        Clear all
      </Button>
    </div>
  );
}
