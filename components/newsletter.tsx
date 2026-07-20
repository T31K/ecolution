"use client";

import { Container } from "./container";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
            <Input
              className="h-14 flex-1 rounded-full border-white/20 bg-white/10 px-6 text-white placeholder:text-white/50"
              placeholder="you@climate-engineer.com"
              aria-label="Email address"
              type="email"
            />
            <Button type="submit" variant="brand" size="pill-lg">
              Subscribe
            </Button>
          </form>
          <p className="mt-6 text-body-sm text-on-primary-container/60">
            No spam. Only impact. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </Container>
  );
}
