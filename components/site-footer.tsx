import Image from "next/image";
import Link from "next/link";
import { Container } from "./container";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const FOOTER_LINKS = [
  { label: "About Us", href: "/legal/about" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Climate Commitment", href: "/legal/climate-commitment" },
  { label: "Contact", href: "/legal/contact" },
];

export function SiteFooter() {
  return (
    <footer className="mt-stack-lg w-full border-t border-outline-variant bg-surface-container-low">
      <Container className="flex flex-col items-center justify-between gap-stack-md py-stack-lg md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <Link className="flex items-center" href="/" aria-label="Sustainability Manager Jobs home">
            <Image src="/img/logo-wordmark.png" alt="Sustainability Manager Jobs" width={1600} height={322} className="h-7 w-auto" />
          </Link>
          <p className="max-w-xs text-center text-body-sm text-on-surface-variant md:text-left">
            © 2024 Sustainability Manager Jobs. Engineering a sustainable future.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-stack-md">
          {FOOTER_LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-body-sm text-on-surface-variant underline transition-all hover:text-secondary"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex gap-4">
          <span
            aria-label="Sustainability Manager Jobs on X (not connected in this demo)"
            title="Not connected in this demo"
            className="text-on-surface-variant/50"
          >
            <FaXTwitter className="h-5 w-5" />
          </span>
          <span
            aria-label="Sustainability Manager Jobs on LinkedIn (not connected in this demo)"
            title="Not connected in this demo"
            className="text-on-surface-variant/50"
          >
            <FaLinkedinIn className="h-5 w-5" />
          </span>
        </div>
      </Container>
    </footer>
  );
}
