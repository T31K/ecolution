"use client";

import Image from "next/image";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./container";
import { Menu, X } from "lucide-react";
import { SessionMenu } from "./session-menu";
import { Button } from "@/components/ui/button";

const NAV_LINKS = [
  { label: "Browse Jobs", href: "/browse" },
  { label: "Remote", href: "/browse?country=remote" },
  { label: "Renewable Energy", href: "/browse?impact=renewable-energy" },
  { label: "Circular Economy", href: "/browse?impact=circular-economy" },
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-surface shadow-card">
      <Container className="relative flex items-center justify-between py-4">
        <Link
          className="flex items-center gap-2.5 font-display text-headline-md font-bold text-secondary"
          href="/"
        >
          <Image
            src="/img/logo.png"
            alt=""
            width={36}
            height={36}
            priority
            className="h-9 w-9"
          />
          Decarbon Jobs
        </Link>
        <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-stack-lg md:flex">
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

        <div className="flex items-center gap-stack-md">
          <div className="hidden lg:block">
            <SessionMenu />
          </div>
          <Link
            href="/employer"
            className="rounded-full bg-secondary px-6 py-2.5 text-label-md text-on-secondary transition-transform active:scale-95"
          >
            Post a Job
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="text-secondary md:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
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
          <SessionMenu onNavigate={() => setMenuOpen(false)} />
        </Container>
      )}
    </header>
  );
}
