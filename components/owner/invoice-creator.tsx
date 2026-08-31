"use client";

import { useState } from "react";
import { FilePlus2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Invoice, Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney, toNumber } from "@/lib/format";

function currentBillingMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function InvoiceCreator({ tenancies, invoices, onChanged }: { tenancies: Tenancy[]; invoices: Invoice[]; onChanged: () => void }) {
  const [tenancyId, setTenancyId] = useState("");
  const [billingMonth, setBillingMonth] = useState(currentBillingMonth());
  const [baseRent, setBaseRent] = useState("");
  const [serviceCharge, setServiceCharge] = useState("0");
  const [electricity, setElectricity] = useState("0");
  const [water, setWater] = useState("0");
  const [gas, setGas] = useState("0");
  const [internet, setInternet] = useState("0");
  const [dueDate, setDueDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const createInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenancyId || !baseRent || !dueDate) {
      alert("Tenancy, base rent, and due date are required.");
      return;
    }
    setSubmitting(true);
    const res = await fetchApi<Invoice>("/billing/invoices", {
      method: "POST",
      body: JSON.stringify({
        tenancy_id: tenancyId,
        billing_month_year: billingMonth,
        base_rent: Number(baseRent),
        service_charge: Number(serviceCharge) || 0,
        electricity_bill: Number(electricity) || 0,
        water_bill: Number(water) || 0,
        gas_bill: Number(gas) || 0,
        internet_bill: Number(internet) || 0,
        due_date: dueDate,
      }),
    });
    setSubmitting(false);
    if (res.success) {
      setBaseRent("");
      setServiceCharge("0");
      setElectricity("0");
      setWater("0");
      setGas("0");
      setInternet("0");
      onChanged();
    } else {
      alert(res.message || "Failed to create invoice");
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={createInvoice} className="p-5 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <h3 className="text-sm font-semibold flex items-center gap-2">
          <FilePlus2 className="h-4 w-4 text-muted-foreground" /> Generate Monthly Invoice
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <select
            value={tenancyId}
            onChange={(e) => setTenancyId(e.target.value)}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
          >
            <option value="">Select tenancy...</option>
            {tenancies
              .filter((t) => t.status === "ACTIVE" || t.status === "NOTICE_SERVED")
              .map((t) => (
                <option key={t.id} value={t.id}>
                  Tenant #{t.tenant_id.slice(0, 8)} • {formatMoney(t.agreed_monthly_rent)}/mo
                </option>
              ))}
          </select>
          <Input type="month" value={billingMonth} onChange={(e) => setBillingMonth(e.target.value)} />
          <Input type="date" placeholder="Due date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Input placeholder="Base rent ৳" type="number" value={baseRent} onChange={(e) => setBaseRent(e.target.value)} required />
          <Input placeholder="Service ৳" type="number" value={serviceCharge} onChange={(e) => setServiceCharge(e.target.value)} />
          <Input placeholder="Electricity ৳" type="number" value={electricity} onChange={(e) => setElectricity(e.target.value)} />
          <Input placeholder="Water ৳" type="number" value={water} onChange={(e) => setWater(e.target.value)} />
          <Input placeholder="Gas ৳" type="number" value={gas} onChange={(e) => setGas(e.target.value)} />
          <Input placeholder="Internet ৳" type="number" value={internet} onChange={(e) => setInternet(e.target.value)} />
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "Creating..." : "Create Invoice"}
        </Button>
      </form>

      <div className="space-y-4">
        {invoices.length > 0 ? (
          invoices.map((invoice) => (
            <div key={invoice.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="font-semibold text-foreground">Invoice #{invoice.invoice_number}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {invoice.billing_month_year} • Due {formatDate(invoice.due_date)} • Total{" "}
                  {formatMoney(invoice.total_amount)}
                </p>
                {toNumber(invoice.paid_amount) > 0 && (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                    Paid {formatMoney(invoice.paid_amount)}
                  </p>
                )}
              </div>
              <StatusBadge status={invoice.status} />
            </div>
          ))
        ) : (
          <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
            <p className="text-sm text-muted-foreground">No invoices issued yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
