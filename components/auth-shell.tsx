import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
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
    <main className="flex min-h-svh flex-col items-center justify-center bg-surface-container-low p-4 md:p-8">
      <div className="grid w-full max-w-7xl overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-raised md:min-h-[920px] md:grid-cols-2">
        <div className="relative min-h-[320px] overflow-hidden md:min-h-full">
          <AuthHeroVideo />
          {/* The photo is bright, so the scrim is heavier than a dusk shot
              would need — white type has to stay legible over open sky. */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/30 to-transparent" />

          <figure className="absolute right-6 bottom-6 left-6 rounded-xl border border-white/15 bg-white/10 p-stack-md backdrop-blur-md">
            <blockquote className="mb-stack-md text-body-md leading-relaxed text-white italic">
              &ldquo;Decarbon Jobs hasn&rsquo;t just helped us find engineers;
              they&rsquo;ve helped us find visionaries who believe that our
              climate goals are solvable through innovation.&rdquo;
            </blockquote>
            <figcaption className="flex items-center gap-stack-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary-container text-label-md font-bold text-on-secondary-container">
                SJ
              </span>
              <div>
                <p className="text-label-md text-white">Sarah Jenkins</p>
                <p className="text-label-sm text-secondary-container">
                  CTO at TerraForm Dynamics
                </p>
              </div>
            </figcaption>
          </figure>
        </div>

        <div className="flex flex-col justify-center p-8 sm:p-12 lg:p-20">
          <Link
            href="/browse"
            className="mb-stack-lg inline-flex items-center gap-2 text-on-surface-variant transition-colors hover:text-secondary"
          >
            <ArrowLeft className="h-[18px] w-[18px]" />
            <span className="text-label-md">Back to jobs</span>
          </Link>

          <div className="mb-stack-lg">
            <p className="mb-4 flex items-center gap-2.5 font-display text-headline-md font-bold text-secondary">
              <Image
                src="/img/logo.png"
                alt=""
                width={36}
                height={36}
                className="h-9 w-9"
              />
              Decarbon Jobs
            </p>
            <h1 className="mb-3 font-display text-display-mobile text-on-surface">
              {title}
            </h1>
            <p className="text-body-lg text-on-surface-variant">{blurb}</p>
          </div>

          {children}

          {footer && <div className="mt-stack-lg">{footer}</div>}
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
