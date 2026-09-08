"use client";

import { useState } from "react";
import { X, Wrench, Clock, AlertTriangle, Plus, Trash2, Image as ImageIcon, Loader2 } from "lucide-react";
import { Complaint, ComplaintCategory, ComplaintPriority, Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface ComplaintSubmissionModalProps {
  tenancies: Tenancy[];
  selectedTenancyId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (complaint: Complaint) => void;
}

const SLA_DESCRIPTIONS: Record<ComplaintPriority, { label: string; hours: number; color: string; examples: string }> = {
  EMERGENCY: {
    label: "Emergency (2h SLA)",
    hours: 2,
    color: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    examples: "Gas leak, sparking electrical box, major sewage burst",
  },
  HIGH: {
    label: "High Priority (24h SLA)",
    hours: 24,
    color: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    examples: "Broken water tap, motor failure, single room blackout",
  },
  MEDIUM: {
    label: "Medium (48h SLA)",
    hours: 48,
    color: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    examples: "Fan regulator broken, window latch loose, kitchen shelf repair",
  },
  LOW: {
    label: "Low (72h SLA)",
    hours: 72,
    color: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400",
    examples: "Minor wall paint scratch, curtain rod adjustment",
  },
};

export function ComplaintSubmissionModal({
  tenancies,
  selectedTenancyId,
  isOpen,
  onClose,
  onSuccess,
}: ComplaintSubmissionModalProps) {
  const activeTenancies = tenancies.filter((t) => t.status === "ACTIVE" || t.status === "NOTICE_SERVED");
  const defaultTenancy = activeTenancies.find((t) => t.id === selectedTenancyId) || activeTenancies[0];

  const [tenancyId, setTenancyId] = useState(defaultTenancy?.id || "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComplaintCategory>("PLUMBING");
  const [priority, setPriority] = useState<ComplaintPriority>("HIGH");
  const [evidenceUrls, setEvidenceUrls] = useState<string[]>([]);
  const [newUrl, setNewUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentTenancy = activeTenancies.find((t) => t.id === tenancyId) || defaultTenancy;

  function handleAddUrl() {
    if (!newUrl.trim()) return;
    try {
      new URL(newUrl.trim());
      setEvidenceUrls([...evidenceUrls, newUrl.trim()]);
      setNewUrl("");
      setError(null);
    } catch {
      setError("Please enter a valid image URL (e.g. https://...).");
    }
  }

  function handleRemoveUrl(index: number) {
    setEvidenceUrls(evidenceUrls.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!currentTenancy) {
      setError("No active tenancy agreement found to file a maintenance complaint for.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Title must be at least 3 characters long.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Please describe the maintenance issue in at least 10 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi<Complaint>("/complaints", {
        method: "POST",
        body: JSON.stringify({
          property_id: currentTenancy.property_id,
          room_id: currentTenancy.room_id || undefined,
          title: title.trim(),
          description: description.trim(),
          category,
          priority,
          evidence_urls: evidenceUrls,
        }),
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "Failed to submit maintenance complaint.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to log maintenance ticket.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
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
            <h2 className="text-xl font-bold tracking-tight text-foreground">Log Maintenance Ticket</h2>
            <p className="text-xs text-muted-foreground">Guaranteed SLA Timer & Photo Evidence Tracking</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {activeTenancies.length > 1 && (
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Select Tenancy Agreement
              </label>
              <select
                value={tenancyId}
                onChange={(e) => setTenancyId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {activeTenancies.map((t) => (
                  <option key={t.id} value={t.id}>
                    Agreement #{t.id.slice(0, 8)} (Started {t.lease_start_date})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ComplaintCategory)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="PLUMBING">Plumbing & Water</option>
                <option value="ELECTRICAL">Electrical & Wiring</option>
                <option value="SECURITY">Security & Locks</option>
                <option value="APPLIANCE">Appliance / Geyser</option>
                <option value="INTERNET">Internet & WiFi</option>
                <option value="STRUCTURAL">Doors & Windows</option>
                <option value="CLEANLINESS">Cleanliness & Waste</option>
                <option value="OTHER">Other Issue</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Priority & SLA
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as ComplaintPriority)}
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                <option value="EMERGENCY">Emergency (2 Hours SLA)</option>
                <option value="HIGH">High (24 Hours SLA)</option>
                <option value="MEDIUM">Medium (48 Hours SLA)</option>
                <option value="LOW">Low (72 Hours SLA)</option>
              </select>
            </div>
          </div>

          {/* Guaranteed SLA Banner */}
          <div className={`rounded-xl border p-3.5 flex items-start gap-3 ${SLA_DESCRIPTIONS[priority].color}`}>
            <Clock className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block">{SLA_DESCRIPTIONS[priority].label}</span>
              <p className="mt-0.5 opacity-90">
                Landlord SLA target: <strong>{SLA_DESCRIPTIONS[priority].hours} Hours</strong>. Typical issues: {SLA_DESCRIPTIONS[priority].examples}.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Issue Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Kitchen tap cracked, water leaking continuously"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Detailed Description
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe the problem, when it started, and whether it impacts other roommates..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Evidence Photos */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Photo / Video Evidence URLs
            </label>
            {evidenceUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {evidenceUrls.map((url, idx) => (
                  <div key={idx} className="relative group rounded-lg border border-border overflow-hidden bg-muted/30 p-1 flex items-center gap-1.5 text-xs max-w-full">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[200px] text-[11px] font-mono">{url}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveUrl(idx)}
                      className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      title="Remove photo"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="url"
                placeholder="Paste image URL (e.g. https://i.imgur.com/...)"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:border-primary focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddUrl}
                className="inline-flex items-center gap-1 rounded-lg border border-primary bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors shrink-0"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
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
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              Submit Maintenance Ticket
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
