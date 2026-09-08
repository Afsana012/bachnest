"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  CheckCircle2,
  Image as ImageIcon,
  RotateCcw,
  Wrench,
  Flame,
  Zap,
  Droplets,
  Wifi,
  ShieldAlert,
  ExternalLink,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Complaint, ComplaintCategory } from "@/lib/types";
import { formatDate, formatMoney } from "@/lib/format";
import { fetchApi } from "@/lib/api";

interface ComplaintTicketCardProps {
  complaint: Complaint;
  isOwnerView?: boolean;
  onStatusChange?: (updated: Complaint) => void;
  onOpenResolveModal?: (complaint: Complaint) => void;
}

function getCategoryIcon(category: ComplaintCategory) {
  switch (category) {
    case "PLUMBING":
      return <Droplets className="h-4 w-4 text-blue-500" />;
    case "ELECTRICAL":
      return <Zap className="h-4 w-4 text-amber-500" />;
    case "INTERNET":
      return <Wifi className="h-4 w-4 text-indigo-500" />;
    case "SECURITY":
      return <ShieldAlert className="h-4 w-4 text-red-500" />;
    case "APPLIANCE":
      return <Flame className="h-4 w-4 text-orange-500" />;
    default:
      return <Wrench className="h-4 w-4 text-slate-500" />;
  }
}

export function ComplaintTicketCard({
  complaint,
  isOwnerView = false,
  onStatusChange,
  onOpenResolveModal,
}: ComplaintTicketCardProps) {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number; isOverdue: boolean }>({
    hours: 0,
    minutes: 0,
    seconds: 0,
    isOverdue: false,
  });
  const [showEvidence, setShowEvidence] = useState(false);
  const [isReopening, setIsReopening] = useState(false);

  const isResolved = complaint.status === "RESOLVED" || complaint.status === "CLOSED";

  useEffect(() => {
    if (isResolved) return;

    function updateTimer() {
      const now = new Date().getTime();
      const deadline = new Date(complaint.sla_deadline).getTime();
      const diff = deadline - now;

      if (diff <= 0) {
        const absDiff = Math.abs(diff);
        const hours = Math.floor(absDiff / (1000 * 60 * 60));
        const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((absDiff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isOverdue: true });
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ hours, minutes, seconds, isOverdue: false });
      }
    }

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [complaint.sla_deadline, isResolved]);

  async function handleReopen() {
    const reason = prompt("Enter reason for reopening ticket (e.g. Faucet leaking again):");
    if (!reason || !reason.trim()) return;

    setIsReopening(true);
    try {
      const res = await fetchApi<Complaint>(`/complaints/${complaint.id}/reopen?reason=${encodeURIComponent(reason.trim())}`, {
        method: "POST",
      });
      if (res.success && res.data && onStatusChange) {
        onStatusChange(res.data);
      }
    } finally {
      setIsReopening(false);
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-xs hover:border-primary/30 transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted/60 border border-border/80">
            {getCategoryIcon(complaint.category)}
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm flex items-center gap-2">
              {complaint.title}
              <span className="font-mono text-[11px] text-muted-foreground">
                #{complaint.id.slice(0, 8)}
              </span>
            </h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span>{complaint.category}</span>
              <span>•</span>
              <span className={`font-semibold ${
                complaint.priority === "EMERGENCY" ? "text-red-600 dark:text-red-400" :
                complaint.priority === "HIGH" ? "text-amber-600 dark:text-amber-400" :
                "text-blue-600 dark:text-blue-400"
              }`}>
                {complaint.priority} Priority
              </span>
              <span>•</span>
              <span>Logged {formatDate(complaint.created_at)}</span>
            </div>
          </div>
        </div>

        {/* SLA Status Indicator */}
        <div className="flex items-center gap-2">
          {isResolved ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>{complaint.status}</span>
            </div>
          ) : timeLeft.isOverdue ? (
            <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/30 px-3 py-1 text-xs font-bold text-destructive animate-pulse">
              <ShieldAlert className="h-3.5 w-3.5" />
              <span>OVERDUE BY {timeLeft.hours}h {timeLeft.minutes}m</span>
            </div>
          ) : (
            <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${
              timeLeft.hours < 4
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                : "bg-emerald-500/10 border-emerald-500/20 text-emerald-700 dark:text-emerald-400"
            }`}>
              <Clock className="h-3.5 w-3.5" />
              <span>
                SLA: {timeLeft.hours}h {timeLeft.minutes}m {timeLeft.seconds}s left
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed mb-4">
        {complaint.description}
      </p>

      {/* Resolution Details Banner if resolved */}
      {complaint.resolution_notes && (
        <div className="mb-4 rounded-lg bg-muted/40 border border-border/60 p-3 text-xs">
          <div className="flex items-center justify-between text-muted-foreground mb-1">
            <span className="font-semibold text-foreground">Resolution Remarks:</span>
            {complaint.repair_cost && (
              <span className="font-medium text-foreground">
                Cost: {formatMoney(complaint.repair_cost)} ({complaint.cost_bearer || "OWNER"})
              </span>
            )}
          </div>
          <p className="text-foreground">{complaint.resolution_notes}</p>
        </div>
      )}

      {/* Evidence Toggle */}
      {complaint.evidence_urls && complaint.evidence_urls.length > 0 && (
        <div className="mb-3">
          <button
            type="button"
            onClick={() => setShowEvidence(!showEvidence)}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <ImageIcon className="h-3.5 w-3.5" />
            <span>{complaint.evidence_urls.length} Photo Evidence Attached</span>
            {showEvidence ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          {showEvidence && (
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-2">
              {complaint.evidence_urls.map((url, idx) => (
                <a
                  key={idx}
                  href={url}
                  target="_blank"
                  rel="noreferrer"
                  className="group relative block aspect-video rounded-lg overflow-hidden border border-border bg-muted"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={`Evidence ${idx + 1}`}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-medium gap-1">
                    <ExternalLink className="h-3.5 w-3.5" /> View Full
                  </div>
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/50 text-xs">
        {isOwnerView && onOpenResolveModal && !isResolved && (
          <button
            type="button"
            onClick={() => onOpenResolveModal(complaint)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-1.5 font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Update & Resolve Ticket
          </button>
        )}

        {!isOwnerView && isResolved && (
          <button
            type="button"
            disabled={isReopening}
            onClick={handleReopen}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {isReopening ? "Reopening..." : "Reopen Ticket"}
          </button>
        )}
      </div>
    </div>
  );
}
