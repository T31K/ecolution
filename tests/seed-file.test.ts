import { describe, expect, it } from "vitest";
import seed from "../data/seed.json";
import type { SeedData } from "@/lib/types";

const data = seed as SeedData;

describe("data/seed.json", () => {
  it("has the expected volumes", () => {
    expect(data.jobs).toHaveLength(500);
    expect(data.posters).toHaveLength(10);
    expect(data.seekers).toHaveLength(20);
    expect(data.applications.length).toBeGreaterThanOrEqual(30);
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
    const raw = JSON.stringify(data);
    expect(raw).not.toContain("function");
    expect(raw).not.toContain("lucide");
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
