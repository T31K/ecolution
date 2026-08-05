import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

/**
 * Placeholder pages for the footer links. They exist so nothing in the demo
 * is a dead click; the copy states plainly that they are not real policies.
 */
const PAGES: Record<string, { title: string; body: string[] }> = {
  about: {
    title: "About Sustainability Manager Jobs",
    body: [
      "Sustainability Manager Jobs connects engineers, scientists, designers and operators with companies working directly on climate outcomes — carbon removal, renewable generation, grid software, water infrastructure and circular supply chains.",
      "We list roles where the work itself moves a physical number: tonnes abated, megawatts delivered, litres recovered.",
    ],
  },
  privacy: {
    title: "Privacy Policy",
    body: [
      "This is a demonstration build. It stores nothing on a server: any account you sign into, application you submit, or listing you post is held only in your own browser's local storage, and clearing it removes everything.",
      "No analytics, tracking pixels or third-party scripts run on this site.",
    ],
  },
  terms: {
    title: "Terms of Service",
    body: [
      "This is a demonstration build provided for evaluation. The listings, companies, salaries and applicant profiles shown are generated sample data and do not describe real vacancies.",
      "Nothing here constitutes an offer of employment or a representation about any named company.",
    ],
  },
  "climate-commitment": {
    title: "Climate Commitment",
    body: [
      "Sustainability Manager Jobs exists to shorten the distance between skilled people and the organisations that need them to hit climate targets.",
      "We measure ourselves on placements into roles with a direct emissions or resilience mandate, not on total listings or traffic.",
    ],
  },
  contact: {
    title: "Contact",
    body: [
      "This is a demonstration build, so the contact form is not connected to anything.",
      "In production this page would carry a support address, a press contact, and a route for employers to reach the partnerships team.",
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(PAGES).map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = PAGES[slug];
  return { title: page ? `${page.title} | Sustainability Manager Jobs` : "Not found | Sustainability Manager Jobs" };
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = PAGES[slug];

  if (!page) notFound();

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-stack-lg">
          <Link
            href="/"
            className="mb-stack-lg inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-secondary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
            <span className="text-label-md">Back home</span>
          </Link>

          <article className="max-w-2xl">
            <h1 className="mb-stack-md font-display text-headline-lg text-primary">
              {page.title}
            </h1>
            {page.body.map((paragraph) => (
              <p
                key={paragraph.slice(0, 32)}
                className="mb-stack-md text-body-lg leading-relaxed text-on-surface-variant"
              >
                {paragraph}
              </p>
            ))}

            <p className="mt-stack-lg rounded-xl border border-outline-variant/30 bg-surface-container-low p-4 text-body-sm text-on-surface-variant">
              This page is placeholder content in a demonstration build.
            </p>
          </article>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
