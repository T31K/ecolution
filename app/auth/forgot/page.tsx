import type { Metadata } from "next";
import { AuthShell } from "@/components/auth-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export const metadata: Metadata = {
  title: "Reset Your Password | Decarbon Jobs",
  description: "We'll email you a link to choose a new password.",
};

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot Your Password?"
      blurb="Enter the email you signed up with and we'll send you a link to set a new one."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
