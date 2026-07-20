import { EmployerJobApplicants } from "@/components/employer-job-applicants";
import { EmployerTopBar } from "@/components/employer-top-bar";

export default async function EmployerJobPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="flex min-h-svh flex-col">
      <EmployerTopBar title="Applicants" />
      <EmployerJobApplicants jobId={id} />
    </div>
  );
}
