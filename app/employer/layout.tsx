import type { Metadata } from "next";
import { AuthGuard } from "@/components/auth-guard";
import { EmployerSidebar } from "@/components/employer-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { UnverifiedBanner } from "@/components/unverified-banner";

export const metadata: Metadata = {
  title: "Employer Dashboard | Decarbon Jobs",
  description:
    "Manage your climate tech listings, applicants, and hiring performance.",
};

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard role="poster">
      <SidebarProvider>
        <EmployerSidebar />
        <SidebarInset className="bg-surface">
          <UnverifiedBanner />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </AuthGuard>
  );
}
