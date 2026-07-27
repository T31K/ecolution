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
            The Best Climate Jobs. Delivered Twice a Week.
          </h2>
          <p className="mx-auto mb-10 max-w-xl text-body-lg text-on-primary-container">
            Skip the search. We hand-pick the best climate jobs and deliver
            them to your inbox twice a week.
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
        </div>
      </div>
    </Container>
  );
}
