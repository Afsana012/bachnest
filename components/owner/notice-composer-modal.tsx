"use client";

import { useState } from "react";
import { Bell, AlertTriangle, X, Send, Loader2, Building2 } from "lucide-react";
import { Notice, NoticePriority, Property } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface NoticeComposerModalProps {
  properties: Property[];
  selectedPropertyId?: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (notice: Notice) => void;
}

const PRIORITY_BADGES: Record<NoticePriority, { label: string; style: string; desc: string }> = {
  URGENT: {
    label: "Urgent Alert (Emergency)",
    style: "border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400",
    desc: "Critical outages: Gas line repair, electrical shutdown, security emergency",
  },
  HIGH: {
    label: "High Priority",
    style: "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400",
    desc: "Major maintenance: Water pump cleaning, generator testing, elevator inspection",
  },
  NORMAL: {
    label: "Normal Notice",
    style: "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400",
    desc: "General updates: Gate closing time, trash collection rules, caretaker contacts",
  },
  LOW: {
    label: "General Memo",
    style: "border-slate-500/30 bg-slate-500/10 text-slate-700 dark:text-slate-400",
    desc: "Low-priority reminders: Rooftop garden hours, parcel storage reminders",
  },
};

export function NoticeComposerModal({
  properties,
  selectedPropertyId,
  isOpen,
  onClose,
  onSuccess,
}: NoticeComposerModalProps) {
  const [propertyId, setPropertyId] = useState(
    selectedPropertyId || (properties.length > 0 ? properties[0].id : "")
  );
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [priority, setPriority] = useState<NoticePriority>("NORMAL");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!propertyId) {
      setError("Please select a target building or property.");
      return;
    }
    if (title.trim().length < 3) {
      setError("Notice title must be at least 3 characters.");
      return;
    }
    if (content.trim().length < 10) {
      setError("Notice announcement text must be at least 10 characters.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetchApi<Notice>(`/properties/${propertyId}/notices`, {
        method: "POST",
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          priority,
        }),
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "Failed to publish notice.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to publish notice.";
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
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Publish Building Notice</h2>
            <p className="text-xs text-muted-foreground">Broadcast official announcement to all building tenants</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Select Building / Property
            </label>
            <div className="relative">
              <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-3 text-xs text-foreground focus:border-primary focus:outline-none"
              >
                {properties.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} ({p.area_neighborhood}, {p.city})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Broadcast Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as NoticePriority)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="URGENT">Urgent Alert (Emergency Red)</option>
              <option value="HIGH">High Priority (Maintenance Amber)</option>
              <option value="NORMAL">Normal Notice (Standard Blue)</option>
              <option value="LOW">General Memo (Informational Slate)</option>
            </select>
          </div>

          {/* Priority description helper */}
          <div className={`rounded-xl border p-3 text-xs ${PRIORITY_BADGES[priority].style}`}>
            <span className="font-bold block">{PRIORITY_BADGES[priority].label}</span>
            <span className="opacity-90 mt-0.5 block">{PRIORITY_BADGES[priority].desc}</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Notice Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. WASA Water Tank Deep Cleaning on Friday"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Announcement Message
            </label>
            <textarea
              required
              rows={4}
              placeholder="Provide exact timings, affected facilities, and any precautionary steps tenants should take..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Broadcast Notice
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
