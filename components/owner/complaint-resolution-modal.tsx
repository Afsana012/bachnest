"use client";

import { useState } from "react";
import { X, CheckCircle2, Wrench, AlertCircle, Loader2 } from "lucide-react";
import { Complaint, ComplaintStatus } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface ComplaintResolutionModalProps {
  complaint: Complaint;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Complaint) => void;
}

export function ComplaintResolutionModal({
  complaint,
  isOpen,
  onClose,
  onSuccess,
}: ComplaintResolutionModalProps) {
  const [status, setStatus] = useState<ComplaintStatus>(
    complaint.status === "OPEN" ? "IN_PROGRESS" : complaint.status
  );
  const [resolutionNotes, setResolutionNotes] = useState(complaint.resolution_notes || "");
  const [repairCost, setRepairCost] = useState(complaint.repair_cost ? String(complaint.repair_cost) : "");
  const [costBearer, setCostBearer] = useState(complaint.cost_bearer || "OWNER");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (status === "RESOLVED" && !resolutionNotes.trim()) {
      setError("Please describe how the issue was resolved (e.g. Technician replaced pipe fitting).");
      return;
    }

    const costNum = repairCost ? parseFloat(repairCost) : undefined;
    if (repairCost && (isNaN(costNum!) || costNum! < 0)) {
      setError("Repair cost must be a valid non-negative number.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi<Complaint>(`/complaints/${complaint.id}/status`, {
        method: "PATCH",
        body: JSON.stringify({
          status,
          resolution_notes: resolutionNotes.trim() || undefined,
          repair_cost: costNum,
          cost_bearer: costBearer,
        }),
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "Failed to update complaint resolution status.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update ticket.";
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
            <Wrench className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Resolve Maintenance Ticket</h2>
            <p className="text-xs text-muted-foreground">Ticket #{complaint.id.slice(0, 8)} · {complaint.title}</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Ticket Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ComplaintStatus)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="IN_PROGRESS">In Progress (Technician Dispatched)</option>
              <option value="RESOLVED">Resolved (Repairs Completed)</option>
              <option value="CLOSED">Closed (Final Handover)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Repair Cost (৳ BDT)
              </label>
              <input
                type="number"
                placeholder="e.g. 500"
                value={repairCost}
                onChange={(e) => setRepairCost(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Cost Bearer
              </label>
              <select
                value={costBearer}
                onChange={(e) => setCostBearer(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="OWNER">Owner (Landlord Covered)</option>
                <option value="TENANT">Tenant (User Caused)</option>
                <option value="SHARED">Shared (50/50 Split)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Resolution Notes & Technician Findings
            </label>
            <textarea
              required={status === "RESOLVED"}
              rows={3}
              placeholder="e.g. Plumber replaced cracked washer and pipe valve. Tested water flow and verified zero leaks."
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
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
              Update Resolution
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
