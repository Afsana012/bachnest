"use client";

import { useState } from "react";
import Link from "next/link";
import { CalendarCheck, XCircle, AlertCircle, Eye, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Booking } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { AdvancePaymentModal } from "./advance-payment-modal";

const CANCELLABLE = new Set(["REQUESTED", "APPROVED_BY_OWNER"]);

export function BookingPanel({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [cancelPromptId, setCancelPromptId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [payingAdvanceBooking, setPayingAdvanceBooking] = useState<Booking | null>(null);

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

  const markVisited = async (bookingId: string) => {
    setBusy(true);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/mark-visited`, { method: "PATCH" });
    setBusy(false);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to update visit status");
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
                  {(b.visit_status === "COMPLETED" || b.booking_status === "APPROVED_BY_OWNER") &&
                    b.booking_status !== "DEPOSIT_PAID" &&
                    b.booking_status !== "CANCELLED" &&
                    b.booking_status !== "REJECTED" && (
                      <Button
                        size="sm"
                        onClick={() => setPayingAdvanceBooking(b)}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs"
                      >
                        <CreditCard className="h-4 w-4 mr-1.5" /> Pay Advance
                      </Button>
                    )}
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

              {b.preferred_visit_date && (
                <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <span className="font-semibold">Visit Inspection:</span>
                    <span>{formatDate(b.preferred_visit_date)}</span>
                    {b.visit_time_slot && <span className="text-muted-foreground">({b.visit_time_slot})</span>}
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        b.visit_status === "COMPLETED"
                          ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                          : b.visit_status === "CONFIRMED"
                            ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                            : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                      }`}
                    >
                      {b.visit_status === "COMPLETED"
                        ? "Visited & Inspected"
                        : b.visit_status === "CONFIRMED"
                          ? "Visit Confirmed"
                          : "Visit Requested"}
                    </span>
                    {b.visit_status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy}
                        onClick={() => markVisited(b.id)}
                        className="h-7 text-xs rounded-lg"
                      >
                        <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                        Mark as Visited
                      </Button>
                    )}
                  </div>
                </div>
              )}

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
          <p className="text-sm font-medium text-foreground">No booking requests found</p>
          <p className="text-xs text-muted-foreground mt-1">Explore verified rooms across Dhaka and send a request.</p>
          <Button asChild className="mt-4 rounded-xl" size="sm">
            <Link href="/properties">Find Accommodations</Link>
          </Button>
        </div>
      )}

      {payingAdvanceBooking && (
        <AdvancePaymentModal
          booking={payingAdvanceBooking}
          isOpen={true}
          onClose={() => setPayingAdvanceBooking(null)}
          onSuccess={() => {
            setPayingAdvanceBooking(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
