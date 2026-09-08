"use client";

import { useEffect, useState } from "react";
import { Home, FileText, Star, PenTool, CheckCircle2, ShieldCheck, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tenancy, DepositClaimOut } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { DigitalAgreementModal } from "./digital-agreement-modal";
import { DepositRefundModal } from "./deposit-refund-modal";
import { DepositClearanceVoucherModal } from "@/components/shared/deposit-clearance-voucher-modal";
import { ReviewSubmissionModal } from "@/components/shared/review-submission-modal";
import { DMPVerificationModal } from "@/components/shared/dmp-verification-modal";

export function TenancyPanel({ tenancies, onChanged }: { tenancies: Tenancy[]; onChanged: () => void }) {
  const [agreementFor, setAgreementFor] = useState<string | null>(null);
  const [noticeFor, setNoticeFor] = useState<string | null>(null);
  const [noticeReason, setNoticeReason] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [reviewingTenancy, setReviewingTenancy] = useState<Tenancy | null>(null);
  const [dmpTenancyId, setDmpTenancyId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [depositClaimFor, setDepositClaimFor] = useState<Tenancy | null>(null);
  const [voucherClaim, setVoucherClaim] = useState<DepositClaimOut | null>(null);
  const [claimsMap, setClaimsMap] = useState<Record<string, DepositClaimOut>>({});

  useEffect(() => {
    async function loadClaims() {
      try {
        const res = await fetchApi<DepositClaimOut[]>("/deposits/claims/me");
        if (res.success && Array.isArray(res.data)) {
          const map: Record<string, DepositClaimOut> = {};
          res.data.forEach((c) => {
            map[c.tenancy_id] = c;
          });
          setClaimsMap(map);
        }
      } catch {
        // Fallback silently if unauthenticated
      }
    }
    loadClaims();
  }, [tenancies]);

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

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Home className="h-5 w-5 text-muted-foreground" /> Rental Agreements
      </h2>
      {tenancies.length > 0 ? (
        <div className="space-y-4">
          {tenancies.map((t) => {
            const claim = claimsMap[t.id];

            return (
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

                    {claim ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setVoucherClaim(claim)}
                        className={`rounded-xl font-medium ${
                          claim.status === "SETTLED"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
                        }`}
                      >
                        <Receipt className="h-4 w-4 mr-1.5" />
                        Clearance Voucher ({claim.status})
                      </Button>
                    ) : (
                      (t.status === "ACTIVE" || t.status === "NOTICE_SERVED") && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setDepositClaimFor(t)}
                          className="rounded-xl font-medium border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <ShieldCheck className="h-4 w-4 mr-1.5" />
                          Claim Deposit Refund
                        </Button>
                      )
                    )}

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

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setDmpTenancyId(t.id)}
                      className="rounded-xl font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                    >
                      <ShieldCheck className="h-4 w-4 mr-1.5" />
                      DMP Police Form
                    </Button>

                    {(t.status === "TERMINATED" || t.status === "EVICTED" || claim?.status === "SETTLED") && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setReviewingTenancy(t)}
                        className="rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                      >
                        <Star className="h-4 w-4 mr-1.5 fill-amber-500 text-amber-500" />
                        Leave Trust Rating
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
              </div>
            );
          })}
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

      {depositClaimFor && (
        <DepositRefundModal
          tenancy={depositClaimFor}
          isOpen={Boolean(depositClaimFor)}
          onClose={() => setDepositClaimFor(null)}
          onSuccess={(claim) => {
            setClaimsMap((prev) => ({ ...prev, [claim.tenancy_id]: claim }));
            onChanged();
          }}
        />
      )}

      {voucherClaim && (
        <DepositClearanceVoucherModal
          claim={voucherClaim}
          isOpen={Boolean(voucherClaim)}
          onClose={() => setVoucherClaim(null)}
        />
      )}

      {reviewingTenancy && (
        <ReviewSubmissionModal
          tenancy={reviewingTenancy}
          isOpen={Boolean(reviewingTenancy)}
          onClose={() => setReviewingTenancy(null)}
          onSuccess={() => {
            setReviewingTenancy(null);
            onChanged();
          }}
        />
      )}

      {dmpTenancyId && (
        <DMPVerificationModal
          tenancyId={dmpTenancyId}
          isOpen={Boolean(dmpTenancyId)}
          onClose={() => setDmpTenancyId(null)}
        />
      )}
    </div>
  );
}
