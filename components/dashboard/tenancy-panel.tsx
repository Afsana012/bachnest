"use client";

import { useState } from "react";
import { Home, FileText, Star, PenTool, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { DigitalAgreementModal } from "./digital-agreement-modal";

export function TenancyPanel({ tenancies, onChanged }: { tenancies: Tenancy[]; onChanged: () => void }) {
  const [agreementFor, setAgreementFor] = useState<string | null>(null);
  const [noticeFor, setNoticeFor] = useState<string | null>(null);
  const [noticeReason, setNoticeReason] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [reviewFor, setReviewFor] = useState<string | null>(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const serveNotice = async (tenancyId: string) => {
    if (!noticeReason.trim() || !moveOutDate) {
      alert("Fill in the reason and move-out date.");
      return;
    }
    setBusy(true);
    const res = await fetchApi<Tenancy>(`/tenancies/${tenancyId}/notice`, {
      method: "PATCH",
      body: JSON.stringify({ notice_reason: noticeReason.trim(), move_out_date: moveOutDate }),
    });
    setBusy(false);
    if (res.success) {
      setNoticeFor(null);
      setNoticeReason("");
      setMoveOutDate("");
      onChanged();
    } else {
      alert(res.message || "Failed to serve notice");
    }
  };

  const submitReview = async (tenancyId: string) => {
    setBusy(true);
    const res = await fetchApi(`/reviews`, {
      method: "POST",
      body: JSON.stringify({ tenancy_id: tenancyId, rating, comment: comment.trim() || undefined }),
    });
    setBusy(false);
    if (res.success) {
      setReviewFor(null);
      setComment("");
      setRating(5);
      alert("Review submitted. It becomes public once the other party reviews too.");
    } else {
      alert(res.message || "Failed to submit review");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Home className="h-5 w-5 text-muted-foreground" /> Rental Agreements
      </h2>
      {tenancies.length > 0 ? (
        <div className="space-y-4">
          {tenancies.map((t) => (
            <div key={t.id} className="p-5 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" /> Agreement #{t.id.slice(0, 8)}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Started {formatDate(t.lease_start_date)} • Rent: {formatMoney(t.agreed_monthly_rent)} • Deposit:{" "}
                    {formatMoney(t.agreed_security_deposit)}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agreement status: {t.agreement_status}
                    {t.digital_agreement_url && (
                      <a href={t.digital_agreement_url} target="_blank" rel="noreferrer" className="ml-2 text-primary hover:underline">
                        View agreement
                      </a>
                    )}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <Button
                    variant={t.agreement_status === "SIGNED" ? "outline" : "default"}
                    size="sm"
                    onClick={() => setAgreementFor(t.id)}
                    className="rounded-xl font-medium"
                  >
                    {t.agreement_status === "SIGNED" ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-1.5 text-emerald-500" />
                        View Agreement
                      </>
                    ) : (
                      <>
                        <PenTool className="h-4 w-4 mr-1.5" />
                        Review & E-Sign
                      </>
                    )}
                  </Button>
                  <StatusBadge status={t.status} />
                  {t.status === "ACTIVE" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setNoticeFor(noticeFor === t.id ? null : t.id)}
                      className="rounded-xl"
                    >
                      Serve Notice
                    </Button>
                  )}
                  {(t.status === "TERMINATED" || t.status === "EVICTED") && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setReviewFor(reviewFor === t.id ? null : t.id)}
                      className="rounded-xl"
                    >
                      <Star className="h-4 w-4 mr-1.5" /> Leave Review
                    </Button>
                  )}
                </div>
              </div>

              {noticeFor === t.id && (
                <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={moveOutDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setMoveOutDate(e.target.value)}
                      className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                    />
                    <input
                      placeholder="Reason for moving out"
                      value={noticeReason}
                      onChange={(e) => setNoticeReason(e.target.value)}
                      className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Notice period for this agreement is {t.notice_period_days} days.
                  </p>
                  <Button size="sm" disabled={busy} onClick={() => serveNotice(t.id)}>
                    Confirm Move-out Notice
                  </Button>
                </div>
              )}

              {reviewFor === t.id && (
                <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button key={star} onClick={() => setRating(star)} type="button">
                        <Star
                          className={`h-6 w-6 ${star <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`}
                        />
                      </button>
                    ))}
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Share your experience with the landlord..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
                  />
                  <Button size="sm" disabled={busy} onClick={() => submitReview(t.id)}>
                    Submit Review
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <Home className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">You have no tenancies yet.</p>
        </div>
      )}

      {agreementFor && (
        <DigitalAgreementModal
          tenancyId={agreementFor}
          isOpen={Boolean(agreementFor)}
          onClose={() => setAgreementFor(null)}
          onSigned={() => {
            onChanged();
          }}
        />
      )}
    </div>
  );
}
