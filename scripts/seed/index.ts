import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { Job, Poster, SeedData } from "@/lib/types";
import { createRng } from "./rng";
import { generateJobs } from "./generate-jobs";
import {
  generateApplications,
  generatePosters,
  generateSeekers,
} from "./generate-users";

/** Fixed so regeneration reproduces identical data. */
const SEED = 2026;
const TOTAL_JOBS = 500;
const NOW = new Date("2026-07-20T12:00:00Z");

/**
 * Real listings scraped from climatechangejobs.com, committed as a fixture so
 * the build never depends on their site being up. Each carries source:"real"
 * and a sourceUrl, and gets a synthetic poster so foreign keys hold.
 */
function loadRealJobs(): { jobs: Job[]; posters: Poster[] } {
  let jobs: Job[] = [];
  try {
    jobs = JSON.parse(
      readFileSync(resolve(process.cwd(), "data/real-jobs.json"), "utf8"),
    ) as Job[];
  } catch {
    console.warn("No data/real-jobs.json — run `npm run fetch:real-jobs`.");
    return { jobs: [], posters: [] };
  }

  const posters = new Map<string, Poster>();
  for (const job of jobs) {
    if (posters.has(job.posterId)) continue;
    posters.set(job.posterId, {
      id: job.posterId,
      // Not sign-in-able: these employers are data, not demo accounts.
      email: `${job.posterId}@example.invalid`,
      password: "",
      name: `${job.company} Hiring Team`,
      company: job.company,
      companyLogo: job.companyLogo,
      plan: "Listed via climatechangejobs.com",
    });
  }

  return { jobs, posters: [...posters.values()] };
}

function main() {
  const generated = generateJobs(createRng(SEED), TOTAL_JOBS, NOW);
  const real = loadRealJobs();
  // Real listings first so they surface at the top of the board.
  const jobs = [...real.jobs.map((job) => ({ ...job, source: "real" as const })),
                ...generated.map((job) => ({ ...job, source: "generated" as const }))];
  const posters = [...generatePosters(), ...real.posters];
  const seekers = generateSeekers();
  // Applications are only ever seeded against generated listings — inventing
  // applicants for real, live vacancies would be misleading.
  const applications = generateApplications(
    createRng(SEED + 1),
    generated,
    seekers,
    NOW,
  );

  const data: SeedData = { jobs, posters, seekers, applications };
  const target = resolve(process.cwd(), "data/seed.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);

  console.log(
    `Wrote ${jobs.length} jobs (${real.jobs.length} real, ${generated.length} generated), ` +
      `${posters.length} posters, ${seekers.length} seekers, ` +
      `${applications.length} applications to ${target}`,
  );
}

main();
