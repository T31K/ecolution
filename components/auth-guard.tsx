"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useSession } from "@/lib/session";

/**
 * Client-side only, and therefore NOT a security boundary — the API enforces
 * authorization on every request; this exists so signed-out visitors land on
 * the sign-in form instead of an empty page. The session hydrates from
 * storage after mount, so the first render always shows the spinner.
 */
export function AuthGuard({
  role,
  children,
}: {
  role: "seeker" | "poster";
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { session } = useSession();

  const allowed = session?.user.role === role;

  useEffect(() => {
    if (!session) {
      router.replace("/auth");
    } else if (session.user.role !== role) {
      // Signed in, but as the other persona — send them where they belong
      // rather than bouncing them to a sign-in form they don't need.
      router.replace(session.user.role === "poster" ? "/employer" : "/account");
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
