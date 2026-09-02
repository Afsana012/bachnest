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
  const [dataLoading, setDataLoading] = useState(true);

  const loadOwnerData = useCallback(async () => {
    setDataLoading(true);
    const [propRes, bookRes, tenRes, invRes, compRes] = await Promise.all([
      fetchApi<Property[]>("/owner/properties"),
      fetchApi<Booking[]>("/bookings/me"),
      fetchApi<Tenancy[]>("/tenancies/me"),
      fetchApi<Invoice[]>("/billing/invoices"),
      fetchApi<Complaint[]>("/complaints"),
    ]);

    if (propRes.success && propRes.data) setProperties(propRes.data);
    if (bookRes.success && bookRes.data) setBookings(bookRes.data);
    if (tenRes.success && tenRes.data) setTenancies(tenRes.data);
    if (invRes.success && invRes.data) setInvoices(invRes.data);
    if (compRes.success && compRes.data) setComplaints(compRes.data);
    setDataLoading(false);
  }, []);

  useEffect(() => {
    if (!loading && (!isAuthenticated || user?.role !== "OWNER")) {
      router.push("/dashboard");
      return;
    }
    if (isAuthenticated) {
      const t = setTimeout(loadOwnerData, 0);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, loading, user?.role, router, loadOwnerData]);

  if (loading) {
    return (
      <div className="container mx-auto flex-1 flex items-center justify-center py-20">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  const tabs: Array<{ key: OwnerTab; label: string; count: number }> = [
    { key: "properties", label: "My Properties", count: properties.length },
    { key: "bookings", label: "Booking Requests", count: bookings.filter((b) => b.booking_status === "REQUESTED").length },
    { key: "tenancies", label: "Tenants", count: tenancies.length },
    { key: "invoices", label: "Invoices", count: invoices.length },
    { key: "complaints", label: "Complaints", count: complaints.length },
  ];

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
            className={`pb-3 text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? "text-foreground border-b-2 border-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {dataLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {activeTab === "properties" &&
            (properties.length > 0 ? (
              <PropertyManager properties={properties} onChanged={loadOwnerData} />
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

          {activeTab === "bookings" && <BookingRequests bookings={bookings} onChanged={loadOwnerData} />}
          {activeTab === "tenancies" && <OwnerTenancies tenancies={tenancies} onChanged={loadOwnerData} />}
          {activeTab === "invoices" && (
            <InvoiceCreator tenancies={tenancies} invoices={invoices} onChanged={loadOwnerData} />
          )}
          {activeTab === "complaints" && <ComplaintManager complaints={complaints} onChanged={loadOwnerData} />}
        </div>
      )}
    </div>
  );
}
