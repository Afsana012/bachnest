"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bike, Car, Calendar, ShieldCheck, XCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { ParkingBooking } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatMoney } from "@/lib/format";

export function ParkingPanel() {
  const [passes, setPasses] = useState<ParkingBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadPasses = async () => {
    setLoading(true);
    const res = await fetchApi<ParkingBooking[]>("/parking/me");
    if (res.success && res.data) {
      setPasses(res.data);
    } else {
      setPasses([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    const t = setTimeout(loadPasses, 0);
    return () => clearTimeout(t);
  }, []);

  const handleCancelPass = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this parking pass?")) return;
    setBusyId(bookingId);
    const res = await fetchApi<ParkingBooking>(`/parking/bookings/${bookingId}/cancel`, {
      method: "POST",
    });
    setBusyId(null);
    if (res.success) {
      loadPasses();
    } else {
      alert(res.message || "Failed to cancel parking pass");
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-32 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
        ))}
      </div>
    );
  }

  if (passes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-12 text-center p-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <Car className="h-6 w-6" />
        </div>
        <h4 className="font-semibold text-foreground">No Parking Passes Found</h4>
        <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-4">
          You don&apos;t have any active motorcycle or car parking spaces reserved yet.
        </p>
        <Button asChild className="rounded-xl">
          <Link href="/parking">
            <Plus className="h-4 w-4 mr-1.5" />
            Explore & Book Parking
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Active and historical vehicle parking reservations.</p>
        <Button variant="outline" size="sm" asChild className="rounded-xl">
          <Link href="/parking">
            <Plus className="h-4 w-4 mr-1.5" />
            Book Another Slot
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {passes.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-2xl border border-border bg-card shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  {item.parking_space?.vehicle_type === "BIKE" ? (
                    <Bike className="h-4 w-4" />
                  ) : (
                    <Car className="h-4 w-4" />
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-foreground">
                    {item.parking_space?.space_number_or_name ?? "Parking Slot"}
                  </h4>
                  <p className="text-xs text-muted-foreground font-mono font-medium">
                    Reg: {item.vehicle_registration_number}
                  </p>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground pt-1">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-primary" />
                  Plan: {item.rental_plan}
                </span>
                <span>• From: {item.start_date}</span>
                {item.end_date && <span>• To: {item.end_date}</span>}
                {item.parking_space?.is_covered && (
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" /> Covered Garage
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-border/60">
              <div className="text-left md:text-right">
                <p className="text-xs text-muted-foreground">Total Paid</p>
                <p className="text-lg font-extrabold text-foreground">{formatMoney(item.total_amount)}</p>
              </div>

              {item.status === "ACTIVE" && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={busyId === item.id}
                  onClick={() => handleCancelPass(item.id)}
                  className="rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive text-xs"
                >
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Cancel Pass
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
