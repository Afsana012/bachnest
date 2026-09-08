"use client";

import {
  Printer,
  X,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  CreditCard,
  Receipt,
  Sparkles,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/lib/types";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";

interface InvoiceReceiptModalProps {
  invoice: Invoice;
  isOpen: boolean;
  onClose: () => void;
  onPay?: () => void;
  tenantName?: string;
  propertyTitle?: string;
  roomNumber?: string;
}

export function InvoiceReceiptModal({
  invoice,
  isOpen,
  onClose,
  onPay,
  tenantName,
  propertyTitle,
  roomNumber,
}: InvoiceReceiptModalProps) {
  if (!isOpen) return null;

  const due = Math.max(0, toNumber(invoice.total_amount) - toNumber(invoice.paid_amount));
  const isPaid = invoice.status === "PAID" || due === 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadInvoicePdf(invoice, { tenantName, propertyTitle, roomNumber });
  };

  const lineItems: Array<{ label: string; bdt: string | number; note?: string }> = [
    { label: "Base Residential Rent (মূল ভাড়া)", bdt: invoice.base_rent },
    { label: "Building Service & Security (সার্ভিস চার্জ)", bdt: invoice.service_charge },
    { label: "Electricity Consumption (বিদ্যুৎ বিল)", bdt: invoice.electricity_bill },
    { label: "Water & Sewerage (পানির বিল)", bdt: invoice.water_bill },
    { label: "Gas Utility Supply (গ্যাস বিল)", bdt: invoice.gas_bill },
    { label: "High-Speed Shared Internet (ইন্টারনেট বিল)", bdt: invoice.internet_bill },
  ];

  if (toNumber(invoice.other_adjustments) !== 0) {
    lineItems.push({ label: "Special Adjustments / Credits (সমন্বয়)", bdt: invoice.other_adjustments });
  }

  if (toNumber(invoice.late_fee) > 0) {
    lineItems.push({ label: "Late Payment Surcharge (বিলম্ব ফি)", bdt: invoice.late_fee });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Invoice & Payment Voucher</h3>
              <p className="text-xs text-muted-foreground font-mono">#{invoice.invoice_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDownloadPdf}
              className="rounded-xl font-medium shadow-xs"
            >
              <Download className="h-4 w-4 mr-1.5" />
              Download PDF
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="rounded-xl font-medium shadow-xs hidden sm:inline-flex"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-foreground print:p-0 print:overflow-visible">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-primary" />
                <span className="font-extrabold text-xl tracking-tight text-foreground">BachNest Housing</span>
              </div>
              <p className="text-xs text-muted-foreground">Official Rent Statement & Settlement Voucher</p>
              <p className="text-xs font-mono text-muted-foreground mt-1">Invoice No: {invoice.invoice_number}</p>
            </div>

            <div className="text-left sm:text-right">
              {isPaid ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4" />
                  PAID & SETTLED
                </div>
              ) : invoice.status === "OVERDUE" ? (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-destructive/10 text-destructive border border-destructive/30">
                  <AlertTriangle className="h-4 w-4" />
                  OVERDUE
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Clock className="h-4 w-4" />
                  PAYMENT DUE
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">Billing Period: <strong className="text-foreground">{invoice.billing_month_year}</strong></p>
              <p className="text-xs text-muted-foreground">Due Date: <strong className="text-foreground">{formatDate(invoice.due_date)}</strong></p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/80 overflow-hidden shadow-xs">
            <div className="bg-muted/40 px-4 py-2.5 border-b border-border/80 flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
              <span>Itemized Particulars</span>
              <span>Amount (BDT)</span>
            </div>
            <div className="divide-y divide-border/60 text-sm">
              {lineItems.map((item) => (
                <div key={item.label} className="px-4 py-3 flex items-center justify-between">
                  <span className="text-foreground/90 font-medium text-xs sm:text-sm">{item.label}</span>
                  <span className="font-semibold text-foreground text-xs sm:text-sm">{formatMoney(item.bdt)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl bg-muted/30 border border-border/80 p-5 space-y-2 text-sm">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Subtotal Gross Billed</span>
              <span className="font-semibold text-foreground">{formatMoney(invoice.total_amount)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-emerald-600 dark:text-emerald-400">
              <span>Total Paid to Date</span>
              <span className="font-semibold">- {formatMoney(invoice.paid_amount)}</span>
            </div>
            <div className="pt-2 border-t border-border flex justify-between items-center">
              <span className="font-bold text-foreground">Total Balance Due</span>
              <span className={`text-xl font-black ${due > 0 ? "text-primary" : "text-emerald-600 dark:text-emerald-400"}`}>
                {formatMoney(due)}
              </span>
            </div>
          </div>

          {isPaid && (
            <div className="p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">Official Settlement Receipt</p>
                <p className="mt-0.5">
                  Payment for billing period {invoice.billing_month_year} has been settled and credited to the landlord account.
                </p>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-border/80 print:hidden">
            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto rounded-xl">
              Close
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                type="button"
                variant="default"
                onClick={handleDownloadPdf}
                className="flex-1 sm:flex-initial rounded-xl font-medium shadow-xs"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Download PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePrint}
                className="flex-1 sm:flex-initial rounded-xl font-medium"
              >
                <Printer className="h-4 w-4 mr-1.5" />
                Print Voucher
              </Button>
              {!isPaid && onPay && (
                <Button
                  type="button"
                  onClick={() => {
                    onClose();
                    onPay();
                  }}
                  className="flex-1 sm:flex-initial rounded-xl font-bold shadow-xs"
                >
                  <CreditCard className="h-4 w-4 mr-1.5" />
                  Pay Invoice
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
