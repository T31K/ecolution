import { Suspense } from "react";
import type { Metadata } from "next";
import { Loader2 } from "lucide-react";
import { AuthShell } from "@/components/auth-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";

export const metadata: Metadata = {
  title: "Choose a New Password | Sustainability Manager Jobs",
  description: "Set a new password for your Sustainability Manager Jobs account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Choose a New Password"
      blurb="Pick something you haven't used elsewhere. You'll be signed in straight after."
    >
      {/* useSearchParams reads the token, so the form needs a Suspense
          boundary or the whole route opts out of static rendering. */}
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-on-surface-variant">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-body-md">Loading…</span>
          </div>
        }
      >
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}
