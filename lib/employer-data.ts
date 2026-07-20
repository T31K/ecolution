export type Listing = {
  id: string;
  title: string;
  location: string;
  posted: string;
  views: string;
  apps: number;
  status: "Active" | "Draft" | "Promoted";
  highImpact?: boolean;
  footnote?: string;
  cta: "Review Applicants" | "Edit Listing";
};

export type Applicant = {
  name: string;
  initials: string;
  experience: string;
  appliedFor: string;
  status: "New" | "Interviewing" | "Reviewing";
};

export const STATS = [
  {
    label: "Total Climate Impact Reach",
    value: "42.8k",
    delta: "+12%",
    caption: null,
  },
  {
    label: "Active Listings",
    value: "12",
    delta: null,
    caption: "3 closing this week",
  },
  {
    label: "Total Applicants",
    value: "341",
    delta: null,
    caption: "+24 in the last 24h",
  },
];

export const LISTINGS: Listing[] = [
  {
    id: "senior-renewable-energy-engineer",
    title: "Senior Renewable Energy Engineer",
    location: "Oslo, Norway (Remote)",
    posted: "Posted 3d ago",
    views: "1,204",
    apps: 86,
    status: "Active",
    footnote: "+83 applicants",
    cta: "Review Applicants",
  },
  {
    id: "sustainability-data-analyst",
    title: "Sustainability Data Analyst",
    location: "Copenhagen, DK",
    posted: "Posted 5d ago",
    views: "856",
    apps: 42,
    status: "Draft",
    cta: "Edit Listing",
  },
  {
    id: "carbon-policy-specialist",
    title: "Carbon Policy Specialist",
    location: "London, UK",
    posted: "Posted 12h ago",
    views: "2.1k",
    apps: 156,
    status: "Promoted",
    highImpact: true,
    footnote: "5 new applicants in the last hour",
    cta: "Review Applicants",
  },
];

export const APPLICANTS: Applicant[] = [
  {
    name: "Sarah Jenkins",
    initials: "SJ",
    experience: "5 years exp.",
    appliedFor: "Senior Energy Engineer",
    status: "New",
  },
  {
    name: "Marcus Thorne",
    initials: "MT",
    experience: "8 years exp.",
    appliedFor: "Sustainability Data Analyst",
    status: "Interviewing",
  },
  {
    name: "Elena Lopez",
    initials: "EL",
    experience: "3 years exp.",
    appliedFor: "Senior Energy Engineer",
    status: "Reviewing",
  },
];
