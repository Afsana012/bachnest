import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { OwnerDashboardView } from "@/components/owner/owner-dashboard-view";

export const metadata: Metadata = {
  title: "Owner Hub",
  description: "Manage listings, tenants, billing invoices, and maintenance requests on BachNest.",
};

export default function OwnerHubPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20 text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <OwnerDashboardView />
      </main>
      <Footer />
    </div>
  );
}
