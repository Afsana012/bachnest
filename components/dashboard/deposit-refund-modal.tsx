"use client";

import { useState } from "react";
import { X, ShieldCheck, CreditCard, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { formatMoney } from "@/lib/format";
import { Tenancy, DepositClaimOut } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface DepositRefundModalProps {
  tenancy: Tenancy;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (claim: DepositClaimOut) => void;
}

export function DepositRefundModal({
  tenancy,
  isOpen,
  onClose,
  onSuccess,
}: DepositRefundModalProps) {
  const [payoutMethod, setPayoutMethod] = useState<"BKASH" | "NAGAD" | "BANK_TRANSFER">("BKASH");
  const [payoutAccount, setPayoutAccount] = useState("");
  const [moveOutDate, setMoveOutDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const depositAmount = tenancy.agreed_security_deposit || 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!payoutAccount.trim()) {
      setError("Please provide your recipient mobile number or bank account number.");
      return;
    }
    if (!moveOutDate) {
      setError("Please specify your expected move-out and key handover date.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi<DepositClaimOut>("/deposits/claims", {
        method: "POST",
        body: JSON.stringify({
          tenancy_id: tenancy.id,
          tenant_payout_method: payoutMethod,
          tenant_payout_account: payoutAccount.trim(),
          move_out_date: moveOutDate,
          tenant_notes: notes.trim() || undefined,
        }),
      });
      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "Failed to submit deposit refund request.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit deposit refund request.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Move-Out Deposit Refund</h2>
            <p className="text-xs text-muted-foreground">Slide 23 Escrow & Transparent Handover Settlement</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Deposit Summary Card */}
        <div className="mb-6 rounded-xl border border-primary/20 bg-primary/5 p-4 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agreed Security Deposit</span>
            <p className="text-2xl font-black text-primary">{formatMoney(depositAmount)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-muted-foreground block">Agreement Reference</span>
            <span className="text-sm font-semibold text-foreground font-mono block">
              #{tenancy.id.slice(0, 8)}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Payout Channel
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["BKASH", "NAGAD", "BANK_TRANSFER"] as const).map((method) => (
                <button
                  type="button"
                  key={method}
                  onClick={() => setPayoutMethod(method)}
                  className={`rounded-lg border py-2.5 px-3 text-xs font-semibold transition-all text-center ${
                    payoutMethod === method
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-background hover:bg-muted text-muted-foreground"
                  }`}
                >
                  {method === "BANK_TRANSFER" ? "Bank Transfer" : method}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {payoutMethod === "BANK_TRANSFER" ? "Bank Account Details (Bank, A/C No, Branch)" : `${payoutMethod} Mobile Number`}
            </label>
            <div className="relative">
              <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                required
                placeholder={payoutMethod === "BANK_TRANSFER" ? "e.g. City Bank, A/C: 123456789, Dhanmondi Branch" : "e.g. 017XXXXXXXX (Personal)"}
                value={payoutAccount}
                onChange={(e) => setPayoutAccount(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Expected Move-Out & Key Handover Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <input
                type="date"
                required
                value={moveOutDate}
                onChange={(e) => setMoveOutDate(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Handover Remarks / Meter Readings (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Sub-meter electric reading 412. All room keys and parking remote ready for handover."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-none"
            />
          </div>

          <div className="rounded-lg bg-muted/40 p-3 text-[11px] text-muted-foreground leading-relaxed border border-border/50">
            <strong>Clearance Process:</strong> Upon submission, your landlord will schedule the physical handover inspection. Any legitimate deductions (utility bills, agreed repairs) will be transparently itemized before final disbursement.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
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
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit Refund Claim
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
