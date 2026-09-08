"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { UserCircle, ShieldAlert, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { Booking, Complaint, Invoice, KYCOut, ParkingBooking, Tenancy } from "@/lib/types";
import { TenancyPanel } from "@/components/dashboard/tenancy-panel";
import { InvoicePanel } from "@/components/dashboard/invoice-panel";
import { ComplaintPanel } from "@/components/dashboard/complaint-panel";
import { BookingPanel } from "@/components/dashboard/booking-panel";
import { NoticePanel } from "@/components/dashboard/notice-panel";
import { ParkingPanel } from "@/components/dashboard/parking-panel";

type DashboardTab = "tenancies" | "invoices" | "complaints" | "bookings" | "notices" | "parking";

export function DashboardClientView() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [parkingPasses, setParkingPasses] = useState<ParkingBooking[]>([]);
  const [kyc, setKyc] = useState<KYCOut | null>(null);

  const [activeTab, setActiveTab] = useState<DashboardTab>("tenancies");

  const loadDashboardData = useCallback(async () => {
    const [tenRes, invRes, kycRes, compRes, bookRes, parkRes] = await Promise.all([
      fetchApi<Tenancy[]>("/tenancies/me"),
      fetchApi<Invoice[]>("/billing/invoices"),
      fetchApi<KYCOut>("/kyc/me"),
      fetchApi<Complaint[]>("/complaints"),
      fetchApi<Booking[]>("/bookings/me"),
      fetchApi<ParkingBooking[]>("/parking/me"),
    ]);

    if (tenRes.success && tenRes.data) setTenancies(tenRes.data);
    if (invRes.success && invRes.data) setInvoices(invRes.data);
    if (kycRes.success && kycRes.data) setKyc(kycRes.data);
    if (compRes.success && compRes.data) setComplaints(compRes.data);
    if (bookRes.success && bookRes.data) setBookings(bookRes.data);
    if (parkRes.success && parkRes.data) setParkingPasses(parkRes.data);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (isAuthenticated) {
      const t = setTimeout(loadDashboardData, 0);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, loading, router, loadDashboardData]);

  if (loading) {
    return (
      <div className="container mx-auto flex-1 flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs: Array<{ key: DashboardTab; label: string; count: number }> = [
    { key: "tenancies", label: "Tenancies", count: tenancies.length },
    { key: "invoices", label: "Invoices", count: invoices.length },
    { key: "complaints", label: "Maintenance", count: complaints.length },
    { key: "bookings", label: "Bookings", count: bookings.length },
    { key: "parking", label: "Parking", count: parkingPasses.length },
  ];

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-8 mb-8">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Welcome, {user?.full_name?.split(" ")[0] || "User"}
          </h1>
          <p className="text-sm text-muted-foreground mt-2">Manage your residential leases, payments, and support tickets.</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="px-3 py-1 font-medium shadow-sm bg-background">
            {user?.role.toLowerCase().replace("_", " ")}
          </Badge>
          <Button variant="outline" size="sm" onClick={() => router.push("/dashboard/profile")}>
            <UserCircle className="h-4 w-4 mr-1.5" /> Profile
          </Button>
        </div>
      </div>

      {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <ShieldAlert className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-emerald-700 dark:text-emerald-400 text-sm">Admin Access Enabled</h3>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/80 mt-1">
                You are logged in with administrative privileges.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            className="shrink-0 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => router.push("/admin/dashboard")}
          >
            Go to Admin Panel
          </Button>
        </div>
      )}

      {user?.role === "OWNER" && (
        <div className="mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-primary/30 bg-primary/5 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <Building2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Manage your properties</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Approve bookings, add rooms, publish listings, and generate invoices from the owner hub.
              </p>
            </div>
          </div>
          <Button size="sm" className="shrink-0" onClick={() => router.push("/dashboard/owner")}>
            Open Owner Hub
          </Button>
        </div>
      )}

      {(!kyc || kyc.status !== "APPROVED") && (
        <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-sm">
          <div className="flex items-start gap-4">
            <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground text-sm">Action Required: Verify Identity</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                {kyc?.status === "REJECTED"
                  ? `Your KYC was rejected: ${kyc.rejection_reason || "documents unclear"}. Please resubmit corrected documents.`
                  : "Submit your National ID (NID) and Student/Job ID to unlock instant bookings, digital agreements, and priority support."}
              </p>
            </div>
          </div>
          <Button size="sm" variant="outline" className="shrink-0 bg-background hover:bg-muted" onClick={() => router.push("/dashboard/kyc")}>
            {kyc?.status === "REJECTED" ? "Resubmit KYC" : "Complete KYC"}
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-6">
          <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden">
                {user?.avatar_url ? (
                  <Image src={user.avatar_url} alt={user.full_name} fill className="object-cover" />
                ) : (
                  <UserCircle className="h-7 w-7" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{user?.full_name}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Phone</span>
                <span className="font-medium flex items-center gap-1.5">
                  {user?.phone}
                  {user?.is_phone_verified ? (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <span className="text-[10px] text-amber-500">unverified</span>
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-border/50">
                <span className="text-muted-foreground">Verification</span>
                {user?.is_kyc_verified ? (
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-medium">
                    <CheckCircle2 className="h-4 w-4" /> Verified
                  </span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-500 font-medium">Pending</span>
                )}
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-muted-foreground">Trust Score</span>
                <span className="font-medium">{user?.trust_score ?? "New"} / 100</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`pb-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.key
                    ? "text-foreground border-b-2 border-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
            <button
              onClick={() => setActiveTab("notices")}
              className={`pb-3 text-sm font-medium transition-all whitespace-nowrap ${
                activeTab === "notices"
                  ? "text-foreground border-b-2 border-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Notices
            </button>
          </div>

          <div className="space-y-6">
            {activeTab === "tenancies" && <TenancyPanel tenancies={tenancies} onChanged={loadDashboardData} />}
            {activeTab === "invoices" && <InvoicePanel invoices={invoices} onChanged={loadDashboardData} />}
            {activeTab === "complaints" && (
              <ComplaintPanel complaints={complaints} tenancies={tenancies} onChanged={loadDashboardData} />
            )}
            {activeTab === "bookings" && <BookingPanel bookings={bookings} onChanged={loadDashboardData} />}
            {activeTab === "parking" && <ParkingPanel />}
            {activeTab === "notices" && <NoticePanel />}
          </div>
        </div>
      </div>
    </div>
  );
}
