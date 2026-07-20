"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Loader2, Mail } from "lucide-react";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/app/auth/actions";
import { DEMO_ACCOUNTS } from "@/lib/auth";
import { setSession } from "@/lib/overlay";
import { useOverlay } from "@/lib/store";

const PROVIDERS = [
  { label: "Google", icon: FaGoogle },
  { label: "Apple", icon: FaApple },
  { label: "GitHub", icon: FaGithub },
];

const ACCOUNT_TYPES = [
  {
    id: "seeker",
    label: "Job seeker",
    icon: Briefcase,
    blurb: "Find roles at companies working on climate.",
    destination: "/account",
  },
  {
    id: "employer",
    label: "Employer",
    icon: Building2,
    blurb: "Post roles and reach purpose-driven talent.",
    destination: "/employer",
  },
] as const;

type AccountType = (typeof ACCOUNT_TYPES)[number]["id"];

export function AuthForm() {
  const router = useRouter();
  const { update } = useOverlay();
  const [accountType, setAccountType] = useState<AccountType>("seeker");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const active = ACCOUNT_TYPES.find((type) => type.id === accountType)!;

  const attempt = (nextEmail: string, nextPassword: string) => {
    setError(null);
    startTransition(async () => {
      const result = await signIn(nextEmail, nextPassword);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      update((current) => setSession(current, result.session));
      router.push(result.session.role === "poster" ? "/employer" : "/account");
    });
  };

  const signInAsDemo = (type: AccountType) => {
    const account =
      type === "employer" ? DEMO_ACCOUNTS.poster : DEMO_ACCOUNTS.seeker;
    setAccountType(type);
    setEmail(account.email);
    setPassword(account.password);
    attempt(account.email, account.password);
  };

  return (
    <>
      <fieldset className="mb-stack-lg" disabled={pending}>
        <legend className="mb-3 text-label-md text-on-surface-variant">
          I&rsquo;m here to
        </legend>
        <div
          role="radiogroup"
          aria-label="Account type"
          className="grid grid-cols-2 gap-2 rounded-full bg-surface-container p-1"
        >
          {ACCOUNT_TYPES.map((type) => {
            const selected = type.id === accountType;
            return (
              <Button
                key={type.id}
                type="button"
                role="radio"
                aria-checked={selected}
                variant={selected ? "brand" : "ghost"}
                size="pill"
                onClick={() => setAccountType(type.id)}
                className="text-body-md font-semibold"
              >
                <type.icon className="h-5 w-5" />
                {type.label}
              </Button>
            );
          })}
        </div>
        <p className="mt-2 text-label-sm text-on-surface-variant">
          {active.blurb}
        </p>
      </fieldset>

      {/* Demo shortcut: the client should never have to type credentials. */}
      <div className="mb-stack-lg rounded-xl border border-secondary/20 bg-secondary/5 p-4">
        <p className="mb-3 text-label-sm font-semibold text-secondary">
          Demo accounts
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            type="button"
            variant="brand"
            size="pill"
            disabled={pending}
            onClick={() => signInAsDemo("seeker")}
            className="flex-1"
          >
            Sign in as job seeker
          </Button>
          <Button
            type="button"
            variant="brandOutline"
            size="pill"
            disabled={pending}
            onClick={() => signInAsDemo("employer")}
            className="flex-1"
          >
            Sign in as employer
          </Button>
        </div>
      </div>

      <div className="mb-stack-lg space-y-stack-sm">
        {PROVIDERS.map((provider) => (
          <Button
            key={provider.label}
            type="button"
            variant="outline"
            size="pill-lg"
            disabled={pending}
            title="Social sign-in is not wired up in this demo"
            className="w-full rounded-full"
          >
            <provider.icon className="h-5 w-5" />
            Continue with {provider.label}
          </Button>
        ))}
      </div>

      <div className="mb-stack-lg flex items-center">
        <div className="grow border-t border-outline-variant" />
        <span className="mx-4 shrink-0 text-label-sm text-on-surface-variant">
          OR
        </span>
        <div className="grow border-t border-outline-variant" />
      </div>

      <form
        className="space-y-stack-md"
        onSubmit={(event) => {
          event.preventDefault();
          attempt(email, password);
        }}
      >
        <div>
          <Label htmlFor="email" className="mb-2 text-label-md">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <Input
              id="email"
              name="email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={
                accountType === "employer"
                  ? "you@company.com"
                  : "name@example.com"
              }
              className="h-14 bg-white pl-12 text-body-lg"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="password" className="mb-2 text-label-md">
            Password
          </Label>
          <Input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            className="h-14 bg-white text-body-lg"
          />
        </div>

        {error && (
          <p role="alert" className="text-body-sm font-semibold text-error">
            {error}
          </p>
        )}

        <Button
          type="submit"
          variant="brand"
          size="pill-lg"
          disabled={pending}
          className="w-full"
        >
          {pending && <Loader2 className="h-5 w-5 animate-spin" />}
          {pending ? "Signing in…" : `Continue as ${active.label.toLowerCase()}`}
        </Button>
      </form>
    </>
  );
}
