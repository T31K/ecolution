"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPassword } from "@/lib/api";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    startTransition(async () => {
      try {
        await forgotPassword(email);
        // The API answers identically whether or not the address has an
        // account, and so must this screen — anything else would let someone
        // discover who has signed up.
        setSent(true);
      } catch {
        // Only a transport failure can land here; a missing account still
        // resolves. So this really is "try again", not "no such account".
        setError("We couldn't reach the server. Check your connection and try again.");
      }
    });
  };

  if (sent) {
    return (
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-lg">
        <MailCheck className="mb-4 h-8 w-8 text-secondary" />
        <h2 className="mb-2 text-title-lg text-on-surface">Check your inbox</h2>
        <p className="mb-stack-md text-body-md text-on-surface-variant">
          If an account exists for <span className="font-semibold">{email}</span>, we&rsquo;ve
          sent a link to reset your password. It works for the next 30 minutes.
        </p>
        <p className="text-body-sm text-on-surface-variant">
          Nothing arrived? Check spam, or{" "}
          <button
            type="button"
            onClick={() => setSent(false)}
            className="font-semibold text-secondary underline-offset-4 hover:underline"
          >
            try a different address
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        submit();
      }}
    >
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoFocus
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            className="h-11 bg-white text-body-md"
          />
          <FieldDescription>
            We&rsquo;ll email you a link to choose a new password.
          </FieldDescription>
        </Field>

        {error && (
          <p role="alert" className="text-body-sm font-semibold text-error">
            {error}
          </p>
        )}

        <Field>
          <Button
            type="submit"
            variant="brand"
            size="pill-lg"
            disabled={pending}
            className="w-full"
          >
            {pending && <Loader2 className="h-5 w-5 animate-spin" />}
            {pending ? "Sending…" : "Send reset link"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          Remembered it?{" "}
          <Link
            href="/auth"
            className="font-semibold text-secondary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
