# PoC Stage 1: Seed Data + Storage Layer — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce `data/seed.json` containing ~500 realistic climate-tech jobs, 10 posters, 20 seekers and ~40 applications, plus the storage layer that reads it on the server and overlays browser-local mutations.

**Architecture:** A deterministic generator script composes the seed from a curated catalogue of real companies, roles and cities, and writes a committed JSON artifact. At runtime the server reads that artifact; the browser keeps mutations (applications, new listings, status changes, session) in a single `localStorage` key. Pure merge functions combine the two, so every merge rule is unit-testable without a DOM.

**Tech Stack:** TypeScript, Node 22, Vitest, Next.js 16 App Router.

## Global Constraints

- Product name is **Ecolution**, never EcoTalent.
- Tailwind v4: no `tailwind.config` file; design tokens are `@theme` custom properties in `app/globals.css`.
- Icons come from `lucide-react`; brand marks from `react-icons`. Never hand-write SVG paths.
- Icons are React components and **must never appear in JSON**. The seed stores string keys resolved via a lookup map at render time.
- `data/seed.json` is read on the **server only**. Never import it into a `"use client"` component.
- Passwords are stored and compared in plain text. This is a PoC constraint, recorded deliberately in the spec.
- Timestamps are ISO 8601 absolute. Relative strings ("Posted 2h ago") are derived at render.
- Seed generation is deterministic: a fixed PRNG seed reproduces identical output.
- Existing verification must keep passing: `npx tsc --noEmit`, `npm run lint`, `npm run build`.

**Spec:** `docs/superpowers/specs/2026-07-20-ecolution-poc-design.md`

---

## File Structure

| File | Responsibility |
|---|---|
| `lib/types.ts` | Shared domain types: `Job`, `Application`, `Poster`, `Seeker`, `SeedData`, enums |
| `scripts/seed/rng.ts` | Deterministic PRNG + pick/weight/shuffle helpers |
| `scripts/seed/catalog.ts` | Curated realism source: companies, role templates, cities, salary bands |
| `scripts/seed/generate-jobs.ts` | Builds the job array from the catalogue |
| `scripts/seed/generate-users.ts` | Builds posters, seekers and seeded applications |
| `scripts/seed/index.ts` | Entry point; writes `data/seed.json` |
| `data/seed.json` | Committed artifact |
| `lib/seed.ts` | Server-only reader |
| `lib/overlay.ts` | Pure merge logic (no browser APIs — fully testable) |
| `lib/store.ts` | `localStorage` read/write wrapper + React hook |
| `tests/*.test.ts` | Unit tests |

---

### Task 1: Test infrastructure

**Files:**
- Modify: `package.json`
- Create: `vitest.config.ts`
- Create: `tests/smoke.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `npm test` runs Vitest; `@/` path alias resolves in tests

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest vite-tsconfig-paths
```

- [ ] **Step 2: Write the config**

Create `vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: Write the failing smoke test**

Create `tests/smoke.test.ts`:

```ts
import { describe, expect, it } from "vitest";

describe("test harness", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```

- [ ] **Step 4: Add the test script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 5: Run the test**

Run: `npm test`
Expected: PASS, 1 test.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/smoke.test.ts
git commit -m "test: add vitest harness"
```

---

### Task 2: Domain types

**Files:**
- Create: `lib/types.ts`

**Interfaces:**
- Consumes: nothing
- Produces: `Job`, `Application`, `AppStatus`, `Poster`, `Seeker`, `SeedData`, `RoleType`, `Seniority`, `ImpactArea`, `Currency`

This task has no test of its own — types are verified by `tsc` and exercised by every later task.

- [ ] **Step 1: Write the types**

Create `lib/types.ts`:

```ts
export type RoleType =
  | "engineering"
  | "data-science"
  | "product"
  | "policy"
  | "operations";

export type Seniority =
  | "intern"
  | "junior"
  | "mid"
  | "senior"
  | "staff"
  | "director";

export type ImpactArea =
  | "renewable-energy"
  | "carbon-capture"
  | "water-systems"
  | "circular-economy";

export type Currency = "USD" | "EUR" | "GBP";

export type Job = {
  id: string;
  title: string;
  posterId: string;
  company: string;
  companyLogo: string;
  companyLogoAlt: string;

  // structured — drives filtering
  salaryMin: number;
  salaryMax: number;
  currency: Currency;
  city: string;
  country: string; // ISO-3166 alpha-2
  remote: boolean;
  roleType: RoleType;
  seniority: Seniority;
  impactArea: ImpactArea;
  postedAt: string; // ISO 8601
  views: number;

  // display — rendered as-is
  salaryDisplay: string;
  locationDisplay: string;

  // detail page
  about: string;
  impactSummary: string;
  impactStats: { value: string; label: string }[];
  responsibilities: string[];
  requirements: string[];
  companyFacts: { label: string; value: string }[];
};

export type AppStatus =
  | "new"
  | "reviewing"
  | "interviewing"
  | "rejected"
  | "offer";

export type Application = {
  id: string;
  jobId: string;
  seekerId: string;
  status: AppStatus;
  coverNote: string;
  appliedAt: string; // ISO 8601
};

export type Poster = {
  id: string;
  email: string;
  password: string; // plain text — PoC only
  name: string;
  company: string;
  companyLogo: string;
  plan: string;
};

export type Seeker = {
  id: string;
  email: string;
  password: string; // plain text — PoC only
  name: string;
  headline: string;
  yearsExperience: number;
};

export type SeedData = {
  jobs: Job[];
  posters: Poster[];
  seekers: Seeker[];
  applications: Application[];
};
```

- [ ] **Step 2: Verify it compiles**

Run: `npx tsc --noEmit`
Expected: no output (clean).

- [ ] **Step 3: Commit**

```bash
git add lib/types.ts
git commit -m "feat: add shared domain types for seed data"
```

---

### Task 3: Deterministic RNG

**Files:**
- Create: `scripts/seed/rng.ts`
- Test: `tests/rng.test.ts`

**Interfaces:**
- Consumes: nothing
- Produces:
  - `createRng(seed: number): Rng`
  - `type Rng = { next(): number; int(min: number, max: number): number; pick<T>(items: readonly T[]): T; weighted<T>(entries: readonly [T, number][]): T; shuffle<T>(items: readonly T[]): T[] }`

`int` is inclusive of both bounds.

- [ ] **Step 1: Write the failing test**

Create `tests/rng.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRng } from "@/scripts/seed/rng";

describe("createRng", () => {
  it("produces the same sequence for the same seed", () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = [a.next(), a.next(), a.next()];
    const seqB = [b.next(), b.next(), b.next()];
    expect(seqA).toEqual(seqB);
  });

  it("produces a different sequence for a different seed", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect(a.next()).not.toBe(b.next());
  });

  it("returns values in [0, 1)", () => {
    const rng = createRng(7);
    for (let i = 0; i < 200; i++) {
      const value = rng.next();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });

  it("int respects inclusive bounds", () => {
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const value = rng.int(5, 10);
      expect(value).toBeGreaterThanOrEqual(5);
      expect(value).toBeLessThanOrEqual(10);
      expect(Number.isInteger(value)).toBe(true);
    }
  });

  it("pick returns a member of the input", () => {
    const rng = createRng(9);
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(rng.pick(items));
    }
  });

  it("weighted honours relative weights", () => {
    const rng = createRng(11);
    const counts = { common: 0, rare: 0 };
    for (let i = 0; i < 1000; i++) {
      counts[rng.weighted([["common", 9], ["rare", 1]] as const)]++;
    }
    expect(counts.common).toBeGreaterThan(counts.rare * 3);
  });

  it("shuffle preserves membership and does not mutate the input", () => {
    const rng = createRng(13);
    const input = [1, 2, 3, 4, 5];
    const output = rng.shuffle(input);
    expect(output).toHaveLength(5);
    expect([...output].sort()).toEqual([1, 2, 3, 4, 5]);
    expect(input).toEqual([1, 2, 3, 4, 5]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- rng`
Expected: FAIL — cannot resolve `@/scripts/seed/rng`.

- [ ] **Step 3: Write the implementation**

Create `scripts/seed/rng.ts`:

```ts
export type Rng = {
  next(): number;
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  weighted<T>(entries: readonly (readonly [T, number])[]): T;
  shuffle<T>(items: readonly T[]): T[];
};

/**
 * mulberry32 — small, fast, deterministic. Chosen so a fixed seed always
 * reproduces the same demo data; Math.random would reshuffle every run and
 * invalidate screenshots and demo scripts.
 */
export function createRng(seed: number): Rng {
  let state = seed;

  const next = (): number => {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number =>
    min + Math.floor(next() * (max - min + 1));

  const pick = <T,>(items: readonly T[]): T => items[int(0, items.length - 1)];

  const weighted = <T,>(entries: readonly (readonly [T, number])[]): T => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let threshold = next() * total;
    for (const [value, weight] of entries) {
      threshold -= weight;
      if (threshold <= 0) return value;
    }
    return entries[entries.length - 1][0];
  };

  const shuffle = <T,>(items: readonly T[]): T[] => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = int(0, i);
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  };

  return { next, int, pick, weighted, shuffle };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- rng`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed/rng.ts tests/rng.test.ts
git commit -m "feat: add deterministic seeded RNG for data generation"
```

---

### Task 4: Realism catalogue

**Files:**
- Create: `scripts/seed/catalog.ts`
- Test: `tests/catalog.test.ts`

**Interfaces:**
- Consumes: `RoleType`, `Seniority`, `ImpactArea`, `Currency` from `@/lib/types`
- Produces:
  - `COMPANIES: CompanyProfile[]` (10 entries)
  - `CITIES: CityProfile[]`
  - `ROLE_TEMPLATES: RoleTemplate[]`
  - `SENIORITY_MULTIPLIER: Record<Seniority, number>`
  - `type CompanyProfile = { id: string; name: string; logo: string; impactArea: ImpactArea; blurb: string; listingShare: number; facts: { label: string; value: string }[] }`
  - `type CityProfile = { city: string; country: string; currency: Currency; baseSalary: number; remoteFriendly: boolean }`
  - `type RoleTemplate = { title: string; roleType: RoleType; impactAreas: ImpactArea[]; responsibilities: string[]; requirements: string[] }`

`listingShare` values are relative weights that produce the uneven distribution the spec calls for (largest employer ~92 listings, smallest ~12).

- [ ] **Step 1: Write the failing test**

Create `tests/catalog.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  CITIES,
  COMPANIES,
  ROLE_TEMPLATES,
  SENIORITY_MULTIPLIER,
} from "@/scripts/seed/catalog";

describe("catalog", () => {
  it("has exactly 10 companies with unique ids", () => {
    expect(COMPANIES).toHaveLength(10);
    const ids = new Set(COMPANIES.map((company) => company.id));
    expect(ids.size).toBe(10);
  });

  it("distributes listings unevenly", () => {
    const shares = COMPANIES.map((company) => company.listingShare);
    expect(Math.max(...shares)).toBeGreaterThan(Math.min(...shares) * 3);
  });

  it("gives every city a positive base salary and a currency", () => {
    for (const city of CITIES) {
      expect(city.baseSalary).toBeGreaterThan(0);
      expect(["USD", "EUR", "GBP"]).toContain(city.currency);
      expect(city.country).toHaveLength(2);
    }
  });

  it("gives every role template real responsibilities and requirements", () => {
    for (const role of ROLE_TEMPLATES) {
      expect(role.responsibilities.length).toBeGreaterThanOrEqual(3);
      expect(role.requirements.length).toBeGreaterThanOrEqual(3);
      expect(role.impactAreas.length).toBeGreaterThanOrEqual(1);
    }
  });

  it("orders seniority multipliers monotonically", () => {
    expect(SENIORITY_MULTIPLIER.intern).toBeLessThan(SENIORITY_MULTIPLIER.junior);
    expect(SENIORITY_MULTIPLIER.junior).toBeLessThan(SENIORITY_MULTIPLIER.mid);
    expect(SENIORITY_MULTIPLIER.mid).toBeLessThan(SENIORITY_MULTIPLIER.senior);
    expect(SENIORITY_MULTIPLIER.senior).toBeLessThan(SENIORITY_MULTIPLIER.staff);
    expect(SENIORITY_MULTIPLIER.staff).toBeLessThan(SENIORITY_MULTIPLIER.director);
  });

  it("covers enough role templates for varied listings", () => {
    expect(ROLE_TEMPLATES.length).toBeGreaterThanOrEqual(12);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- catalog`
Expected: FAIL — cannot resolve `@/scripts/seed/catalog`.

- [ ] **Step 3: Write the implementation**

Create `scripts/seed/catalog.ts`. Logo paths reuse images already in `public/img/`:

```ts
import type { Currency, ImpactArea, RoleType, Seniority } from "@/lib/types";

export type CompanyProfile = {
  id: string;
  name: string;
  logo: string;
  impactArea: ImpactArea;
  blurb: string;
  listingShare: number;
  facts: { label: string; value: string }[];
};

export type CityProfile = {
  city: string;
  country: string;
  currency: Currency;
  baseSalary: number;
  remoteFriendly: boolean;
};

export type RoleTemplate = {
  title: string;
  roleType: RoleType;
  impactAreas: ImpactArea[];
  responsibilities: string[];
  requirements: string[];
};

/** Relative weights; the generator normalises these across ~500 listings. */
export const COMPANIES: CompanyProfile[] = [
  {
    id: "octopus-energy",
    name: "Octopus Energy",
    logo: "/img/logo-gridworks.jpg",
    impactArea: "renewable-energy",
    blurb:
      "a retail energy business running one of Europe's largest smart-tariff and flexibility platforms",
    listingShare: 92,
    facts: [
      { label: "Industry", value: "Energy Retail" },
      { label: "Size", value: "5000+ Employees" },
      { label: "Founded", value: "2015" },
      { label: "Funding", value: "Public" },
    ],
  },
  {
    id: "watershed",
    name: "Watershed",
    logo: "/img/logo-watershed.jpg",
    impactArea: "carbon-capture",
    blurb:
      "a carbon accounting platform used by enterprises to measure and reduce emissions",
    listingShare: 78,
    facts: [
      { label: "Industry", value: "Carbon Accounting" },
      { label: "Size", value: "500 - 1000 Employees" },
      { label: "Founded", value: "2019" },
      { label: "Funding", value: "Series C ($100M)" },
    ],
  },
  {
    id: "helion",
    name: "Helion Energy",
    logo: "/img/co-helion.jpg",
    impactArea: "renewable-energy",
    blurb: "a fusion company building pulsed non-ignition fusion generators",
    listingShare: 61,
    facts: [
      { label: "Industry", value: "Fusion Energy" },
      { label: "Size", value: "200 - 500 Employees" },
      { label: "Founded", value: "2013" },
      { label: "Funding", value: "Series F ($425M)" },
    ],
  },
  {
    id: "form-energy",
    name: "Form Energy",
    logo: "/img/co-sila.jpg",
    impactArea: "renewable-energy",
    blurb:
      "a storage company commercialising multi-day iron-air batteries for the grid",
    listingShare: 55,
    facts: [
      { label: "Industry", value: "Grid Storage" },
      { label: "Size", value: "500 - 1000 Employees" },
      { label: "Founded", value: "2017" },
      { label: "Funding", value: "Series F ($405M)" },
    ],
  },
  {
    id: "climeworks",
    name: "Climeworks",
    logo: "/img/logo-atmoshield.jpg",
    impactArea: "carbon-capture",
    blurb: "a direct air capture operator running commercial DAC plants",
    listingShare: 48,
    facts: [
      { label: "Industry", value: "Carbon Removal" },
      { label: "Size", value: "200 - 500 Employees" },
      { label: "Founded", value: "2009" },
      { label: "Funding", value: "Series E ($650M)" },
    ],
  },
  {
    id: "rivian",
    name: "Rivian",
    logo: "/img/co-rivian.jpg",
    impactArea: "circular-economy",
    blurb: "an electric vehicle manufacturer building trucks, vans and charging networks",
    listingShare: 44,
    facts: [
      { label: "Industry", value: "Electric Vehicles" },
      { label: "Size", value: "5000+ Employees" },
      { label: "Founded", value: "2009" },
      { label: "Funding", value: "Public" },
    ],
  },
  {
    id: "solestial",
    name: "Solestial",
    logo: "/img/co-solestial.jpg",
    impactArea: "renewable-energy",
    blurb: "a manufacturer of radiation-tolerant silicon solar blankets for orbit",
    listingShare: 33,
    facts: [
      { label: "Industry", value: "Space Solar" },
      { label: "Size", value: "50 - 200 Employees" },
      { label: "Founded", value: "2018" },
      { label: "Funding", value: "Series A ($17M)" },
    ],
  },
  {
    id: "hydrologic",
    name: "HydroLogic Systems",
    logo: "/img/logo-hydrologic.jpg",
    impactArea: "water-systems",
    blurb:
      "a water infrastructure firm designing storm surge and freshwater recovery systems",
    listingShare: 28,
    facts: [
      { label: "Industry", value: "Water Infrastructure" },
      { label: "Size", value: "200 - 500 Employees" },
      { label: "Founded", value: "2012" },
      { label: "Funding", value: "Series C ($70M)" },
    ],
  },
  {
    id: "zeropath",
    name: "ZeroPath",
    logo: "/img/logo-zeropath.jpg",
    impactArea: "circular-economy",
    blurb: "a reverse-logistics operator running take-back programmes for manufacturers",
    listingShare: 21,
    facts: [
      { label: "Industry", value: "Circular Economy" },
      { label: "Size", value: "500 - 1000 Employees" },
      { label: "Founded", value: "2015" },
      { label: "Funding", value: "Series C ($95M)" },
    ],
  },
  {
    id: "terrabase-solar",
    name: "Terrabase Solar",
    logo: "/img/logo-terrabase.jpg",
    impactArea: "renewable-energy",
    blurb: "a utility-scale solar developer using robotics for build-out and maintenance",
    listingShare: 12,
    facts: [
      { label: "Industry", value: "Utility Solar" },
      { label: "Size", value: "50 - 200 Employees" },
      { label: "Founded", value: "2020" },
      { label: "Funding", value: "Series A ($22M)" },
    ],
  },
];

/** baseSalary is the mid-level anchor in that city's own currency. */
export const CITIES: CityProfile[] = [
  { city: "San Francisco", country: "US", currency: "USD", baseSalary: 165000, remoteFriendly: true },
  { city: "Austin", country: "US", currency: "USD", baseSalary: 140000, remoteFriendly: true },
  { city: "Boston", country: "US", currency: "USD", baseSalary: 150000, remoteFriendly: false },
  { city: "Seattle", country: "US", currency: "USD", baseSalary: 158000, remoteFriendly: true },
  { city: "London", country: "GB", currency: "GBP", baseSalary: 82000, remoteFriendly: true },
  { city: "Berlin", country: "DE", currency: "EUR", baseSalary: 78000, remoteFriendly: true },
  { city: "Munich", country: "DE", currency: "EUR", baseSalary: 84000, remoteFriendly: false },
  { city: "Copenhagen", country: "DK", currency: "EUR", baseSalary: 88000, remoteFriendly: false },
  { city: "Oslo", country: "NO", currency: "EUR", baseSalary: 90000, remoteFriendly: true },
  { city: "Rotterdam", country: "NL", currency: "EUR", baseSalary: 79000, remoteFriendly: false },
  { city: "Zurich", country: "CH", currency: "EUR", baseSalary: 118000, remoteFriendly: false },
  { city: "Toronto", country: "CA", currency: "USD", baseSalary: 122000, remoteFriendly: true },
];

export const SENIORITY_MULTIPLIER: Record<Seniority, number> = {
  intern: 0.35,
  junior: 0.7,
  mid: 1,
  senior: 1.35,
  staff: 1.7,
  director: 2.1,
};

export const ROLE_TEMPLATES: RoleTemplate[] = [
  {
    title: "Grid Software Engineer",
    roleType: "engineering",
    impactAreas: ["renewable-energy"],
    responsibilities: [
      "Build dispatch and forecasting services that decide when stored energy reaches the grid.",
      "Model network constraints against real balancing-market data.",
      "Own service reliability for systems operating on half-hourly settlement cycles.",
      "Work with traders and operations to turn market rules into running code.",
    ],
    requirements: [
      "Production experience with PyPSA, PLEXOS, or comparable power-system modelling tools.",
      "Strong Python and experience handling timeseries data at scale.",
      "Familiarity with balancing or wholesale electricity markets.",
      "Comfort operating services where downtime has settlement consequences.",
    ],
  },
  {
    title: "Power Systems Engineer",
    roleType: "engineering",
    impactAreas: ["renewable-energy"],
    responsibilities: [
      "Run interconnection studies and load-flow analysis for new generation assets.",
      "Specify protection schemes and coordinate with utility counterparties.",
      "Validate models against commissioning data from live sites.",
      "Support the development team through grid-connection milestones.",
    ],
    requirements: [
      "Degree in Electrical Engineering with a power systems focus.",
      "Hands-on experience with ETAP, PSCAD, or DIgSILENT PowerFactory.",
      "Understanding of regional interconnection queues and their timelines.",
      "Track record taking at least one asset from study through energisation.",
    ],
  },
  {
    title: "Senior Thermal Engineer",
    roleType: "engineering",
    impactAreas: ["renewable-energy", "carbon-capture"],
    responsibilities: [
      "Own heat-transfer loop design from receiver through storage.",
      "Model transient thermal behaviour and validate against plant telemetry.",
      "Lead failure analysis on high-temperature materials and piping.",
      "Set commissioning criteria with the operations team.",
    ],
    requirements: [
      "MS or PhD in Mechanical Engineering or Thermal Sciences.",
      "Experience designing systems operating above 500°C.",
      "Fluency with CFD and transient thermal simulation tooling.",
      "Experience taking a thermal system through commissioning.",
    ],
  },
  {
    title: "Solar Design Engineer",
    roleType: "engineering",
    impactAreas: ["renewable-energy"],
    responsibilities: [
      "Produce array layouts and yield estimates for utility-scale sites.",
      "Run shading and soiling analysis across candidate parcels.",
      "Review EPC drawings and resolve constructability issues.",
      "Support due diligence on project acquisitions.",
    ],
    requirements: [
      "Proficiency with PVSyst and AutoCAD or Civil 3D.",
      "Experience with bifacial and single-axis tracking systems.",
      "Understanding of interconnection and permitting constraints.",
      "At least 100MW of delivered design experience.",
    ],
  },
  {
    title: "Battery Systems Engineer",
    roleType: "engineering",
    impactAreas: ["renewable-energy", "circular-economy"],
    responsibilities: [
      "Design pack architecture and thermal management for long-duration storage.",
      "Define cell qualification and abuse-testing programmes.",
      "Work with manufacturing to close the loop between design and yield.",
      "Own state-of-health modelling across the fleet.",
    ],
    requirements: [
      "Experience with cell characterisation and BMS design.",
      "Familiarity with UL 9540A or IEC 62619 test regimes.",
      "Strong data analysis skills applied to cycling data.",
      "Background in electrochemistry or mechanical engineering.",
    ],
  },
  {
    title: "ML Research Scientist",
    roleType: "data-science",
    impactAreas: ["carbon-capture", "renewable-energy"],
    responsibilities: [
      "Build predictive models from live plant sensor streams.",
      "Search process parameter spaces against energy-per-ton objectives.",
      "Ship models to production and own their monitoring and retraining.",
      "Publish methods work and collaborate with external research groups.",
    ],
    requirements: [
      "PhD in Machine Learning, Physics, Chemistry, or a related field.",
      "Track record applying ML to physical or industrial systems.",
      "Fluency in Python and a modern deep-learning framework.",
      "Comfort working from noisy real-world sensor data rather than clean benchmarks.",
    ],
  },
  {
    title: "Climate Data Scientist",
    roleType: "data-science",
    impactAreas: ["carbon-capture", "water-systems"],
    responsibilities: [
      "Build emissions and scenario models from heterogeneous client data.",
      "Turn methodology decisions into reproducible pipelines.",
      "Quantify uncertainty and communicate it to non-technical stakeholders.",
      "Partner with policy specialists to keep models aligned with standards.",
    ],
    requirements: [
      "Strong Python or R with a reproducible-analysis discipline.",
      "Working knowledge of the GHG Protocol scopes.",
      "Experience with geospatial or timeseries data.",
      "Ability to defend methodology choices to auditors.",
    ],
  },
  {
    title: "Carbon Analyst",
    roleType: "data-science",
    impactAreas: ["carbon-capture"],
    responsibilities: [
      "Build inventories across Scope 1, 2 and 3 for enterprise clients.",
      "Validate supplier-reported data and flag inconsistencies.",
      "Prepare disclosure-ready reporting packs.",
      "Advise clients on reduction pathways with defensible numbers.",
    ],
    requirements: [
      "Working knowledge of the GHG Protocol and CSRD reporting.",
      "Advanced spreadsheet and SQL skills.",
      "Experience with supplier engagement or LCA methodology.",
      "Precision with data that will be externally assured.",
    ],
  },
  {
    title: "Lifecycle Assessment Specialist",
    roleType: "data-science",
    impactAreas: ["circular-economy"],
    responsibilities: [
      "Run cradle-to-grave assessments across the product portfolio.",
      "Maintain the LCA model and its underlying inventory data.",
      "Review supplier declarations for methodological soundness.",
      "Translate findings into design recommendations.",
    ],
    requirements: [
      "Experience with SimaPro, GaBi, or openLCA.",
      "Understanding of ISO 14040 and 14044.",
      "Background in environmental engineering or materials science.",
      "Track record producing externally reviewed assessments.",
    ],
  },
  {
    title: "Product Manager, Climate Platform",
    roleType: "product",
    impactAreas: ["carbon-capture", "renewable-energy"],
    responsibilities: [
      "Own the roadmap for a platform serving sustainability teams.",
      "Translate regulatory requirements into product requirements.",
      "Run discovery with enterprise customers under NDA.",
      "Partner with data science to ship model-backed features.",
    ],
    requirements: [
      "Experience shipping B2B SaaS to technical buyers.",
      "Comfort reading regulation and turning it into scope.",
      "Track record prioritising against a compliance deadline.",
      "Strong written communication with executive audiences.",
    ],
  },
  {
    title: "Senior Product Designer",
    roleType: "product",
    impactAreas: ["renewable-energy", "circular-economy"],
    responsibilities: [
      "Design workflows for operators managing physical infrastructure.",
      "Run usability sessions with field and control-room staff.",
      "Own the design system alongside front-end engineering.",
      "Turn dense telemetry into interfaces people can act on.",
    ],
    requirements: [
      "Portfolio showing complex data-dense product work.",
      "Experience designing for operational or industrial users.",
      "Fluency in Figma and comfort working close to code.",
      "Ability to defend design decisions with research.",
    ],
  },
  {
    title: "Climate Policy Lead",
    roleType: "policy",
    impactAreas: ["carbon-capture", "renewable-energy"],
    responsibilities: [
      "Track regulatory developments across target markets.",
      "Prepare consultation responses and position papers.",
      "Brief the executive team on policy risk and opportunity.",
      "Build relationships with regulators and industry bodies.",
    ],
    requirements: [
      "Experience in energy or climate policy at a regulator, trade body, or operator.",
      "Understanding of carbon markets and compliance regimes.",
      "Excellent written advocacy under deadline.",
      "Comfort operating across technical and political audiences.",
    ],
  },
  {
    title: "Regulatory Affairs Manager",
    roleType: "policy",
    impactAreas: ["water-systems", "renewable-energy"],
    responsibilities: [
      "Manage permitting and consent processes across jurisdictions.",
      "Coordinate technical input into regulatory submissions.",
      "Maintain the compliance calendar and its evidence trail.",
      "Represent the company in hearings and stakeholder forums.",
    ],
    requirements: [
      "Experience managing environmental permitting end to end.",
      "Familiarity with EIA processes and their evidence requirements.",
      "Strong project management across parallel submissions.",
      "Background in environmental law, policy, or engineering.",
    ],
  },
  {
    title: "Operations Manager",
    roleType: "operations",
    impactAreas: ["circular-economy", "water-systems"],
    responsibilities: [
      "Own regional operations and their throughput targets.",
      "Optimise routing and facility utilisation against cost per unit.",
      "Manage carrier and processing partner relationships.",
      "Report recovery and diversion metrics to clients.",
    ],
    requirements: [
      "5+ years in logistics or industrial operations management.",
      "Experience owning cost-per-unit targets for a region.",
      "Comfort with routing optimisation and WMS platforms.",
      "Track record improving throughput in a physical operation.",
    ],
  },
  {
    title: "Field Service Engineer",
    roleType: "operations",
    impactAreas: ["renewable-energy", "water-systems"],
    responsibilities: [
      "Commission and maintain installed equipment across the region.",
      "Diagnose faults and drive them to root cause.",
      "Feed field failure data back into the design organisation.",
      "Train customer staff on operating procedures.",
    ],
    requirements: [
      "Hands-on experience commissioning industrial equipment.",
      "Willingness to travel to sites regularly.",
      "Strong electrical and mechanical fault-finding ability.",
      "Rigour about safety procedures in high-voltage environments.",
    ],
  },
  {
    title: "Supply Chain Manager",
    roleType: "operations",
    impactAreas: ["circular-economy", "renewable-energy"],
    responsibilities: [
      "Own supplier qualification and dual-sourcing strategy.",
      "Manage long-lead procurement against build schedules.",
      "Drive embodied-carbon reduction through sourcing decisions.",
      "Build supplier scorecards covering quality, cost and emissions.",
    ],
    requirements: [
      "Experience procuring for hardware manufacturing at volume.",
      "Familiarity with supplier audits and qualification processes.",
      "Data-driven approach to supplier performance.",
      "Understanding of embodied carbon in supply chains.",
    ],
  },
];
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- catalog`
Expected: PASS, 6 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed/catalog.ts tests/catalog.test.ts
git commit -m "feat: add realism catalogue of companies, cities and role templates"
```

---

### Task 5: Job generator

**Files:**
- Create: `scripts/seed/generate-jobs.ts`
- Test: `tests/generate-jobs.test.ts`

**Interfaces:**
- Consumes: `createRng` (Task 3); `COMPANIES`, `CITIES`, `ROLE_TEMPLATES`, `SENIORITY_MULTIPLIER` (Task 4); `Job` (Task 2)
- Produces: `generateJobs(rng: Rng, total: number, now: Date): Job[]`

Rules the tests enforce:
- ids are unique and slug-shaped
- `salaryMin < salaryMax`, both positive
- `salaryDisplay` reflects the numeric values
- `impactArea` is one the role template allows
- `postedAt` never in the future
- listing counts per company follow `listingShare` ordering

- [ ] **Step 1: Write the failing test**

Create `tests/generate-jobs.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { createRng } from "@/scripts/seed/rng";
import { generateJobs } from "@/scripts/seed/generate-jobs";
import { COMPANIES, ROLE_TEMPLATES } from "@/scripts/seed/catalog";

const NOW = new Date("2026-07-20T12:00:00Z");

function build(total = 500) {
  return generateJobs(createRng(2026), total, NOW);
}

describe("generateJobs", () => {
  it("generates the requested number of jobs", () => {
    expect(build()).toHaveLength(500);
  });

  it("is deterministic for a fixed seed", () => {
    const a = generateJobs(createRng(99), 50, NOW);
    const b = generateJobs(createRng(99), 50, NOW);
    expect(a).toEqual(b);
  });

  it("gives every job a unique slug id", () => {
    const jobs = build();
    const ids = new Set(jobs.map((job) => job.id));
    expect(ids.size).toBe(jobs.length);
    for (const job of jobs) {
      expect(job.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
    }
  });

  it("produces coherent salary ranges", () => {
    for (const job of build()) {
      expect(job.salaryMin).toBeGreaterThan(0);
      expect(job.salaryMax).toBeGreaterThan(job.salaryMin);
    }
  });

  it("renders salaryDisplay from the numeric range", () => {
    for (const job of build().slice(0, 50)) {
      const min = Math.round(job.salaryMin / 1000);
      const max = Math.round(job.salaryMax / 1000);
      expect(job.salaryDisplay).toContain(`${min}k`);
      expect(job.salaryDisplay).toContain(`${max}k`);
    }
  });

  it("only assigns impact areas the role template allows", () => {
    for (const job of build()) {
      // Director titles name a department rather than the template role,
      // so they legitimately do not match any template title.
      const template = ROLE_TEMPLATES.find((role) =>
        job.title.includes(role.title),
      );
      if (template) {
        expect(template.impactAreas).toContain(job.impactArea);
      }
    }
  });

  it("titles directors by department, not by role template", () => {
    const directors = build().filter((job) => job.seniority === "director");
    expect(directors.length).toBeGreaterThan(0);
    for (const job of directors) {
      expect(job.title).toMatch(
        /^Director of (Engineering|Data Science|Product|Policy|Operations)$/,
      );
    }
  });

  it("never posts a job in the future", () => {
    for (const job of build()) {
      expect(new Date(job.postedAt).getTime()).toBeLessThanOrEqual(NOW.getTime());
    }
  });

  it("distributes listings unevenly, following listingShare order", () => {
    const jobs = build();
    const counts = new Map<string, number>();
    for (const job of jobs) {
      counts.set(job.posterId, (counts.get(job.posterId) ?? 0) + 1);
    }
    const biggest = COMPANIES.reduce((a, b) =>
      a.listingShare > b.listingShare ? a : b,
    );
    const smallest = COMPANIES.reduce((a, b) =>
      a.listingShare < b.listingShare ? a : b,
    );
    expect(counts.get(biggest.id)!).toBeGreaterThan(counts.get(smallest.id)!);
    expect(counts.size).toBe(COMPANIES.length);
  });

  it("marks some jobs remote and some not", () => {
    const jobs = build();
    expect(jobs.some((job) => job.remote)).toBe(true);
    expect(jobs.some((job) => !job.remote)).toBe(true);
  });

  it("gives every job renderable detail content", () => {
    for (const job of build().slice(0, 50)) {
      expect(job.about.length).toBeGreaterThan(40);
      expect(job.responsibilities.length).toBeGreaterThanOrEqual(3);
      expect(job.requirements.length).toBeGreaterThanOrEqual(3);
      expect(job.impactStats).toHaveLength(3);
      expect(job.companyFacts.length).toBeGreaterThanOrEqual(3);
    }
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- generate-jobs`
Expected: FAIL — cannot resolve `@/scripts/seed/generate-jobs`.

- [ ] **Step 3: Write the implementation**

Create `scripts/seed/generate-jobs.ts`:

```ts
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
    const template = rng.pick(ROLE_TEMPLATES);
    const city = rng.pick(CITIES);
    const seniority = rng.weighted(SENIORITY_WEIGHTS);

    const impactArea = template.impactAreas.includes(company.impactArea)
      ? company.impactArea
      : rng.pick(template.impactAreas);

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
    const daysAgo =
      rng.next() < 0.7 ? rng.int(0, 21) : rng.int(22, 120);
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- generate-jobs`
Expected: PASS, 11 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed/generate-jobs.ts tests/generate-jobs.test.ts
git commit -m "feat: add deterministic job generator"
```

---

### Task 6: User and application generator

**Files:**
- Create: `scripts/seed/generate-users.ts`
- Test: `tests/generate-users.test.ts`

**Interfaces:**
- Consumes: `createRng` (Task 3); `COMPANIES` (Task 4); `Job`, `Poster`, `Seeker`, `Application` (Task 2)
- Produces:
  - `generatePosters(): Poster[]` — one per company, 10 total
  - `generateSeekers(): Seeker[]` — 20 total
  - `generateApplications(rng: Rng, jobs: Job[], seekers: Seeker[], now: Date): Application[]`

Account rules fixed by the spec:
- `posters[0].email === "jobposter@email.com"`
- `seekers[0].email === "jobseeker@email.com"`
- remaining seekers are `jobseeker1@email.com` … `jobseeker19@email.com`
- remaining posters are `jobposter1@email.com` … `jobposter9@email.com`
- every password is `"password"`
- `jobseeker1@` and `jobseeker2@` must have applications to jobs owned by `jobposter@email.com`, so the demo poster's dashboard is populated on first load

- [ ] **Step 1: Write the failing test**

Create `tests/generate-users.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- generate-users`
Expected: FAIL — cannot resolve `@/scripts/seed/generate-users`.

- [ ] **Step 3: Write the implementation**

Create `scripts/seed/generate-users.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- generate-users`
Expected: PASS, 12 tests.

- [ ] **Step 5: Commit**

```bash
git add scripts/seed/generate-users.ts tests/generate-users.test.ts
git commit -m "feat: add poster, seeker and application generators"
```

---

### Task 7: Seed entry point and committed artifact

**Files:**
- Create: `scripts/seed/index.ts`
- Create: `data/seed.json` (generated output, committed)
- Modify: `package.json`
- Test: `tests/seed-file.test.ts`

**Interfaces:**
- Consumes: all generators from Tasks 3–6
- Produces: `data/seed.json` conforming to `SeedData`; `npm run seed` regenerates it

- [ ] **Step 1: Write the entry point**

Create `scripts/seed/index.ts`:

```ts
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
```

- [ ] **Step 2: Add the seed script**

In `package.json`, add to `"scripts"`:

```json
"seed": "node --experimental-strip-types --no-warnings scripts/seed/index.ts"
```

> If Node rejects the `@/` alias at runtime, change the three `@/lib/types` imports in `scripts/seed/*.ts` to the relative `../../lib/types`. Vitest resolves the alias via `vite-tsconfig-paths`; bare Node does not.

- [ ] **Step 3: Generate the seed**

Run: `npm run seed`
Expected: `Wrote 500 jobs, 10 posters, 20 seekers, 40 applications to .../data/seed.json`

- [ ] **Step 4: Write the artifact test**

Create `tests/seed-file.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import seed from "../data/seed.json";
import type { SeedData } from "@/lib/types";

const data = seed as SeedData;

describe("data/seed.json", () => {
  it("has the expected volumes", () => {
    expect(data.jobs).toHaveLength(500);
    expect(data.posters).toHaveLength(10);
    expect(data.seekers).toHaveLength(20);
    expect(data.applications.length).toBeGreaterThanOrEqual(30);
  });

  it("contains both demo accounts", () => {
    expect(
      data.seekers.some((seeker) => seeker.email === "jobseeker@email.com"),
    ).toBe(true);
    expect(
      data.posters.some((poster) => poster.email === "jobposter@email.com"),
    ).toBe(true);
  });

  it("has no dangling references", () => {
    const jobIds = new Set(data.jobs.map((job) => job.id));
    const seekerIds = new Set(data.seekers.map((seeker) => seeker.id));
    const posterIds = new Set(data.posters.map((poster) => poster.id));

    for (const job of data.jobs) {
      expect(posterIds.has(job.posterId)).toBe(true);
    }
    for (const application of data.applications) {
      expect(jobIds.has(application.jobId)).toBe(true);
      expect(seekerIds.has(application.seekerId)).toBe(true);
    }
  });

  it("stores no React components or icon references", () => {
    const raw = JSON.stringify(data);
    expect(raw).not.toContain("function");
    expect(raw).not.toContain("lucide");
  });

  it("covers every filter dimension with more than one value", () => {
    const roleTypes = new Set(data.jobs.map((job) => job.roleType));
    const countries = new Set(data.jobs.map((job) => job.country));
    const impactAreas = new Set(data.jobs.map((job) => job.impactArea));
    expect(roleTypes.size).toBeGreaterThan(1);
    expect(countries.size).toBeGreaterThan(1);
    expect(impactAreas.size).toBeGreaterThan(1);
  });
});
```

- [ ] **Step 5: Run the test**

Run: `npm test -- seed-file`
Expected: PASS, 5 tests.

> If `resolveJsonModule` errors appear, confirm `tsconfig.json` already sets `"resolveJsonModule": true`. It does.

- [ ] **Step 6: Commit**

```bash
git add scripts/seed/index.ts data/seed.json package.json tests/seed-file.test.ts
git commit -m "feat: generate and commit seed data artifact"
```

---

### Task 8: Server-side seed reader

**Files:**
- Create: `lib/seed.ts`
- Test: `tests/seed-reader.test.ts`

**Interfaces:**
- Consumes: `data/seed.json`; types from Task 2
- Produces:
  - `getSeed(): SeedData`
  - `getJobById(id: string): Job | undefined`
  - `getPosterById(id: string): Poster | undefined`
  - `getSeekerById(id: string): Seeker | undefined`
  - `getJobsByPoster(posterId: string): Job[]`

Lookups use maps built once at module load — linear scans over 500 jobs on every request would be wasteful.

- [ ] **Step 1: Write the failing test**

Create `tests/seed-reader.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- seed-reader`
Expected: FAIL — cannot resolve `@/lib/seed`.

- [ ] **Step 3: Write the implementation**

Create `lib/seed.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- seed-reader`
Expected: PASS, 5 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/seed.ts tests/seed-reader.test.ts
git commit -m "feat: add server-side seed reader with indexed lookups"
```

---

### Task 9: Overlay merge logic

**Files:**
- Create: `lib/overlay.ts`
- Test: `tests/overlay.test.ts`

**Interfaces:**
- Consumes: `Application`, `AppStatus`, `Job` (Task 2)
- Produces:
  - `type Overlay = { applications: Application[]; listings: Job[]; statusPatches: Record<string, AppStatus>; session: Session | null }`
  - `type Session = { userId: string; role: "seeker" | "poster" }`
  - `EMPTY_OVERLAY: Overlay`
  - `mergeApplications(seeded: Application[], overlay: Overlay): Application[]`
  - `mergeJobs(seeded: Job[], overlay: Overlay): Job[]`
  - `addApplication(overlay: Overlay, application: Application): Overlay`
  - `setStatus(overlay: Overlay, applicationId: string, status: AppStatus): Overlay`
  - `addListing(overlay: Overlay, job: Job): Overlay`
  - `hasApplied(applications: Application[], seekerId: string, jobId: string): boolean`

Every function is pure and touches no browser API, so all merge rules are testable in a Node environment. Task 10 wraps these with `localStorage`.

- [ ] **Step 1: Write the failing test**

Create `tests/overlay.test.ts`:

```ts
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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- overlay`
Expected: FAIL — cannot resolve `@/lib/overlay`.

- [ ] **Step 3: Write the implementation**

Create `lib/overlay.ts`:

```ts
import type { AppStatus, Application, Job } from "./types";

export type Session = { userId: string; role: "seeker" | "poster" };

export type Overlay = {
  applications: Application[];
  listings: Job[];
  statusPatches: Record<string, AppStatus>;
  session: Session | null;
};

export const EMPTY_OVERLAY: Overlay = {
  applications: [],
  listings: [],
  statusPatches: {},
  session: null,
};

/** Seeded first, overlay appended, then status patches applied over both. */
export function mergeApplications(
  seeded: Application[],
  overlay: Overlay,
): Application[] {
  return [...seeded, ...overlay.applications].map((application) => {
    const patched = overlay.statusPatches[application.id];
    return patched ? { ...application, status: patched } : application;
  });
}

/** Newly posted listings surface first so the poster sees their own work. */
export function mergeJobs(seeded: Job[], overlay: Overlay): Job[] {
  return [...overlay.listings, ...seeded];
}

export function addApplication(
  overlay: Overlay,
  application: Application,
): Overlay {
  return { ...overlay, applications: [...overlay.applications, application] };
}

export function setStatus(
  overlay: Overlay,
  applicationId: string,
  status: AppStatus,
): Overlay {
  return {
    ...overlay,
    statusPatches: { ...overlay.statusPatches, [applicationId]: status },
  };
}

export function addListing(overlay: Overlay, job: Job): Overlay {
  return { ...overlay, listings: [...overlay.listings, job] };
}

export function hasApplied(
  applications: Application[],
  seekerId: string,
  jobId: string,
): boolean {
  return applications.some(
    (application) =>
      application.seekerId === seekerId && application.jobId === jobId,
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- overlay`
Expected: PASS, 7 tests.

- [ ] **Step 5: Commit**

```bash
git add lib/overlay.ts tests/overlay.test.ts
git commit -m "feat: add pure overlay merge logic"
```

---

### Task 10: localStorage store

**Files:**
- Create: `lib/store.ts`
- Test: `tests/store.test.ts`
- Modify: `vitest.config.ts`

**Interfaces:**
- Consumes: `Overlay`, `EMPTY_OVERLAY` (Task 9)
- Produces:
  - `STORAGE_KEY = "ecolution:demo:v1"`
  - `readOverlay(): Overlay`
  - `writeOverlay(overlay: Overlay): void`
  - `resetOverlay(): void`
  - `useOverlay(): { overlay: Overlay; update: (fn: (current: Overlay) => Overlay) => void; reset: () => void }`

Behaviour the tests enforce: unavailable or corrupt storage degrades to in-memory rather than throwing, per the spec's private-mode risk.

- [ ] **Step 1: Add a DOM environment for this test file**

In `vitest.config.ts`, replace the `test` block:

```ts
  test: {
    include: ["tests/**/*.test.ts"],
    environmentMatchGlobs: [
      ["tests/store.test.ts", "happy-dom"],
    ],
    environment: "node",
  },
```

Then install the DOM implementation:

```bash
npm install -D happy-dom
```

- [ ] **Step 2: Write the failing test**

Create `tests/store.test.ts`:

```ts
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  STORAGE_KEY,
  readOverlay,
  resetOverlay,
  writeOverlay,
} from "@/lib/store";
import { EMPTY_OVERLAY, addApplication } from "@/lib/overlay";
import type { Application } from "@/lib/types";

const application: Application = {
  id: "app-1",
  jobId: "job-1",
  seekerId: "seeker-0",
  status: "new",
  coverNote: "hello",
  appliedAt: "2026-07-20T00:00:00Z",
};

describe("store", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns an empty overlay when nothing is stored", () => {
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
  });

  it("round-trips an overlay", () => {
    writeOverlay(addApplication(EMPTY_OVERLAY, application));
    expect(readOverlay().applications).toHaveLength(1);
    expect(readOverlay().applications[0].id).toBe("app-1");
  });

  it("clears stored state on reset", () => {
    writeOverlay(addApplication(EMPTY_OVERLAY, application));
    resetOverlay();
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("falls back to empty when stored JSON is corrupt", () => {
    localStorage.setItem(STORAGE_KEY, "{not json");
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
  });

  it("falls back to empty when stored JSON has the wrong shape", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ nonsense: true }));
    expect(readOverlay()).toEqual(EMPTY_OVERLAY);
  });

  it("does not throw when storage writes fail", () => {
    const spy = vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("QuotaExceededError");
    });
    expect(() => writeOverlay(EMPTY_OVERLAY)).not.toThrow();
    spy.mockRestore();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- store`
Expected: FAIL — cannot resolve `@/lib/store`.

- [ ] **Step 4: Write the implementation**

Create `lib/store.ts`:

```ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { EMPTY_OVERLAY, type Overlay } from "./overlay";

export const STORAGE_KEY = "ecolution:demo:v1";

/**
 * Used when localStorage is unavailable (private mode) or throws on write.
 * The demo keeps working for the session; state simply does not survive a
 * reload, which beats crashing in front of a client.
 */
let memoryFallback: Overlay = EMPTY_OVERLAY;

function isOverlay(value: unknown): value is Overlay {
  if (typeof value !== "object" || value === null) return false;
  const candidate = value as Partial<Overlay>;
  return (
    Array.isArray(candidate.applications) &&
    Array.isArray(candidate.listings) &&
    typeof candidate.statusPatches === "object" &&
    candidate.statusPatches !== null
  );
}

export function readOverlay(): Overlay {
  if (typeof window === "undefined") return EMPTY_OVERLAY;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryFallback;
    const parsed: unknown = JSON.parse(raw);
    return isOverlay(parsed) ? parsed : EMPTY_OVERLAY;
  } catch {
    return memoryFallback;
  }
}

export function writeOverlay(overlay: Overlay): void {
  memoryFallback = overlay;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(overlay));
  } catch {
    // Quota or private mode — memoryFallback already holds the value.
  }
}

export function resetOverlay(): void {
  memoryFallback = EMPTY_OVERLAY;
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing to do; memoryFallback is already reset.
  }
}

export function useOverlay() {
  // Starts empty so server and first client render agree; the effect below
  // hydrates from storage immediately after mount.
  const [overlay, setOverlay] = useState<Overlay>(EMPTY_OVERLAY);

  useEffect(() => {
    setOverlay(readOverlay());
  }, []);

  const update = useCallback((fn: (current: Overlay) => Overlay) => {
    setOverlay((current) => {
      const next = fn(current);
      writeOverlay(next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    resetOverlay();
    setOverlay(EMPTY_OVERLAY);
  }, []);

  return { overlay, update, reset };
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- store`
Expected: PASS, 6 tests.

- [ ] **Step 6: Run the full suite and the existing checks**

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected: all tests pass; tsc silent; lint silent; build succeeds.

- [ ] **Step 7: Commit**

```bash
git add lib/store.ts tests/store.test.ts vitest.config.ts package.json package-lock.json
git commit -m "feat: add localStorage-backed overlay store with in-memory fallback"
```

---

## Stage 1 Definition of Done

- [ ] `npm test` passes
- [ ] `npx tsc --noEmit` clean
- [ ] `npm run lint` clean
- [ ] `npm run build` succeeds
- [ ] `data/seed.json` committed, containing 500 jobs / 10 posters / 20 seekers / ~40 applications
- [ ] `npm run seed` reproduces byte-identical output (verify: `npm run seed && git diff --exit-code data/seed.json`)
- [ ] No existing route regressed: `/`, `/browse`, `/auth`, `/employer`, `/jobs/[id]` all still return 200

**Not done in this stage, by design:** no UI consumes the seed yet. The existing pages still render their hardcoded fixtures. Stage 2 (auth) begins wiring this in.
