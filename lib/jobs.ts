import { Cloud, Droplet, Leaf, RefreshCw } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type BrowseJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  salary: string;
  posted: string;
  logo: string;
  logoAlt: string;
  impact: { label: string; icon: LucideIcon; highlighted?: boolean };
  verified?: boolean;
  isNew?: boolean;
};

export const BROWSE_JOBS: BrowseJob[] = [
  {
    id: "senior-solar-engineer",
    title: "Senior Renewable Energy Engineer",
    company: "Solaris Systems",
    location: "Copenhagen, Denmark (Hybrid)",
    salary: "$120k – $160k",
    posted: "Posted 2d ago",
    logo: "/img/logo-solaris-systems.jpg",
    logoAlt: "a stylized leaf fused with a power-grid symbol",
    impact: { label: "Renewable Energy", icon: Leaf, highlighted: true },
    verified: true,
  },
  {
    id: "senior-thermal-engineer",
    title: "Senior Thermal Engineer",
    company: "SolarVortex",
    location: "Austin, TX (Hybrid)",
    salary: "$140k – $185k",
    posted: "Posted 2h ago",
    logo: "/img/logo-solarvortex.jpg",
    logoAlt: "a stylized emerald turbine leaf inside a soft gray circle",
    impact: { label: "Renewable Energy", icon: Leaf, highlighted: true },
    verified: true,
  },
  {
    id: "ml-research-scientist",
    title: "ML Research Scientist",
    company: "AtmoShield",
    location: "Remote (Global)",
    salary: "$160k – $220k",
    posted: "Posted 5h ago",
    logo: "/img/logo-atmoshield.jpg",
    logoAlt: "a teal abstract hexagon motif",
    impact: { label: "Carbon Capture", icon: Cloud },
    isNew: true,
  },
  {
    id: "lead-water-systems-architect",
    title: "Lead Water Systems Architect",
    company: "HydroLogic Systems",
    location: "Rotterdam, NL",
    salary: "€90k – €120k",
    posted: "Posted 1d ago",
    logo: "/img/logo-hydrologic.jpg",
    logoAlt: "blue and emerald fluid wave lines within a square boundary",
    impact: { label: "Water Systems", icon: Droplet },
  },
  {
    id: "operations-manager-green-logistics",
    title: "Operations Manager (Green Logistics)",
    company: "ZeroPath",
    location: "Chicago, IL",
    salary: "$115k – $150k",
    posted: "Posted 2d ago",
    logo: "/img/logo-zeropath.jpg",
    logoAlt: "an emerald stylized path forming a continuous loop",
    impact: { label: "Circular Economy", icon: RefreshCw },
  },
];
