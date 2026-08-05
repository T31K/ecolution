import Image from "next/image";
import Link from "next/link";
import { AuthHeroVideo } from "@/components/auth-hero-video";

/**
 * The split-panel chrome shared by every auth screen. Extracted when the reset,
 * verify and magic-link pages arrived — four copies of this layout would drift
 * apart, and these flows only feel like one product if they look identical.
 *
 * The site header is deliberately suppressed on these transactional pages;
 * brand identity is carried by the wordmark inside the card.
 */
export function AuthShell({
  title,
  blurb,
  children,
  footer,
  showTerms = false,
}: {
  title: string;
  blurb: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showTerms?: boolean;
}) {
  return (
    // Sized to fit a laptop viewport without scrolling: the card is capped
    // against the screen height rather than given a fixed tall min-height.
    <main className="flex min-h-svh flex-col items-center justify-center bg-surface-container-low p-4 md:p-6">
      {/* max-h is what actually guarantees this fits: the card can never grow
          past the viewport, and the form panel below scrolls inside it instead.
          The 7rem allows for the page padding and the terms line underneath. */}
      <div className="grid w-full max-w-4xl overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-raised md:min-h-[560px] md:max-h-[calc(100svh-7rem)] md:grid-cols-2">
        <div className="relative min-h-[200px] overflow-hidden md:min-h-full">
          <AuthHeroVideo />
          {/* The photo is bright, so the scrim is heavier than a dusk shot
              would need — white type has to stay legible over open sky. */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/30 to-transparent" />
        </div>

        <div className="flex flex-col justify-center overflow-y-auto p-6 sm:p-8 lg:px-10 lg:py-8">
          <div className="mb-5">
            <p className="mb-3 flex items-center gap-2 font-display text-title-lg font-bold text-secondary">
              <Image
                src="/img/logo.png"
                alt=""
                width={28}
                height={28}
                className="h-7 w-7"
              />
              Sustainability Manager Jobs
            </p>
            <h1 className="mb-2 font-display text-headline-lg text-on-surface">
              {title}
            </h1>
            {/* Sized to sit on one line in the panel rather than wrapping. */}
            <p className="text-body-sm text-on-surface-variant">{blurb}</p>
          </div>

          {children}

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </div>

      {showTerms && (
        <p className="mt-stack-md text-center text-body-sm text-on-surface-variant">
          By clicking continue, you agree to our{" "}
          <Link
            href="/legal/terms"
            className="font-semibold text-secondary hover:underline"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/legal/privacy"
            className="font-semibold text-secondary hover:underline"
          >
            Privacy Policy
          </Link>
          .
        </p>
      )}
    </main>
  );
}
