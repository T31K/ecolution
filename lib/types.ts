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

export type JobStat = { value: string; label: string };

export type CompanyFact = { label: string; value: string };

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
  impactStats: JobStat[];
  responsibilities: string[];
  requirements: string[];
  companyFacts: CompanyFact[];

  /**
   * "real" listings are scraped from climatechangejobs.com and carry a
   * sourceUrl back to the original posting. Everything else is generated
   * sample data. The UI must keep the two visibly distinguishable.
   */
  source?: "real" | "generated";
  sourceUrl?: string;
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
