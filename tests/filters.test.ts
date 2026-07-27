import { describe, expect, it } from "vitest";
import {
  EMPTY_FILTERS,
  SALARY_FLOOR,
  filterJobs,
  filtersToQuery,
  hasActiveFilters,
  paginate,
  parseFilters,
} from "@/lib/filters";
import seed from "../data/seed.json";
import type { SeedData } from "@/lib/types";

const jobs = (seed as SeedData).jobs;

describe("parseFilters", () => {
  it("returns defaults for empty params", () => {
    expect(parseFilters({})).toEqual(EMPTY_FILTERS);
  });

  it("reads comma-separated and repeated values alike", () => {
    expect(parseFilters({ role: "engineering,policy" }).roles).toEqual([
      "engineering",
      "policy",
    ]);
    expect(parseFilters({ role: ["engineering", "policy"] }).roles).toEqual([
      "engineering",
      "policy",
    ]);
  });

  it("drops unknown role and impact values", () => {
    expect(parseFilters({ role: "engineering,wizardry" }).roles).toEqual([
      "engineering",
    ]);
    expect(parseFilters({ impact: "nonsense" }).impactAreas).toEqual([]);
  });

  it("treats country=remote as the remote flag", () => {
    const filters = parseFilters({ country: "DE,remote" });
    expect(filters.countries).toEqual(["DE"]);
    expect(filters.remote).toBe(true);
  });

  it("clamps salary and page into range", () => {
    expect(parseFilters({ salaryMin: "999999" }).salaryMin).toBe(300000);
    expect(parseFilters({ salaryMin: "-5" }).salaryMin).toBe(SALARY_FLOOR);
    expect(parseFilters({ salaryMin: "abc" }).salaryMin).toBe(SALARY_FLOOR);
    expect(parseFilters({ page: "0" }).page).toBe(1);
  });

  it("round-trips through filtersToQuery", () => {
    const filters = parseFilters({
      q: "grid",
      country: "DE,remote",
      role: "engineering",
      impact: "renewable-energy",
      salaryMin: "90000",
      page: "2",
    });
    expect(parseFilters(Object.fromEntries(new URLSearchParams(filtersToQuery(filters))))).toEqual(
      filters,
    );
  });

  it("omits defaults from the query string", () => {
    expect(filtersToQuery(EMPTY_FILTERS)).toBe("");
  });
});

describe("filterJobs", () => {
  it("returns everything when nothing is set", () => {
    expect(filterJobs(jobs, EMPTY_FILTERS)).toHaveLength(jobs.length);
  });

  it("narrows by role and only returns that role", () => {
    const result = filterJobs(jobs, { ...EMPTY_FILTERS, roles: ["engineering"] });
    expect(result.length).toBeGreaterThan(0);
    expect(result.length).toBeLessThan(jobs.length);
    for (const job of result) expect(job.roleType).toBe("engineering");
  });

  it("ORs within a group", () => {
    const one = filterJobs(jobs, { ...EMPTY_FILTERS, roles: ["engineering"] });
    const two = filterJobs(jobs, {
      ...EMPTY_FILTERS,
      roles: ["engineering", "policy"],
    });
    expect(two.length).toBeGreaterThan(one.length);
  });

  it("ANDs across groups", () => {
    const role = filterJobs(jobs, { ...EMPTY_FILTERS, roles: ["engineering"] });
    const both = filterJobs(jobs, {
      ...EMPTY_FILTERS,
      roles: ["engineering"],
      countries: ["DE"],
    });
    expect(both.length).toBeLessThanOrEqual(role.length);
    for (const job of both) {
      expect(job.roleType).toBe("engineering");
      expect(job.country).toBe("DE");
    }
  });

  it("matches remote roles when remote is selected", () => {
    const result = filterJobs(jobs, { ...EMPTY_FILTERS, remote: true });
    expect(result.length).toBeGreaterThan(0);
    for (const job of result) expect(job.remote).toBe(true);
  });

  it("combines a country with remote as an OR", () => {
    const result = filterJobs(jobs, {
      ...EMPTY_FILTERS,
      countries: ["DE"],
      remote: true,
    });
    for (const job of result) {
      expect(job.country === "DE" || job.remote).toBe(true);
    }
  });

  it("keeps roles whose top of band clears the salary bar", () => {
    const result = filterJobs(jobs, { ...EMPTY_FILTERS, salaryMin: 200000 });
    expect(result.length).toBeGreaterThan(0);
    for (const job of result) expect(job.salaryMax).toBeGreaterThanOrEqual(200000);
  });

  it("searches title, company, city and requirements", () => {
    const byTitle = filterJobs(jobs, { ...EMPTY_FILTERS, q: "engineer" });
    expect(byTitle.length).toBeGreaterThan(0);

    const byCompany = filterJobs(jobs, { ...EMPTY_FILTERS, q: "watershed" });
    expect(byCompany.length).toBeGreaterThan(0);
    for (const job of byCompany) {
      const hay = `${job.title} ${job.company} ${job.city} ${job.requirements.join(" ")}`;
      expect(hay.toLowerCase()).toContain("watershed");
    }

    const byCity = filterJobs(jobs, { ...EMPTY_FILTERS, q: "berlin" });
    expect(byCity.length).toBeGreaterThan(0);
  });

  it("is case-insensitive", () => {
    const lower = filterJobs(jobs, { ...EMPTY_FILTERS, q: "berlin" });
    const upper = filterJobs(jobs, { ...EMPTY_FILTERS, q: "BERLIN" });
    expect(upper.length).toBe(lower.length);
  });

  it("returns an empty array when nothing matches", () => {
    expect(
      filterJobs(jobs, { ...EMPTY_FILTERS, q: "zzzz-no-such-role" }),
    ).toEqual([]);
  });
});

describe("paginate", () => {
  it("slices the requested page", () => {
    const page1 = paginate(jobs, 1);
    const page2 = paginate(jobs, 2);
    expect(page1.items).toHaveLength(20);
    expect(page1.items[0].id).not.toBe(page2.items[0].id);
    expect(page1.total).toBe(jobs.length);
    expect(page1.totalPages).toBe(Math.ceil(jobs.length / 20));
  });

  it("clamps a page beyond the end", () => {
    const result = paginate(jobs, 9999);
    expect(result.current).toBe(result.totalPages);
    expect(result.items.length).toBeGreaterThan(0);
  });

  it("handles an empty list without dividing by zero", () => {
    const result = paginate([], 1);
    expect(result.items).toEqual([]);
    expect(result.totalPages).toBe(1);
    expect(result.total).toBe(0);
  });
});

describe("hasActiveFilters", () => {
  it("is false for defaults and true for any change", () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, q: "x" })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, remote: true })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, salaryMin: 90000 })).toBe(true);
  });
});
