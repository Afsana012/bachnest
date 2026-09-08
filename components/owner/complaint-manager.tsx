"use client";

import { useState } from "react";
import { Wrench, ShieldCheck } from "lucide-react";
import { Complaint } from "@/lib/types";
import { ComplaintTicketCard } from "@/components/dashboard/complaint-ticket-card";
import { ComplaintResolutionModal } from "./complaint-resolution-modal";

export function ComplaintManager({ complaints, onChanged }: { complaints: Complaint[]; onChanged: () => void }) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ACTIVE");
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);

  const filteredComplaints = complaints.filter((c) => {
    if (filter === "ACTIVE") return c.status === "OPEN" || c.status === "ACKNOWLEDGED" || c.status === "IN_PROGRESS" || c.status === "REOPENED";
    if (filter === "RESOLVED") return c.status === "RESOLVED" || c.status === "CLOSED";
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wrench className="h-5 w-5 text-primary" /> Tenant Maintenance Requests
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage tenant repair tickets, track SLA countdowns, and record itemized repair expenses.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1.5 rounded-lg border border-border p-1 text-xs bg-card">
          {(["ACTIVE", "RESOLVED", "ALL"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`rounded-md px-3 py-1 font-medium transition-colors ${
                filter === tab
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "ACTIVE" ? `Pending SLA (${complaints.filter(c => c.status !== "RESOLVED" && c.status !== "CLOSED").length})` : tab === "RESOLVED" ? "Resolved" : "All"}
            </button>
          ))}
        </div>
      </div>

      {filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintTicketCard
              key={complaint.id}
              complaint={complaint}
              isOwnerView={true}
              onStatusChange={() => onChanged()}
              onOpenResolveModal={(c) => setResolvingComplaint(c)}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <ShieldCheck className="h-10 w-10 text-emerald-500/60 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No pending maintenance issues!</p>
          <p className="text-xs text-muted-foreground mt-1">
            All tenant tickets are currently resolved within guaranteed SLA timeframes.
          </p>
        </div>
      )}

      {resolvingComplaint && (
        <ComplaintResolutionModal
          complaint={resolvingComplaint}
          isOpen={Boolean(resolvingComplaint)}
          onClose={() => setResolvingComplaint(null)}
          onSuccess={() => {
            setResolvingComplaint(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}
