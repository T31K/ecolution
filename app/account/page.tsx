import type { Metadata } from "next";
import { AccountSummary } from "@/components/account-summary";
import { AuthGuard } from "@/components/auth-guard";
import { Container } from "@/components/container";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "My Applications | Ecolution",
  description: "Track the climate roles you have applied to.",
};

export default function AccountPage() {
  return (
    <AuthGuard role="seeker">
      <SiteHeader />
      <main className="flex-1">
        <Container className="py-stack-lg">
          <AccountSummary />
        </Container>
      </main>
      <SiteFooter />
    </AuthGuard>
  );
}
