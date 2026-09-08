"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, AlertCircle, Eye, CalendarCheck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Booking } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export function BookingRequests({ bookings, onChanged }: { bookings: Booking[]; onChanged: () => void }) {
  const [decidingId, setDecidingId] = useState<string | null>(null);
  const [rejectPromptId, setRejectPromptId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [busy, setBusy] = useState(false);

  const approve = async (bookingId: string) => {
    setBusy(true);
    setDecidingId(bookingId);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/decision`, {
      method: "PATCH",
      body: JSON.stringify({ decision: "APPROVE" }),
    });
    setBusy(false);
    setDecidingId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to approve booking");
    }
  };

  const confirmVisit = async (bookingId: string) => {
    setBusy(true);
    setDecidingId(bookingId);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/visit-confirm`, {
      method: "PATCH",
    });
    setBusy(false);
    setDecidingId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to confirm visit date");
    }
  };

  const markVisited = async (bookingId: string) => {
    setBusy(true);
    setDecidingId(bookingId);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/mark-visited`, {
      method: "PATCH",
    });
    setBusy(false);
    setDecidingId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to mark as visited");
    }
  };

  const openRejectPrompt = (bookingId: string) => {
    setRejectPromptId(bookingId);
    setRejectReason("");
  };

  const dismissRejectPrompt = () => {
    setRejectPromptId(null);
    setRejectReason("");
  };

  const confirmReject = async (bookingId: string) => {
    if (!rejectReason.trim()) return;
    setBusy(true);
    setDecidingId(bookingId);
    const res = await fetchApi<Booking>(`/bookings/${bookingId}/decision`, {
      method: "PATCH",
      body: JSON.stringify({ decision: "REJECT", reason: rejectReason.trim() }),
    });
    setBusy(false);
    setDecidingId(null);
    if (res.success) {
      dismissRejectPrompt();
      onChanged();
    } else {
      alert(res.message || "Failed to reject booking");
    }
  };

  return (
    <div className="space-y-4">
      {bookings.length > 0 ? (
        bookings.map((booking) => (
          <div key={booking.id} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground">Tenant #{booking.tenant_id.slice(0, 8)}</h4>
                  {booking.preferred_visit_date && (
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center gap-1">
                      <Eye className="h-3 w-3" /> Visit Requested
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Wants to move in {formatDate(booking.requested_move_in_date)} · Token:{" "}
                  {formatMoney(booking.token_deposit_amount)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Room #{booking.room_id.slice(0, 8)}
                  {booking.seat_id ? ` · Seat #${booking.seat_id.slice(0, 8)}` : ""} · Requested{" "}
                  {formatDate(booking.created_at)}
                </p>
                {booking.owner_remarks && (
                  <p className="text-xs text-muted-foreground mt-1">Your remarks: {booking.owner_remarks}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <StatusBadge status={booking.booking_status} />
                {booking.booking_status === "REQUESTED" && rejectPromptId !== booking.id && (
                  <div className="flex flex-wrap gap-2">
                    {booking.preferred_visit_date && booking.visit_status === "SCHEDULED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy && decidingId === booking.id}
                        className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-950/30"
                        onClick={() => confirmVisit(booking.id)}
                      >
                        <CalendarCheck className="h-4 w-4 mr-1.5" />
                        Confirm Visit Date
                      </Button>
                    )}
                    {booking.preferred_visit_date && booking.visit_status === "CONFIRMED" && (
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={busy && decidingId === booking.id}
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/30"
                        onClick={() => markVisited(booking.id)}
                      >
                        <CheckCircle2 className="h-4 w-4 mr-1.5" />
                        Mark as Visited
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy && decidingId === booking.id}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
                      onClick={() => approve(booking.id)}
                    >
                      <CheckCircle2 className="h-4 w-4 mr-1.5" />
                      {busy && decidingId === booking.id ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={busy && decidingId === booking.id}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => openRejectPrompt(booking.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1.5" /> Reject
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {booking.preferred_visit_date && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border/50 text-xs flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  <span className="font-semibold">Inspection Appointment:</span>
                  <span>{formatDate(booking.preferred_visit_date)}</span>
                  {booking.visit_time_slot && (
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3 inline" /> {booking.visit_time_slot}
                    </span>
                  )}
                  {booking.visit_notes && (
                    <span className="text-muted-foreground italic"> — &ldquo;{booking.visit_notes}&rdquo;</span>
                  )}
                </div>
                <span
                  className={`px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                    booking.visit_status === "COMPLETED"
                      ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/30"
                      : booking.visit_status === "CONFIRMED"
                        ? "bg-blue-500/10 text-blue-600 border border-blue-500/30"
                        : "bg-amber-500/10 text-amber-600 border border-amber-500/30"
                  }`}
                >
                  {booking.visit_status === "COMPLETED"
                    ? "Tenant Visited"
                    : booking.visit_status === "CONFIRMED"
                      ? "Visit Confirmed"
                      : "Awaiting Your Confirmation"}
                </span>
              </div>
            )}

            {rejectPromptId === booking.id && (
              <div className="pt-3 border-t border-border/60 space-y-3">
                <div className="flex items-start gap-2 text-xs text-amber-600 dark:text-amber-400">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Provide a reason for rejection — the tenant will see this message.</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="E.g. Room no longer available, existing tenant extended stay..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={busy || !rejectReason.trim()}
                    onClick={() => confirmReject(booking.id)}
                  >
                    {busy && decidingId === booking.id ? "Rejecting..." : "Confirm Rejection"}
                  </Button>
                  <Button size="sm" variant="ghost" disabled={busy} onClick={dismissRejectPrompt}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
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
