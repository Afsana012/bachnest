import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view";
import { DashboardSearchParamsReader } from "@/components/dashboard/dashboard-search-params-reader";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Manage your residential leases, invoices, bookings, and maintenance tickets on BachNest.",
};

export default function DashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <Suspense fallback={<DashboardClientView />}>
          <DashboardSearchParamsReader />
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}
