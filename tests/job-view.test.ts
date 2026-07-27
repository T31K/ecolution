import { describe, expect, it } from "vitest";
import {
  IMPACT_ICONS,
  IMPACT_LABELS,
  ROLE_LABELS,
  findSimilarJobs,
  formatPostedAgo,
  jobChips,
} from "@/lib/job-view";
import seed from "../data/seed.json";
import type { SeedData } from "@/lib/types";
import type { Job } from "@/lib/types";

const NOW = new Date("2026-07-20T12:00:00Z");
const ago = (ms: number) => new Date(NOW.getTime() - ms).toISOString();

describe("formatPostedAgo", () => {
  it("describes the last hour as just now", () => {
    expect(formatPostedAgo(ago(5 * 60 * 1000), NOW)).toBe("Posted just now");
  });

  it("describes hours within a day", () => {
    expect(formatPostedAgo(ago(5 * 60 * 60 * 1000), NOW)).toBe("Posted 5h ago");
  });

  it("singularises one day", () => {
    expect(formatPostedAgo(ago(26 * 60 * 60 * 1000), NOW)).toBe("Posted 1 day ago");
  });

  it("describes multiple days", () => {
    expect(formatPostedAgo(ago(5 * 24 * 60 * 60 * 1000), NOW)).toBe(
      "Posted 5 days ago",
    );
  });

  it("rolls over to months", () => {
    expect(formatPostedAgo(ago(75 * 24 * 60 * 60 * 1000), NOW)).toBe(
      "Posted 2 months ago",
    );
  });

  it("singularises one month", () => {
    expect(formatPostedAgo(ago(35 * 24 * 60 * 60 * 1000), NOW)).toBe(
      "Posted 1 month ago",
    );
  });
});

describe("label maps", () => {
  it("covers every impact area used in the seed", () => {
    for (const job of (seed as SeedData).jobs) {
      expect(IMPACT_LABELS[job.impactArea]).toBeTruthy();
      expect(IMPACT_ICONS[job.impactArea]).toBeTruthy();
      expect(ROLE_LABELS[job.roleType]).toBeTruthy();
    }
  });
});

describe("jobChips", () => {
  it("returns three renderable chips", () => {
    const job = (seed as SeedData).jobs[0];
    const chips = jobChips(job);
    expect(chips).toHaveLength(3);
    for (const chip of chips) expect(chip.length).toBeGreaterThan(0);
  });
});

describe("findSimilarJobs", () => {
  const jobs = (seed as SeedData).jobs;

  it("never returns the job itself", () => {
    const job = jobs[0];
    for (const similar of findSimilarJobs(job, jobs)) {
      expect(similar.id).not.toBe(job.id);
    }
  });

  it("returns jobs in the same impact area at other companies", () => {
    const job = jobs[0];
    for (const similar of findSimilarJobs(job, jobs)) {
      expect(similar.impactArea).toBe(job.impactArea);
      expect(similar.company).not.toBe(job.company);
    }
  });

  it("respects the limit", () => {
    expect(findSimilarJobs(jobs[0], jobs, 2)).toHaveLength(2);
  });

  it("returns an empty list rather than throwing when nothing matches", () => {
    const lonely = { ...jobs[0], impactArea: "water-systems" } as Job;
    expect(findSimilarJobs(lonely, [lonely])).toEqual([]);
  });
});
