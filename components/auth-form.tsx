"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Briefcase, Building2, Loader2, Mail, User } from "lucide-react";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError, login, signup } from "@/lib/api";
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

  const active = ACCOUNT_TYPES.find((type) => type.id === accountType)!;
  const isSignup = mode === "signup";

  const submit = () => {
    setError(null);
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

  return (
    <>
      <div
        role="radiogroup"
        aria-label="Sign in or create account"
        className="mb-stack-lg grid grid-cols-2 gap-2 rounded-full bg-surface-container p-1"
      >
        {(
          [
            { id: "login", label: "Log in" },
            { id: "signup", label: "Create account" },
          ] as const
        ).map((tab) => {
          const selected = tab.id === mode;
          return (
            <Button
              key={tab.id}
              type="button"
              role="radio"
              aria-checked={selected}
              variant={selected ? "brand" : "ghost"}
              size="pill"
              disabled={pending}
              onClick={() => {
                setMode(tab.id);
                setError(null);
              }}
              className="text-body-md font-semibold"
            >
              {tab.label}
            </Button>
          );
        })}
      </div>

      {isSignup && (
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
      )}

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
          submit();
        }}
      >
        {isSignup && (
          <div>
            <Label htmlFor="name" className="mb-2 text-label-md">
              {accountType === "employer" ? "Your Name" : "Full Name"}
            </Label>
            <div className="relative">
              <User className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Jane Doe"
                className="h-14 bg-white pl-12 text-body-lg"
              />
            </div>
          </div>
        )}

        {isSignup && accountType === "employer" && (
          <div>
            <Label htmlFor="company" className="mb-2 text-label-md">
              Company Name
            </Label>
            <div className="relative">
              <Building2 className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-on-surface-variant" />
              <Input
                id="company"
                name="company"
                type="text"
                required
                value={company}
                onChange={(event) => setCompany(event.target.value)}
                placeholder="TerraForm Dynamics"
                className="h-14 bg-white pl-12 text-body-lg"
              />
            </div>
          </div>
        )}

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
                isSignup && accountType === "employer"
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
            autoComplete={isSignup ? "new-password" : "current-password"}
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
          {pending
            ? isSignup
              ? "Creating account…"
              : "Signing in…"
            : isSignup
              ? `Join as ${active.label.toLowerCase()}`
              : "Log in"}
        </Button>
      </form>
    </>
  );
}
