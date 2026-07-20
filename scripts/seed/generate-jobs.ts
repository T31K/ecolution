import type { Currency, Job, RoleType, Seniority } from "@/lib/types";
import type { Rng } from "./rng";
import {
  CITIES,
  COMPANIES,
  ROLE_TEMPLATES,
  SENIORITY_MULTIPLIER,
} from "./catalog";

const SENIORITY_WEIGHTS: readonly (readonly [Seniority, number])[] = [
  ["intern", 3],
  ["junior", 12],
  ["mid", 34],
  ["senior", 30],
  ["staff", 14],
  ["director", 7],
];

const SENIORITY_PREFIX: Record<Exclude<Seniority, "director">, string> = {
  intern: "Intern, ",
  junior: "Junior ",
  mid: "",
  senior: "Senior ",
  staff: "Staff ",
};

/**
 * Director titles name a department, not a role. Prefixing the template title
 * would produce "Director of Grid Software Engineer" — the kind of phrasing
 * that immediately reads as machine-generated.
 */
const DIRECTOR_TITLE: Record<RoleType, string> = {
  engineering: "Director of Engineering",
  "data-science": "Director of Data Science",
  product: "Director of Product",
  policy: "Director of Policy",
  operations: "Director of Operations",
};

const CURRENCY_SYMBOL: Record<Currency, string> = {
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const IMPACT_STAT_POOL: Record<string, { value: string; label: string }[]> = {
  "renewable-energy": [
    { value: "2.5GW", label: "Planned Portfolio" },
    { value: "12M", label: "Trees Equivalent" },
    { value: "15%", label: "Efficiency Gain Goal" },
    { value: "600MW", label: "Live Capacity" },
  ],
  "carbon-capture": [
    { value: "40kt", label: "CO2 Captured / yr" },
    { value: "10%", label: "Energy Cost Target" },
    { value: "6", label: "Plants Instrumented" },
    { value: "1.2Mt", label: "Contracted Removal" },
  ],
  "water-systems": [
    { value: "2M", label: "Residents Served" },
    { value: "35%", label: "Freshwater Recovery" },
    { value: "9", label: "Municipal Deployments" },
    { value: "40%", label: "Leakage Reduction" },
  ],
  "circular-economy": [
    { value: "88%", label: "Material Recovery" },
    { value: "1.2M", label: "Units Returned / yr" },
    { value: "40kt", label: "Landfill Diverted" },
    { value: "60%", label: "Recycled Content" },
  ],
};

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function roundToThousand(value: number): number {
  return Math.round(value / 1000) * 1000;
}

/**
 * Expands each company's listingShare into a flat array of company ids, so
 * picking uniformly from it reproduces the intended uneven distribution.
 */
function buildCompanySlots(total: number): string[] {
  const totalShare = COMPANIES.reduce(
    (sum, company) => sum + company.listingShare,
    0,
  );
  const slots: string[] = [];
  for (const company of COMPANIES) {
    const count = Math.max(
      1,
      Math.round((company.listingShare / totalShare) * total),
    );
    for (let i = 0; i < count; i++) slots.push(company.id);
  }
  return slots;
}

export function generateJobs(rng: Rng, total: number, now: Date): Job[] {
  const slots = rng.shuffle(buildCompanySlots(total)).slice(0, total);
  const jobs: Job[] = [];
  const usedIds = new Set<string>();

  for (let index = 0; index < slots.length; index++) {
    const company = COMPANIES.find((item) => item.id === slots[index])!;

    // Only offer roles the company would plausibly hire for. Without this a
    // carbon-accounting software firm advertises Field Service Engineers, which
    // is the fastest way for generated data to read as fake.
    const eligible = ROLE_TEMPLATES.filter((role) =>
      role.impactAreas.includes(company.impactArea),
    );
    const template = rng.pick(eligible);
    const city = rng.pick(CITIES);
    const seniority = rng.weighted(SENIORITY_WEIGHTS);
    const impactArea = company.impactArea;

    const title =
      seniority === "director"
        ? DIRECTOR_TITLE[template.roleType]
        : `${SENIORITY_PREFIX[seniority]}${template.title}`;

    let id = slugify(`${title}-${company.name}`);
    if (usedIds.has(id)) id = `${id}-${index}`;
    usedIds.add(id);

    const anchor = city.baseSalary * SENIORITY_MULTIPLIER[seniority];
    const salaryMin = roundToThousand(anchor * 0.92);
    const salaryMax = roundToThousand(anchor * 1.24);
    const symbol = CURRENCY_SYMBOL[city.currency];
    const salaryDisplay = `${symbol}${Math.round(salaryMin / 1000)}k – ${symbol}${Math.round(salaryMax / 1000)}k`;

    const remote = city.remoteFriendly && rng.next() < 0.35;
    const arrangement = remote ? "Remote" : rng.next() < 0.5 ? "Hybrid" : "On-site";
    const locationDisplay = remote
      ? `${city.city} (Remote)`
      : `${city.city} (${arrangement})`;

    // Posting dates cluster in the last three weeks with a tail to ~120 days.
    const daysAgo = rng.next() < 0.7 ? rng.int(0, 21) : rng.int(22, 120);
    const postedAt = new Date(
      now.getTime() - daysAgo * 24 * 60 * 60 * 1000,
    ).toISOString();

    const statPool = IMPACT_STAT_POOL[impactArea];
    const impactStats = rng.shuffle(statPool).slice(0, 3);

    jobs.push({
      id,
      title,
      posterId: company.id,
      company: company.name,
      companyLogo: company.logo,
      companyLogoAlt: `${company.name} logo`,
      salaryMin,
      salaryMax,
      currency: city.currency,
      city: city.city,
      country: city.country,
      remote,
      roleType: template.roleType,
      seniority,
      impactArea,
      postedAt,
      views: rng.int(40, 3200),
      salaryDisplay,
      locationDisplay,
      about: `${company.name} is ${company.blurb}. As ${title}, you will work alongside a team that treats climate outcomes as an engineering constraint rather than a marketing line.`,
      impactSummary: `Work here is measured against physical outcomes. This role contributes directly to ${company.name}'s ${impactArea.replace(/-/g, " ")} targets.`,
      impactStats,
      responsibilities: template.responsibilities,
      requirements: template.requirements,
      companyFacts: company.facts,
    });
  }

  return jobs;
}
