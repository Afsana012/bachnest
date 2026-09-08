"use client";

import { X, Download, Printer, CheckCircle2, ShieldCheck } from "lucide-react";
import { formatMoney, formatDate, toNumber } from "@/lib/format";
import { DepositClaimOut } from "@/lib/types";
import { downloadDepositClearancePdf } from "@/lib/deposit-pdf";

interface DepositClearanceVoucherModalProps {
  claim: DepositClaimOut;
  isOpen: boolean;
  onClose: () => void;
}

export function DepositClearanceVoucherModal({
  claim,
  isOpen,
  onClose,
}: DepositClearanceVoucherModalProps) {
  if (!isOpen) return null;

  const isSettled = claim.status === "SETTLED";
  const totalDeposit = toNumber(claim.total_deposit_amount);
  const totalDeductions = toNumber(claim.deduction_amount);
  const netRefund = toNumber(claim.net_refund_amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Header Accent */}
        <div className="rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 p-5 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary">BachNest Platform · Slide 23</span>
                <h2 className="text-xl font-black tracking-tight text-foreground">
                  Security Deposit Clearance Voucher
                </h2>
              </div>
            </div>

            <div className="inline-flex items-center gap-1.5 self-start sm:self-auto rounded-full px-3 py-1 text-xs font-bold border bg-card shadow-xs">
              {isSettled ? (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">SETTLED & DISCHARGED</span>
                </>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">{claim.status}</span>
              )}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs border-t border-border/50 pt-3 text-muted-foreground">
            <div>
              <span>Voucher Ref: </span>
              <span className="font-mono font-semibold text-foreground">#{claim.id.slice(0, 10).toUpperCase()}</span>
            </div>
            <div>
              <span>Move-Out Date: </span>
              <span className="font-semibold text-foreground">{formatDate(claim.move_out_date)}</span>
            </div>
            {claim.settled_at && (
              <div>
                <span>Settled At: </span>
                <span className="font-semibold text-foreground">{formatDate(claim.settled_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Parties Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-xs">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Tenant Particulars
            </span>
            <p className="font-bold text-sm text-foreground">{claim.tenant_name || "Enrolled Bachelor"}</p>
            <p className="text-muted-foreground mt-0.5">
              Payout Channel: <span className="text-foreground font-medium">{claim.tenant_payout_method} ({claim.tenant_payout_account})</span>
            </p>
            {claim.transaction_reference && (
              <p className="text-muted-foreground mt-0.5">
                Trx Ref: <span className="font-mono text-foreground font-semibold">{claim.transaction_reference}</span>
              </p>
            )}
          </div>

          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
              Premises & Owner
            </span>
            <p className="font-bold text-sm text-foreground">{claim.property_title || "Residential Flat"}</p>
            {claim.room_name && (
              <p className="text-muted-foreground mt-0.5">Room: {claim.room_name}</p>
            )}
            <p className="text-muted-foreground mt-0.5">
              Owner: <span className="text-foreground font-medium">{claim.owner_name || "Registered Landlord"}</span>
            </p>
          </div>
        </div>

        {/* Financial Settlement Breakdown */}
        <div className="rounded-xl border border-border bg-card p-4 mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
            Financial Reconciliation
          </h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-1 border-b border-border/50 text-xs">
              <span className="text-muted-foreground">Original Security Deposit Received</span>
              <span className="font-bold text-foreground">{formatMoney(totalDeposit)}</span>
            </div>

            {claim.deduction_breakdown && claim.deduction_breakdown.length > 0 ? (
              <div className="py-2 space-y-1.5">
                <span className="text-xs font-semibold text-muted-foreground block">
                  Itemized Handover Deductions:
                </span>
                {claim.deduction_breakdown.map((item, idx) => (
                  <div key={idx} className="flex justify-between pl-3 text-xs text-muted-foreground">
                    <span>• {item.reason}</span>
                    <span className="font-medium text-destructive">-{formatMoney(item.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-1 text-xs text-emerald-600 dark:text-emerald-400">
                ✓ Zero deductions recorded during move-out inspection.
              </div>
            )}

            <div className="flex justify-between py-1 border-b border-border/50 text-xs">
              <span className="text-muted-foreground">Total Deductions</span>
              <span className="font-bold text-destructive">-{formatMoney(totalDeductions)}</span>
            </div>

            <div className="flex justify-between pt-2 text-base font-black">
              <span className="text-foreground">Net Refund Disbursed</span>
              <span className="text-emerald-600 dark:text-emerald-400">{formatMoney(netRefund)}</span>
            </div>
          </div>
        </div>

        {claim.landlord_remarks && (
          <div className="mb-6 rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground border border-border/50">
            <strong className="text-foreground">Landlord Handover Note:</strong> {claim.landlord_remarks}
          </div>
        )}

        {/* Legal Disclaimer */}
        <p className="text-[11px] text-muted-foreground text-center mb-6 leading-relaxed">
          This digital clearance certificate confirms the full and final settlement of all security deposit obligations between the tenant and property owner in compliance with the BachNest Digital Tenancy Framework.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 pt-3 border-t border-border">
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Voucher
          </button>
          <button
            type="button"
            onClick={() => downloadDepositClearancePdf(claim)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
          >
            <Download className="h-3.5 w-3.5" />
            Download Official PDF
          </button>
        </div>
      </div>
    </div>
  );
}
