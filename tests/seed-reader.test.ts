import { describe, expect, it } from "vitest";
import {
  getJobById,
  getJobsByPoster,
  getPosterById,
  getSeed,
  getSeekerById,
} from "@/lib/seed";

describe("seed reader", () => {
  it("returns the full seed", () => {
    const seed = getSeed();
    expect(seed.jobs).toHaveLength(500);
    expect(seed.posters).toHaveLength(10);
  });

  it("finds a job by id", () => {
    const first = getSeed().jobs[0];
    expect(getJobById(first.id)).toEqual(first);
  });

  it("returns undefined for an unknown job id", () => {
    expect(getJobById("does-not-exist")).toBeUndefined();
  });

  it("finds the demo poster and seeker", () => {
    const poster = getSeed().posters.find(
      (item) => item.email === "jobposter@email.com",
    )!;
    expect(getPosterById(poster.id)?.email).toBe("jobposter@email.com");

    const seeker = getSeed().seekers.find(
      (item) => item.email === "jobseeker@email.com",
    )!;
    expect(getSeekerById(seeker.id)?.email).toBe("jobseeker@email.com");
  });

  it("returns only that poster's jobs", () => {
    const posterId = getSeed().posters[0].id;
    const jobs = getJobsByPoster(posterId);
    expect(jobs.length).toBeGreaterThan(0);
    for (const job of jobs) {
      expect(job.posterId).toBe(posterId);
    }
  });
});
