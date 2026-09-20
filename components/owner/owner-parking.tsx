"use client";

import { useState } from "react";
import {
  Bike,
  Car,
  Search,
  Phone,
  Mail,
  Calendar,
  XCircle,
  CheckCircle2,
  ShieldCheck,
  Building2,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { ParkingBooking, Property } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";

interface OwnerParkingProps {
  bookings: ParkingBooking[];
  properties: Property[];
  onChanged: () => void;
  loading?: boolean;
}

export function OwnerParking({
  bookings,
  properties,
  onChanged,
  loading = false,
}: OwnerParkingProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [busyId, setBusyId] = useState<string | null>(null);

  const activeBookings = bookings.filter((b) => b.status === "ACTIVE");
  const activeRevenue = activeBookings.reduce(
    (sum, b) => sum + Number(b.total_amount || 0),
    0
  );

  const filteredBookings = bookings.filter((b) => {
    if (selectedPropertyId !== "ALL") {
      const propId = b.property_id || b.parking_space?.property_id;
      if (propId !== selectedPropertyId) return false;
    }
    if (statusFilter !== "ALL" && b.status !== statusFilter) {
      return false;
    }
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      const reg = (b.vehicle_registration_number || "").toLowerCase();
      const tenant = (b.tenant_name || "").toLowerCase();
      const slot = (
        b.space_number_or_name ||
        b.parking_space?.space_number_or_name ||
        ""
      ).toLowerCase();
      const propTitle = (
        b.property_title ||
        b.parking_space?.property_id ||
        ""
      ).toLowerCase();
      if (
        !reg.includes(term) &&
        !tenant.includes(term) &&
        !slot.includes(term) &&
        !propTitle.includes(term)
      ) {
        return false;
      }
    }
    return true;
  });

  const handleReleaseSlot = async (bookingId: string) => {
    if (
      !confirm(
        "Are you sure you want to cancel this parking pass and mark the slot as vacant?"
      )
    ) {
      return;
    }
    setBusyId(bookingId);
    const res = await fetchApi<ParkingBooking>(
      `/parking/bookings/${bookingId}/cancel`,
      {
        method: "POST",
      }
    );
    setBusyId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to cancel parking pass");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-muted/40 animate-pulse border border-border/50"
            />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-muted/40 animate-pulse border border-border/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <Car className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Total Passes
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {bookings.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Occupied
            </p>
            <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400">
              {activeBookings.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
            <XCircle className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Vacated / Cancelled
            </p>
            <p className="text-2xl font-black tracking-tight text-foreground">
              {bookings.length - activeBookings.length}
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-card shadow-xs flex items-center gap-3.5">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary shrink-0">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Active Revenue
            </p>
            <p className="text-2xl font-black tracking-tight text-primary">
              {formatMoney(activeRevenue)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search reg no, tenant, slot..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-48">
            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              aria-label="Filter by property"
              className="h-10 w-full pl-8 pr-3 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative w-36">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by pass status"
              className="h-10 w-full pl-8 pr-3 rounded-xl border border-input bg-card text-xs font-medium focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="CANCELLED">Cancelled</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center p-6 bg-card/40">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Car className="h-6 w-6" />
          </div>
          <h4 className="font-semibold text-foreground">
            No Parking Passes Found
          </h4>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {searchTerm || selectedPropertyId !== "ALL" || statusFilter !== "ALL"
              ? "No reservations match your search or filter criteria."
              : "No garage or vehicle parking spaces have been reserved yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {filteredBookings.map((pass) => {
            const vType =
              pass.vehicle_type || pass.parking_space?.vehicle_type || "BIKE";
            const slotName =
              pass.space_number_or_name ||
              pass.parking_space?.space_number_or_name ||
              "Parking Slot";
            const propTitle =
              pass.property_title ||
              properties.find(
                (p) =>
                  p.id === pass.property_id ||
                  p.id === pass.parking_space?.property_id
              )?.title ||
              "Building Parking";

            return (
              <div
                key={pass.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5 transition-all hover:border-primary/30"
              >
                {/* Left Section: Slot & Vehicle Details */}
                <div className="space-y-3 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary shrink-0">
                      {vType === "BIKE" ? (
                        <Bike className="h-5 w-5" />
                      ) : (
                        <Car className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-foreground truncate">
                          {slotName}
                        </h4>
                        <StatusBadge status={pass.status} />
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {propTitle}
                      </p>
                    </div>
                  </div>

                  {/* Vehicle Plate Badge */}
                  <div className="flex flex-wrap items-center gap-2 pt-0.5">
                    <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg bg-muted text-foreground border border-border/80">
                      🚗 Plate: {pass.vehicle_registration_number}
                    </span>
                    <span className="text-[11px] text-muted-foreground flex items-center gap-1 font-medium">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {pass.rental_plan} • From {pass.start_date}
                      {pass.end_date ? ` to ${pass.end_date}` : ""}
                    </span>
                  </div>
                </div>

                {/* Middle Section: Tenant Details */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 flex flex-col gap-1.5 text-xs text-muted-foreground shrink-0 min-w-64">
                  <span className="text-[10px] font-bold text-foreground uppercase tracking-wider">
                    Reserved Tenant
                  </span>
                  <p className="font-semibold text-foreground text-sm">
                    {pass.tenant_name || "Bachelor Tenant"}
                  </p>
                  {pass.tenant_phone && (
                    <a
                      href={`tel:${pass.tenant_phone}`}
                      className="flex items-center gap-1.5 text-primary hover:underline font-medium"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {pass.tenant_phone}
                    </a>
                  )}
                  {pass.tenant_email && (
                    <span className="flex items-center gap-1.5 truncate text-[11px]">
                      <Mail className="h-3.5 w-3.5" />
                      {pass.tenant_email}
                    </span>
                  )}
                </div>

                {/* Right Section: Fee & Actions */}
                <div className="flex items-center justify-between lg:justify-end gap-5 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-border/60">
                  <div className="text-left lg:text-right">
                    <p className="text-xs text-muted-foreground">Rental Fee</p>
                    <p className="text-xl font-black text-foreground">
                      {formatMoney(pass.total_amount)}
                    </p>
                  </div>

                  {pass.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={busyId === pass.id}
                      onClick={() => handleReleaseSlot(pass.id)}
                      className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive text-xs border-destructive/20 font-semibold"
                    >
                      <XCircle className="h-3.5 w-3.5 mr-1" />
                      Release Slot
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
