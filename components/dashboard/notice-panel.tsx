"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing, CheckCheck, AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Notice, NoticePriority } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

function getPriorityBadge(priority: NoticePriority) {
  switch (priority) {
    case "URGENT":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-red-500/30 bg-red-500/10 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
          <AlertCircle className="h-3 w-3" /> URGENT ALERT
        </span>
      );
    case "HIGH":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-amber-500/30 bg-amber-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          <AlertTriangle className="h-3 w-3" /> High Priority
        </span>
      );
    case "LOW":
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-slate-500/30 bg-slate-500/10 px-2.5 py-0.5 text-[11px] font-medium text-slate-600 dark:text-slate-400">
          Memo
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-[11px] font-medium text-blue-600 dark:text-blue-400">
          <Info className="h-3 w-3" /> Notice
        </span>
      );
  }
}

export function NoticePanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "URGENT">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadNotices() {
      const res = await fetchApi<Notice[]>("/tenancies/me/notices");
      if (!active) return;
      if (res.success && res.data) {
        setNotices(res.data);
      }
      setLoading(false);
    }

    loadNotices();
    return () => {
      active = false;
    };
  }, []);

  const markRead = async (noticeId: string) => {
    const res = await fetchApi(`/notices/${noticeId}/read`, { method: "POST" });
    if (res.success) {
      setNotices((prev) => prev.map((n) => (n.id === noticeId ? { ...n, is_read: true } : n)));
    }
  };

  const markAllRead = async () => {
    const unread = notices.filter((n) => !n.is_read);
    await Promise.all(unread.map((n) => fetchApi(`/notices/${n.id}/read`, { method: "POST" })));
    setNotices((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const unreadCount = notices.filter((n) => !n.is_read).length;

  const filteredNotices = notices.filter((n) => {
    if (filter === "UNREAD") return !n.is_read;
    if (filter === "URGENT") return n.priority === "URGENT" || n.priority === "HIGH";
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" /> Building Announcements & Notices
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Official broadcast communications from your building management and landlord.
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllRead}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline self-start sm:self-auto"
          >
            <CheckCheck className="h-3.5 w-3.5" /> Mark All as Read ({unreadCount})
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 border-b border-border pb-2 text-xs">
        {(["ALL", "UNREAD", "URGENT"] as const).map((tab) => (
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
            {tab === "ALL"
              ? `All Notices (${notices.length})`
              : tab === "UNREAD"
              ? `Unread (${unreadCount})`
              : "Urgent Alerts"}
          </button>
        ))}
      </div>

      {filteredNotices.length > 0 ? (
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <div
              key={notice.id}
              className={`p-5 rounded-xl border transition-all ${
                notice.priority === "URGENT"
                  ? "border-red-500/30 bg-red-500/5"
                  : notice.is_read
                  ? "border-border bg-card"
                  : "border-primary/40 bg-primary/5 shadow-xs"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {!notice.is_read && (
                      <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                    )}
                    <h4 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                      {!notice.is_read && <BellRing className="h-3.5 w-3.5 text-primary" />}
                      {notice.title}
                    </h4>
                    {getPriorityBadge(notice.priority)}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {notice.content}
                  </p>
                  <span className="text-[11px] text-muted-foreground/80 block pt-1">
                    Posted on {formatDate(notice.created_at)}
                  </span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {!notice.is_read && (
                    <button
                      type="button"
                      onClick={() => markRead(notice.id)}
                      className="inline-flex items-center gap-1 rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
          <Bell className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-sm font-medium text-foreground">No notices found.</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "UNREAD" ? "You have read all announcements!" : "No notices posted for your premises."}
          </p>
        </div>
      )}
    </div>
  );
}
