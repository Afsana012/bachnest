"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Menu,
  Plus,
  Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { Booking, Complaint, Invoice, ParkingBooking, Property, Tenancy } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { OwnerSidebar, OwnerTab } from "@/components/owner/owner-sidebar";
import { OwnerOverviewTab } from "@/components/owner/owner-overview-tab";
import { PropertyManager } from "@/components/owner/property-manager";
import { BookingRequests } from "@/components/owner/booking-requests";
import { InvoiceCreator } from "@/components/owner/invoice-creator";
import { ComplaintManager } from "@/components/owner/complaint-manager";
import { OwnerTenancies } from "@/components/owner/owner-tenancies";
import { OwnerNotices } from "@/components/owner/owner-notices";
import { OwnerParking } from "@/components/owner/owner-parking";
import { NoticeComposerModal } from "@/components/owner/notice-composer-modal";

export function OwnerDashboardView() {
  const router = useRouter();
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<OwnerTab>("overview");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isNoticeComposerOpen, setIsNoticeComposerOpen] = useState(false);

  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [parkingBookings, setParkingBookings] = useState<ParkingBooking[]>([]);

  const [tabLoading, setTabLoading] = useState<Record<OwnerTab, boolean>>({
    overview: false,
    properties: true,
    bookings: true,
    tenancies: true,
    parking: true,
    invoices: true,
    complaints: true,
    notices: false,
  });

  const setLoading = (tab: OwnerTab, value: boolean) =>
    setTabLoading((prev) => ({ ...prev, [tab]: value }));

  const loadProperties = useCallback(async () => {
    setLoading("properties", true);
    const res = await fetchApi<Property[]>("/owner/properties");
    if (res.success && res.data) setProperties(res.data);
    setLoading("properties", false);
  }, []);

  const loadBookings = useCallback(async () => {
    setLoading("bookings", true);
    const res = await fetchApi<Booking[]>("/bookings/me");
    if (res.success && res.data) setBookings(res.data);
    setLoading("bookings", false);
  }, []);

  const loadTenancies = useCallback(async () => {
    setLoading("tenancies", true);
    const res = await fetchApi<Tenancy[]>("/tenancies/me");
    if (res.success && res.data) setTenancies(res.data);
    setLoading("tenancies", false);
  }, []);

  const loadInvoices = useCallback(async () => {
    setLoading("invoices", true);
    const res = await fetchApi<Invoice[]>("/billing/invoices");
    if (res.success && res.data) setInvoices(res.data);
    setLoading("invoices", false);
  }, []);

  const loadComplaints = useCallback(async () => {
    setLoading("complaints", true);
    const res = await fetchApi<Complaint[]>("/complaints");
    if (res.success && res.data) setComplaints(res.data);
    setLoading("complaints", false);
  }, []);

  const loadParkingBookings = useCallback(async () => {
    setLoading("parking", true);
    const res = await fetchApi<ParkingBooking[]>("/parking/owner/bookings");
    if (res.success && res.data) setParkingBookings(res.data);
    setLoading("parking", false);
  }, []);

  const loadAll = useCallback(async () => {
    await Promise.all([
      loadProperties(),
      loadBookings(),
      loadTenancies(),
      loadInvoices(),
      loadComplaints(),
      loadParkingBookings(),
    ]);
  }, [loadProperties, loadBookings, loadTenancies, loadInvoices, loadComplaints, loadParkingBookings]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "OWNER")) {
      router.push("/dashboard");
      return;
    }
    if (isAuthenticated) {
      const t = setTimeout(loadAll, 0);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, loading, user?.role, router, loadAll]);

  if (loading) {
    return (
      <div className="container mx-auto flex-1 flex items-center justify-center py-24">
        <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const pendingBookingsCount = bookings.filter((b) => b.booking_status === "REQUESTED").length;
  const openComplaintsCount = complaints.filter((c) => c.status !== "RESOLVED").length;
  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE");
  const monthlyExpectedRevenue = activeTenancies.reduce(
    (sum, t) => sum + Number(t.agreed_monthly_rent || 0),
    0
  );

  const tabTitles: Record<OwnerTab, { title: string; subtitle: string }> = {
    overview: {
      title: "Portfolio Overview",
      subtitle: "Live performance, occupancy, financial metrics, and immediate alerts.",
    },
    properties: {
      title: "My Properties & Units",
      subtitle: "Add apartments, configure single/shared rooms, and manage parking slots.",
    },
    bookings: {
      title: "Booking Requests & Schedule",
      subtitle: "Review prospective tenant profiles, confirm visits, and accept bookings.",
    },
    tenancies: {
      title: "Tenants & Agreements",
      subtitle: "Active leases, dual e-signature contracts, deposit refunds, and DMP police forms.",
    },
    invoices: {
      title: "Rent Billing & Invoices",
      subtitle: "Generate monthly rent bills, track payments, and manage clearance vouchers.",
    },
    complaints: {
      title: "Maintenance & Support",
      subtitle: "Tenant maintenance issues with tracked SLA resolution times.",
    },
    notices: {
      title: "Building Announcements",
      subtitle: "Broadcast emergency and routine notices to your building tenants.",
    },
    parking: {
      title: "Garage & Parking Passes",
      subtitle: "Track registered vehicles, active parking passes, and monthly garage revenue.",
    },
  };

  const isTabLoading = tabLoading[activeTab];

  return (
    <div className="container mx-auto max-w-7xl px-3 sm:px-6">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
        {/* Left Responsive Sidebar */}
        <OwnerSidebar
          user={user}
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          counts={{
            properties: properties.length,
            pendingBookings: pendingBookingsCount,
            tenancies: tenancies.length,
            parkingPasses: parkingBookings.filter((b) => b.status === "ACTIVE").length,
            invoices: invoices.length,
            openComplaints: openComplaintsCount,
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenNoticeComposer={() => setIsNoticeComposerOpen(true)}
          onLogout={logout}
        />

        {/* Right Main Dashboard Workspace */}
        <div className="flex-1 w-full min-w-0 space-y-6">
          {/* Top Header Bar */}
          <div className="p-4 sm:p-6 rounded-3xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl border border-border bg-muted/40 hover:bg-muted text-foreground transition-colors"
                aria-label="Open sidebar menu"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                    {tabTitles[activeTab].title}
                  </h1>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                  {tabTitles[activeTab].subtitle}
                </p>
              </div>
            </div>

            {/* Header Right Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsNoticeComposerOpen(true)}
                disabled={properties.length === 0}
                className="rounded-xl text-xs font-semibold h-9"
              >
                <Megaphone className="h-3.5 w-3.5 mr-1.5 text-primary" />
                <span className="hidden sm:inline">Broadcast</span> Notice
              </Button>
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs font-bold h-9 shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
              >
                <Link href="/dashboard/properties/new">
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span className="hidden sm:inline">Post</span> Property
                </Link>
              </Button>
            </div>
          </div>

          {/* 4-KPI Metric Intelligence Bar */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {/* KPI 1: Monthly Expected Rent */}
            <div
              onClick={() => setActiveTab("invoices")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer space-y-1"
            >
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Monthly Rent
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {formatMoney(monthlyExpectedRevenue)}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {activeTenancies.length} active lease{activeTenancies.length === 1 ? "" : "s"}
              </p>
            </div>

            {/* KPI 2: Total Properties */}
            <div
              onClick={() => setActiveTab("properties")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer space-y-1"
            >
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Properties
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {properties.length}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {properties.filter((p) => p.is_published).length} live on platform
              </p>
            </div>

            {/* KPI 3: Active Tenants */}
            <div
              onClick={() => setActiveTab("tenancies")}
              className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors cursor-pointer space-y-1"
            >
              <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                Active Tenants
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {activeTenancies.length}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                Current occupied residents
              </p>
            </div>

            {/* KPI 4: Pending Action Items */}
            <div
              onClick={() =>
                setActiveTab(pendingBookingsCount > 0 ? "bookings" : openComplaintsCount > 0 ? "complaints" : "overview")
              }
              className={`p-4 rounded-xl border transition-colors cursor-pointer space-y-1 ${
                pendingBookingsCount > 0 || openComplaintsCount > 0
                  ? "bg-amber-500/5 border-amber-500/30 hover:border-amber-500/60"
                  : "bg-card border-border hover:border-primary/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                  Attention Needed
                </span>
                {(pendingBookingsCount > 0 || openComplaintsCount > 0) && (
                  <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                )}
              </div>
              <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {pendingBookingsCount + openComplaintsCount}
              </div>
              <p className="text-xs text-muted-foreground truncate">
                {pendingBookingsCount > 0
                  ? `${pendingBookingsCount} booking(s) awaiting review`
                  : openComplaintsCount > 0
                    ? `${openComplaintsCount} maintenance ticket(s)`
                    : "All clear"}
              </p>
            </div>
          </div>

          {/* Active Tab Content Area */}
          {isTabLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="animate-in fade-in duration-150">
              {activeTab === "overview" && (
                <OwnerOverviewTab
                  properties={properties}
                  bookings={bookings}
                  tenancies={tenancies}
                  invoices={invoices}
                  complaints={complaints}
                  onSelectTab={setActiveTab}
                  onOpenNoticeComposer={() => setIsNoticeComposerOpen(true)}
                />
              )}

              {activeTab === "properties" &&
                (properties.length > 0 ? (
                  <PropertyManager properties={properties} onChanged={loadProperties} />
                ) : (
                  <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card space-y-3">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">You have no listings yet</h4>
                      <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
                        Post your first residential property or vacant seat to start receiving verified bachelor bookings.
                      </p>
                    </div>
                    <Button asChild size="sm" className="rounded-xl font-bold">
                      <Link href="/dashboard/properties/new">
                        <Plus className="h-4 w-4 mr-1.5" /> Post First Property
                      </Link>
                    </Button>
                  </div>
                ))}

              {activeTab === "bookings" && (
                <BookingRequests bookings={bookings} onChanged={loadBookings} />
              )}

              {activeTab === "tenancies" && (
                <OwnerTenancies tenancies={tenancies} onChanged={loadTenancies} />
              )}

              {activeTab === "invoices" && (
                <InvoiceCreator tenancies={tenancies} invoices={invoices} onChanged={loadInvoices} />
              )}

              {activeTab === "complaints" && (
                <ComplaintManager complaints={complaints} onChanged={loadComplaints} />
              )}

              {activeTab === "notices" && (
                <OwnerNotices properties={properties} />
              )}

              {activeTab === "parking" && (
                <OwnerParking
                  bookings={parkingBookings}
                  properties={properties}
                  onChanged={loadParkingBookings}
                  loading={isTabLoading}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Broadcast Notice Modal */}
      <NoticeComposerModal
        properties={properties}
        isOpen={isNoticeComposerOpen}
        onClose={() => setIsNoticeComposerOpen(false)}
        onSuccess={() => {
          setActiveTab("notices");
        }}
      />
    </div>
  );
}
