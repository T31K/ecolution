import { Container } from "./container";
import { FaLinkedinIn, FaXTwitter } from "react-icons/fa6";

const FOOTER_LINKS = [
  "About Us",
  "Privacy Policy",
  "Terms of Service",
  "Climate Commitment",
  "Contact",
];

export function SiteFooter() {
  return (
    <footer className="mt-stack-lg w-full border-t border-outline-variant bg-surface-container-low">
      <Container className="flex flex-col items-center justify-between gap-stack-md py-stack-lg md:flex-row">
        <div className="flex flex-col items-center gap-2 md:items-start">
          <a className="font-display text-body-lg font-bold text-secondary" href="#">
            Ecolution
          </a>
          <p className="max-w-xs text-center text-body-sm text-on-surface-variant md:text-left">
            © 2024 Ecolution. Engineering a sustainable future.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-stack-md">
          {FOOTER_LINKS.map((label) => (
            <a
              key={label}
              href="#"
              className="text-body-sm text-on-surface-variant underline transition-all hover:text-secondary"
            >
              {label}
            </a>
          ))}
        </div>

        <div className="flex gap-4">
          <a
            href="#"
            aria-label="Ecolution on X"
            className="text-on-surface-variant transition-colors hover:text-secondary"
          >
            <FaXTwitter className="h-5 w-5" />
          </a>
          <a
            href="#"
            aria-label="Ecolution on LinkedIn"
            className="text-on-surface-variant transition-colors hover:text-secondary"
          >
            <FaLinkedinIn className="h-5 w-5" />
          </a>
        </div>
      </Container>
    </footer>
  );
}
