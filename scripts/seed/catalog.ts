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
    logo: "/img/companies/octopus-energy.jpg",
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
    logo: "/img/companies/watershed.jpg",
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
    logo: "/img/companies/helion.jpg",
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
    logo: "/img/companies/form-energy.jpg",
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
    logo: "/img/companies/climeworks.jpg",
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
    logo: "/img/companies/rivian.jpg",
    impactArea: "circular-economy",
    blurb:
      "an electric vehicle manufacturer building trucks, vans and charging networks",
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
    logo: "/img/companies/solestial.jpg",
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
    logo: "/img/companies/hydrologic.jpg",
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
    logo: "/img/companies/zeropath.jpg",
    impactArea: "circular-economy",
    blurb:
      "a reverse-logistics operator running take-back programmes for manufacturers",
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
    logo: "/img/companies/terrabase-solar.jpg",
    impactArea: "renewable-energy",
    blurb:
      "a utility-scale solar developer using robotics for build-out and maintenance",
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
    title: "Thermal Engineer",
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
    title: "Product Designer",
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
    title: "Climate Policy Specialist",
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
