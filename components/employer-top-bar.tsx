"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useSession } from "@/lib/session";

/**
 * The employer area does not render SiteHeader, so sign-out lives here —
 * otherwise there is no way out of the dashboard.
 */
export function EmployerTopBar({ title }: { title: string }) {
  const router = useRouter();
  const { session, signOut } = useSession();

  return (
    <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-outline-variant/30 bg-surface px-4 py-3 md:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger className="text-on-surface-variant" />
        <h1 className="text-body-md font-semibold text-on-surface">{title}</h1>
      </div>

      <div className="flex items-center gap-2">
        {session && (
          <span className="hidden text-body-sm text-on-surface-variant sm:block">
            {session.user.name}
          </span>
        )}

        <Button
          variant="brand"
          size="pill-sm"
          render={<Link href="/employer/post" />}
        >
          <Plus className="h-4 w-4" />
          Post a Job
        </Button>

        <Button
          variant="ghost"
          size="icon"
          aria-label="Notifications"
          className="text-on-surface-variant hover:text-secondary"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <Button
          variant="ghost"
          size="icon-sm"
          aria-label="Sign out"
          title="Sign out"
          onClick={() => {
            signOut();
            router.push("/");
          }}
          className="text-on-surface-variant hover:text-secondary"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
