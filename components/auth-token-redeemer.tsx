"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { confirmMagicLink, confirmVerification } from "@/lib/api";
import { isAlreadyUsed, tokenErrorMessage } from "@/lib/auth-errors";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

type Mode = "verify" | "magic";

const CONFIRM = { verify: confirmVerification, magic: confirmMagicLink };

const SUCCESS = {
  verify: {
    title: "Email confirmed",
    blurb: "Thanks — your address is verified and your account is ready to go.",
  },
  magic: {
    title: "You're signed in",
    blurb: "Taking you to your dashboard…",
  },
} as const;

/**
 * Redeems a one-click link on mount. Both flows return a full session, so a
 * successful redemption replaces whatever the client had stored — which also
 * clears a stale emailVerified: false left behind by another tab.
 */
export function AuthTokenRedeemer({ mode }: { mode: Mode }) {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { signIn } = useSession();

  const [state, setState] = useState<"working" | "done" | "failed">("working");
  const [error, setError] = useState<string | null>(null);
  const [spent, setSpent] = useState(false);

  // The token is single-use, so this must fire exactly once. Without the guard,
  // React's development double-invoke redeems it, then reports the second
  // attempt as token_used — a failure screen after a successful redemption.
  const redeemed = useRef(false);

  useEffect(() => {
    // A missing token is knowable at render time and handled below, so the
    // effect never has to report it.
    if (!token || redeemed.current) return;
    redeemed.current = true;

    let active = true;
    CONFIRM[mode](token)
      .then((result) => {
        if (!active) return;
        signIn(result);
        setState("done");
        if (mode === "magic") {
          router.replace(result.user.role === "poster" ? "/employer" : "/account");
        }
      })
      .catch((caught: unknown) => {
        if (!active) return;
        setSpent(isAlreadyUsed(caught));
        setError(tokenErrorMessage(caught));
        setState("failed");
      });

    return () => {
      active = false;
    };
  }, [mode, token, signIn, router]);

  const failure = !token
    ? "This link is missing its token. Try copying the full link from your email."
    : error;

  if (!token || state === "failed") {
    return (
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-lg">
        <XCircle className="mb-4 h-8 w-8 text-error" />
        <h2 className="mb-2 text-title-lg text-on-surface">
          {spent ? "This link is already used" : "That link didn't work"}
        </h2>
        <p role="alert" className="mb-stack-md text-body-md text-on-surface-variant">
          {failure}
        </p>
        {/* A spent link usually means it already worked, so sign-in is the
            useful next step. Anything else needs a fresh link. */}
        <Link
          href={spent || mode === "verify" ? "/auth" : "/auth/forgot"}
          className={cn(buttonVariants({ variant: "brand", size: "pill-lg" }), "w-full")}
        >
          {spent || mode === "verify" ? "Go to sign in" : "Request a new link"}
        </Link>
      </div>
    );
  }

  if (state === "working") {
    return (
      <div className="flex items-center gap-3 text-on-surface-variant">
        <Loader2 className="h-5 w-5 animate-spin" />
        <span className="text-body-md">
          {mode === "verify" ? "Confirming your email…" : "Signing you in…"}
        </span>
      </div>
    );
  }

  if (state === "done") {
    return (
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-lg">
        <CheckCircle2 className="mb-4 h-8 w-8 text-secondary" />
        <h2 className="mb-2 text-title-lg text-on-surface">{SUCCESS[mode].title}</h2>
        <p className="mb-stack-md text-body-md text-on-surface-variant">
          {SUCCESS[mode].blurb}
        </p>
        {mode === "verify" && (
          <Link
            href="/browse"
            className={cn(buttonVariants({ variant: "brand", size: "pill-lg" }), "w-full")}
          >
            Browse climate roles
          </Link>
        )}
      </div>
    );
  }

  // Magic mode redirects on success, so this only shows for a beat.
  return (
    <div className="flex items-center gap-3 text-on-surface-variant">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-body-md">Taking you to your dashboard…</span>
    </div>
  );
}
