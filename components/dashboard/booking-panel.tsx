"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, XCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Booking } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

const CANCELLABLE = new Set(["REQUESTED", "APPROVED_BY_OWNER"]);

export function BookingPanel({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);

  const openCancelPrompt = (bookingId: string) => {
    setCancelPromptId(bookingId);
    setCancelReason("");
  };

  const dismissCancelPrompt = () => {
    setCancelPromptId(null);
    setCancelReason("");
  };

  const confirmCancel = async (bookingId: string) => {
    if (!cancelReason.trim()) return;
    setBusy(true);
    setCancellingId(bookingId);
    const res = await fetchApi<Booking>(
      `/bookings/${bookingId}/cancel?reason=${encodeURIComponent(cancelReason.trim())}`,
      { method: "POST" }
    );
    setBusy(false);
    setCancellingId(null);
    if (res.success) {
      dismissCancelPrompt();
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
            <div key={b.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-foreground">Booking #{b.id.slice(0, 8)}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Requested move-in: {formatDate(b.requested_move_in_date)} · Token deposit:{" "}
                    {formatMoney(b.token_deposit_amount)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Submitted {formatDate(b.created_at)}</p>
                  {b.owner_remarks && (
                    <p className="text-xs text-muted-foreground mt-1">Owner remarks: {b.owner_remarks}</p>
                  )}
                  {b.cancellation_reason && (
                    <p className="text-xs text-destructive mt-1">Cancelled: {b.cancellation_reason}</p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <StatusBadge status={b.booking_status} />
                  {CANCELLABLE.has(b.booking_status) && cancelPromptId !== b.id && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openCancelPrompt(b.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <XCircle className="h-4 w-4 mr-1.5" /> Cancel
                    </Button>
                  )}
                </div>
              </div>

              {cancelPromptId === b.id && (
                <div className="pt-3 border-t border-border/60 space-y-3">
                  <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>Please provide a reason for cancelling this booking request.</span>
                  </div>
                  <textarea
                    rows={2}
                    placeholder="E.g. Found another place, plans changed, budget constraints..."
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={busy || !cancelReason.trim()}
                      onClick={() => confirmCancel(b.id)}
                    >
                      {cancellingId === b.id ? "Cancelling..." : "Confirm Cancellation"}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={busy} onClick={dismissCancelPrompt}>
                      Keep Booking
                    </Button>
                  </div>
                </div>
              )}
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
