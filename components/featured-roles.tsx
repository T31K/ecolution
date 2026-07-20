import Image from "next/image";
import { Container } from "./container";
import { ArrowRight, ChevronRight } from "lucide-react";

const SIDE_ROLES = [
  {
    title: "Carbon Analyst",
    company: "Watershed",
    logo: "/img/logo-watershed.jpg",
    logoAlt:
      "Circular renewable-energy icon in a mint and forest green gradient.",
    tags: ["New York", "Hybrid"],
  },
  {
    title: "Mechanical Engineer",
    company: "H2 Energy",
    logo: "/img/logo-h2energy.jpg",
    logoAlt: "Stylized letter H for hydrogen in crisp emerald green.",
    tags: ["Berlin", "On-site"],
  },
  {
    title: "Frontend Engineer",
    company: "GridWorks",
    logo: "/img/logo-gridworks.jpg",
    logoAlt:
      "Smart-grid logo of interconnected dots in slate gray and forest green.",
    tags: ["Remote", "React"],
  },
  {
    title: "Director of Policy",
    company: "Climate Policy Lab",
    logo: "/img/logo-policylab.jpg",
    logoAlt: "Botanical line-art mark for a bio-materials company in deep green.",
    tags: ["DC", "Hybrid"],
  },
];

export function FeaturedRoles() {
  return (
    <section className="bg-surface py-stack-lg">
      <Container>
        <div className="mb-stack-lg flex items-end justify-between">
          <div>
            <h2 className="mb-2 font-display text-headline-lg text-primary">
              Featured Impact Roles
            </h2>
            <p className="text-body-md text-on-surface-variant">
              High-priority positions with direct climate impact.
            </p>
          </div>
          <a
            className="hidden items-center gap-1 font-bold text-secondary hover:underline md:flex"
            href="#"
          >
            View all 3,500+ jobs
            <ArrowRight className="h-5 w-5" />
          </a>
        </div>

        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          {/* Hero role — spans two thirds of the bento grid. */}
          <article className="group relative cursor-pointer overflow-hidden rounded-xl border border-transparent bg-surface-container-lowest p-stack-lg shadow-card transition-all hover:border-secondary md:col-span-8">
            <div className="mb-6 flex items-start justify-between">
              <div className="flex gap-stack-md">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container">
                  <Image
                    src="/img/logo-terrabase.jpg"
                    alt="Terrabase Solar logo: a geometric leaf in emerald green."
                    width={48}
                    height={48}
                    className="h-12 w-12 object-contain"
                  />
                </div>
                <div>
                  <h3 className="mb-1 font-display text-headline-md text-secondary">
                    Lead Software Architect
                  </h3>
                  <p className="text-body-md font-semibold text-on-surface-variant">
                    Terrabase Solar
                  </p>
                </div>
              </div>
              <span className="climate-pulse rounded-full bg-secondary-container/50 px-3 py-1 text-label-sm text-secondary">
                Climate Impact
              </span>
            </div>

            <p className="mb-stack-lg max-w-xl text-body-md text-on-surface-variant">
              Join us in building the next generation of utility-scale solar
              farms through advanced robotics and grid optimization software.
            </p>

            <div className="mb-stack-md flex flex-wrap gap-2">
              {["Remote", "$160k - $220k", "Full-time"].map((tag) => (
                <span
                  key={tag}
                  className="rounded bg-surface-container px-3 py-1 text-xs font-semibold text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-outline-variant/20 pt-6">
              <span className="text-label-sm text-on-surface-variant">
                Posted 2h ago
              </span>
              <button className="rounded-full bg-primary px-6 py-2 text-label-md text-on-primary transition-colors group-hover:bg-secondary">
                Apply Now
              </button>
            </div>
          </article>

          {SIDE_ROLES.map((role) => (
            <article
              key={role.title}
              className="group cursor-pointer rounded-xl border border-transparent bg-surface-container-lowest p-stack-md shadow-card transition-all hover:border-secondary md:col-span-4"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center overflow-hidden rounded-lg border border-outline-variant/30 bg-surface-container">
                <Image
                  src={role.logo}
                  alt={`${role.company} logo: ${role.logoAlt}`}
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </div>
              <h3 className="mb-1 text-body-lg font-bold text-secondary">
                {role.title}
              </h3>
              <p className="mb-4 text-body-sm text-on-surface-variant">
                {role.company}
              </p>
              <div className="mb-stack-md flex flex-wrap gap-2">
                {role.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded bg-surface-container px-2 py-0.5 text-[10px] font-bold uppercase text-on-surface-variant"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <a
                className="flex items-center gap-1 text-label-md text-secondary transition-transform group-hover:translate-x-1"
                href="#"
              >
                Details
                <ChevronRight className="h-4 w-4" />
              </a>
            </article>
          ))}
        </div>

        <div className="mt-stack-lg flex justify-center md:hidden">
          <button className="rounded-full bg-surface-container-high px-8 py-3 text-label-md text-secondary">
            View all jobs
          </button>
        </div>
      </Container>
    </section>
  );
}
