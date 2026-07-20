import { EmployerDashboard } from "@/components/employer-dashboard";
import { EmployerTopBar } from "@/components/employer-top-bar";

export default function EmployerDashboardPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <EmployerTopBar title="Employer Dashboard" />
      <EmployerDashboard />
    </div>
  );
}
