"use client";

import { useState, useTransition } from "react";
import { MailWarning, X } from "lucide-react";
import { me, sendVerification } from "@/lib/api";
import { useSession } from "@/lib/session";

/**
 * Nudges an unverified account without blocking it. Verification is not
 * currently enforced (see DECARBON_REQUIRE_VERIFIED on the API), so this is a
 * prompt rather than a wall — it must stay dismissible.
 */
export function UnverifiedBanner() {
  const { session, signIn } = useSession();
  const [dismissed, setDismissed] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  // Sessions stored before emailVerified existed read undefined here. Treating
  // that as unverified is the safe default, and the resend below refreshes the
  // stored user from the API, which repairs the shape.
  if (!session || session.user.emailVerified || dismissed) return null;

  const resend = () => {
    setError(null);
    startTransition(async () => {
      try {
        await sendVerification(session.token);
        setSent(true);
        // Pull the user back down in case they verified in another tab: that
        // would make this banner vanish rather than linger incorrectly.
        const { user } = await me(session.token);
        signIn({ token: session.token, user });
      } catch {
        setError("Couldn't send just now. Try again in a moment.");
      }
    });
  };

  return (
    <div
      role="status"
      className="flex flex-wrap items-center gap-3 border-b border-outline-variant/40 bg-secondary-container/40 px-4 py-3 text-on-surface sm:px-6"
    >
      <MailWarning className="h-5 w-5 shrink-0 text-secondary" />
      <p className="flex-1 text-body-sm">
        {sent ? (
          <>
            Verification email sent to{" "}
            <span className="font-semibold">{session.user.email}</span>. Check your inbox.
          </>
        ) : (
          <>
            Confirm your email address so we can reach you about applications.
          </>
        )}
      </p>

      {error && <span className="text-body-sm font-semibold text-error">{error}</span>}

      {!sent && (
        <button
          type="button"
          onClick={resend}
          disabled={pending}
          className="text-label-md font-semibold text-secondary underline-offset-4 hover:underline disabled:opacity-60"
        >
          {pending ? "Sending…" : "Resend email"}
        </button>
      )}

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss"
        className="rounded-full p-1 text-on-surface-variant transition-colors hover:bg-surface-container hover:text-on-surface"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
