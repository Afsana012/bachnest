"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Trash2, Plus, Building2, Megaphone, Loader2 } from "lucide-react";
import { Notice, NoticePriority, Property } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { NoticeComposerModal } from "@/components/owner/notice-composer-modal";

interface OwnerNoticesProps {
  properties: Property[];
  onChanged?: () => void;
}

const PRIORITY_STYLES: Record<NoticePriority, { label: string; badge: string; border: string }> = {
  URGENT: {
    label: "Urgent Alert",
    badge: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/20",
    border: "border-l-4 border-l-red-500",
  },
  HIGH: {
    label: "High Priority",
    badge: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20",
    border: "border-l-4 border-l-amber-500",
  },
  NORMAL: {
    label: "Normal",
    badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20",
    border: "border-l-4 border-l-blue-500",
  },
  LOW: {
    label: "General Memo",
    badge: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/20",
    border: "border-l-4 border-l-slate-400",
  },
};

interface NoticeWithProperty extends Notice {
  property_title?: string;
  property_area?: string;
}

export function OwnerNotices({ properties }: OwnerNoticesProps) {
  const [notices, setNotices] = useState<NoticeWithProperty[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>("ALL");
  const [isComposerOpen, setIsComposerOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadNotices = useCallback(async () => {
    setLoading(true);
    try {
      const allFetched: NoticeWithProperty[] = [];

      // Fetch notices for each property owned
      await Promise.all(
        properties.map(async (p) => {
          const res = await fetchApi<Notice[]>(`/properties/${p.id}/notices`);
          if (res.success && res.data) {
            res.data.forEach((n) => {
              allFetched.push({
                ...n,
                property_title: p.title,
                property_area: `${p.area_neighborhood}, ${p.city}`,
              });
            });
          }
        })
      );

      // Sort newest first
      allFetched.sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
      setNotices(allFetched);
    } catch {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  }, [properties]);

  useEffect(() => {
    if (properties.length > 0) {
      const t = setTimeout(() => {
        loadNotices();
      }, 0);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLoading(false);
    }, 0);
    return () => clearTimeout(t);
  }, [properties, loadNotices]);

  async function handleDeleteNotice(noticeId: string) {
    if (!confirm("Are you sure you want to delete this broadcast notice?")) return;

    setDeletingId(noticeId);
    try {
      const res = await fetchApi<{ message: string }>(`/notices/${noticeId}`, {
        method: "DELETE",
      });
      if (res.success) {
        setNotices((prev) => prev.filter((n) => n.id !== noticeId));
      }
    } catch {
      // Ignored
    } finally {
      setDeletingId(null);
    }
  }

  const filteredNotices =
    selectedPropertyId === "ALL"
      ? notices
      : notices.filter((n) => n.property_id === selectedPropertyId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Megaphone className="h-5 w-5 text-primary" />
            Building Notice Board & Broadcasts
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send immediate priority alerts, utility downtime notices, and general announcements to your tenants.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {properties.length > 0 && (
            <select
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
              className="rounded-xl border border-border bg-background px-3 py-2 text-xs text-foreground focus:border-primary focus:outline-none"
            >
              <option value="ALL">All Buildings ({properties.length})</option>
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          )}

          <Button
            onClick={() => setIsComposerOpen(true)}
            disabled={properties.length === 0}
            className="rounded-xl shrink-0"
          >
            <Plus className="h-4 w-4 mr-1.5" /> Broadcast Notice
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : filteredNotices.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
            <Bell className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">No Broadcast Notices Yet</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Keep your tenants informed by publishing utility maintenance schedules, gate closing rules, or urgent emergency notices.
          </p>
          {properties.length > 0 && (
            <Button
              onClick={() => setIsComposerOpen(true)}
              className="mt-4 rounded-xl text-xs"
              variant="outline"
            >
              <Plus className="h-3.5 w-3.5 mr-1" /> Post First Notice
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredNotices.map((notice) => {
            const priorityConf = PRIORITY_STYLES[notice.priority] || PRIORITY_STYLES.NORMAL;
            const isDeleting = deletingId === notice.id;

            return (
              <div
                key={notice.id}
                className={`rounded-2xl border border-border bg-card p-5 shadow-sm transition hover:shadow-md ${priorityConf.border}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-semibold ${priorityConf.badge}`}
                      >
                        {priorityConf.label}
                      </span>
                      {notice.property_title && (
                        <span className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <Building2 className="h-3 w-3" />
                          {notice.property_title}
                        </span>
                      )}
                    </div>
                    <h3 className="font-bold text-sm text-foreground pt-1">{notice.title}</h3>
                  </div>

                  <button
                    onClick={() => handleDeleteNotice(notice.id)}
                    disabled={isDeleting}
                    className="text-muted-foreground hover:text-destructive p-1 rounded-lg hover:bg-destructive/10 transition"
                    title="Delete Notice"
                  >
                    {isDeleting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-foreground/80 leading-relaxed mt-3 whitespace-pre-line bg-muted/30 p-3 rounded-xl border border-border/50">
                  {notice.content}
                </p>

                <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground pt-2 border-t border-border/50">
                  <span>
                    Posted: {new Date(notice.created_at).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {notice.property_area && (
                    <span className="truncate max-w-[180px]">{notice.property_area}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <NoticeComposerModal
        properties={properties}
        selectedPropertyId={selectedPropertyId !== "ALL" ? selectedPropertyId : undefined}
        isOpen={isComposerOpen}
        onClose={() => setIsComposerOpen(false)}
        onSuccess={() => {
          loadNotices();
        }}
      />
    </div>
  );
}
