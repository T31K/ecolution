"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Loader2, Mail } from "lucide-react";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa6";
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
              <button
                key={type.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setAccountType(type.id)}
                className={
                  selected
                    ? "flex items-center justify-center gap-2 rounded-full bg-secondary px-4 py-3.5 text-body-md font-semibold text-on-secondary shadow-sm transition-all"
                    : "flex items-center justify-center gap-2 rounded-full px-4 py-3.5 text-body-md font-semibold text-on-surface-variant transition-all hover:text-secondary"
                }
              >
                <type.icon className="h-5 w-5" />
                {type.label}
              </button>
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
          <button
            type="button"
            disabled={pending}
            onClick={() => signInAsDemo("seeker")}
            className="flex-1 rounded-full bg-secondary px-4 py-3 text-label-md text-on-secondary transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
          >
            Sign in as job seeker
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => signInAsDemo("employer")}
            className="flex-1 rounded-full border border-secondary px-4 py-3 text-label-md text-secondary transition-all hover:bg-secondary/10 active:scale-95 disabled:opacity-60"
          >
            Sign in as employer
          </button>
        </div>
      </div>

      <div className="mb-stack-lg space-y-stack-sm">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.label}
            type="button"
            disabled={pending}
            title="Social sign-in is not wired up in this demo"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant bg-white px-6 py-4 text-body-md font-semibold text-on-surface transition-all hover:bg-surface-container-high active:scale-95 disabled:opacity-60"
          >
            <provider.icon className="h-5 w-5" />
            Continue with {provider.label}
          </button>
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
          <label
            htmlFor="email"
            className="mb-2 block text-label-md text-on-surface-variant"
          >
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
            <input
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
              className="w-full rounded-lg border border-outline-variant bg-white py-4 pr-4 pl-12 text-body-lg transition-all outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="password"
            className="mb-2 block text-label-md text-on-surface-variant"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="password"
            className="w-full rounded-lg border border-outline-variant bg-white px-4 py-4 text-body-lg transition-all outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
          />
        </div>

        {error && (
          <p role="alert" className="text-body-sm font-semibold text-error">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-secondary py-5 text-body-md font-bold text-on-secondary shadow-sm transition-all hover:brightness-110 active:scale-95 disabled:opacity-60"
        >
          {pending && <Loader2 className="h-5 w-5 animate-spin" />}
          {pending ? "Signing in…" : `Continue as ${active.label.toLowerCase()}`}
        </button>
      </form>
    </>
  );
}
