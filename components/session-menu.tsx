"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, RotateCcw } from "lucide-react";
import { setSession } from "@/lib/overlay";
import { useOverlay } from "@/lib/store";

/**
 * Renders the signed-out call to action or the signed-in identity, depending
 * on the overlay session. Also carries the demo reset, since that is the
 * control someone reaches for when the demo state gets messy.
 */
export function SessionMenu({ onNavigate }: { onNavigate?: () => void }) {
  const router = useRouter();
  const { overlay, update, reset } = useOverlay();
  const session = overlay.session;

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

  const home = session.role === "poster" ? "/employer" : "/account";

  return (
    <div className="flex items-center gap-2">
      <Link
        href={home}
        onClick={onNavigate}
        className="flex items-center gap-2 rounded-full px-3 py-1.5 transition-colors hover:bg-surface-container"
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary-container/60 text-label-sm font-bold text-on-secondary-container">
          {session.name.slice(0, 2).toUpperCase()}
        </span>
        <span className="hidden text-body-sm font-semibold text-on-surface sm:block">
          {session.name}
        </span>
      </Link>

      <button
        aria-label="Reset demo data"
        title="Reset demo data"
        onClick={() => {
          reset();
          router.push("/");
        }}
        className="text-on-surface-variant transition-colors hover:text-secondary"
      >
        <RotateCcw className="h-4 w-4" />
      </button>

      <button
        aria-label="Sign out"
        title="Sign out"
        onClick={() => {
          update((current) => setSession(current, null));
          onNavigate?.();
          router.push("/");
        }}
        className="text-on-surface-variant transition-colors hover:text-secondary"
      >
        <LogOut className="h-4 w-4" />
      </button>
    </div>
  );
}
