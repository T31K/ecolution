export type JobStat = {
  value: string;
  label: string;
};

export type SimilarJob = {
  title: string;
  company: string;
  location: string;
  tag: string;
  postedAgo: string;
};

export type CompanyFact = {
  label: string;
  value: string;
};

export type Job = {
  id: string;
  title: string;
  company: string;
  companyLogo: string;
  companyLogoAlt: string;
  location: string;
  postedAgo: string;
  chips: string[];
  impactChip: string;
  about: string;
  impactSummary: string;
  impactStats: JobStat[];
  responsibilities: string[];
  requirements: string[];
  companyFacts: CompanyFact[];
  officePhoto: string;
  officePhotoAlt: string;
  similarJobs: SimilarJob[];
  similarJobsCta: string;
};

export const JOBS: Record<string, Job> = {
  "senior-solar-engineer": {
    id: "senior-solar-engineer",
    title: "Senior Renewable Energy Engineer",
    company: "Solaris Systems",
    companyLogo: "/img/logo-solaris-systems.jpg",
    companyLogoAlt:
      "Solaris Systems logo: a stylized leaf fused with a power-grid symbol in emerald green and slate grey.",
    location: "Copenhagen, Denmark (Hybrid)",
    postedAgo: "Posted 2 days ago",
    chips: ["Full-time", "$120k - $160k"],
    impactChip: "High Impact Role",
    about:
      "At Solaris Systems, we are pioneering the next generation of integrated photovoltaic storage solutions. As a Senior Renewable Energy Engineer, you will lead the technical design and optimization of large-scale utility projects across Northern Europe. You'll bridge the gap between theoretical solar physics and practical electrical engineering, ensuring our systems deliver maximum efficiency while maintaining the highest safety standards.",
    impactSummary:
      "This role isn't just about engineering—it's about acceleration. Every megawatt of solar capacity you optimize directly offsets approximately 400 metric tons of CO2 per year.",
    impactStats: [
      { value: "2.5GW", label: "Planned Portfolio" },
      { value: "12M", label: "Trees Equivalent" },
      { value: "15%", label: "Efficiency Gain Goal" },
    ],
    responsibilities: [
      "Design complex solar-plus-storage utility systems from initial site assessment to commissioning.",
      "Perform advanced modeling and simulations using PVSyst, AutoCAD, and ETAP.",
      "Lead technical due diligence for international project acquisitions.",
      "Collaborate with the R&D team to integrate proprietary bifacial tracking algorithms.",
    ],
    requirements: [
      "Masters or PhD in Electrical Engineering, Physics, or Renewable Energy.",
      "5+ years of experience in utility-scale PV system engineering.",
      "Proficiency in PVSyst, Homer, and electrical distribution simulation tools.",
      "Proven track record of delivering at least 250MW of grid-connected capacity.",
    ],
    companyFacts: [
      { label: "Industry", value: "Clean Tech" },
      { label: "Size", value: "200 - 500 Employees" },
      { label: "Founded", value: "2016" },
      { label: "Funding", value: "Series C ($85M)" },
    ],
    officePhoto: "/img/solaris-systems-hq.jpg",
    officePhotoAlt:
      "The Solaris Systems headquarters in Copenhagen: a glass-fronted office block with vertical gardens on its facade, bicycle paths and lawns in front, under bright Nordic morning light.",
    similarJobs: [
      {
        title: "Grid Integration Lead",
        company: "EnviroGrid",
        location: "Berlin",
        tag: "Remote",
        postedAgo: "3 days ago",
      },
      {
        title: "Battery Storage Analyst",
        company: "Lumina Energy",
        location: "Oslo",
        tag: "On-site",
        postedAgo: "1 week ago",
      },
      {
        title: "VP of Engineering",
        company: "WindSail Tech",
        location: "Remote",
        tag: "Remote",
        postedAgo: "2 weeks ago",
      },
    ],
    similarJobsCta: "Browse all Engineering jobs",
  },

  "senior-thermal-engineer": {
    id: "senior-thermal-engineer",
    title: "Senior Thermal Engineer",
    company: "SolarVortex",
    companyLogo: "/img/logo-solarvortex.jpg",
    companyLogoAlt:
      "SolarVortex logo: a stylized emerald turbine leaf inside a soft grey circle.",
    location: "Austin, TX (Hybrid)",
    postedAgo: "Posted 2 hours ago",
    chips: ["Full-time", "$140k - $185k"],
    impactChip: "Renewable Energy",
    about:
      "SolarVortex builds concentrated solar thermal plants that store heat in molten salt, letting a solar farm dispatch power long after sunset. As Senior Thermal Engineer you will own the heat-transfer loop end to end: receiver design, storage tank thermodynamics, and the control strategy that decides when stored energy reaches the grid.",
    impactSummary:
      "Dispatchable solar displaces the gas peaker plants that utilities fire up at dusk. Every plant your designs bring online retires roughly 180,000 metric tons of annual CO2.",
    impactStats: [
      { value: "600MW", label: "Thermal Capacity" },
      { value: "14h", label: "Storage Duration" },
      { value: "180kt", label: "CO2 Displaced / yr" },
    ],
    responsibilities: [
      "Own receiver and molten-salt storage design from concept through commissioning.",
      "Model transient thermal behaviour and validate against plant telemetry.",
      "Set the dispatch control strategy with the grid operations team.",
      "Lead failure analysis on high-temperature materials and piping.",
    ],
    requirements: [
      "MS or PhD in Mechanical Engineering, Thermal Sciences, or equivalent.",
      "6+ years designing high-temperature thermal systems.",
      "Deep familiarity with CFD and transient thermal simulation tooling.",
      "Experience taking a thermal plant from design through commissioning.",
    ],
    companyFacts: [
      { label: "Industry", value: "Solar Thermal" },
      { label: "Size", value: "80 - 200 Employees" },
      { label: "Founded", value: "2018" },
      { label: "Funding", value: "Series B ($60M)" },
    ],
    officePhoto: "/img/mission-control-room.jpg",
    officePhotoAlt:
      "A brightly lit plant control room where operators monitor thermal output on wall-sized displays.",
    similarJobs: [
      {
        title: "Senior Renewable Energy Engineer",
        company: "Solaris Systems",
        location: "Copenhagen",
        tag: "Hybrid",
        postedAgo: "2 days ago",
      },
      {
        title: "Grid Integration Lead",
        company: "EnviroGrid",
        location: "Berlin",
        tag: "Remote",
        postedAgo: "3 days ago",
      },
      {
        title: "Battery Storage Analyst",
        company: "Lumina Energy",
        location: "Oslo",
        tag: "On-site",
        postedAgo: "1 week ago",
      },
    ],
    similarJobsCta: "Browse all Engineering jobs",
  },

  "ml-research-scientist": {
    id: "ml-research-scientist",
    title: "ML Research Scientist",
    company: "AtmoShield",
    companyLogo: "/img/logo-atmoshield.jpg",
    companyLogoAlt: "AtmoShield logo: a teal abstract hexagon motif.",
    location: "Remote (Global)",
    postedAgo: "Posted 5 hours ago",
    chips: ["Full-time", "$160k - $220k"],
    impactChip: "Carbon Capture",
    about:
      "AtmoShield runs direct air capture plants whose sorbent cycles are tuned by learned models rather than fixed schedules. You will build those models: predicting sorbent saturation from sensor data, and searching the regeneration parameter space for cycles that pull the same carbon for less energy.",
    impactSummary:
      "Energy cost per ton is the number standing between direct air capture and climate relevance. A 10% cut across the fleet is worth more than any single new plant.",
    impactStats: [
      { value: "40kt", label: "CO2 Captured / yr" },
      { value: "10%", label: "Energy Cost Target" },
      { value: "6", label: "Plants Instrumented" },
    ],
    responsibilities: [
      "Build predictive models of sorbent saturation from live plant sensor streams.",
      "Run parameter search over regeneration cycles against energy-per-ton.",
      "Ship models to production and own their monitoring and retraining.",
      "Publish methods work and collaborate with external research groups.",
    ],
    requirements: [
      "PhD in Machine Learning, Physics, Chemistry, or a related field.",
      "Strong track record applying ML to physical or industrial systems.",
      "Fluency in Python and a modern deep-learning framework.",
      "Comfort working from noisy, real-world sensor data rather than clean benchmarks.",
    ],
    companyFacts: [
      { label: "Industry", value: "Carbon Removal" },
      { label: "Size", value: "50 - 100 Employees" },
      { label: "Founded", value: "2020" },
      { label: "Funding", value: "Series A ($35M)" },
    ],
    officePhoto: "/img/mission-control-room.jpg",
    officePhotoAlt:
      "An operations room where engineers monitor capture-plant performance across banked screens.",
    similarJobs: [
      {
        title: "Carbon Analyst",
        company: "Watershed",
        location: "New York",
        tag: "Hybrid",
        postedAgo: "4 days ago",
      },
      {
        title: "Senior Thermal Engineer",
        company: "SolarVortex",
        location: "Austin",
        tag: "Hybrid",
        postedAgo: "2 hours ago",
      },
      {
        title: "Process Engineer",
        company: "Heirloom",
        location: "Remote",
        tag: "Remote",
        postedAgo: "1 week ago",
      },
    ],
    similarJobsCta: "Browse all Data Science jobs",
  },

  "lead-water-systems-architect": {
    id: "lead-water-systems-architect",
    title: "Lead Water Systems Architect",
    company: "HydroLogic Systems",
    companyLogo: "/img/logo-hydrologic.jpg",
    companyLogoAlt:
      "HydroLogic Systems logo: blue and emerald fluid wave lines within a square boundary.",
    location: "Rotterdam, NL",
    postedAgo: "Posted 1 day ago",
    chips: ["Full-time", "€90k - €120k"],
    impactChip: "Water Systems",
    about:
      "HydroLogic designs the water infrastructure that coastal cities will need as sea levels rise — storm surge management, freshwater recovery, and the sensor networks that tie them together. You will lead system architecture across municipal deployments, starting with the Rotterdam delta programme.",
    impactSummary:
      "Water infrastructure is climate adaptation made concrete. The systems you architect determine whether a city of two million has drinking water during a drought year.",
    impactStats: [
      { value: "2M", label: "Residents Served" },
      { value: "35%", label: "Freshwater Recovery" },
      { value: "9", label: "Municipal Deployments" },
    ],
    responsibilities: [
      "Own end-to-end architecture for municipal water recovery deployments.",
      "Model storm surge and drought scenarios against proposed system designs.",
      "Lead technical relationships with municipal engineering counterparts.",
      "Set standards for the distributed sensor network and its data pipeline.",
    ],
    requirements: [
      "MS in Civil, Environmental, or Water Resources Engineering.",
      "8+ years in municipal-scale water infrastructure.",
      "Experience with hydraulic modelling and scenario simulation tools.",
      "Track record leading multi-stakeholder public infrastructure projects.",
    ],
    companyFacts: [
      { label: "Industry", value: "Water Infrastructure" },
      { label: "Size", value: "200 - 500 Employees" },
      { label: "Founded", value: "2012" },
      { label: "Funding", value: "Series C ($70M)" },
    ],
    officePhoto: "/img/mission-control-room.jpg",
    officePhotoAlt:
      "A monitoring centre displaying live flow and water-level data across a delta network.",
    similarJobs: [
      {
        title: "Hydraulic Modelling Lead",
        company: "DeltaWorks",
        location: "Amsterdam",
        tag: "Hybrid",
        postedAgo: "5 days ago",
      },
      {
        title: "Environmental Data Engineer",
        company: "HydroLogic Systems",
        location: "Rotterdam",
        tag: "On-site",
        postedAgo: "1 week ago",
      },
      {
        title: "Coastal Resilience Planner",
        company: "TideLine",
        location: "Remote",
        tag: "Remote",
        postedAgo: "2 weeks ago",
      },
    ],
    similarJobsCta: "Browse all Engineering jobs",
  },

  "operations-manager-green-logistics": {
    id: "operations-manager-green-logistics",
    title: "Operations Manager (Green Logistics)",
    company: "ZeroPath",
    companyLogo: "/img/logo-zeropath.jpg",
    companyLogoAlt:
      "ZeroPath logo: an emerald stylized path forming a continuous loop.",
    location: "Chicago, IL",
    postedAgo: "Posted 2 days ago",
    chips: ["Full-time", "$115k - $150k"],
    impactChip: "Circular Economy",
    about:
      "ZeroPath runs reverse logistics for manufacturers who have committed to take their products back at end of life. You will own regional operations: the routing, the sorting facilities, and the recovery rates that decide whether a returned product becomes feedstock or landfill.",
    impactSummary:
      "A circular supply chain only works if the return leg is as well run as the outbound one. Recovery rate is the metric that makes or breaks the model.",
    impactStats: [
      { value: "88%", label: "Material Recovery" },
      { value: "1.2M", label: "Units Returned / yr" },
      { value: "40kt", label: "Landfill Diverted" },
    ],
    responsibilities: [
      "Own regional reverse-logistics operations and their recovery targets.",
      "Optimise routing and sorting-facility throughput against cost per unit.",
      "Manage carrier and processing partner relationships.",
      "Report recovery and diversion metrics to manufacturing clients.",
    ],
    requirements: [
      "5+ years in logistics or supply chain operations management.",
      "Experience owning P&L or cost-per-unit targets for a region.",
      "Comfort with routing optimisation and warehouse management systems.",
      "Track record improving throughput in a physical operation.",
    ],
    companyFacts: [
      { label: "Industry", value: "Circular Economy" },
      { label: "Size", value: "500 - 1000 Employees" },
      { label: "Founded", value: "2015" },
      { label: "Funding", value: "Series C ($95M)" },
    ],
    officePhoto: "/img/mission-control-room.jpg",
    officePhotoAlt:
      "A logistics operations centre with live routing and throughput dashboards on the wall.",
    similarJobs: [
      {
        title: "Supply Chain Analyst",
        company: "ZeroPath",
        location: "Chicago",
        tag: "Hybrid",
        postedAgo: "1 week ago",
      },
      {
        title: "Facilities Lead",
        company: "ReMat",
        location: "Detroit",
        tag: "On-site",
        postedAgo: "4 days ago",
      },
      {
        title: "Director of Policy",
        company: "Climate Policy Lab",
        location: "DC",
        tag: "Hybrid",
        postedAgo: "2 weeks ago",
      },
    ],
    similarJobsCta: "Browse all Operations jobs",
  },
};

export function getJob(id: string): Job | undefined {
  return JOBS[id];
}
