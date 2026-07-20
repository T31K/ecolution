import Image from "next/image";
import { Container } from "./container";

const COMPANIES = [
  {
    name: "Rivian",
    logo: "/img/co-rivian.jpg",
    logoAlt: "geometric black and white mark for an EV manufacturer",
  },
  {
    name: "Watershed",
    logo: "/img/co-watershed.jpg",
    logoAlt: "blue and green wordmark with a subtle leaf icon",
  },
  {
    name: "Helion",
    logo: "/img/co-helion.jpg",
    logoAlt: "concentric circles in emerald green and slate",
  },
  {
    name: "Solestial",
    logo: "/img/co-solestial.jpg",
    logoAlt: "clean line drawing of a satellite in forest green",
  },
  {
    name: "Veev",
    logo: "/img/co-veev.jpg",
    logoAlt: "square grid motif in deep green and light gray",
  },
  {
    name: "Sila",
    logo: "/img/co-sila.jpg",
    logoAlt: "horizontal line and dot in emerald green",
  },
];

export function Companies() {
  return (
    <section className="bg-surface-container-low py-24">
      <Container>
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-display text-headline-lg text-primary">
            Hiring Climate Tech Pioneers
          </h2>
          <p className="mx-auto max-w-2xl text-body-md text-on-surface-variant">
            These companies are leading the charge against global warming
            through radical engineering and innovative policy.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-stack-md md:grid-cols-4 lg:grid-cols-6">
          {COMPANIES.map((company) => (
            <div
              key={company.name}
              className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 text-center transition-all hover:shadow-md"
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo: ${company.logoAlt}.`}
                width={96}
                height={48}
                // CSS drives the height, so width must be explicitly auto or
                // next/image warns about a broken aspect ratio.
                style={{ width: "auto" }}
                className="mb-4 h-12 grayscale transition-all group-hover:grayscale-0"
              />
              <span className="text-label-sm font-bold text-on-surface-variant">
                {company.name}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <button className="rounded-full bg-secondary px-8 py-3 text-label-md text-on-secondary transition-all hover:shadow-lg">
            Explore All Companies
          </button>
        </div>
      </Container>
    </section>
  );
}
