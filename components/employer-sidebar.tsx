"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Building2,
  Briefcase,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { label: "Overview", href: "/employer", icon: LayoutDashboard },
  { label: "My Jobs", href: "/employer/jobs", icon: Briefcase },
  { label: "Applicants", href: "/employer/applicants", icon: Users },
  { label: "Analytics", href: "/employer/analytics", icon: BarChart3 },
  { label: "Company Profile", href: "/employer/company", icon: Building2 },
  { label: "Settings", href: "/employer/settings", icon: Settings },
];

export function EmployerSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="border-outline-variant/30">
      <SidebarHeader className="px-4 py-5">
        <Link
          href="/"
          className="font-display text-headline-md font-bold text-secondary group-data-[collapsible=icon]:hidden"
        >
          Ecolution
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => {
                const active = pathname === item.href;
                return (
                  <SidebarMenuItem key={item.label}>
                    {/* Base UI composition: `render`, not Radix's `asChild`. */}
                    <SidebarMenuButton
                      render={<Link href={item.href} />}
                      isActive={active}
                      tooltip={item.label}
                      className="data-[active=true]:bg-secondary-container/40 data-[active=true]:font-semibold data-[active=true]:text-secondary"
                    >
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-outline-variant/30 p-3">
        <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary-container/50 text-label-sm font-bold text-secondary">
            VE
          </span>
          <div className="min-w-0 group-data-[collapsible=icon]:hidden">
            <p className="truncate text-body-sm font-semibold text-on-surface">
              Verida Energy
            </p>
            <p className="truncate text-label-sm text-on-surface-variant">
              Admin Account
            </p>
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
