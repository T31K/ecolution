"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Container } from "./container";
import { COUNTRY_NAMES } from "./browse-filters";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Label lookup so the trigger shows "Germany", not "DE". */
const LOCATION_LABELS = (countries: string[]): Record<string, string> => ({
  any: "Anywhere",
  remote: "Remote only",
  ...Object.fromEntries(
    countries.map((country) => [country, COUNTRY_NAMES[country] ?? country]),
  ),
});

const POPULAR_SEARCHES = [
  { label: "Carbon Capture", href: "/browse?impact=carbon-capture" },
  { label: "Grid Software", href: "/browse?q=grid" },
  { label: "Engineering", href: "/browse?role=engineering" },
  { label: "Remote", href: "/browse?country=remote" },
];

export function Hero({ countries }: { countries: string[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("any");

  const search = () => {
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (location && location !== "any") params.set("country", location);
    const qs = params.toString();
    router.push(qs ? `/browse?${qs}` : "/browse");
  };

  return (
    <section className="relative overflow-hidden pt-20 pb-32">
      <Container className="relative z-10">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
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
            onSubmit={(event) => {
              event.preventDefault();
              search();
            }}
          >
            <div className="flex w-full flex-1 items-center border-b border-outline-variant/30 px-4 md:border-r md:border-b-0">
              <Search className="h-5 w-5 shrink-0 text-outline" />
              <Input
                className="border-none bg-transparent pl-2 text-body-md shadow-none focus-visible:ring-0"
                placeholder="Search for climate tech roles..."
                aria-label="Search for climate tech roles"
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            <div className="flex w-full flex-1 items-center px-4">
              <MapPin className="h-5 w-5 shrink-0 text-outline" />
              <Select
                value={location}
                onValueChange={(value) => setLocation(value as string)}
              >
                <SelectTrigger
                  aria-label="Location"
                  className="w-full border-none bg-transparent py-4 pl-2 text-body-md shadow-none focus-visible:ring-0"
                >
                  <SelectValue>
                    {(value) => LOCATION_LABELS(countries)[value as string]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="any">Anywhere</SelectItem>
                  <SelectItem value="remote">Remote only</SelectItem>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {COUNTRY_NAMES[country] ?? country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              type="submit"
              variant="brand"
              size="pill-lg"
              className="w-full rounded-lg md:w-auto"
            >
              Search Jobs
            </Button>
          </form>

          <div className="mt-stack-lg flex flex-wrap items-center justify-center gap-3">
            <span className="text-label-sm tracking-wider text-on-surface-variant uppercase">
              Popular:
            </span>
            {POPULAR_SEARCHES.map((term) => (
              <a
                key={term.label}
                href={term.href}
                className="rounded-full bg-tertiary-fixed px-4 py-1 text-label-sm text-on-tertiary-fixed transition-colors hover:bg-secondary-container"
              >
                {term.label}
              </a>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
