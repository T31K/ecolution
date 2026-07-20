"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { Menu, X } from "lucide-react";

const NAV_LINKS = [
  { label: "Browse Jobs", href: "/browse" },
  { label: "Companies", href: "#" },
  { label: "Impact", href: "#" },
  { label: "Resources", href: "#" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-surface shadow-card">
      <Container className="flex items-center justify-between py-4">
        <div className="flex items-center gap-12">
          <Link
            className="font-display text-headline-md font-bold text-secondary"
            href="/"
          >
            Ecolution
          </Link>
          <div className="hidden items-center gap-stack-lg md:flex">
            {NAV_LINKS.map((link) => {
              const current = link.href !== "#" && pathname.startsWith(link.href);
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  aria-current={current ? "page" : undefined}
                  className={
                    current
                      ? "border-b-2 border-secondary pb-1 text-body-md font-bold text-secondary"
                      : "text-body-md font-medium text-on-surface-variant transition-colors duration-200 hover:text-secondary"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-stack-md">
          <Link
            href="/auth"
            className="hidden px-4 py-2 text-body-md font-medium text-on-surface-variant transition-colors hover:text-secondary lg:block"
          >
            Sign In
          </Link>
          <button className="rounded-full bg-secondary px-6 py-2.5 text-label-md text-on-secondary transition-transform active:scale-95">
            Post a Job
          </button>
          <button
            className="text-secondary md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </Container>

      {menuOpen && (
        <Container className="flex flex-col gap-stack-md border-t border-outline-variant/30 py-stack-md md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-body-md font-medium text-on-surface-variant hover:text-secondary"
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/auth"
            className="text-body-md font-medium text-on-surface-variant hover:text-secondary"
            onClick={() => setMenuOpen(false)}
          >
            Sign In
          </Link>
        </Container>
      )}
    </header>
  );
}
