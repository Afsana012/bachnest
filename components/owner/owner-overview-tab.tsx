"use client";

import Link from "next/link";
import {
  Building2,
  CalendarCheck,
  Receipt,
  AlertCircle,
  ArrowRight,
  TrendingUp,
  Eye,
  Plus,
  Clock,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking, Complaint, Invoice, Property, Tenancy } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { StatusBadge } from "@/components/shared/status-badge";

interface OwnerOverviewTabProps {
  properties: Property[];
  bookings: Booking[];
  tenancies: Tenancy[];
  invoices: Invoice[];
  complaints: Complaint[];
  onSelectTab: (tab: "properties" | "bookings" | "tenancies" | "invoices" | "complaints" | "notices") => void;
  onOpenNoticeComposer: () => void;
}

export function OwnerOverviewTab({
  properties,
  bookings,
  tenancies,
  invoices,
  complaints,
  onSelectTab,
  onOpenNoticeComposer,
}: OwnerOverviewTabProps) {
  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE");
  const monthlyExpectedRent = activeTenancies.reduce((sum, t) => sum + Number(t.agreed_monthly_rent || 0), 0);
  const totalDepositHeld = activeTenancies.reduce((sum, t) => sum + Number(t.agreed_security_deposit || 0), 0);

  const pendingBookings = bookings.filter((b) => b.booking_status === "REQUESTED");
  const openComplaints = complaints.filter((c) => c.status !== "RESOLVED");

  const paidInvoices = invoices.filter((i) => i.status === "PAID");
  const unpaidInvoices = invoices.filter((i) => i.status === "ISSUED" || i.status === "OVERDUE");
  const totalCollectedThisCycle = paidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);
  const totalPendingRent = unpaidInvoices.reduce((sum, i) => sum + Number(i.total_amount || 0), 0);

  const publishedProperties = properties.filter((p) => p.is_published);

  return (
    <div className="space-y-6">
      {/* Action Required Banner if pending items exist */}
      {(pendingBookings.length > 0 || openComplaints.length > 0) && (
        <div className="p-4 sm:p-5 rounded-2xl border border-amber-500/30 bg-amber-500/10 text-card-foreground shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  Action Required: {pendingBookings.length + openComplaints.length} Items Awaiting Review
                </h4>
                <p className="text-xs text-amber-800/80 dark:text-amber-300/80 mt-0.5">
                  {pendingBookings.length > 0 && `${pendingBookings.length} booking request(s) waiting for visit approval. `}
                  {openComplaints.length > 0 && `${openComplaints.length} tenant maintenance issue(s) unresolved.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              {pendingBookings.length > 0 && (
                <Button
                  size="sm"
                  onClick={() => onSelectTab("bookings")}
                  className="rounded-xl text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white"
                >
                  Review Bookings ({pendingBookings.length})
                </Button>
              )}
              {openComplaints.length > 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onSelectTab("complaints")}
                  className="rounded-xl text-xs font-semibold border-amber-500/40 text-amber-800 dark:text-amber-200 hover:bg-amber-500/20"
                >
                  Maintenance ({openComplaints.length})
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Financial & Operational Pulse */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Monthly Revenue Card */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Monthly Rent Run-Rate
            </span>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {formatMoney(monthlyExpectedRent)}
              <span className="text-xs font-normal text-muted-foreground ml-1">/ month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Active Leases: <strong className="text-foreground">{activeTenancies.length}</strong> · Security Held:{" "}
              {formatMoney(totalDepositHeld)}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Collection Status</span>
            <button
              type="button"
              onClick={() => onSelectTab("invoices")}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              View Invoices <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Invoicing Breakdown */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Billing & Collections
            </span>
            <div className="h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <Receipt className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {formatMoney(totalCollectedThisCycle)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Collected from {paidInvoices.length} invoice(s)
              {totalPendingRent > 0 && (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  {" "}· {formatMoney(totalPendingRent)} pending
                </span>
              )}
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Total Invoices: {invoices.length}</span>
            <button
              type="button"
              onClick={() => onSelectTab("invoices")}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              Create Invoice <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Occupancy & Portfolio Status */}
        <div className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Portfolio Occupancy
            </span>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-black text-foreground">
              {publishedProperties.length} / {properties.length}
              <span className="text-xs font-normal text-muted-foreground ml-1.5">Listed Properties</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {activeTenancies.length} Active Resident(s)
              </span>
              {" "}living in your accommodations.
            </p>
          </div>
          <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Compliance: 100% DMP Ready</span>
            <button
              type="button"
              onClick={() => onSelectTab("properties")}
              className="text-primary hover:underline font-semibold flex items-center gap-1"
            >
              Manage Units <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Bookings & Property Quick Health */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Booking Inquiries */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Recent Booking Inquiries & Schedule</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTab("bookings")}
              className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 h-7"
            >
              View All ({bookings.length})
            </Button>
          </div>

          {bookings.length > 0 ? (
            <div className="space-y-3">
              {bookings.slice(0, 4).map((b) => (
                <div
                  key={b.id}
                  className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-primary/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-sm text-foreground">
                        {b.property_title || `Booking #${b.id.slice(0, 8)}`}
                      </h4>
                      {b.room_number_or_name && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-primary/10 text-primary font-medium">
                          {b.room_number_or_name}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-2.5 text-xs text-muted-foreground">
                      <span>Move-in: {formatDate(b.requested_move_in_date)}</span>
                      <span>·</span>
                      <span>Deposit: {formatMoney(b.token_deposit_amount)}</span>
                      {b.preferred_visit_date && (
                        <>
                          <span>·</span>
                          <span className="text-primary font-medium flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Visit {formatDate(b.preferred_visit_date)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                    <StatusBadge status={b.booking_status} />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTab("bookings")}
                      className="h-7 text-xs rounded-lg font-medium"
                    >
                      <Eye className="h-3 w-3 mr-1" /> Inspect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card space-y-2">
              <CalendarCheck className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">No booking inquiries yet.</p>
            </div>
          )}
        </div>

        {/* Right Column: Properties Quick Snapshot & Quick CTAs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              <h3 className="font-bold text-sm text-foreground">Your Properties</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onSelectTab("properties")}
              className="text-xs font-semibold text-primary hover:text-primary hover:bg-primary/10 h-7"
            >
              Manage ({properties.length})
            </Button>
          </div>

          {properties.length > 0 ? (
            <div className="space-y-3">
              {properties.slice(0, 3).map((p) => (
                <div
                  key={p.id}
                  className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-2.5 hover:border-primary/40 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-foreground">{p.title}</h4>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <MapPin className="h-3 w-3 text-destructive" />
                        {p.area_neighborhood}, {p.city}
                      </p>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        p.is_published
                          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                          : "bg-muted text-muted-foreground border border-border"
                      }`}
                    >
                      {p.is_published ? "Live" : "Draft"}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-border/60 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground text-xs">
                      {p.rooms && p.rooms.length > 0
                        ? `${p.rooms.length} Unit(s) · From ${formatMoney(Math.min(...p.rooms.map((r) => Number(r.monthly_rent || 0))))}/mo`
                        : `${p.property_type.toLowerCase()} accommodation`}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectTab("properties")}
                      className="text-primary hover:underline font-semibold flex items-center gap-1"
                    >
                      Manage Rooms & Beds <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}

              <div className="pt-1 flex gap-2">
                <Button
                  asChild
                  size="sm"
                  className="w-full rounded-xl text-xs font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <Link href="/dashboard/properties/new">
                    <Plus className="h-3.5 w-3.5 mr-1" /> Post New Property
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onOpenNoticeComposer}
                  className="rounded-xl text-xs font-semibold shrink-0"
                >
                  Broadcast Notice
                </Button>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-dashed border-border bg-card space-y-3">
              <Building2 className="h-8 w-8 mx-auto text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">You have no properties listed.</p>
              <Button asChild size="sm" className="rounded-xl text-xs font-semibold">
                <Link href="/dashboard/properties/new">Post First Property</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
