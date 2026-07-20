import { EmployerListings } from "@/components/employer-listings";
import { EmployerTopBar } from "@/components/employer-top-bar";

export default function EmployerJobsPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <EmployerTopBar title="My Jobs" />
      <EmployerListings />
    </div>
  );
}
