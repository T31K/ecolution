import type { Metadata } from "next";
import { EmployerSidebar } from "@/components/employer-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export const metadata: Metadata = {
  title: "Employer Dashboard | Ecolution",
  description:
    "Manage your climate tech listings, applicants, and hiring performance.",
};

export default function EmployerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <EmployerSidebar />
      <SidebarInset className="bg-surface">{children}</SidebarInset>
    </SidebarProvider>
  );
}
