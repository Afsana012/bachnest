import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";

export const metadata: Metadata = {
  title: "Admin Console",
  description: "Moderation, KYC verification, property approvals, and audit logs for BachNest administrators.",
};

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-muted/20 text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <AdminDashboardView />
      </main>
      <Footer />
    </div>
  );
}
