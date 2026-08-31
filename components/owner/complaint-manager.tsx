"use client";

import { useState } from "react";
import { Wrench, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { Complaint, ComplaintStatus } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

const NEXT_STATUSES: ComplaintStatus[] = ["ACKNOWLEDGED", "IN_PROGRESS", "RESOLVED", "CLOSED"];

export function ComplaintManager({ complaints, onChanged }: { complaints: Complaint[]; onChanged: () => void }) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [status, setStatus] = useState<ComplaintStatus>("ACKNOWLEDGED");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [repairCost, setRepairCost] = useState("");
  const [costBearer, setCostBearer] = useState("");
  const [busy, setBusy] = useState(false);

  const updateStatus = async (complaintId: string) => {
    setBusy(true);
    const res = await fetchApi<Complaint>(`/complaints/${complaintId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        resolution_notes: resolutionNotes.trim() || undefined,
        repair_cost: repairCost ? Number(repairCost) : undefined,
        cost_bearer: costBearer.trim() || undefined,
      }),
    });
    setBusy(false);
    if (res.success) {
      setOpenId(null);
      setResolutionNotes("");
      setRepairCost("");
      setCostBearer("");
      onChanged();
    } else {
      alert(res.message || "Failed to update complaint");
    }
  };

  return (
    <div className="space-y-4">
      {complaints.length > 0 ? (
        complaints.map((complaint) => (
          <div key={complaint.id} className="p-5 rounded-xl border border-border bg-card shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h4 className="font-semibold text-foreground">{complaint.title}</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {complaint.category} • {complaint.priority} priority • Filed {formatDate(complaint.created_at)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  SLA deadline: {formatDate(complaint.sla_deadline)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={complaint.status} />
                <Button variant="ghost" size="sm" onClick={() => setOpenId(openId === complaint.id ? null : complaint.id)}>
                  <ChevronDown className={`h-4 w-4 transition-transform ${openId === complaint.id ? "rotate-180" : ""}`} />
                </Button>
              </div>
            </div>

            {openId === complaint.id && (
              <div className="mt-4 pt-4 border-t border-border/60 space-y-3">
                <p className="text-sm text-muted-foreground">{complaint.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                  >
                    {NEXT_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0) + s.slice(1).toLowerCase().replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <input
                    placeholder="Repair cost ৳ (optional)"
                    type="number"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                  />
                  <input
                    placeholder="Cost bearer (tenant/owner)"
                    value={costBearer}
                    onChange={(e) => setCostBearer(e.target.value)}
                    className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                  />
                </div>
                <textarea
                  placeholder="Resolution notes for the tenant..."
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  rows={2}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
                />
                <Button size="sm" disabled={busy} onClick={() => updateStatus(complaint.id)}>
                  <Wrench className="h-4 w-4 mr-1.5" /> Update Status
                </Button>
              </div>
            )}
          </div>
        ))
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <p className="text-sm text-muted-foreground">No complaints filed by your tenants yet.</p>
        </div>
      )}
    </div>
  );
}
