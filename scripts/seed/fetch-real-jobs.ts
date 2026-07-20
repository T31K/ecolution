/**
 * Fetches a fixed list of real climate job postings and normalises them into
 * our Job shape, writing data/real-jobs.json.
 *
 * Run manually — the committed JSON is what the build reads, so a change on
 * their site can never break our build:
 *
 *   npm run fetch:real-jobs
 *
 * climatechangejobs.com/robots.txt disallows only /rss/ and asks for
 * Crawl-delay: 1, which this respects. Each listing keeps a sourceUrl so the
 * UI can attribute it and link back to the original posting.
 */
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { ImpactArea, Job, RoleType, Seniority } from "@/lib/types";

const URLS = [
  "https://climatechangejobs.com/jobs/534613478-senior-product-manager-device-data-performance",
  "https://climatechangejobs.com/jobs/534463765-development-prgm-spec-iii-ic",
  "https://climatechangejobs.com/jobs/501246767-business-developer-m-f-d-for-photovoltaics",
  "https://climatechangejobs.com/jobs/533930715-global-business-marketing-supervisor",
  "https://climatechangejobs.com/jobs/472937682-head-of-carbon",
  "https://climatechangejobs.com/jobs/472938060-grid-connection-engineer-m-f-d-solar-pv-construction-focus-only",
  "https://climatechangejobs.com/jobs/534463767-climate-resilient-stewardship-fellow",
  "https://climatechangejobs.com/jobs/533983548-landscape-conservation-program-manager-remote",
  "https://climatechangejobs.com/jobs/523131491-head-of-enterprise-sales",
  "https://climatechangejobs.com/jobs/523042707-environmental-sector-lead-south-atlantic-division",
];

const COUNTRY_CODES: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  Germany: "DE",
  Denmark: "DK",
  Norway: "NO",
  Netherlands: "NL",
  Switzerland: "CH",
  Canada: "CA",
  Brazil: "BR",
  China: "CN",
};

type JsonLd = Record<string, unknown>;

function stripTags(input: string): string {
  return input
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Titles are the only reliable signal for team, so classify from them. */
function inferRoleType(title: string): RoleType {
  const t = title.toLowerCase();
  if (/engineer|technical|developer(?!s)|architect/.test(t)) return "engineering";
  if (/data|analyst|scientist|research/.test(t)) return "data-science";
  if (/product manager|product owner|design/.test(t)) return "product";
  if (/policy|conservation|stewardship|program|fellow|regulat/.test(t))
    return "policy";
  return "operations";
}

function inferSeniority(title: string): Seniority {
  const t = title.toLowerCase();
  if (/\bhead\b|\bdirector\b|\bvp\b|\bchief\b|\blead\b(?!ership)/.test(t))
    return "director";
  if (/\bsenior\b|\bsr\.?\b|\bprincipal\b|supervisor|\biii\b/.test(t))
    return "senior";
  if (/\bstaff\b/.test(t)) return "staff";
  if (/\bintern\b|\bfellow\b|\bgraduate\b|\bjunior\b/.test(t)) return "intern";
  return "mid";
}

function inferImpactArea(title: string, description: string): ImpactArea {
  const t = `${title} ${description.slice(0, 1200)}`.toLowerCase();
  if (/carbon|emission|ghg|offset|removal|net zero/.test(t))
    return "carbon-capture";
  if (/water|watershed|river|marine|ocean|hydro/.test(t)) return "water-systems";
  if (/circular|recycl|waste|supply chain|material/.test(t))
    return "circular-economy";
  return "renewable-energy";
}

function extractJobPosting(html: string): JsonLd | null {
  const blocks = html.matchAll(
    /<script[^>]+application\/ld\+json[^>]*>([\s\S]*?)<\/script>/g,
  );
  for (const block of blocks) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(block[1]);
    } catch {
      continue;
    }
    const items = Array.isArray(parsed) ? parsed : [parsed];
    for (const item of items) {
      if (
        item &&
        typeof item === "object" &&
        (item as JsonLd)["@type"] === "JobPosting"
      ) {
        return item as JsonLd;
      }
    }
  }
  return null;
}

function toJob(posting: JsonLd, sourceUrl: string): Job | null {
  const title = String(posting.title ?? "").trim();
  const org = posting.hiringOrganization as { name?: string } | undefined;
  const company = String(org?.name ?? "").trim();
  if (!title || !company) return null;

  const rawLocation = Array.isArray(posting.jobLocation)
    ? posting.jobLocation[0]
    : posting.jobLocation;
  const address =
    ((rawLocation as { address?: Record<string, string> } | undefined)
      ?.address ?? {}) as Record<string, string>;

  const city = address.addressLocality ?? "";
  const countryName = address.addressCountry ?? "";
  const country = COUNTRY_CODES[countryName] ?? "";

  const description = stripTags(String(posting.description ?? ""));
  const remote = /\bremote\b/i.test(`${title} ${description.slice(0, 600)}`);

  const salary = (posting.baseSalary as { value?: Record<string, number> })
    ?.value;
  const salaryMin = Number(salary?.minValue ?? 0);
  const salaryMax = Number(salary?.maxValue ?? 0);
  const hasSalary = salaryMin > 0 && salaryMax >= salaryMin;

  const locationDisplay = city
    ? remote
      ? `${city} (Remote)`
      : city
    : remote
      ? "Remote"
      : "See listing";

  // Split the description into paragraphs; the first becomes the summary and
  // a few of the longest become responsibilities, so the detail page has real
  // structure rather than one wall of text.
  const sentences = description
    .split(/(?<=\.)\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 40);

  return {
    id: slugify(`${title}-${company}`).slice(0, 80),
    title,
    posterId: `real-${slugify(company).slice(0, 40)}`,
    company,
    companyLogo: `/img/companies/real-${slugify(company).slice(0, 40)}.svg`,
    companyLogoAlt: `${company} logo`,
    salaryMin: hasSalary ? salaryMin : 0,
    salaryMax: hasSalary ? salaryMax : 0,
    currency: "USD",
    city,
    country,
    remote,
    roleType: inferRoleType(title),
    seniority: inferSeniority(title),
    impactArea: inferImpactArea(title, description),
    postedAt: String(posting.datePosted ?? new Date().toISOString()),
    views: 0,
    salaryDisplay: hasSalary
      ? `$${Math.round(salaryMin / 1000)}k – $${Math.round(salaryMax / 1000)}k`
      : "Not specified",
    locationDisplay,
    about: sentences.slice(0, 3).join(" ").slice(0, 900),
    impactSummary:
      "This is a live posting sourced from climatechangejobs.com. Follow the link to the original listing to apply with the employer directly.",
    impactStats: [
      { value: "Live", label: "Real posting" },
      { value: company.split(" ")[0], label: "Employer" },
      { value: hasSalary ? "Published" : "On request", label: "Salary" },
    ],
    responsibilities: sentences.slice(3, 8),
    requirements: sentences.slice(8, 13),
    companyFacts: [
      { label: "Employer", value: company },
      { label: "Source", value: "climatechangejobs.com" },
      { label: "Location", value: locationDisplay },
    ],
    source: "real",
    sourceUrl,
  };
}

async function main() {
  const jobs: Job[] = [];

  for (const url of URLS) {
    const response = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0 (compatible; EcolutionDemo/1.0)" },
    });
    if (!response.ok) {
      console.error(`FAILED ${response.status} ${url}`);
      continue;
    }

    const posting = extractJobPosting(await response.text());
    if (!posting) {
      console.error(`NO JSON-LD ${url}`);
      continue;
    }

    const job = toJob(posting, url);
    if (!job) {
      console.error(`INCOMPLETE ${url}`);
      continue;
    }

    jobs.push(job);
    console.log(`ok  ${job.title} — ${job.company}`);

    // Honour their Crawl-delay: 1.
    await new Promise((r) => setTimeout(r, 1100));
  }

  const target = resolve(process.cwd(), "data/real-jobs.json");
  writeFileSync(target, `${JSON.stringify(jobs, null, 2)}\n`);
  console.log(`\nWrote ${jobs.length} real listings to ${target}`);
}

main();
