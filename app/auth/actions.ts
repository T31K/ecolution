"use server";

import { verifyCredentials, type Session } from "@/lib/auth";
import { getSeed } from "@/lib/seed";

export type SignInResult =
  | { ok: true; session: Session }
  | { ok: false; error: string };

/**
 * Runs on the server so the seed — and every account's password — stays out
 * of the client bundle. The client persists the returned session itself.
 */
export async function signIn(
  email: string,
  password: string,
): Promise<SignInResult> {
  if (!email.trim() || !password) {
    return { ok: false, error: "Enter an email address and password." };
  }

  const session = verifyCredentials(getSeed(), email, password);
  if (!session) {
    return { ok: false, error: "No account matches those details." };
  }

  return { ok: true, session };
}
