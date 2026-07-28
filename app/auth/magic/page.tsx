import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { AuthTokenRedeemer } from "@/components/auth-token-redeemer";

export const metadata: Metadata = {
  title: "Signing You In | Decarbon Jobs",
  description: "Signing you in with your emailed link.",
};

export default function MagicLinkPage() {
  return (
    <AuthShell title="Signing You In" blurb="One moment while we check your link.">
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-body-md">Loading…</span>
          </div>
        }
      >
        <AuthTokenRedeemer mode="magic" />
      </Suspense>
    </AuthShell>
  );
}
