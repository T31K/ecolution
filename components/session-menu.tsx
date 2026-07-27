"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/session";

/**
 * Renders the signed-out call to action or the signed-in identity, depending
 * on the API session.
 */
export function SessionMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { session, signOut } = useSession();

  if (!session) {
    return (
      <Link
        href="/auth"
        onClick={onNavigate}
        className="px-4 py-2 text-body-md font-medium text-on-surface-variant transition-colors hover:text-secondary"
      >
        Sign In
      </Link>
    );
  }

  const { user } = session;
  const home = user.role === "poster" ? "/employer" : "/account";
  // Employers show up as their company, matching the old seed sessions where
  // the display name held the company for posters.
  const displayName =
    user.role === "poster" ? (user.company ?? user.name) : user.name;

  return (
    <div className="flex items-center gap-2">
      <Link
        href={home}
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-surface-container"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container/60 text-label-sm font-bold text-on-secondary-container">
          {displayName.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden text-body-sm font-semibold text-on-surface sm:block">
          {displayName}
        </span>
      </Link>

      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Sign out"
        title="Sign out"
        onClick={() => {
          signOut();
          onNavigate?.();
          router.push("/");
        }}
        className="text-on-surface-variant hover:text-secondary"
      >
        <LogOut className="h-4 w-4" />
      </Button>
    </div>
  );
}
