"use client";

import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Booking } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export function BookingRequests({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  const [decidingId, setDecidingId] = useState<string | null>(null);

  const decide = async (bookingId: string, decision: "APPROVE" | "REJECT") => {
    setDecidingId(bookingId);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/decision`, {
      method: "PATCH",
      body: JSON.stringify({
        decision,
        reason: decision === "REJECT" ? "Room no longer available" : undefined,
      }),
    });
    setDecidingId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to record decision");
    }
  };

  return (
    <div className="space-y-4">
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">Tenant #{booking.tenant_id.slice(0, 8)}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Wants to move in {formatDate(booking.requested_move_in_date)} • Token:{" "}
                {formatMoney(booking.token_deposit_amount)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Room #{booking.room_id.slice(0, 8)}
                {booking.seat_id ? ` • Seat #${booking.seat_id.slice(0, 8)}` : ""} • Requested{" "}
                {formatDate(booking.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={booking.booking_status} />
              {booking.booking_status === "REQUESTED" && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={decidingId === booking.id}
                    className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => decide(booking.id, "APPROVE")}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={decidingId === booking.id}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => decide(booking.id, "REJECT")}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </div>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">No booking requests yet. Publish your property to attract tenants.</p>
        </div>
      )}
    </div>
  );
}
