"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Booking } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

const CANCELLABLE = new Set(["REQUESTED", "APPROVED_BY_OWNER"]);

export function BookingPanel({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const cancelBooking = async (bookingId: string) => {
    setCancellingId(bookingId);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/cancel?reason=${encodeURIComponent("Changed plans")}`, {
      method: "POST",
    });
    setCancellingId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to cancel booking");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <CalendarCheck className="h-5 w-5 text-muted-foreground" /> Booking Requests
      </h2>
      {bookings.length > 0 ? (
        <div className="space-y-4">
          {bookings.map((b) => (
            <div key={b.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground">Booking #{b.id.slice(0, 8)}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Requested move-in: {formatDate(b.requested_move_in_date)} • Token deposit:{" "}
                  {formatMoney(b.token_deposit_amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Submitted {formatDate(b.created_at)}</p>
                {b.owner_remarks && <p className="text-xs text-muted-foreground mt-1">Owner remarks: {b.owner_remarks}</p>}
                {b.cancellation_reason && (
                  <p className="text-xs text-destructive mt-1">Cancelled: {b.cancellation_reason}</p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={b.booking_status} />
                {CANCELLABLE.has(b.booking_status) && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={cancellingId === b.id}
                    onClick={() => cancelBooking(b.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <XCircle className="h-4 w-4 mr-1.5" />
                    {cancellingId === b.id ? "Cancelling..." : "Cancel"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <CalendarCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            No booking requests yet.{" "}
            <Link href="/properties" className="text-primary hover:underline">
              Browse properties
            </Link>{" "}
            to get started.
          </p>
        </div>
      )}
    </div>
  );
}
