"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { Notice } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function NoticePanel() {
  const [notices, setNotices] = useState<Notice[]>([]);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Bell className="h-5 w-5 text-muted-foreground" /> Building Notices
      </h2>
      {notices.length > 0 ? (
        <div className="space-y-4">
          {notices.map((notice) => (
            <div
              key={notice.id}
              className={`p-5 rounded-xl border shadow-sm ${
                notice.is_read ? "border-border bg-card" : "border-primary/30 bg-primary/5"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="font-semibold text-foreground flex items-center gap-2">
                    {!notice.is_read && <BellRing className="h-4 w-4 text-primary" />}
                    {notice.title}
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">{notice.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">Posted {formatDate(notice.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={notice.priority} />
                  {!notice.is_read && (
                    <button onClick={() => markRead(notice.id)} className="text-xs text-primary hover:underline">
                      Mark read
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
          <p className="text-sm text-muted-foreground">No notices from your landlord yet.</p>
        </div>
      )}
    </div>
  );
}
