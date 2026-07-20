"use client";

import { useState } from "react";
import { Briefcase, Building2, Mail } from "lucide-react";
import { FaApple, FaGithub, FaGoogle } from "react-icons/fa6";

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
  },
  {
    id: "employer",
    label: "Employer",
    icon: Building2,
    blurb: "Post roles and reach purpose-driven talent.",
  },
] as const;

type AccountType = (typeof ACCOUNT_TYPES)[number]["id"];

export function AuthForm() {
  const [accountType, setAccountType] = useState<AccountType>("seeker");
  const active = ACCOUNT_TYPES.find((type) => type.id === accountType)!;

  return (
    <>
      <fieldset className="mb-stack-lg">
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

      <div className="mb-stack-lg space-y-stack-sm">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.label}
            type="button"
            className="flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant bg-white px-6 py-4 text-body-md font-semibold text-on-surface transition-all hover:bg-surface-container-high active:scale-95"
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
        onSubmit={(event) => event.preventDefault()}
      >
        {/* Carries the choice through to whatever handles submission later. */}
        <input type="hidden" name="accountType" value={accountType} />
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
              placeholder={
                accountType === "employer"
                  ? "you@company.com"
                  : "name@example.com"
              }
              className="w-full rounded-lg border border-outline-variant bg-white py-4 pr-4 pl-12 text-body-lg transition-all outline-none focus:border-secondary focus:ring-2 focus:ring-secondary/20"
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full rounded-full bg-secondary py-5 text-body-md font-bold text-on-secondary shadow-sm transition-all hover:brightness-110 active:scale-95"
        >
          Continue as {active.label.toLowerCase()}
        </button>
      </form>
    </>
  );
}
