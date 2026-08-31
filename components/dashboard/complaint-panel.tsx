"use client";

import { useState } from "react";
import { Wrench, Plus, RotateCcw, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Complaint, ComplaintCategory, ComplaintPriority, Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

const CATEGORIES: ComplaintCategory[] = [
  "PLUMBING",
  "ELECTRICAL",
  "APPLIANCE",
  "STRUCTURAL",
  "INTERNET",
  "SECURITY",
  "NOISE",
  "CLEANLINESS",
  "OTHER",
];

const PRIORITIES: ComplaintPriority[] = ["LOW", "MEDIUM", "HIGH", "EMERGENCY"];

export function ComplaintPanel({
  complaints,
  tenancies,
  onChanged,
}: {
  complaints: Complaint[];
  tenancies: Tenancy[];
  onChanged: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("PLUMBING");
  const [priority, setPriority] = useState<ComplaintPriority>("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<Complaint | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenancies.length) {
      alert("You need an active tenancy to file a complaint.");
      return;
    }
    setSubmitting(true);
    const res = await fetchApi<Complaint>("/complaints", {
      method: "POST",
      body: JSON.stringify({
        property_id: tenancies[0].property_id,
        room_id: tenancies[0].room_id,
        title,
        description,
        category,
        priority,
      }),
    });
    setSubmitting(false);
    if (res.success) {
      setTitle("");
      setDescription("");
      onChanged();
    } else {
      alert(res.message || "Failed to file complaint");
    }
  };

  const openDetail = async (complaintId: string) => {
    if (expandedId === complaintId) {
      setExpandedId(null);
      setDetail(null);
      return;
    }
    setExpandedId(complaintId);
    const res = await fetchApi<Complaint>(`/complaints/${complaintId}`);
    if (res.success && res.data) {
      setDetail(res.data);
    }
  };

  const reopen = async (complaintId: string) => {
    const res = await fetchApi<Complaint>(`/complaints/${complaintId}/reopen?reason=${encodeURIComponent("Issue came back")}`, {
      method: "POST",
    });
    if (res.success) {
      setExpandedId(null);
      setDetail(null);
      onChanged();
    } else {
      alert(res.message || "Failed to reopen complaint");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Wrench className="h-5 w-5 text-muted-foreground" /> Support Tickets
      </h2>

      <div className="p-5 rounded-xl border border-border bg-card shadow-sm mb-6">
        <h3 className="text-sm font-semibold mb-4">File a new request</h3>
        <form onSubmit={handleCreate} className="space-y-3">
          <Input placeholder="E.g. AC not cooling, sink leaking..." value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea
            placeholder="Describe the issue in detail..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            required
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
          />
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
              className="h-10 flex-1 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c.charAt(0) + c.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
              className="h-10 flex-1 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p.charAt(0) + p.slice(1).toLowerCase()}
                </option>
              ))}
            </select>
            <Button type="submit" disabled={submitting} className="px-6 shrink-0">
              <Plus className="h-4 w-4 mr-2" /> File Request
            </Button>
          </div>
        </form>
      </div>

      {complaints.length > 0 ? (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="p-5 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-foreground">{c.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {c.category} • {c.priority} priority • Created: {formatDate(c.created_at)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={c.status} />
                  <Button variant="ghost" size="sm" onClick={() => openDetail(c.id)}>
                    <ChevronDown className={`h-4 w-4 transition-transform ${expandedId === c.id ? "rotate-180" : ""}`} />
                  </Button>
                </div>
              </div>

              {expandedId === c.id && (
                <div className="mt-4 pt-4 border-t border-border/60 text-sm space-y-2">
                  <p className="text-muted-foreground">{detail?.description ?? c.description}</p>
                  {detail && (
                    <p className="text-xs text-muted-foreground">
                      SLA deadline: {formatDate(detail.sla_deadline)}
                      {detail.resolution_notes && ` • Resolution: ${detail.resolution_notes}`}
                      {detail.repair_cost != null && ` • Repair cost: ৳${detail.repair_cost}`}
                    </p>
                  )}
                  {(c.status === "RESOLVED" || c.status === "CLOSED") && (
                    <Button variant="outline" size="sm" onClick={() => reopen(c.id)}>
                      <RotateCcw className="h-4 w-4 mr-1.5" /> Reopen Issue
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <Wrench className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No active maintenance requests.</p>
        </div>
      )}
    </div>
  );
}
