import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";
import { getSeed } from "@/lib/seed";

export function Companies() {
  const seed = getSeed();

  // Ranked by how many roles each is hiring for, so the row reflects the
  // board rather than a hardcoded list that can drift from the data.
  const counts = new Map<string, number>();
  for (const job of seed.jobs) {
    counts.set(job.posterId, (counts.get(job.posterId) ?? 0) + 1);
  }

  const companies = seed.posters
    .map((poster) => ({
      id: poster.id,
      name: poster.company,
      logo: poster.companyLogo,
      openRoles: counts.get(poster.id) ?? 0,
    }))
    .sort((a, b) => b.openRoles - a.openRoles)
    .slice(0, 6);

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
          {companies.map((company) => (
            <Link
              key={company.id}
              href={`/companies/${company.id}`}
              className="group flex flex-col items-center justify-center rounded-xl border border-outline-variant/10 bg-surface-container-lowest p-6 text-center transition-all hover:border-secondary/40 hover:shadow-md"
            >
              <Image
                src={company.logo}
                alt={`${company.name} logo`}
                width={48}
                height={48}
                className="mb-4 h-12 w-12 object-contain grayscale transition-all group-hover:grayscale-0"
              />
              <span className="text-label-sm font-bold text-on-surface-variant group-hover:text-secondary">
                {company.name}
              </span>
              <span className="mt-1 text-label-sm text-outline">
                {company.openRoles} open
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/browse"
            className="inline-block rounded-full bg-secondary px-8 py-3 text-label-md text-on-secondary transition-all hover:shadow-lg"
          >
            Explore All Companies
          </Link>
        </div>
      </Container>
    </section>
  );
}
