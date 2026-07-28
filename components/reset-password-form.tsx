"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { PasswordInput } from "@/components/password-input";
import { resetPassword } from "@/lib/api";
import { isAlreadyUsed, tokenErrorMessage } from "@/lib/auth-errors";
import { useSession } from "@/lib/session";
import { cn } from "@/lib/utils";

export function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const { signIn } = useSession();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [spent, setSpent] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = () => {
    setError(null);
    if (password !== confirm) {
      setError("Those two passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Use at least 6 characters.");
      return;
    }
    startTransition(async () => {
      try {
        // Reset returns a full session, so a successful reset also signs you
        // in — no reason to make someone type the password they just chose.
        const result = await resetPassword(token, password);
        signIn(result);
        router.push(result.user.role === "poster" ? "/employer" : "/account");
      } catch (caught) {
        setSpent(isAlreadyUsed(caught));
        setError(tokenErrorMessage(caught));
      }
    });
  };

  if (!token) {
    return (
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-lg">
        <h2 className="mb-2 text-title-lg text-on-surface">This link is incomplete</h2>
        <p className="mb-stack-md text-body-md text-on-surface-variant">
          The reset link is missing its token. Some email apps split long links across
          lines — try copying the whole thing, or request a new one.
        </p>
        <Link
          href="/auth/forgot"
          className={cn(buttonVariants({ variant: "brand", size: "pill-lg" }), "w-full")}
        >
          Request a new link
        </Link>
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
          <FieldLabel htmlFor="password">New Password</FieldLabel>
          <PasswordInput
            id="password"
            name="password"
            required
            autoFocus
            autoComplete="new-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••"
            className="h-11 bg-white text-body-md"
          />
          <FieldDescription>At least 6 characters.</FieldDescription>
        </Field>

        <Field>
          <FieldLabel htmlFor="confirm">Confirm New Password</FieldLabel>
          <PasswordInput
            id="confirm"
            name="confirm"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="••••••••"
            className="h-11 bg-white text-body-md"
          />
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
            {pending ? "Saving…" : "Save new password"}
          </Button>
        </Field>

        <FieldDescription className="text-center">
          {spent ? (
            <Link
              href="/auth"
              className="font-semibold text-secondary underline-offset-4 hover:underline"
            >
              Go to sign in
            </Link>
          ) : (
            <Link
              href="/auth/forgot"
              className="font-semibold text-secondary underline-offset-4 hover:underline"
            >
              Request a new link
            </Link>
          )}
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
