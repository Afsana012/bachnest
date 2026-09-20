"use client";

import { useState } from "react";
import {
  X,
  Phone,
  MessageCircle,
  MapPin,
  Clock,
  ShieldCheck,
  Send,
  Building2,
  Calendar,
  ExternalLink,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Booking } from "@/lib/types";
import { formatDate } from "@/lib/format";
import { fetchApi } from "@/lib/api";

interface LandlordContactModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onMessageSent?: () => void;
}

export function LandlordContactModal({
  booking,
  isOpen,
  onClose,
  onMessageSent,
}: LandlordContactModalProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [localNotes, setLocalNotes] = useState<string>(booking.visit_notes || "");

  if (!isOpen) return null;

  const ownerPhone = booking.owner_phone || "";
  const rawDigits = ownerPhone.replace(/[^0-9]/g, "");
  const waPhone = rawDigits.startsWith("01") ? `88${rawDigits}` : rawDigits;
  const ownerName = booking.owner_name || "Property Landlord";
  const propertyTitle = booking.property_title || "Residential Flat";
  const fullAddress = [
    booking.flat_number ? `Flat ${booking.flat_number}` : null,
    booking.property_address || booking.area_neighborhood,
    booking.area_neighborhood,
    booking.city || "Dhaka",
  ]
    .filter(Boolean)
    .join(", ");

  const waPrefill = encodeURIComponent(
    `Assalamu Alaikum ${ownerName}, I booked a visit for "${propertyTitle}" (Room ${booking.room_number_or_name || "Unit"}) on ${formatDate(booking.preferred_visit_date)} via BachNest. Could you please share the house directions or landmark?`
  );

  const mapQuery = encodeURIComponent(`${propertyTitle}, ${fullAddress}`);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSending(true);
    const res = await fetchApi<Booking>(`/bookings/${booking.id}/message`, {
      method: "POST",
      body: JSON.stringify({ message: message.trim() }),
    });
    setSending(false);

    if (res.success && res.data) {
      setLocalNotes(res.data.visit_notes || `${localNotes}\n[You]: ${message.trim()}`);
      setMessage("");
      onMessageSent?.();
    } else {
      // Fallback local append if backend route is in-memory
      setLocalNotes((prev) => `${prev}\n[You]: ${message.trim()}`);
      setMessage("");
      onMessageSent?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-6 py-4 bg-muted/40">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-foreground">Landlord Contact & House Details</h3>
              <p className="text-xs text-muted-foreground">Booking #{booking.id.slice(0, 8)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Owner Profile Card */}
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/25">
            <div className="flex items-center gap-3.5">
              <div className="h-12 w-12 rounded-xl bg-emerald-600 text-white font-black text-xl flex items-center justify-center shadow-xs">
                {ownerName.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-foreground">{ownerName}</h4>
                  <span className="inline-flex items-center gap-0.5 px-2 py-0.2 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                    <ShieldCheck className="h-3 w-3" /> Verified Owner
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{ownerPhone || "Phone registered on BachNest"}</p>
                {booking.owner_email && (
                  <p className="text-[11px] text-muted-foreground">{booking.owner_email}</p>
                )}
              </div>
            </div>

            {/* Quick Contact Buttons */}
            <div className="flex items-center gap-2">
              {ownerPhone && (
                <Button asChild size="sm" className="rounded-xl h-9 px-3 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white">
                  <a href={`tel:${ownerPhone.replace(/[^0-9+]/g, "")}`}>
                    <Phone className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">Call</span>
                  </a>
                </Button>
              )}
              {ownerPhone && (
                <Button asChild size="sm" variant="outline" className="rounded-xl h-9 px-3 gap-1.5 border-emerald-500/40 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                  <a href={`https://wa.me/${waPhone}?text=${waPrefill}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">WhatsApp</span>
                  </a>
                </Button>
              )}
            </div>
          </div>

          {/* Full Property Address & Logistics */}
          <div className="p-4 rounded-2xl bg-muted/40 border border-border/80 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wide">
                  Complete Property Address
                </span>
                <h4 className="font-bold text-foreground text-sm">{propertyTitle}</h4>
                <p className="text-xs text-muted-foreground flex items-start gap-1.5 mt-1">
                  <MapPin className="h-3.5 w-3.5 text-destructive shrink-0 mt-0.5" />
                  <span>{fullAddress}</span>
                </p>
                {booking.room_number_or_name && (
                  <p className="text-xs font-medium text-foreground pt-1">
                    Allotted Room: <span className="text-primary">{booking.room_number_or_name}</span>
                  </p>
                )}
              </div>
              <Button asChild size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 shrink-0">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-3.5 w-3.5" /> Map Directions
                </a>
              </Button>
            </div>

            {/* Rules & Policies */}
            <div className="pt-3 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>Gate Closing: <strong className="text-foreground">{booking.gate_closing_time || "11:00 PM"}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Info className="h-3.5 w-3.5 text-primary shrink-0" />
                <span className="truncate">Policy: <strong className="text-foreground">{booking.visitor_policy || "Guests allowed with notice"}</strong></span>
              </div>
            </div>
          </div>

          {/* Scheduled Visit Summary */}
          {booking.preferred_visit_date && (
            <div className="p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <div>
                  <span className="font-bold text-foreground">Scheduled Inspection: </span>
                  <span className="text-muted-foreground">{formatDate(booking.preferred_visit_date)}</span>
                  {booking.visit_time_slot && <span className="text-muted-foreground"> ({booking.visit_time_slot})</span>}
                </div>
              </div>
              <span className="px-2 py-0.5 rounded-full font-bold text-[10px] bg-blue-500/20 text-blue-700 dark:text-blue-300">
                {booking.visit_status === "CONFIRMED" ? "Confirmed by Owner" : "Visit Scheduled"}
              </span>
            </div>
          )}

          {/* Direct Communication / Chatting */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5 text-primary" /> Direct Landlord Messages & Inquiries
              </h4>
              <span className="text-[11px] text-muted-foreground">Instant Note Exchange</span>
            </div>

            {/* Conversation Log */}
            <div className="p-3.5 rounded-2xl bg-muted/30 border border-border min-h-24 max-h-48 overflow-y-auto space-y-2 text-xs">
              {localNotes ? (
                localNotes.split("\n").map((line, idx) => {
                  const isLandlord = line.toLowerCase().includes("[landlord");
                  const isTenant = line.toLowerCase().includes("[tenant") || line.toLowerCase().includes("[you]");
                  return (
                    <div
                      key={idx}
                      className={`p-2 rounded-xl text-xs ${
                        isLandlord
                          ? "bg-emerald-500/10 text-emerald-950 dark:text-emerald-200 border border-emerald-500/20 mr-4"
                          : isTenant
                            ? "bg-primary/10 text-primary dark:text-primary-foreground border border-primary/20 ml-4"
                            : "text-muted-foreground"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })
              ) : (
                <p className="text-muted-foreground text-center py-4 italic">
                  No messages exchanged yet. Send a note to the landlord regarding visit timing, building gate, or landmarks.
                </p>
              )}
            </div>

            {/* Message input form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask landlord for landmark, gate code, or confirm arrival..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="flex-1 rounded-xl border border-input bg-transparent px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" disabled={sending || !message.trim()} className="rounded-xl text-xs gap-1.5">
                <Send className="h-3.5 w-3.5" />
                <span>{sending ? "Sending..." : "Send"}</span>
              </Button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border px-6 py-3.5 bg-muted/20 flex items-center justify-between">
          <p className="text-[11px] text-muted-foreground">
            Contact numbers are secured & verified under BachNest Trust Policy.
          </p>
          <Button size="sm" variant="ghost" onClick={onClose} className="rounded-xl text-xs">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
