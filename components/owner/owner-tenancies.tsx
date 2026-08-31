"use client";

import { useState } from "react";
import { FileText, SquareOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

export function OwnerTenancies({ tenancies, onChanged }: { tenancies: Tenancy[]; onChanged: () => void }) {
  const [terminatingId, setTerminatingId] = useState<string | null>(null);

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
        tenancies.map((tenancy) => (
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
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={tenancy.status} />
              {(tenancy.status === "ACTIVE" || tenancy.status === "NOTICE_SERVED") && (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={terminatingId === tenancy.id}
                  onClick={() => terminate(tenancy.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <SquareOff className="h-4 w-4 mr-1.5" />
                  {terminatingId === tenancy.id ? "Terminating..." : "Terminate"}
                </Button>
              )}
            </div>
          </div>
        ))
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">
            No tenancies yet. Approve a booking request to create one — the tenancy starts once the tenant signs the
            agreement.
          </p>
        </div>
      )}
    </div>
  );
}
