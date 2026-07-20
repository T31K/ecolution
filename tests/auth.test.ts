import { describe, expect, it } from "vitest";
import { DEMO_ACCOUNTS, verifyCredentials } from "@/lib/auth";
import { getSeed } from "@/lib/seed";

const seed = getSeed();

describe("verifyCredentials", () => {
  it("signs in the demo seeker", () => {
    const session = verifyCredentials(
      seed,
      DEMO_ACCOUNTS.seeker.email,
      DEMO_ACCOUNTS.seeker.password,
    );
    expect(session).not.toBeNull();
    expect(session!.role).toBe("seeker");
    expect(session!.email).toBe("jobseeker@email.com");
    expect(session!.name.length).toBeGreaterThan(0);
  });

  it("signs in the demo poster", () => {
    const session = verifyCredentials(
      seed,
      DEMO_ACCOUNTS.poster.email,
      DEMO_ACCOUNTS.poster.password,
    );
    expect(session).not.toBeNull();
    expect(session!.role).toBe("poster");
    expect(session!.userId).toBe("octopus-energy");
  });

  it("signs in the seekers that have seeded applications", () => {
    for (const email of ["jobseeker1@email.com", "jobseeker2@email.com"]) {
      expect(verifyCredentials(seed, email, "password")).not.toBeNull();
    }
  });

  it("rejects a wrong password", () => {
    expect(
      verifyCredentials(seed, "jobseeker@email.com", "wrong"),
    ).toBeNull();
  });

  it("rejects an unknown email", () => {
    expect(verifyCredentials(seed, "nobody@email.com", "password")).toBeNull();
  });

  it("ignores surrounding whitespace and case in the email", () => {
    expect(
      verifyCredentials(seed, "  JobSeeker@Email.com  ", "password"),
    ).not.toBeNull();
  });

  it("does not treat an empty password as valid", () => {
    expect(verifyCredentials(seed, "jobseeker@email.com", "")).toBeNull();
  });
});
