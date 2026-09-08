"use client";

import { useState } from "react";
import { X, Plus, Trash2, CheckCircle2, AlertCircle, Receipt, Loader2 } from "lucide-react";
import { formatMoney, toNumber } from "@/lib/format";
import { DepositClaimOut, DepositDeductionItem } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface DepositSettlementModalProps {
  claim: DepositClaimOut;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedClaim: DepositClaimOut) => void;
}

export function DepositSettlementModal({
  claim,
  isOpen,
  onClose,
  onSuccess,
}: DepositSettlementModalProps) {
  const [deductions, setDeductions] = useState<DepositDeductionItem[]>(
    claim.deduction_breakdown && claim.deduction_breakdown.length > 0
      ? claim.deduction_breakdown
      : []
  );
  const [newReason, setNewReason] = useState("");
  const [newAmount, setNewAmount] = useState("");
  const [transactionRef, setTransactionRef] = useState(claim.transaction_reference || "");
  const [remarks, setRemarks] = useState(claim.landlord_remarks || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const totalDeposit = toNumber(claim.total_deposit_amount);
  const totalDeductions = deductions.reduce((sum, item) => sum + toNumber(item.amount), 0);
  const netRefund = Math.max(0, totalDeposit - totalDeductions);

  function handleAddDeduction() {
    if (!newReason.trim()) {
      setError("Please describe the deduction reason.");
      return;
    }
    const amt = parseFloat(newAmount);
    if (isNaN(amt) || amt <= 0) {
      setError("Deduction amount must be a positive number.");
      return;
    }
    if (totalDeductions + amt > totalDeposit) {
      setError("Total deductions cannot exceed the initial security deposit.");
      return;
    }

    setError(null);
    setDeductions([...deductions, { reason: newReason.trim(), amount: amt }]);
    setNewReason("");
    setNewAmount("");
  }

  function handleRemoveDeduction(index: number) {
    setDeductions(deductions.filter((_, i) => i !== index));
  }

  async function handleSettle(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (netRefund > 0 && !transactionRef.trim()) {
      setError("Please enter the disbursement transaction reference (e.g. bKash TrxID or Bank Voucher No).");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi<DepositClaimOut>(`/deposits/claims/${claim.id}/settle`, {
        method: "POST",
        body: JSON.stringify({
          deductions,
          transaction_reference: transactionRef.trim() || undefined,
          landlord_remarks: remarks.trim() || undefined,
        }),
      });
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "Failed to settle deposit refund.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to settle deposit refund.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-2xl bg-card border border-border shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <Receipt className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Move-Out Inspection & Settlement</h2>
            <p className="text-xs text-muted-foreground">Itemized Security Deposit Reconciliation & Discharge</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Tenant Payout Channel Banner */}
        <div className="mb-6 rounded-xl border border-border bg-muted/40 p-4 grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-muted-foreground block font-medium">Tenant Payout Channel</span>
            <span className="font-semibold text-foreground text-sm block mt-0.5">
              {claim.tenant_payout_method}: {claim.tenant_payout_account}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground block font-medium">Target Handover Date</span>
            <span className="font-semibold text-foreground text-sm block mt-0.5">
              {claim.move_out_date}
            </span>
          </div>
          {claim.tenant_notes && (
            <div className="col-span-2 pt-2 border-t border-border/50">
              <span className="text-muted-foreground font-medium">Tenant Handover Notes: </span>
              <span className="text-foreground">{claim.tenant_notes}</span>
            </div>
          )}
        </div>

        {/* Live Calculation Bar */}
        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-border bg-background p-3">
            <span className="text-[11px] text-muted-foreground uppercase font-semibold">Agreed Deposit</span>
            <p className="text-lg font-bold text-foreground mt-0.5">{formatMoney(totalDeposit)}</p>
          </div>
          <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-3">
            <span className="text-[11px] text-destructive uppercase font-semibold">Itemized Deductions</span>
            <p className="text-lg font-bold text-destructive mt-0.5">-{formatMoney(totalDeductions)}</p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3">
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">Net Refund</span>
            <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">{formatMoney(netRefund)}</p>
          </div>
        </div>

        <form onSubmit={handleSettle} className="space-y-5">
          {/* Deductions Builder */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Itemized Handover Deductions (Repairs, Utilities, Arrears)
            </label>

            {deductions.length > 0 && (
              <div className="space-y-2 mb-3">
                {deductions.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2 text-xs"
                  >
                    <div>
                      <span className="font-semibold text-foreground">{item.reason}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-destructive">-{formatMoney(item.amount)}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveDeduction(idx)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                        title="Remove deduction"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Deduction reason (e.g. Unpaid DESCO electric bill, broken tap)"
                value={newReason}
                onChange={(e) => setNewReason(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <input
                type="number"
                placeholder="Amount (৳)"
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-28 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddDeduction}
                className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Item
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Disbursement Transaction Reference (bKash / Nagad / Bank Trx ID)
            </label>
            <input
              type="text"
              placeholder="e.g. 9JA7BK2981 or CASH-HANDOVER-SIGN"
              value={transactionRef}
              onChange={(e) => setTransactionRef(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Inspection Findings & Remarks (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Keys handed over. Room inspected and approved with electricity bill settlement."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Confirm Settlement & Issue Clearance
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
