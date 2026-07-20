"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useOverlay } from "@/lib/store";

/**
 * Client-side only, and therefore NOT a security boundary — the seed ships no
 * secrets worth guarding and anyone can navigate straight past this. It exists
 * so the demo behaves like a real product, nothing more. Replace with a
 * server-side session check before any real account exists.
 */
export function AuthGuard({
  role,
  children,
}: {
  role: "seeker" | "poster";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { overlay } = useOverlay();
  const session = overlay.session;

  const allowed = session?.role === role;

  useEffect(() => {
    if (!session) {
      router.replace("/auth");
    } else if (session.role !== role) {
      // Signed in, but as the other persona — send them where they belong
      // rather than bouncing them to a sign-in form they don't need.
      router.replace(session.role === "poster" ? "/employer" : "/account");
    }
  }, [session, role, router]);

  if (!allowed) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-surface">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-body-md">Checking your session…</span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
