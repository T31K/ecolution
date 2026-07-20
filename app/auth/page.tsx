import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In or Join | Ecolution",
  description: "Access the world's most impactful climate tech network.",
};

export default function AuthPage() {
  return (
    // The site header is deliberately suppressed on this transactional page —
    // brand identity is carried by the wordmark inside the card.
    <main className="flex min-h-svh flex-col items-center justify-center bg-surface-container-low p-4 md:p-8">
      <div className="grid w-full max-w-7xl overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container-lowest shadow-raised md:min-h-[920px] md:grid-cols-2">
        <div className="relative min-h-[320px] md:min-h-full">
          <Image
            src="/img/auth-wind-farm.jpg"
            alt="A receding row of white wind turbines on a desert ridge, mountains behind them under a clear blue sky."
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
          {/* The photo is bright, so the scrim is heavier than a dusk shot
              would need — white type has to stay legible over open sky. */}
          <div className="absolute inset-0 bg-gradient-to-t from-primary-container via-primary-container/30 to-transparent" />

          <figure className="absolute right-6 bottom-6 left-6 rounded-xl border border-white/15 bg-white/10 p-stack-md backdrop-blur-md">
            <blockquote className="mb-stack-md text-body-md leading-relaxed text-white italic">
              &ldquo;Ecolution hasn&rsquo;t just helped us find engineers;
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
            <p className="mb-4 font-display text-headline-md font-bold text-secondary">
              Ecolution
            </p>
            <h1 className="mb-3 font-display text-display-mobile text-on-surface">
              Sign In or Join Now
            </h1>
            <p className="text-body-lg text-on-surface-variant">
              Access the world&rsquo;s most impactful climate tech network.
            </p>
          </div>

          <AuthForm />

          <div className="mt-stack-lg flex justify-center">
            <div className="flex items-center gap-3 rounded-full bg-secondary/5 px-4 py-2">
              <span className="flex h-2 w-2 animate-pulse rounded-full bg-secondary" />
              <span className="text-label-sm text-secondary">
                2,431 Climate Impact roles open today
              </span>
            </div>
          </div>
        </div>
      </div>

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
    </main>
  );
}
