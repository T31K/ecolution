import { ApiError } from "./api";

/**
 * Copy for a failed link redemption. The three cases need genuinely different
 * responses — an expired link is a "try again" and a used link usually means
 * the person already succeeded, so telling them "invalid" would be wrong and
 * would send them back through a flow they no longer need.
 */
const TOKEN_MESSAGES: Record<string, string> = {
  invalid_token: "This link isn't valid. It may have been mistyped or cut short by your email app.",
  token_expired: "This link has expired. Request a new one and we'll send a fresh link.",
  token_used: "This link has already been used. If you've finished, just sign in.",
};

export function tokenErrorMessage(error: unknown): string {
  if (error instanceof ApiError && TOKEN_MESSAGES[error.message]) {
    return TOKEN_MESSAGES[error.message];
  }
  if (error instanceof ApiError) return error.message;
  return "Something went wrong. Please try again.";
}

/** A used link means the account is fine — offer sign-in rather than a retry. */
export function isAlreadyUsed(error: unknown): boolean {
  return error instanceof ApiError && error.message === "token_used";
}
