"use client";

import { useState } from "react";
import { Wrench, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Complaint, Tenancy } from "@/lib/types";
import { ComplaintTicketCard } from "./complaint-ticket-card";
import { ComplaintSubmissionModal } from "./complaint-submission-modal";

export function ComplaintPanel({
  complaints,
  tenancies,
  onChanged,
}: {
  complaints: Complaint[];
  tenancies: Tenancy[];
  onChanged: () => void;
}) {
  const [filter, setFilter] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");
  const [isSubmitOpen, setIsSubmitOpen] = useState(false);

  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE" || t.status === "NOTICE_SERVED");

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
            <Wrench className="h-5 w-5 text-primary" /> Maintenance & Support Tickets
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time SLA resolution countdowns with transparent photo evidence tracking.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTenancies.length > 0 && (
            <Button
              onClick={() => setIsSubmitOpen(true)}
              className="rounded-xl shadow-xs"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-1.5" /> Log Issue
            </Button>
          )}
        </div>
      </div>

      {/* SLA Commitment Highlights */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
          <span className="font-bold text-red-600 dark:text-red-400 block text-xs">EMERGENCY (2h)</span>
          <span className="text-[11px] text-muted-foreground">Gas leak, short circuits</span>
        </div>
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3">
          <span className="font-bold text-amber-600 dark:text-amber-400 block text-xs">HIGH (24h)</span>
          <span className="text-[11px] text-muted-foreground">Broken tap, water pump</span>
        </div>
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
          <span className="font-bold text-blue-600 dark:text-blue-400 block text-xs">MEDIUM (48h)</span>
          <span className="text-[11px] text-muted-foreground">Fan regulator, window latch</span>
        </div>
        <div className="rounded-xl border border-slate-500/20 bg-slate-500/5 p-3">
          <span className="font-bold text-slate-600 dark:text-slate-400 block text-xs">LOW (72h)</span>
          <span className="text-[11px] text-muted-foreground">Aesthetic fixes, touchups</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 text-xs">
        {(["ALL", "ACTIVE", "RESOLVED"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setFilter(tab)}
            className={`rounded-lg px-3 py-1 font-medium transition-colors ${
              filter === tab
                ? "bg-primary text-primary-foreground font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            }`}
          >
            {tab === "ALL" ? `All Tickets (${complaints.length})` : tab === "ACTIVE" ? "Active / In Progress" : "Resolved"}
          </button>
        ))}
      </div>

      {filteredComplaints.length > 0 ? (
        <div className="space-y-4">
          {filteredComplaints.map((complaint) => (
            <ComplaintTicketCard
              key={complaint.id}
              complaint={complaint}
              isOwnerView={false}
              onStatusChange={() => onChanged()}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <ShieldCheck className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No maintenance tickets found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {activeTenancies.length > 0
              ? "Experiencing plumbing, gas, or electrical trouble? Click 'Log Issue' above."
              : "An active tenancy lease is required to log maintenance requests."}
          </p>
        </div>
      )}

      {isSubmitOpen && (
        <ComplaintSubmissionModal
          tenancies={activeTenancies}
          isOpen={isSubmitOpen}
          onClose={() => setIsSubmitOpen(false)}
          onSuccess={() => {
            onChanged();
          }}
        />
      )}
    </div>
  );
}
