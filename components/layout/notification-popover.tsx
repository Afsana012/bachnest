"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  CheckCheck,
  MessageCircle,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Megaphone,
} from "lucide-react";
import { fetchApi } from "@/lib/api";
import { NotificationItem, NotificationSummary } from "@/lib/types";
import { useAuth } from "@/hooks/use-auth";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSec < 60) return "Just now";
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDay = Math.floor(diffHour / 24);
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function getNotificationIcon(type?: string) {
  switch (type) {
    case "BUILDING_NOTICE":
      return <Megaphone className="h-4 w-4 text-amber-500 shrink-0" />;
    case "BOOKING_MESSAGE":
      return <MessageCircle className="h-4 w-4 text-emerald-500 shrink-0" />;
    case "VISIT_CONFIRMED":
      return <CalendarCheck className="h-4 w-4 text-blue-500 shrink-0" />;
    case "BOOKING_APPROVED":
      return <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />;
    case "BOOKING_REJECTED":
      return <AlertCircle className="h-4 w-4 text-destructive shrink-0" />;
    default:
      return <Bell className="h-4 w-4 text-primary shrink-0" />;
  }
}

export function NotificationPopover() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [summary, setSummary] = useState<NotificationSummary>({ unread_count: 0, items: [] });
  const [loading, setLoading] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    const res = await fetchApi<NotificationSummary>("/notifications/me?limit=25");
    if (res.success && res.data) {
      setSummary(res.data);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const initialTimer = setTimeout(() => {
      fetchNotifications();
    }, 0);
    const interval = setInterval(fetchNotifications, 25000);
    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [isAuthenticated, fetchNotifications]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAsRead = async (item: NotificationItem) => {
    if (!item.is_read) {
      setSummary((prev) => ({
        unread_count: Math.max(0, prev.unread_count - 1),
        items: prev.items.map((n) => (n.id === item.id ? { ...n, is_read: true } : n)),
      }));
      await fetchApi<NotificationItem>(`/notifications/${item.id}/read`, { method: "PATCH" });
    }

    setIsOpen(false);

    if (item.data?.type === "BUILDING_NOTICE") {
      router.push("/dashboard?tab=notices");
      return;
    }

    if (item.data?.booking_id) {
      if (user?.role === "OWNER") {
        router.push("/dashboard/owner");
      } else {
        router.push(`/dashboard?bookingId=${item.data.booking_id}`);
      }
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    setSummary((prev) => ({
      unread_count: 0,
      items: prev.items.map((n) => ({ ...n, is_read: true })),
    }));
    await fetchApi<{ updated_count: number }>("/notifications/read-all", { method: "POST" });
    setLoading(false);
  };

  if (!isAuthenticated) return null;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notifications"
        className="relative flex h-8 w-8 items-center justify-center rounded-full border border-border bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
      >
        <Bell className="h-4 w-4" />
        {summary.unread_count > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground shadow-xs animate-in zoom-in-50">
            {summary.unread_count > 9 ? "9+" : summary.unread_count}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl border border-border bg-popover shadow-xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-foreground">Notifications</h4>
              {summary.unread_count > 0 && (
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {summary.unread_count} new
                </span>
              )}
            </div>
            {summary.unread_count > 0 && (
              <button
                type="button"
                disabled={loading}
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-primary transition-colors disabled:opacity-50"
              >
                <CheckCheck className="h-3.5 w-3.5" />
                <span>Mark all as read</span>
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto divide-y divide-border/60">
            {summary.items.length > 0 ? (
              summary.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleMarkAsRead(item)}
                  className={`w-full text-left p-3.5 flex items-start gap-3 transition-colors hover:bg-muted/60 ${
                    !item.is_read ? "bg-primary/5" : "bg-transparent"
                  }`}
                >
                  <div className="mt-0.5">{getNotificationIcon(item.data?.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p
                        className={`text-xs truncate ${
                          !item.is_read ? "font-bold text-foreground" : "font-medium text-foreground/80"
                        }`}
                      >
                        {item.title}
                      </p>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatRelativeTime(item.created_at)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                      {item.body}
                    </p>
                    {item.data?.property_title && (
                      <span className="inline-block mt-1 text-[10px] text-primary/80 font-medium truncate max-w-full">
                        {item.data.property_title}
                      </span>
                    )}
                  </div>
                  <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50 self-center shrink-0" />
                </button>
              ))
            ) : (
              <div className="py-8 text-center px-4">
                <Bell className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
                <p className="text-xs font-medium text-muted-foreground">No notifications yet</p>
                <p className="text-[11px] text-muted-foreground/70 mt-0.5">
                  Visit confirmations and messages will appear here.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
