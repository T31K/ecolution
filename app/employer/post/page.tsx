import { EmployerPostForm } from "@/components/employer-post-form";
import { EmployerTopBar } from "@/components/employer-top-bar";

export default function EmployerPostPage() {
  return (
    <div className="flex min-h-svh flex-col">
      <EmployerTopBar title="Post a Job" />
      <EmployerPostForm />
    </div>
  );
}
