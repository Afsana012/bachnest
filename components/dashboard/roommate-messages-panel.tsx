"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  MessageCircle,
  Phone,
  Send,
  CheckCircle2,
  Clock,
  Inbox,
  User,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoommateMessage } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate } from "@/lib/format";

export function RoommateMessagesPanel() {
  const [messages, setMessages] = useState<RoommateMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function fetchMessages() {
      try {
        const res = await fetchApi<RoommateMessage[]>("/roommates/messages/me");
        if (active && res.success && Array.isArray(res.data)) {
          setMessages(res.data);
        }
      } catch {
        // unauthenticated or offline
      } finally {
        if (active) setLoading(false);
      }
    }
    fetchMessages();
    return () => {
      active = false;
    };
  }, []);

  const handleSendReply = async (messageId: string) => {
    const text = (replyTextMap[messageId] || "").trim();
    if (!text) return;

    setSendingReplyId(messageId);
    const res = await fetchApi<RoommateMessage>(`/roommates/messages/${messageId}/reply`, {
      method: "PATCH",
      body: JSON.stringify({ reply: text }),
    });
    setSendingReplyId(null);

    if (res.success && res.data) {
      setMessages((prev) => prev.map((m) => (m.id === messageId ? res.data : m)));
      setReplyTextMap((prev) => ({ ...prev, [messageId]: "" }));
    } else {
      alert(res.message || "Failed to send reply");
    }
  };

  const getWaLink = (contact: string, name: string) => {
    const rawDigits = contact.replace(/[^0-9]/g, "");
    if (!rawDigits || rawDigits.length < 10) return null;
    const waPhone = rawDigits.startsWith("01") ? `88${rawDigits}` : rawDigits;
    return `https://wa.me/${waPhone}?text=${encodeURIComponent(
      `Assalamu Alaikum ${name}, replying to your roommate inquiry on BachNest.`
    )}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" /> Roommate Inquiries & Messages
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Connect directly with potential bachelors, flatmates, and respond to match requests.
          </p>
        </div>
        <Button asChild size="sm" variant="outline" className="rounded-xl self-start sm:self-auto">
          <Link href="/roommates">
            <ExternalLink className="h-4 w-4 mr-1.5" /> Find Roommates
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="py-12 flex justify-center items-center">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
      ) : messages.length > 0 ? (
        <div className="space-y-4">
          {messages.map((msg) => {
            const waLink = getWaLink(msg.sender_contact, msg.sender_name);
            const isReplying = sendingReplyId === msg.id;

            return (
              <div
                key={msg.id}
                className="p-5 rounded-2xl border border-border bg-card shadow-xs space-y-4 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary font-bold flex items-center justify-center">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground text-sm">{msg.sender_name}</h4>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-medium text-muted-foreground">
                          {msg.sender_contact}
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Clock className="h-3 w-3" /> {formatDate(msg.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {waLink && (
                      <Button asChild size="sm" variant="outline" className="h-8 rounded-xl text-xs gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                        <a href={waLink} target="_blank" rel="noopener noreferrer">
                          <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                        </a>
                      </Button>
                    )}
                    {msg.sender_contact.replace(/[^0-9]/g, "").length >= 10 && (
                      <Button asChild size="sm" variant="ghost" className="h-8 rounded-xl text-xs gap-1.5">
                        <a href={`tel:${msg.sender_contact.replace(/[^0-9]/g, "")}`}>
                          <Phone className="h-3.5 w-3.5" /> Call
                        </a>
                      </Button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="p-3.5 rounded-xl bg-muted/40 text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">
                    {msg.message}
                  </div>

                  {msg.reply && (
                    <div className="ml-4 p-3 rounded-xl bg-primary/10 border border-primary/20 text-xs text-foreground space-y-1">
                      <span className="font-semibold text-primary flex items-center gap-1 text-[11px]">
                        <CheckCircle2 className="h-3 w-3" /> Your Reply:
                      </span>
                      <p className="whitespace-pre-wrap">{msg.reply}</p>
                    </div>
                  )}

                  {!msg.reply && (
                    <div className="pt-2 flex items-center gap-2">
                      <Input
                        placeholder="Type a quick reply to this roommate..."
                        value={replyTextMap[msg.id] || ""}
                        onChange={(e) =>
                          setReplyTextMap((prev) => ({ ...prev, [msg.id]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault();
                            handleSendReply(msg.id);
                          }
                        }}
                        className="h-9 rounded-xl text-xs"
                      />
                      <Button
                        size="sm"
                        disabled={isReplying || !(replyTextMap[msg.id] || "").trim()}
                        onClick={() => handleSendReply(msg.id)}
                        className="h-9 rounded-xl px-3 text-xs shrink-0"
                      >
                        <Send className="h-3.5 w-3.5 mr-1" />
                        {isReplying ? "Sending..." : "Reply"}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-14 text-center rounded-2xl border border-dashed border-border bg-muted/20 space-y-3">
          <div className="mx-auto w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground">
            <Inbox className="h-6 w-6" />
          </div>
          <div>
            <h4 className="font-semibold text-foreground text-sm">No roommate inquiries yet</h4>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              When bachelors find your roommate ad or when you send match requests, conversations will appear here.
            </p>
          </div>
          <Button asChild size="sm" className="rounded-xl text-xs font-semibold">
            <Link href="/roommates">Browse Roommates in Dhaka</Link>
          </Button>
        </div>
      )}
    </div>
  );
}
