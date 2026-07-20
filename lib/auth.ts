import type { SeedData } from "./types";

export type Session = {
  userId: string;
  role: "seeker" | "poster";
  name: string;
  email: string;
};

/**
 * Plain-text comparison against the seed. This is a PoC affordance, not
 * authentication: passwords ship in the seed and the route guard is
 * client-side. Replace entirely before any real account exists.
 *
 * Pure so it can be tested without a server or a request context.
 */
export function verifyCredentials(
  data: SeedData,
  email: string,
  password: string,
): Session | null {
  const normalised = email.trim().toLowerCase();

  const seeker = data.seekers.find(
    (candidate) => candidate.email.toLowerCase() === normalised,
  );
  if (seeker) {
    return seeker.password === password
      ? {
          userId: seeker.id,
          role: "seeker",
          name: seeker.name,
          email: seeker.email,
        }
      : null;
  }

  const poster = data.posters.find(
    (candidate) => candidate.email.toLowerCase() === normalised,
  );
  if (poster) {
    return poster.password === password
      ? {
          userId: poster.id,
          role: "poster",
          name: poster.company,
          email: poster.email,
        }
      : null;
  }

  return null;
}

export const DEMO_ACCOUNTS = {
  seeker: { email: "jobseeker@email.com", password: "password" },
  poster: { email: "jobposter@email.com", password: "password" },
} as const;
