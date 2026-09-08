"use client";

import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Printer,
  Building2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/lib/types";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";

interface InvoiceDocumentViewProps {
  invoice: Invoice;
  tenantName?: string;
  propertyTitle?: string;
  roomNumber?: string;
  ownerName?: string;
}

export function InvoiceDocumentView({
  invoice,
  tenantName,
  propertyTitle,
  roomNumber,
  ownerName,
}: InvoiceDocumentViewProps) {
  const due = Math.max(0, toNumber(invoice.total_amount) - toNumber(invoice.paid_amount));
  const isPaid = invoice.status === "PAID" || due === 0;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    downloadInvoicePdf(invoice, {
      tenantName,
      propertyTitle,
      roomNumber,
      ownerName,
    });
  };

  const lineItems: Array<{ label: string; bdt: string | number }> = [
    { label: "Base Residential Rent (মূল ভাড়া)", bdt: invoice.base_rent },
    { label: "Building Service & Security (সার্ভিস চার্জ)", bdt: invoice.service_charge },
    { label: "Electricity Consumption (বিদ্যুৎ বিল)", bdt: invoice.electricity_bill },
    { label: "Water & Sewerage Supply (পানির বিল)", bdt: invoice.water_bill },
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
    <div className="min-h-screen bg-muted/20 py-8 px-4 sm:px-6 print:p-0 print:bg-white">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
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
              Print
            </Button>
          </div>
        </div>

        <div className="bg-card text-card-foreground border border-border/80 rounded-3xl p-6 sm:p-10 shadow-xl print:shadow-none print:border-none print:p-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-8 border-b border-border/80">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Building2 className="h-6 w-6 text-primary" />
                <span className="font-black text-2xl tracking-tight text-foreground">BachNest Housing</span>
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                Official Rent Statement & Settlement Voucher
              </p>
              <p className="text-xs font-mono text-muted-foreground mt-1">
                Ref #{invoice.invoice_number} • Generated {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="text-left sm:text-right">
              {isPaid ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-4 w-4" />
                  PAID & SETTLED
                </div>
              ) : invoice.status === "OVERDUE" ? (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-destructive/10 text-destructive border border-destructive/30">
                  <AlertTriangle className="h-4 w-4" />
                  PAYMENT OVERDUE
                </div>
              ) : (
                <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Clock className="h-4 w-4" />
                  PAYMENT DUE
                </div>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                Billing Period: <strong className="text-foreground">{invoice.billing_month_year}</strong>
              </p>
              <p className="text-xs text-muted-foreground">
                Due Date: <strong className="text-foreground">{formatDate(invoice.due_date)}</strong>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-6 border-b border-border/80 text-xs">
            <div className="space-y-1.5">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">Tenant / Bill To:</span>
              <p className="font-semibold text-foreground text-sm">{tenantName || "Registered Tenant"}</p>
              <p className="text-muted-foreground">Tenancy Ref: {invoice.tenancy_id.slice(0, 18)}...</p>
              {roomNumber && <p className="text-muted-foreground">Allocated Room: {roomNumber}</p>}
            </div>
            <div className="space-y-1.5 sm:text-right">
              <span className="font-bold text-muted-foreground uppercase tracking-wider">Property & Landlord:</span>
              <p className="font-semibold text-foreground text-sm">{propertyTitle || "BachNest Verified Residence"}</p>
              <p className="text-muted-foreground">Managed by: {ownerName || "BachNest Property Host"}</p>
              <p className="text-muted-foreground">Dhaka, Bangladesh</p>
            </div>
          </div>

          <div className="py-6 space-y-4">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Itemized Particulars</h4>
            <div className="rounded-2xl border border-border/80 overflow-hidden">
              <div className="bg-muted/40 px-4 py-2.5 border-b border-border/80 flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Description</span>
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
            <div className="mt-6 p-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
              <Sparkles className="h-5 w-5 text-emerald-500 shrink-0" />
              <div className="text-xs text-muted-foreground">
                <p className="font-bold text-emerald-700 dark:text-emerald-400">Official Settlement Record</p>
                <p className="mt-0.5">
                  Payment for billing period {invoice.billing_month_year} has been settled and credited to the landlord account.
                </p>
              </div>
            </div>
          )}

          <div className="mt-12 pt-8 border-t border-border/80 grid grid-cols-2 gap-8 text-xs text-muted-foreground">
            <div>
              <div className="border-b border-border/80 pb-6 mb-2" />
              <p className="font-semibold text-foreground">Authorized Host Signature</p>
              <p>BachNest Housing Operations</p>
            </div>
            <div className="text-right">
              <div className="border-b border-border/80 pb-6 mb-2" />
              <p className="font-semibold text-foreground">Tenant Signature / Seal</p>
              <p>Verified Digital Tenancy</p>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              Official Computer Generated Rent Statement
            </span>
            <span>https://bachnest.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
