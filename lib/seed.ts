import seed from "@/data/seed.json";
import type { Job, Poster, SeedData, Seeker } from "./types";

/**
 * Server-only. Never import this from a "use client" component — it would
 * ship the whole ~500-job catalogue to the browser.
 */
const data = seed as SeedData;

const jobsById = new Map(data.jobs.map((job) => [job.id, job]));
const postersById = new Map(data.posters.map((poster) => [poster.id, poster]));
const seekersById = new Map(data.seekers.map((seeker) => [seeker.id, seeker]));

const jobsByPoster = new Map<string, Job[]>();
for (const job of data.jobs) {
  const existing = jobsByPoster.get(job.posterId);
  if (existing) existing.push(job);
  else jobsByPoster.set(job.posterId, [job]);
}

/**
 * The seed's own reference clock: the newest posting in the dataset.
 *
 * Relative times are rendered against this rather than the real clock. The
 * seed is frozen, so using Date.now() would make every listing drift to
 * "Posted 8 months ago" as the demo ages. Anchoring here keeps the board
 * reading fresh indefinitely, and keeps render deterministic.
 */
const seedNow = data.jobs.reduce(
  (latest, job) => (job.postedAt > latest ? job.postedAt : latest),
  data.jobs[0]?.postedAt ?? new Date(0).toISOString(),
);

export function getSeedNow(): Date {
  return new Date(seedNow);
}

export function getSeed(): SeedData {
  return data;
}

export function getJobById(id: string): Job | undefined {
  return jobsById.get(id);
}

export function getPosterById(id: string): Poster | undefined {
  return postersById.get(id);
}

export function getSeekerById(id: string): Seeker | undefined {
  return seekersById.get(id);
}

export function getJobsByPoster(posterId: string): Job[] {
  return jobsByPoster.get(posterId) ?? [];
}
