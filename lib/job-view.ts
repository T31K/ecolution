import { Cloud, Droplet, Leaf, RefreshCw, type LucideIcon } from "lucide-react";
import type { ImpactArea, Job, RoleType, Seniority } from "./types";

/**
 * Icons are React components and cannot live in the seed JSON, so the seed
 * stores a string key and this map resolves it at render time.
 */
export const IMPACT_ICONS: Record<ImpactArea, LucideIcon> = {
  "renewable-energy": Leaf,
  "carbon-capture": Cloud,
  "water-systems": Droplet,
  "circular-economy": RefreshCw,
};

export const IMPACT_LABELS: Record<ImpactArea, string> = {
  "renewable-energy": "Renewable Energy",
  "carbon-capture": "Carbon Capture",
  "water-systems": "Water Systems",
  "circular-economy": "Circular Economy",
};

export const ROLE_LABELS: Record<RoleType, string> = {
  engineering: "Engineering",
  "data-science": "Data Science",
  product: "Product",
  policy: "Policy",
  operations: "Operations",
};

export const SENIORITY_LABELS: Record<Seniority, string> = {
  intern: "Internship",
  junior: "Junior",
  mid: "Mid-level",
  senior: "Senior",
  staff: "Staff",
  director: "Director",
};

/** URL slug for a company page, e.g. "Too Good To Go" -> "too-good-to-go". */
export function companySlug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Derived at render rather than stored, so the seed does not visibly rot —
 * a fixture reading "Posted 2h ago" is wrong the day after it is written.
 */
export function formatPostedAgo(postedAt: string, now: Date = new Date()): string {
  const elapsed = now.getTime() - new Date(postedAt).getTime();

  if (elapsed < HOUR) return "Posted just now";
  if (elapsed < DAY) {
    const hours = Math.floor(elapsed / HOUR);
    return `Posted ${hours}h ago`;
  }

  const days = Math.floor(elapsed / DAY);
  if (days === 1) return "Posted 1 day ago";
  if (days < 30) return `Posted ${days} days ago`;

  const months = Math.floor(days / 30);
  return months === 1 ? "Posted 1 month ago" : `Posted ${months} months ago`;
}

/** The pill row under a job title: arrangement, salary, seniority. */
export function jobChips(job: Job): string[] {
  return [
    job.remote ? "Remote" : "On-site / Hybrid",
    job.salaryDisplay,
    SENIORITY_LABELS[job.seniority],
  ];
}

/**
 * Roles at other companies in the same impact area — close enough to be
 * useful, and never the job you are already looking at.
 */
export function findSimilarJobs(job: Job, all: Job[], limit = 3): Job[] {
  const sameArea = all.filter(
    (candidate) =>
      candidate.id !== job.id &&
      candidate.impactArea === job.impactArea &&
      candidate.company !== job.company,
  );

  const sameRole = sameArea.filter(
    (candidate) => candidate.roleType === job.roleType,
  );

  return [...sameRole, ...sameArea].slice(0, limit);
}
