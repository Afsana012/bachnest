"use client";

import { useEffect, useState } from "react";
import { FileText, SquareOff, ShieldAlert, CheckCircle2, Receipt, Star, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tenancy, DepositClaimOut } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";
import { DepositSettlementModal } from "./deposit-settlement-modal";
import { DepositClearanceVoucherModal } from "@/components/shared/deposit-clearance-voucher-modal";
import { ReviewSubmissionModal } from "@/components/shared/review-submission-modal";
import { DMPVerificationModal } from "@/components/shared/dmp-verification-modal";

export function OwnerTenancies({ tenancies, onChanged }: { tenancies: Tenancy[]; onChanged: () => void }) {
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [settlingClaim, setSettlingClaim] = useState<DepositClaimOut | null>(null);
  const [voucherClaim, setVoucherClaim] = useState<DepositClaimOut | null>(null);
  const [reviewingTenancy, setReviewingTenancy] = useState<Tenancy | null>(null);
  const [dmpTenancyId, setDmpTenancyId] = useState<string | null>(null);
  const [claimsMap, setClaimsMap] = useState<Record<string, DepositClaimOut>>({});

  useEffect(() => {
    async function loadOwnerClaims() {
      try {
        const res = await fetchApi<DepositClaimOut[]>("/deposits/claims/owner");
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
    loadOwnerClaims();
  }, [tenancies]);

  const terminate = async (tenancyId: string) => {
    if (!confirm("Terminate this tenancy? The room/seat becomes available again.")) return;
    setTerminatingId(tenancyId);
    const res = await fetchApi<Tenancy>(`/tenancies/${tenancyId}/terminate`, { method: "PATCH" });
    setTerminatingId(null);
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to terminate tenancy");
    }
  };

  return (
    <div className="space-y-4">
      {tenancies.length > 0 ? (
        tenancies.map((tenancy) => {
          const claim = claimsMap[tenancy.id];

          return (
            <div key={tenancy.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  Tenant #{tenancy.tenant_id.slice(0, 8)}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Started {formatDate(tenancy.lease_start_date)} • {formatMoney(tenancy.agreed_monthly_rent)}/mo • Deposit{" "}
                  {formatMoney(tenancy.agreed_security_deposit)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Agreement: {tenancy.agreement_status}
                  {tenancy.lease_end_date ? ` • Ends ${formatDate(tenancy.lease_end_date)}` : ""}
                </p>
                {claim && (
                  <div className="mt-2 inline-flex items-center gap-2 rounded-lg bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-xs">
                    <ShieldAlert className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-amber-700 dark:text-amber-300">
                      Deposit Claim: {claim.status} ({claim.tenant_payout_method})
                    </span>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2.5">
                <StatusBadge status={tenancy.status} />

                {claim && claim.status !== "SETTLED" && (
                  <Button
                    size="sm"
                    onClick={() => setSettlingClaim(claim)}
                    className="rounded-xl font-medium bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Receipt className="h-4 w-4 mr-1.5" />
                    Inspect & Settle Deposit
                  </Button>
                )}

                {claim && claim.status === "SETTLED" && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setVoucherClaim(claim)}
                    className="rounded-xl font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" />
                    Clearance Voucher
                  </Button>
                )}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setDmpTenancyId(tenancy.id)}
                  className="rounded-xl font-medium border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10"
                >
                  <ShieldCheck className="h-4 w-4 mr-1.5" />
                  DMP Police Form
                </Button>

                {(tenancy.status === "TERMINATED" || claim?.status === "SETTLED") && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setReviewingTenancy(tenancy)}
                    className="rounded-xl border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                  >
                    <Star className="h-4 w-4 mr-1.5 fill-amber-500 text-amber-500" />
                    Rate Tenant
                  </Button>
                )}

                {(tenancy.status === "ACTIVE" || tenancy.status === "NOTICE_SERVED") && (
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={terminatingId === tenancy.id}
                    onClick={() => terminate(tenancy.id)}
                    className="rounded-xl text-destructive hover:text-destructive"
                  >
                    <SquareOff className="h-4 w-4 mr-1.5" />
                    {terminatingId === tenancy.id ? "Terminating..." : "Terminate"}
                  </Button>
                )}
              </div>
            </div>
          );
        })
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No tenancies yet. Approve a booking request to create one — the tenancy starts once the tenant signs the
            agreement.
          </p>
        </div>
      )}

      {settlingClaim && (
        <DepositSettlementModal
          claim={settlingClaim}
          isOpen={Boolean(settlingClaim)}
          onClose={() => setSettlingClaim(null)}
          onSuccess={(settled) => {
            setClaimsMap((prev) => ({ ...prev, [settled.tenancy_id]: settled }));
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
