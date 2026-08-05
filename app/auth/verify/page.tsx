import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { AuthTokenRedeemer } from "@/components/auth-token-redeemer";

export const metadata: Metadata = {
  title: "Confirm Your Email | Sustainability Manager Jobs",
  description: "Confirm your email address to finish setting up your account.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Confirming Your Email"
      blurb="One moment while we check your link."
    >
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-body-md">Loading…</span>
          </div>
        }
      >
        <AuthTokenRedeemer mode="verify" />
      </Suspense>
    </AuthShell>
  );
}
