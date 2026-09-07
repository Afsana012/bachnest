"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { Booking, Complaint, Invoice, Property, Tenancy } from "@/lib/types";
import { PropertyManager } from "@/components/owner/property-manager";
import { BookingRequests } from "@/components/owner/booking-requests";
import { InvoiceCreator } from "@/components/owner/invoice-creator";
import { ComplaintManager } from "@/components/owner/complaint-manager";
import { OwnerTenancies } from "@/components/owner/owner-tenancies";

type OwnerTab = "properties" | "bookings" | "tenancies" | "invoices" | "complaints";

export function OwnerDashboardView() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<OwnerTab>("properties");

  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);

  // Per-tab loading state so only the active tab shows a spinner on refresh
  const [tabLoading, setTabLoading] = useState<Record<OwnerTab, boolean>>({
    properties: true,
    bookings: true,
    tenancies: true,
    invoices: true,
    complaints: true,
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

  // Load all tabs on initial mount in parallel (background, non-blocking)
  const loadAll = useCallback(async () => {
    await Promise.all([
      loadProperties(),
      loadBookings(),
      loadTenancies(),
      loadInvoices(),
      loadComplaints(),
    ]);
  }, [loadProperties, loadBookings, loadTenancies, loadInvoices, loadComplaints]);

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
      <div className="container mx-auto flex-1 flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const pendingBookingsCount = bookings.filter((b) => b.booking_status === "REQUESTED").length;

  const tabs: Array<{ key: OwnerTab; label: string; count: number }> = [
    { key: "properties", label: "My Properties", count: properties.length },
    { key: "bookings", label: "Booking Requests", count: pendingBookingsCount },
    { key: "tenancies", label: "Tenants", count: tenancies.length },
    { key: "invoices", label: "Invoices", count: invoices.length },
    { key: "complaints", label: "Complaints", count: complaints.length },
  ];

  const isTabLoading = tabLoading[activeTab];

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Owner Hub</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage listings, tenants, billing, and maintenance.</p>
        </div>
        <Button onClick={() => router.push("/dashboard/properties/new")} className="rounded-xl shrink-0">
          <Plus className="h-4 w-4 mr-1.5" /> Post New Property
        </Button>
      </div>

      <div className="flex items-center gap-6 border-b border-border mb-8 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-medium transition-all whitespace-nowrap relative ${
              activeTab === tab.key
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className={`ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                tab.key === "bookings" && pendingBookingsCount > 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {isTabLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "properties" &&
            (properties.length > 0 ? (
              <PropertyManager properties={properties} onChanged={loadProperties} />
            ) : (
              <div className="py-16 text-center rounded-2xl border border-dashed border-border bg-card">
                <p className="text-sm text-muted-foreground">
                  You have no listings yet.{" "}
                  <Link href="/dashboard/properties/new" className="text-primary hover:underline">
                    Post your first property
                  </Link>{" "}
                  to start receiving bookings.
                </p>
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
        </div>
      )}
    </div>
  );
}
