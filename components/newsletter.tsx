"use client";

import { Container } from "./container";

export function Newsletter() {
  return (
    <Container className="mb-24">
      <div className="relative overflow-hidden rounded-[2rem] bg-primary-container p-stack-lg text-center md:p-24">
        <div className="relative z-10">
          <h2 className="mb-6 font-display text-display-mobile text-on-primary md:text-headline-lg">
            Stay informed on climate careers
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-body-lg text-on-primary-container">
            Get a weekly digest of high-impact roles, climate tech news, and
            career advice directly in your inbox.
          </p>
          <form
            className="mx-auto flex max-w-md flex-col gap-4 md:flex-row"
            onSubmit={(event) => event.preventDefault()}
          >
            <input
              className="flex-1 rounded-full border border-white/20 bg-white/10 px-6 py-4 text-white transition-all placeholder:text-white/50 focus:ring-2 focus:ring-secondary focus:outline-none"
              placeholder="you@climate-engineer.com"
              aria-label="Email address"
              type="email"
            />
            <button
              type="submit"
              className="rounded-full bg-secondary px-8 py-4 text-label-md font-bold text-on-secondary transition-all hover:bg-secondary-fixed hover:text-on-secondary-container active:scale-95"
            >
              Subscribe
            </button>
          </form>
          <p className="mt-6 text-body-sm text-on-primary-container/60">
            No spam. Only impact. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </Container>
  );
}
