import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import type { SeedData } from "@/lib/types";
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

function main() {
  const jobs = generateJobs(createRng(SEED), TOTAL_JOBS, NOW);
  const posters = generatePosters();
  const seekers = generateSeekers();
  const applications = generateApplications(
    createRng(SEED + 1),
    jobs,
    seekers,
    NOW,
  );

  const data: SeedData = { jobs, posters, seekers, applications };
  const target = resolve(process.cwd(), "data/seed.json");
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, `${JSON.stringify(data, null, 2)}\n`);

  console.log(
    `Wrote ${jobs.length} jobs, ${posters.length} posters, ` +
      `${seekers.length} seekers, ${applications.length} applications to ${target}`,
  );
}

main();
