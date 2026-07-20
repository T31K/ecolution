import { describe, expect, it } from "vitest";
import { createRng } from "@/scripts/seed/rng";
import { generateJobs } from "@/scripts/seed/generate-jobs";
import {
  generateApplications,
  generatePosters,
  generateSeekers,
} from "@/scripts/seed/generate-users";

const NOW = new Date("2026-07-20T12:00:00Z");

describe("generatePosters", () => {
  it("creates one poster per company", () => {
    expect(generatePosters()).toHaveLength(10);
  });

  it("makes the first poster the demo account", () => {
    expect(generatePosters()[0].email).toBe("jobposter@email.com");
  });

  it("gives every poster the demo password and a unique email", () => {
    const posters = generatePosters();
    const emails = new Set(posters.map((poster) => poster.email));
    expect(emails.size).toBe(posters.length);
    for (const poster of posters) {
      expect(poster.password).toBe("password");
    }
  });
});

describe("generateSeekers", () => {
  it("creates 20 seekers", () => {
    expect(generateSeekers()).toHaveLength(20);
  });

  it("makes the first seeker the demo account", () => {
    expect(generateSeekers()[0].email).toBe("jobseeker@email.com");
  });

  it("numbers the remaining seekers from 1", () => {
    const seekers = generateSeekers();
    expect(seekers[1].email).toBe("jobseeker1@email.com");
    expect(seekers[2].email).toBe("jobseeker2@email.com");
  });

  it("gives every seeker the demo password and a unique email", () => {
    const seekers = generateSeekers();
    const emails = new Set(seekers.map((seeker) => seeker.email));
    expect(emails.size).toBe(seekers.length);
    for (const seeker of seekers) {
      expect(seeker.password).toBe("password");
    }
  });
});

describe("generateApplications", () => {
  const jobs = generateJobs(createRng(2026), 500, NOW);
  const seekers = generateSeekers();
  const applications = generateApplications(createRng(7), jobs, seekers, NOW);

  it("generates a populated set", () => {
    expect(applications.length).toBeGreaterThanOrEqual(30);
    expect(applications.length).toBeLessThanOrEqual(60);
  });

  it("is deterministic for a fixed seed", () => {
    const again = generateApplications(createRng(7), jobs, seekers, NOW);
    expect(again).toEqual(applications);
  });

  it("references only real jobs and seekers", () => {
    const jobIds = new Set(jobs.map((job) => job.id));
    const seekerIds = new Set(seekers.map((seeker) => seeker.id));
    for (const application of applications) {
      expect(jobIds.has(application.jobId)).toBe(true);
      expect(seekerIds.has(application.seekerId)).toBe(true);
    }
  });

  it("gives jobseeker1 and jobseeker2 applications to the demo poster's jobs", () => {
    const demoPosterJobIds = new Set(
      jobs.filter((job) => job.posterId === "octopus-energy").map((job) => job.id),
    );
    for (const email of ["jobseeker1@email.com", "jobseeker2@email.com"]) {
      const seeker = seekers.find((item) => item.email === email)!;
      const theirs = applications.filter(
        (application) => application.seekerId === seeker.id,
      );
      expect(theirs.length).toBeGreaterThan(0);
      expect(
        theirs.some((application) => demoPosterJobIds.has(application.jobId)),
      ).toBe(true);
    }
  });

  it("never applies the same seeker to the same job twice", () => {
    const pairs = applications.map(
      (application) => `${application.seekerId}:${application.jobId}`,
    );
    expect(new Set(pairs).size).toBe(pairs.length);
  });

  it("uses only valid statuses and never applies in the future", () => {
    const valid = ["new", "reviewing", "interviewing", "rejected", "offer"];
    for (const application of applications) {
      expect(valid).toContain(application.status);
      expect(new Date(application.appliedAt).getTime()).toBeLessThanOrEqual(
        NOW.getTime(),
      );
    }
  });
});
