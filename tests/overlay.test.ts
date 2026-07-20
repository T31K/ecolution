import { describe, expect, it } from "vitest";
import {
  EMPTY_OVERLAY,
  addApplication,
  addListing,
  hasApplied,
  mergeApplications,
  mergeJobs,
  setStatus,
} from "@/lib/overlay";
import type { Application, Job } from "@/lib/types";

const seededApp: Application = {
  id: "app-0",
  jobId: "job-a",
  seekerId: "seeker-0",
  status: "new",
  coverNote: "seeded",
  appliedAt: "2026-07-01T00:00:00Z",
};

const newApp: Application = {
  id: "app-local-1",
  jobId: "job-b",
  seekerId: "seeker-0",
  status: "new",
  coverNote: "local",
  appliedAt: "2026-07-20T00:00:00Z",
};

const job = (id: string): Job =>
  ({ id, title: `Job ${id}`, posterId: "p1" }) as Job;

describe("overlay merges", () => {
  it("returns seeded applications untouched when the overlay is empty", () => {
    expect(mergeApplications([seededApp], EMPTY_OVERLAY)).toEqual([seededApp]);
  });

  it("appends overlay applications to seeded ones", () => {
    const overlay = addApplication(EMPTY_OVERLAY, newApp);
    const merged = mergeApplications([seededApp], overlay);
    expect(merged).toHaveLength(2);
    expect(merged.map((item) => item.id)).toContain("app-local-1");
  });

  it("applies status patches to seeded applications", () => {
    const overlay = setStatus(EMPTY_OVERLAY, "app-0", "interviewing");
    const merged = mergeApplications([seededApp], overlay);
    expect(merged[0].status).toBe("interviewing");
  });

  it("applies status patches to overlay applications too", () => {
    let overlay = addApplication(EMPTY_OVERLAY, newApp);
    overlay = setStatus(overlay, "app-local-1", "offer");
    const merged = mergeApplications([seededApp], overlay);
    const target = merged.find((item) => item.id === "app-local-1")!;
    expect(target.status).toBe("offer");
  });

  it("puts overlay listings ahead of seeded jobs", () => {
    const overlay = addListing(EMPTY_OVERLAY, job("new-1"));
    const merged = mergeJobs([job("seed-1")], overlay);
    expect(merged[0].id).toBe("new-1");
    expect(merged).toHaveLength(2);
  });

  it("does not mutate the overlay it is given", () => {
    const before = structuredClone(EMPTY_OVERLAY);
    addApplication(EMPTY_OVERLAY, newApp);
    setStatus(EMPTY_OVERLAY, "app-0", "rejected");
    addListing(EMPTY_OVERLAY, job("x"));
    expect(EMPTY_OVERLAY).toEqual(before);
  });

  it("detects a duplicate application", () => {
    expect(hasApplied([seededApp], "seeker-0", "job-a")).toBe(true);
    expect(hasApplied([seededApp], "seeker-0", "job-z")).toBe(false);
    expect(hasApplied([seededApp], "seeker-9", "job-a")).toBe(false);
  });
});
