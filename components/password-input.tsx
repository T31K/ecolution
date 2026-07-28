"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Password field with a reveal toggle. Used by sign-in, sign-up and reset —
 * mistyping a password you cannot see is the most common reason people end up
 * in the reset flow at all.
 */
export function PasswordInput({
  className,
  ...props
}: React.ComponentProps<typeof Input>) {
  const [visible, setVisible] = useState(false);

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        // Room for the toggle so a long password never runs under it.
        className={cn("pr-11", className)}
      />
      <button
        type="button"
        onClick={() => setVisible(!visible)}
        // Purely a convenience control: announcing it on every tab through a
        // sign-in form is noise, and the field is already labelled.
        tabIndex={-1}
        aria-label={visible ? "Hide password" : "Show password"}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-on-surface-variant transition-colors hover:text-on-surface"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}
