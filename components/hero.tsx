"use client";

import { Container } from "./container";
import { MapPin, Search } from "lucide-react";

const POPULAR_SEARCHES = [
  "Carbon Capture",
  "Nuclear Fusion",
  "EV Infrastructure",
  "Grid Software",
];

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <Container className="relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary-container/30 px-4 py-1.5">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-secondary" />
            <span className="text-label-md text-secondary">
              1,240 active climate roles posted this week
            </span>
          </div>

          <h1 className="mb-6 font-display text-display-mobile leading-tight tracking-tight text-primary md:text-display">
            Solve the planet&rsquo;s hardest problems.
            <span className="block text-secondary underline decoration-secondary-container/50 decoration-8 underline-offset-4">
              Work in climate tech.
            </span>
          </h1>

          <p className="mb-stack-lg max-w-2xl text-body-lg text-on-surface-variant">
            Connecting engineers, designers, and scientists with high-impact
            startups building carbon removal, renewable energy, and sustainable
            infrastructure.
          </p>

          <form
            className="glass-card flex w-full max-w-3xl flex-col items-center gap-2 rounded-xl border border-outline-variant/30 p-2 shadow-raised transition-all focus-within:border-secondary focus-within:shadow-[0_20px_60px_rgba(0,108,73,0.2)] md:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="flex w-full flex-1 items-center border-b border-outline-variant/30 px-4 md:border-b-0 md:border-r">
              <Search className="h-5 w-5 shrink-0 text-outline" />
              <input
                className="w-full border-none bg-transparent py-4 pl-2 text-body-md focus:outline-none"
                placeholder="Search for climate tech roles..."
                aria-label="Search for climate tech roles"
                type="text"
              />
            </div>
            <div className="flex w-full flex-1 items-center px-4">
              <MapPin className="h-5 w-5 shrink-0 text-outline" />
              <input
                className="w-full border-none bg-transparent py-4 pl-2 text-body-md focus:outline-none"
                placeholder="Remote or City"
                aria-label="Location"
                type="text"
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-secondary px-8 py-4 text-label-md text-on-secondary transition-all hover:shadow-lg hover:shadow-secondary/20 active:scale-95 md:w-auto"
            >
              Search Jobs
            </button>
          </form>

          <div className="mt-stack-lg flex flex-wrap items-center justify-center gap-3">
            <span className="text-label-sm uppercase tracking-wider text-on-surface-variant">
              Popular:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <a
                key={term}
                href="#"
                className="rounded-full bg-tertiary-fixed px-4 py-1 text-label-sm text-on-tertiary-fixed transition-colors hover:bg-secondary-container"
              >
                {term}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
