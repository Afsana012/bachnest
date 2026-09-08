"use client";

import { useState } from "react";
import {
  X,
  ShieldCheck,
  MapPin,
  Calendar,
  DollarSign,
  Briefcase,
  Phone,
  Send,
  MessageCircle,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RoommateProfile } from "@/lib/types";
import { formatMoney } from "@/lib/format";

interface RoommateConnectModalProps {
  roommate: RoommateProfile;
  isOpen: boolean;
  onClose: () => void;
}

export function RoommateConnectModal({ roommate, isOpen, onClose }: RoommateConnectModalProps) {
  const [message, setMessage] = useState("");
  const [senderContact, setSenderContact] = useState("");
  const [sent, setSent] = useState(false);

  if (!isOpen) return null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !senderContact.trim()) return;
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage("");
      setSenderContact("");
      onClose();
    }, 2500);
  };

  const cleanPhone = roommate.phone?.replace(/[^0-9]/g, "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Roommate Profile & Contact</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="flex items-start gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-black text-2xl border border-primary/20 shrink-0">
              {roommate.full_name.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className="font-extrabold text-lg text-foreground truncate">{roommate.full_name}</h4>
                {roommate.is_kyc_verified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <ShieldCheck className="h-3.5 w-3.5" /> NID Verified
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                <Briefcase className="h-3.5 w-3.5 text-primary" />
                {roommate.occupation} • {roommate.institution_or_company}
              </p>
              <div className="flex items-center gap-3 text-xs text-muted-foreground mt-2">
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Trust Score: {roommate.trust_score}%
                </span>
                <span>•</span>
                <span className="capitalize">{roommate.gender.toLowerCase()} bachelor</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-muted/30 border border-border/80 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Max Monthly Budget</span>
              <p className="font-bold text-foreground text-sm flex items-center">
                <DollarSign className="h-3.5 w-3.5 text-primary mr-0.5" />
                {formatMoney(roommate.budget_max)}/mo
              </p>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Target Move-in</span>
              <p className="font-bold text-foreground text-sm flex items-center">
                <Calendar className="h-3.5 w-3.5 text-primary mr-0.5" />
                {roommate.move_in_date}
              </p>
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Preferred Neighborhoods
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roommate.preferred_areas.map((area: string) => (
                <span
                  key={area}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-muted border border-border text-foreground"
                >
                  <MapPin className="h-3 w-3 text-primary" />
                  {area}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
              Lifestyle Habits & Preferences
            </span>
            <div className="flex flex-wrap gap-1.5">
              {roommate.lifestyle_tags.map((tag: string) => (
                <span
                  key={tag}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-primary/10 text-primary border border-primary/20"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-1">
              About & Expectations
            </span>
            <p className="text-xs text-foreground/90 leading-relaxed bg-muted/20 p-3.5 rounded-xl border border-border/70">
              {roommate.bio}
            </p>
          </div>

          <div className="border-t border-border/80 pt-5 space-y-3">
            <h5 className="text-xs font-bold text-foreground uppercase tracking-wider">Direct Contact Options</h5>

            {roommate.phone_visible && roommate.phone ? (
              <div className="flex flex-wrap gap-2">
                <a
                  href={`tel:${roommate.phone}`}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold border border-border bg-card hover:bg-muted transition-colors text-foreground"
                >
                  <Phone className="h-4 w-4 text-emerald-500" />
                  Call: {roommate.phone}
                </a>
                {cleanPhone && (
                  <a
                    href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(roommate.full_name)},%20I%20saw%20your%20roommate%20profile%20on%20BachNest.`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                  >
                    <MessageCircle className="h-4 w-4" />
                    WhatsApp
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                Phone number is kept private by user. You can send a direct invitation message below:
              </p>
            )}

            {sent ? (
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-semibold flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Invitation sent successfully! {roommate.full_name} has been notified.
              </div>
            ) : (
              <form onSubmit={handleSend} className="space-y-3 pt-2">
                <Input
                  placeholder="Your Phone / WhatsApp number or Email"
                  value={senderContact}
                  onChange={(e) => setSenderContact(e.target.value)}
                  className="rounded-xl text-xs"
                  required
                />
                <textarea
                  rows={2}
                  placeholder={`Hi ${roommate.full_name}, I have a flat in ${roommate.preferred_areas[0] || "Dhaka"} and looking for a roommate...`}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full rounded-xl border border-input bg-transparent p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  required
                />
                <Button type="submit" size="sm" className="w-full rounded-xl font-bold shadow-xs">
                  <Send className="h-3.5 w-3.5 mr-1.5" />
                  Send Match Request
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
