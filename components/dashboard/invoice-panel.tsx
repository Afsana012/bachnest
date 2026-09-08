"use client";

import { useState } from "react";
import { FileText, CreditCard, Receipt, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { CheckoutResponse, Invoice, Payment } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney, toNumber } from "@/lib/format";
import { InvoiceReceiptModal } from "@/components/shared/invoice-receipt-modal";
import { downloadInvoicePdf } from "@/lib/invoice-pdf";

const PAYABLE = new Set(["ISSUED", "PARTIALLY_PAID", "OVERDUE"]);

export function InvoicePanel({ invoices, onChanged }: { invoices: Invoice[]; onChanged: () => void }) {
  const [payingId, setPayingId] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<Payment | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  const payInvoice = async (invoice: Invoice) => {
    setPayingId(invoice.id);
    const res = await fetchApi<CheckoutResponse>("/payments/checkout", {
      method: "POST",
      body: JSON.stringify({ invoice_id: invoice.id, payment_method: "MOCK" }),
    });
    setPayingId(null);
    if (!res.success || !res.data) {
      alert(res.message || "Payment failed");
      return;
    }

    if (res.data.payment_url) {
      window.open(res.data.payment_url, "_blank");
    }

    const paymentRes = await fetchApi<Payment>(`/payments/${res.data.payment_id}`);
    if (paymentRes.success && paymentRes.data) {
      setReceipt(paymentRes.data);
    }
    onChanged();
  };

  const dueAmount = (invoice: Invoice) => toNumber(invoice.total_amount) - toNumber(invoice.paid_amount);

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <FileText className="h-5 w-5 text-muted-foreground" /> Billing History
      </h2>

      {receipt && (
        <div className="mb-4 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-sm">
          <p className="font-semibold text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
            <Receipt className="h-4 w-4" /> Payment receipt
          </p>
          <p className="text-muted-foreground mt-1">
            Ref {receipt.transaction_reference} • {formatMoney(receipt.amount)} • {receipt.status}
          </p>
        </div>
      )}

      {invoices.length > 0 ? (
        <div className="space-y-4">
          {invoices.map((inv) => (
            <div key={inv.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground">Invoice #{inv.invoice_number}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {inv.billing_month_year} • Due: {formatDate(inv.due_date)} • Total: {formatMoney(inv.total_amount)}
                </p>
                {PAYABLE.has(inv.status) && dueAmount(inv) > 0 && (
                  <p className="text-xs text-destructive mt-1">Outstanding: {formatMoney(dueAmount(inv))}</p>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedInvoice(inv)}
                  className="rounded-xl font-medium"
                >
                  <FileText className="h-4 w-4 mr-1.5" />
                  View Voucher
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => downloadInvoicePdf(inv)}
                  className="rounded-xl font-medium shadow-2xs"
                  title="Download Official PDF"
                >
                  <Download className="h-4 w-4 mr-1.5" />
                  PDF
                </Button>
                <StatusBadge status={inv.status} />
                {PAYABLE.has(inv.status) && (
                  <Button size="sm" disabled={payingId === inv.id} onClick={() => payInvoice(inv)} className="rounded-xl font-semibold shadow-xs">
                    <CreditCard className="h-4 w-4 mr-1.5" />
                    {payingId === inv.id ? "Processing..." : "Pay Now"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No pending or past invoices found.</p>
        </div>
      )}

      {selectedInvoice && (
        <InvoiceReceiptModal
          invoice={selectedInvoice}
          isOpen={Boolean(selectedInvoice)}
          onClose={() => setSelectedInvoice(null)}
          onPay={() => {
            payInvoice(selectedInvoice);
          }}
        />
      )}
    </div>
  );
}
