import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { AuthShell } from "@/components/auth-shell";

export const metadata: Metadata = {
  title: "Sign In or Join | Sustainability Manager Jobs",
  description: "Access the world's most impactful climate tech network.",
};

export default function AuthPage() {
  return (
    <AuthShell
      title="Sign In or Join Now"
      blurb="Access the world's most impactful climate tech network."
      showTerms
    >
      <AuthForm />
    </AuthShell>
  );
}
