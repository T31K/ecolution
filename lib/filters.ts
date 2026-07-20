import type { ImpactArea, Job, RoleType } from "./types";

export type JobFilters = {
  q: string;
  countries: string[];
  remote: boolean;
  roles: RoleType[];
  impactAreas: ImpactArea[];
  salaryMin: number;
  page: number;
};

export const PAGE_SIZE = 20;
export const SALARY_FLOOR = 40000;
export const SALARY_CEILING = 300000;

export const EMPTY_FILTERS: JobFilters = {
  q: "",
  countries: [],
  remote: false,
  roles: [],
  impactAreas: [],
  salaryMin: SALARY_FLOOR,
  page: 1,
};

const ROLE_VALUES: RoleType[] = [
  "engineering",
  "data-science",
  "product",
  "policy",
  "operations",
];

const IMPACT_VALUES: ImpactArea[] = [
  "renewable-energy",
  "carbon-capture",
  "water-systems",
  "circular-economy",
];

/** Accepts repeated params (?role=a&role=b) and comma-separated (?role=a,b). */
function readList(value: string | string[] | undefined): string[] {
  if (!value) return [];
  const raw = Array.isArray(value) ? value : [value];
  return raw
    .flatMap((entry) => entry.split(","))
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function readNumber(value: string | string[] | undefined, fallback: number) {
  const raw = Array.isArray(value) ? value[0] : value;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Parses URL search params into filters. Unknown values are dropped rather
 * than passed through, so a hand-edited URL cannot produce an empty board
 * with no visible explanation.
 */
export function parseFilters(
  params: Record<string, string | string[] | undefined>,
): JobFilters {
  const countries = readList(params.country);
  const remote = countries.includes("remote");

  return {
    q: (Array.isArray(params.q) ? params.q[0] : (params.q ?? "")).trim(),
    countries: countries.filter((entry) => entry !== "remote"),
    remote,
    roles: readList(params.role).filter((entry): entry is RoleType =>
      ROLE_VALUES.includes(entry as RoleType),
    ),
    impactAreas: readList(params.impact).filter((entry): entry is ImpactArea =>
      IMPACT_VALUES.includes(entry as ImpactArea),
    ),
    salaryMin: Math.max(
      SALARY_FLOOR,
      Math.min(SALARY_CEILING, readNumber(params.salaryMin, SALARY_FLOOR)),
    ),
    page: Math.max(1, Math.floor(readNumber(params.page, 1))),
  };
}

/** Serialises filters back to a query string, omitting defaults. */
export function filtersToQuery(filters: JobFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);

  const countries = [...filters.countries];
  if (filters.remote) countries.push("remote");
  if (countries.length) params.set("country", countries.join(","));

  if (filters.roles.length) params.set("role", filters.roles.join(","));
  if (filters.impactAreas.length)
    params.set("impact", filters.impactAreas.join(","));
  if (filters.salaryMin > SALARY_FLOOR)
    params.set("salaryMin", String(filters.salaryMin));
  if (filters.page > 1) params.set("page", String(filters.page));

  return params.toString();
}

function matchesQuery(job: Job, q: string): boolean {
  if (!q) return true;
  const needle = q.toLowerCase();
  return (
    job.title.toLowerCase().includes(needle) ||
    job.company.toLowerCase().includes(needle) ||
    job.city.toLowerCase().includes(needle) ||
    job.requirements.some((line) => line.toLowerCase().includes(needle))
  );
}

/**
 * Groups combine with AND; values within a group combine with OR. Salary
 * compares against salaryMax so a role whose top of band clears the bar is
 * still shown — filtering on salaryMin would hide roles that could pay it.
 */
export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  return jobs.filter((job) => {
    if (!matchesQuery(job, filters.q)) return false;

    if (filters.countries.length || filters.remote) {
      const countryMatch = filters.countries.includes(job.country);
      const remoteMatch = filters.remote && job.remote;
      if (!countryMatch && !remoteMatch) return false;
    }

    if (filters.roles.length && !filters.roles.includes(job.roleType)) {
      return false;
    }

    if (
      filters.impactAreas.length &&
      !filters.impactAreas.includes(job.impactArea)
    ) {
      return false;
    }

    // The floor means "no minimum", not "at least 40k" — otherwise the
    // default view silently hides internships, whose bands sit below it.
    if (filters.salaryMin > SALARY_FLOOR && job.salaryMax < filters.salaryMin) {
      return false;
    }

    return true;
  });
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, totalPages);
  const start = (current - 1) * size;
  return {
    items: items.slice(start, start + size),
    current,
    totalPages,
    total: items.length,
  };
}

export function hasActiveFilters(filters: JobFilters): boolean {
  return (
    filters.q !== "" ||
    filters.countries.length > 0 ||
    filters.remote ||
    filters.roles.length > 0 ||
    filters.impactAreas.length > 0 ||
    filters.salaryMin > SALARY_FLOOR
  );
}
