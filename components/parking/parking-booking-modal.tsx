"use client";

import { useState } from "react";
import { X, Loader2, CheckCircle2, ShieldCheck, Calendar, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParkingBooking, ParkingRentalPlan, ParkingSearchItem } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

interface ParkingBookingModalProps {
  spot: ParkingSearchItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ParkingBookingModal({ spot, isOpen, onClose, onSuccess }: ParkingBookingModalProps) {
  const { isAuthenticated } = useAuth();
  const [rentalPlan, setRentalPlan] = useState<ParkingRentalPlan>("MONTHLY");
  const [vehicleReg, setVehicleReg] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen) return null;

  const calculateTotal = () => {
    if (rentalPlan === "DAILY") {
      const dailyRate = Number(spot.daily_rate) || 0;
      if (startDate && endDate && endDate > startDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const days = Math.max(1, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
        return dailyRate * days;
      }
      return dailyRate;
    }
    return Number(spot.monthly_rate) || 0;
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      setError("Please log in to book a parking spot.");
      return;
    }

    if (!vehicleReg.trim()) {
      setError("Please provide your vehicle registration number.");
      return;
    }

    if (rentalPlan === "DAILY" && !endDate) {
      setError("Please specify an end date for daily parking.");
      return;
    }

    setLoading(true);
    setError("");

    const res = await fetchApi<ParkingBooking>(`/parking/${spot.id}/book`, {
      method: "POST",
      body: JSON.stringify({
        rental_plan: rentalPlan,
        vehicle_registration_number: vehicleReg.trim(),
        start_date: startDate,
        end_date: rentalPlan === "DAILY" && endDate ? endDate : undefined,
      }),
    });

    setLoading(false);

    if (res.success) {
      setSuccessMsg("Parking space reserved successfully!");
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } else {
      setError(res.message || "Failed to book parking space.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl text-card-foreground">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:bg-muted transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold">Reserve Parking Space</h3>
            <p className="text-xs text-muted-foreground">
              {spot.space_number_or_name} • {spot.property_title}
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
            <CheckCircle2 className="h-12 w-12 text-green-500 animate-in zoom-in" />
            <p className="text-base font-semibold">{successMsg}</p>
            <p className="text-xs text-muted-foreground">Redirecting to your parking passes...</p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                {error}
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">
                Rental Plan
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setRentalPlan("MONTHLY")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                    rentalPlan === "MONTHLY"
                      ? "border-primary bg-primary/5 text-primary shadow-xs"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="font-bold">Monthly Pass</span>
                  <span className="text-xs opacity-80">৳{Number(spot.monthly_rate).toLocaleString()}/month</span>
                </button>
                <button
                  type="button"
                  disabled={!spot.daily_rate}
                  onClick={() => setRentalPlan("DAILY")}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border text-sm font-medium transition-all ${
                    !spot.daily_rate ? "opacity-40 cursor-not-allowed border-border text-muted-foreground" :
                    rentalPlan === "DAILY"
                      ? "border-primary bg-primary/5 text-primary shadow-xs"
                      : "border-border hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="font-bold">Daily Stay</span>
                  <span className="text-xs opacity-80">
                    {spot.daily_rate ? `৳${Number(spot.daily_rate).toLocaleString()}/day` : "Not Available"}
                  </span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                Vehicle Registration Number
              </label>
              <div className="relative">
                <Hash className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="e.g. Dhaka Metro-Ha 45-6789"
                  value={vehicleReg}
                  onChange={(e) => setVehicleReg(e.target.value)}
                  className="pl-9"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>
              {rentalPlan === "DAILY" && (
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="pl-9"
                      required
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-xl bg-muted/50 p-3.5 border border-border/60 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Estimated Fee</p>
                <p className="text-xl font-black tracking-tight text-primary">
                  ৳{calculateTotal().toLocaleString()}
                </p>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <p>{spot.is_covered ? "Covered Bay" : "Open Bay"}</p>
                <p>{spot.has_cctv ? "24/7 CCTV Monitored" : "Secured Gate"}</p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 font-semibold">
                {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Confirm Reservation
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
