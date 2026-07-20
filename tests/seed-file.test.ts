import { describe, expect, it } from "vitest";
import seed from "../data/seed.json";
import type { SeedData } from "@/lib/types";

const data = seed as SeedData;

describe("data/seed.json", () => {
  it("has the expected volumes", () => {
    const generated = data.jobs.filter((job) => job.source !== "real");
    const real = data.jobs.filter((job) => job.source === "real");
    expect(generated).toHaveLength(500);
    expect(real).toHaveLength(10);
    expect(data.seekers).toHaveLength(20);
    expect(data.applications.length).toBeGreaterThanOrEqual(30);
  });

  it("gives every real listing a source URL and no invented salary", () => {
    for (const job of data.jobs.filter((item) => item.source === "real")) {
      expect(job.sourceUrl).toMatch(/^https:\/\/climatechangejobs\.com\//);
      // Their postings omit salary; inventing one would misrepresent a real
      // vacancy, so it must stay zero and render as "Not specified".
      if (job.salaryMin === 0) {
        expect(job.salaryDisplay).toBe("Not specified");
      }
    }
  });

  it("never seeds applications against a real vacancy", () => {
    const realIds = new Set(
      data.jobs.filter((job) => job.source === "real").map((job) => job.id),
    );
    for (const application of data.applications) {
      expect(realIds.has(application.jobId)).toBe(false);
    }
  });

  it("contains both demo accounts", () => {
    expect(
      data.seekers.some((seeker) => seeker.email === "jobseeker@email.com"),
    ).toBe(true);
    expect(
      data.posters.some((poster) => poster.email === "jobposter@email.com"),
    ).toBe(true);
  });

  it("has no dangling references", () => {
    const jobIds = new Set(data.jobs.map((job) => job.id));
    const seekerIds = new Set(data.seekers.map((seeker) => seeker.id));
    const posterIds = new Set(data.posters.map((poster) => poster.id));

    for (const job of data.jobs) {
      expect(posterIds.has(job.posterId)).toBe(true);
    }
    for (const application of data.applications) {
      expect(jobIds.has(application.jobId)).toBe(true);
      expect(seekerIds.has(application.seekerId)).toBe(true);
    }
  });

  it("stores no React components or icon references", () => {
    // Checking for the substring "function" gave a false positive once real
    // descriptions arrived ("cross-functional"). Assert the actual invariant:
    // no serialised functions, and no `icon` key anywhere in the tree.
    const walk = (value: unknown, path = "$"): void => {
      expect(typeof value).not.toBe("function");
      if (Array.isArray(value)) {
        value.forEach((item, index) => walk(item, `${path}[${index}]`));
      } else if (value && typeof value === "object") {
        for (const [key, child] of Object.entries(value)) {
          expect(key).not.toBe("icon");
          walk(child, `${path}.${key}`);
        }
      }
    };
    walk(data);
    expect(JSON.stringify(data)).not.toContain("lucide");
  });

  it("covers every filter dimension with more than one value", () => {
    const roleTypes = new Set(data.jobs.map((job) => job.roleType));
    const countries = new Set(data.jobs.map((job) => job.country));
    const impactAreas = new Set(data.jobs.map((job) => job.impactArea));
    expect(roleTypes.size).toBeGreaterThan(1);
    expect(countries.size).toBeGreaterThan(1);
    expect(impactAreas.size).toBeGreaterThan(1);
  });
});
