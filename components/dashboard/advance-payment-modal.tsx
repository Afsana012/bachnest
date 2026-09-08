"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, ShieldCheck, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Booking, PaymentMethod } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface AdvancePaymentModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const PAYMENT_METHODS: { id: PaymentMethod; label: string; color: string }[] = [
  { id: "BKASH", label: "bKash", color: "bg-pink-500/10 text-pink-600 border-pink-500/30" },
  { id: "NAGAD", label: "Nagad", color: "bg-orange-500/10 text-orange-600 border-orange-500/30" },
  { id: "ROCKET", label: "Rocket", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
];

export function AdvancePaymentModal({ booking, isOpen, onClose, onSuccess }: AdvancePaymentModalProps) {
  const [advanceAmount, setAdvanceAmount] = useState("1000");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("BKASH");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = Number(advanceAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      setError("Please enter a valid advance amount.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetchApi<Booking>(`/bookings/${booking.id}/pay-advance`, {
      method: "POST",
      body: JSON.stringify({
        advance_amount: amount,
        payment_method: paymentMethod,
        remarks: remarks.trim() || undefined,
      }),
    });

    setLoading(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setError(res.message || "Failed to process advance payment.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6">
        <div className="flex items-center justify-between border-b border-border/60 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Pay Advance Token Deposit</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
            {error}
          </div>
        )}

        <div className="p-3 mb-4 rounded-xl bg-muted/40 border border-border/50 text-xs space-y-1">
          <p className="font-semibold text-foreground flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Inspected & Confirmed Room
          </p>
          <p className="text-muted-foreground">
            Paying this token advance locks your room reservation and issues your official digital tenancy agreement.
          </p>
        </div>

        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Advance Amount (BDT) *
            </label>
            <Input
              type="number"
              value={advanceAmount}
              onChange={(e) => setAdvanceAmount(e.target.value)}
              placeholder="e.g. 1000"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">
              Payment Gateway
            </label>
            <div className="grid grid-cols-3 gap-2">
              {PAYMENT_METHODS.map((method) => (
                <button
                  key={method.id}
                  type="button"
                  onClick={() => setPaymentMethod(method.id)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                    paymentMethod === method.id
                      ? `${method.color} ring-2 ring-primary/40`
                      : "border-border bg-background text-muted-foreground hover:border-foreground/20"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Payment Note / Ref (Optional)
            </label>
            <Input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Transaction ID / Advance token"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="rounded-xl flex items-center gap-2">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirm Payment
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
