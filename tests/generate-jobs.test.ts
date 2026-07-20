import { describe, expect, it } from "vitest";
import { createRng } from "@/scripts/seed/rng";
import { generateJobs } from "@/scripts/seed/generate-jobs";
import { COMPANIES, ROLE_TEMPLATES } from "@/scripts/seed/catalog";

const NOW = new Date("2026-07-20T12:00:00Z");

function build(total = 500) {
  return generateJobs(createRng(2026), total, NOW);
}

describe("generateJobs", () => {
  it("generates the requested number of jobs", () => {
    expect(build()).toHaveLength(500);
  });

  it("is deterministic for a fixed seed", () => {
    const a = generateJobs(createRng(99), 50, NOW);
    const b = generateJobs(createRng(99), 50, NOW);
    expect(a).toEqual(b);
  });

  it("gives every job a unique slug id", () => {
    const jobs = build();
    const ids = new Set(jobs.map((job) => job.id));
    expect(ids.size).toBe(jobs.length);
    for (const job of jobs) {
      expect(job.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("produces coherent salary ranges", () => {
    for (const job of build()) {
      expect(job.salaryMin).toBeGreaterThan(0);
      expect(job.salaryMax).toBeGreaterThan(job.salaryMin);
    }
  });

  it("renders salaryDisplay from the numeric range", () => {
    for (const job of build().slice(0, 50)) {
      const min = Math.round(job.salaryMin / 1000);
      const max = Math.round(job.salaryMax / 1000);
      expect(job.salaryDisplay).toContain(`${min}k`);
      expect(job.salaryDisplay).toContain(`${max}k`);
    }
  });

  it("only assigns impact areas the role template allows", () => {
    for (const job of build()) {
      // Director titles name a department rather than the template role,
      // so they legitimately do not match any template title.
      const template = ROLE_TEMPLATES.find((role) =>
        job.title.includes(role.title),
      );
      if (template) {
        expect(template.impactAreas).toContain(job.impactArea);
      }
    }
  });

  it("titles directors by department, not by role template", () => {
    const directors = build().filter((job) => job.seniority === "director");
    expect(directors.length).toBeGreaterThan(0);
    for (const job of directors) {
      expect(job.title).toMatch(
        /^Director of (Engineering|Data Science|Product|Policy|Operations)$/,
      );
    }
  });

  it("never posts a job in the future", () => {
    for (const job of build()) {
      expect(new Date(job.postedAt).getTime()).toBeLessThanOrEqual(NOW.getTime());
    }
  });

  it("distributes listings unevenly, following listingShare order", () => {
    const jobs = build();
    const counts = new Map<string, number>();
    for (const job of jobs) {
      counts.set(job.posterId, (counts.get(job.posterId) ?? 0) + 1);
    }
    const biggest = COMPANIES.reduce((a, b) =>
      a.listingShare > b.listingShare ? a : b,
    );
    const smallest = COMPANIES.reduce((a, b) =>
      a.listingShare < b.listingShare ? a : b,
    );
    expect(counts.get(biggest.id)!).toBeGreaterThan(counts.get(smallest.id)!);
    expect(counts.size).toBe(COMPANIES.length);
  });

  it("marks some jobs remote and some not", () => {
    const jobs = build();
    expect(jobs.some((job) => job.remote)).toBe(true);
    expect(jobs.some((job) => !job.remote)).toBe(true);
  });

  it("gives every job renderable detail content", () => {
    for (const job of build().slice(0, 50)) {
      expect(job.about.length).toBeGreaterThan(40);
      expect(job.responsibilities.length).toBeGreaterThanOrEqual(3);
      expect(job.requirements.length).toBeGreaterThanOrEqual(3);
      expect(job.impactStats).toHaveLength(3);
      expect(job.companyFacts.length).toBeGreaterThanOrEqual(3);
    }
  });
});

describe("generated data reads as legitimate", () => {
  const jobs = build();

  it("never doubles a seniority word in a title", () => {
    for (const job of jobs) {
      expect(job.title).not.toMatch(/Senior Senior|Junior Junior|Staff Staff/);
    }
  });

  it("never pairs a junior seniority with a lead-level title", () => {
    for (const job of jobs) {
      if (job.seniority === "intern" || job.seniority === "junior") {
        expect(job.title).not.toMatch(/\bLead\b|\bHead\b|\bDirector\b/);
      }
    }
  });

  it("keeps title seniority consistent with the seniority field", () => {
    for (const job of jobs) {
      if (job.title.startsWith("Senior ")) expect(job.seniority).toBe("senior");
      if (job.title.startsWith("Staff ")) expect(job.seniority).toBe("staff");
      if (job.title.startsWith("Junior ")) expect(job.seniority).toBe("junior");
    }
  });

  it("only advertises roles matching what the company actually does", () => {
    for (const job of jobs) {
      const company = COMPANIES.find((item) => item.id === job.posterId)!;
      const template = ROLE_TEMPLATES.find((role) =>
        job.title.includes(role.title),
      );
      if (template) {
        expect(template.impactAreas).toContain(company.impactArea);
      }
      expect(job.impactArea).toBe(company.impactArea);
    }
  });
});
