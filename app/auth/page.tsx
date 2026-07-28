import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "Sign In or Join | Decarbon Jobs",
  description: "Access the world's most impactful climate tech network.",
};

export default function AuthPage() {
  return (
    <AuthShell
      title="Sign In or Join Now"
      blurb="Access the world's most impactful climate tech network."
      showTerms
      footer={
        <div className="flex justify-center">
          <div className="flex items-center gap-3 rounded-full bg-secondary/5 px-4 py-2">
            <span className="flex h-2 w-2 animate-pulse rounded-full bg-secondary" />
            <span className="text-label-sm text-secondary">
              2,431 Climate Impact roles open today
            </span>
          </div>
        </div>
      }
    >
      <AuthForm />
    </AuthShell>
  );
}
