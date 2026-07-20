import type { AppStatus, Application, Job, Poster, Seeker } from "@/lib/types";
import type { Rng } from "./rng";
import { COMPANIES } from "./catalog";

const DEMO_PASSWORD = "password";

/** The demo poster owns the largest catalogue entry, so their dashboard is full. */
const DEMO_POSTER_ID = "octopus-energy";

const SEEKER_NAMES = [
  "Sarah Jenkins", "Marcus Thorne", "Elena Lopez", "Priya Raman",
  "Tom Okafor", "Ingrid Sandberg", "Daniel Weiss", "Mei Chen",
  "Lucas Moreau", "Aisha Bello", "Jonas Berg", "Clara Duarte",
  "Ravi Menon", "Hannah Fischer", "Diego Ramirez", "Yuki Tanaka",
  "Nora Haugen", "Samuel Adeyemi", "Laura Vogel", "Peter Novak",
];

const SEEKER_HEADLINES = [
  "Power systems engineer, grid interconnection",
  "ML engineer working on industrial sensor data",
  "Water infrastructure architect",
  "Carbon accounting analyst, GHG Protocol",
  "Mechanical engineer, high-temperature systems",
  "Product manager, climate SaaS",
  "Policy specialist, EU energy regulation",
  "Battery systems engineer",
  "Operations lead, reverse logistics",
  "LCA specialist, ISO 14040",
];

const COVER_NOTES = [
  "I've spent the last few years on grid-scale systems and want my work pointed at something that actually decarbonises. Happy to walk through the interconnection project on my CV.",
  "Your work on storage duration is the reason I applied. I've shipped modelling tooling for a comparable asset class and would like to do it somewhere the physics matters.",
  "I moved into climate work deliberately after a decade in general software. This role lines up with both the technical depth and the outcome I'm looking for.",
  "I led commissioning on two plants in a similar regulatory environment, and I'd bring that experience directly to this team.",
  "Strong overlap with my current remit, and I'm looking for a step up in scope. Available at short notice.",
];

const STATUS_WEIGHTS: readonly (readonly [AppStatus, number])[] = [
  ["new", 40],
  ["reviewing", 26],
  ["interviewing", 18],
  ["rejected", 10],
  ["offer", 6],
];

export function generatePosters(): Poster[] {
  return COMPANIES.map((company, index) => ({
    id: company.id,
    email: index === 0 ? "jobposter@email.com" : `jobposter${index}@email.com`,
    password: DEMO_PASSWORD,
    name: `${company.name} Hiring Team`,
    company: company.name,
    companyLogo: company.logo,
    plan: "Impact Pro",
  }));
}

export function generateSeekers(): Seeker[] {
  return SEEKER_NAMES.map((name, index) => ({
    id: `seeker-${index}`,
    email: index === 0 ? "jobseeker@email.com" : `jobseeker${index}@email.com`,
    password: DEMO_PASSWORD,
    name,
    headline: SEEKER_HEADLINES[index % SEEKER_HEADLINES.length],
    yearsExperience: 2 + (index % 12),
  }));
}

export function generateApplications(
  rng: Rng,
  jobs: Job[],
  seekers: Seeker[],
  now: Date,
): Application[] {
  const applications: Application[] = [];
  const taken = new Set<string>();

  const add = (job: Job, seeker: Seeker) => {
    const key = `${seeker.id}:${job.id}`;
    if (taken.has(key)) return;
    taken.add(key);

    const daysAgo = rng.int(0, 30);
    applications.push({
      id: `app-${applications.length}`,
      jobId: job.id,
      seekerId: seeker.id,
      status: rng.weighted(STATUS_WEIGHTS),
      coverNote: rng.pick(COVER_NOTES),
      appliedAt: new Date(
        now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
      ).toISOString(),
    });
  };

  // The spec requires jobseeker1 and jobseeker2 to have applied to the demo
  // poster's listings, so /employer is populated before anyone clicks anything.
  const demoPosterJobs = jobs.filter((job) => job.posterId === DEMO_POSTER_ID);
  for (const email of ["jobseeker1@email.com", "jobseeker2@email.com"]) {
    const seeker = seekers.find((item) => item.email === email)!;
    for (const job of rng.shuffle(demoPosterJobs).slice(0, 3)) {
      add(job, seeker);
    }
  }

  // Remaining applications spread across other seekers and jobs.
  const others = seekers.filter(
    (seeker) =>
      seeker.email !== "jobseeker1@email.com" &&
      seeker.email !== "jobseeker2@email.com",
  );
  for (let i = 0; i < 34; i++) {
    add(rng.pick(jobs), rng.pick(others));
  }

  return applications;
}
