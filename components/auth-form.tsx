"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Loader2, MailCheck } from "lucide-react";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { ApiError, login, requestMagicLink, signup } from "@/lib/api";
import { useSession } from "@/lib/session";

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
    role: "seeker",
  },
  {
    id: "employer",
    label: "Employer",
    icon: Building2,
    blurb: "Post roles and reach purpose-driven talent.",
    role: "poster",
  },
] as const;

type AccountType = (typeof ACCOUNT_TYPES)[number]["id"];
type Mode = "login" | "signup";

/** shadcn login-04 layout adapted to the real decarbon auth flow. */
export function AuthForm() {
  const router = useRouter();
  const { signIn } = useSession();
  const [mode, setMode] = useState<Mode>("login");
  const [accountType, setAccountType] = useState<AccountType>("seeker");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  // Passwordless sign-in, offered only on the login side — a brand new account
  // has nothing to sign in to yet.
  const [magicMode, setMagicMode] = useState(false);
  const [magicSent, setMagicSent] = useState(false);

  const active = ACCOUNT_TYPES.find((type) => type.id === accountType)!;
  const isSignup = mode === "signup";
  const useMagic = !isSignup && magicMode;

  const submit = () => {
    setError(null);

    if (useMagic) {
      startTransition(async () => {
        try {
          await requestMagicLink(email);
          // Resolves whether or not the account exists, and this screen says
          // the same thing either way.
          setMagicSent(true);
        } catch {
          setError("We couldn't reach the server. Check your connection and try again.");
        }
      });
      return;
    }

    startTransition(async () => {
      try {
        const result = isSignup
          ? await signup({
              email,
              password,
              name,
              role: active.role,
              company: active.role === "poster" ? company : undefined,
            })
          : await login(email, password);
        signIn(result);
        router.push(result.user.role === "poster" ? "/employer" : "/account");
      } catch (caught) {
        setError(
          caught instanceof ApiError
            ? caught.message
            : "Something went wrong. Please try again.",
        );
      }
    });
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMagicMode(false);
    setMagicSent(false);
  };

  if (magicSent) {
    return (
      <div className="rounded-xl border border-outline-variant/40 bg-surface-container-low p-stack-lg">
        <MailCheck className="mb-4 h-8 w-8 text-secondary" />
        <h2 className="mb-2 text-title-lg text-on-surface">Check your inbox</h2>
        <p className="mb-stack-md text-body-md text-on-surface-variant">
          If an account exists for <span className="font-semibold">{email}</span>, we&rsquo;ve
          sent a one-click sign-in link. It works for the next 30 minutes.
        </p>
        <button
          type="button"
          onClick={() => {
            setMagicSent(false);
            setMagicMode(false);
          }}
          className="text-body-sm font-semibold text-secondary underline-offset-4 hover:underline"
        >
          Use a password instead
        </button>
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
        {isSignup && (
          <Field>
            <FieldLabel>I&rsquo;m here to</FieldLabel>
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
                    disabled={pending}
                    onClick={() => setAccountType(type.id)}
                    className="text-body-md font-semibold"
                  >
                    <type.icon className="h-5 w-5" />
                    {type.label}
                  </Button>
                );
              })}
            </div>
            <FieldDescription>{active.blurb}</FieldDescription>
          </Field>
        )}

        {isSignup && (
          <Field>
            <FieldLabel htmlFor="name">
              {accountType === "employer" ? "Your Name" : "Full Name"}
            </FieldLabel>
            <Input
              id="name"
              name="name"
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Jane Doe"
              className="h-12 bg-white text-body-lg"
            />
          </Field>
        )}

        {isSignup && accountType === "employer" && (
          <Field>
            <FieldLabel htmlFor="company">Company Name</FieldLabel>
            <Input
              id="company"
              name="company"
              type="text"
              required
              value={company}
              onChange={(event) => setCompany(event.target.value)}
              placeholder="TerraForm Dynamics"
              className="h-12 bg-white text-body-lg"
            />
          </Field>
        )}

        <Field>
          <FieldLabel htmlFor="email">Email Address</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={
              isSignup && accountType === "employer"
                ? "you@company.com"
                : "name@example.com"
            }
            className="h-12 bg-white text-body-lg"
          />
        </Field>

        {!useMagic && (
          <Field>
            <div className="flex items-baseline justify-between gap-4">
              <FieldLabel htmlFor="password">Password</FieldLabel>
              {!isSignup && (
                <Link
                  href="/auth/forgot"
                  className="text-label-md font-semibold text-secondary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              )}
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••••"
              autoComplete={isSignup ? "new-password" : "current-password"}
              className="h-12 bg-white text-body-lg"
            />
          </Field>
        )}

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
            {pending
              ? isSignup
                ? "Creating account…"
                : useMagic
                  ? "Sending…"
                  : "Signing in…"
              : isSignup
                ? `Join as ${active.label.toLowerCase()}`
                : useMagic
                  ? "Email me a sign-in link"
                  : "Log in"}
          </Button>
        </Field>

        {!isSignup && (
          <button
            type="button"
            onClick={() => {
              setMagicMode(!magicMode);
              setError(null);
            }}
            className="text-center text-body-sm font-semibold text-secondary underline-offset-4 hover:underline"
          >
            {magicMode ? "Use a password instead" : "Email me a link instead"}
          </button>
        )}

        <FieldSeparator>Or continue with</FieldSeparator>

        <Field className="grid grid-cols-3 gap-4">
          {PROVIDERS.map((provider) => (
            <Button
              key={provider.label}
              type="button"
              variant="outline"
              disabled={pending}
              title="Social sign-in is not wired up in this demo"
              className="h-12 rounded-full"
            >
              <provider.icon className="h-5 w-5" />
              <span className="sr-only">Continue with {provider.label}</span>
            </Button>
          ))}
        </Field>

        <FieldDescription className="text-center">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("login")}
                className="font-semibold text-secondary underline-offset-4 hover:underline"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don&rsquo;t have an account?{" "}
              <button
                type="button"
                onClick={() => switchMode("signup")}
                className="font-semibold text-secondary underline-offset-4 hover:underline"
              >
                Sign up
              </button>
            </>
          )}
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
