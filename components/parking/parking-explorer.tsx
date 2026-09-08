"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bike,
  Car,
  ShieldCheck,
  Camera,
  MapPin,
  Search,
  CheckCircle2,
  Calendar,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ParkingSearchItem, ParkingVehicleType } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { ParkingBookingModal } from "./parking-booking-modal";

const POPULAR_DHAKA_AREAS = [
  "All Areas",
  "Mirpur",
  "Uttara",
  "Dhanmondi",
  "Mohakhali",
  "Bashundhara",
  "Banani",
  "Badda",
  "Farmgate",
];

export function ParkingExplorer() {
  const [spots, setSpots] = useState<ParkingSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchArea, setSearchArea] = useState("");
  const [selectedAreaPill, setSelectedAreaPill] = useState("All Areas");
  const [vehicleType, setVehicleType] = useState<ParkingVehicleType | "ALL">("ALL");
  const [coveredOnly, setCoveredOnly] = useState(false);
  const [cctvOnly, setCctvOnly] = useState(false);

  const [bookingSpot, setBookingSpot] = useState<ParkingSearchItem | null>(null);

  const loadSpots = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    const effectiveArea = selectedAreaPill !== "All Areas" ? selectedAreaPill : searchArea.trim();
    if (effectiveArea) params.set("area", effectiveArea);
    if (vehicleType !== "ALL") params.set("vehicle_type", vehicleType);
    if (coveredOnly) params.set("is_covered", "true");
    if (cctvOnly) params.set("has_cctv", "true");
    params.set("only_available", "true");

    const res = await fetchApi<ParkingSearchItem[]>(`/parking/search?${params.toString()}`);
    if (res.success && res.data) {
      setSpots(res.data);
    } else {
      setSpots([]);
    }
    setLoading(false);
  }, [searchArea, selectedAreaPill, vehicleType, coveredOnly, cctvOnly]);

  useEffect(() => {
    const t = setTimeout(loadSpots, 0);
    return () => clearTimeout(t);
  }, [loadSpots]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedAreaPill("All Areas");
    loadSpots();
  };

  return (
    <div className="space-y-8">
      <div className="rounded-3xl border border-border/80 bg-card/60 backdrop-blur-md p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by neighborhood (e.g. Mirpur-10, Road 4, Sector 7)..."
              value={searchArea}
              onChange={(e) => setSearchArea(e.target.value)}
              className="pl-10 h-11 rounded-2xl bg-background/80"
            />
          </form>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0">
            <button
              type="button"
              onClick={() => setVehicleType("ALL")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                vehicleType === "ALL"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              All Vehicles
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("BIKE")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                vehicleType === "BIKE"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Bike className="h-4 w-4" />
              <span>Motorcycle</span>
            </button>
            <button
              type="button"
              onClick={() => setVehicleType("CAR")}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                vehicleType === "CAR"
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              <Car className="h-4 w-4" />
              <span>Car Parking</span>
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border/50">
          <div className="flex flex-wrap items-center gap-1.5">
            {POPULAR_DHAKA_AREAS.map((area) => (
              <button
                key={area}
                type="button"
                onClick={() => {
                  setSelectedAreaPill(area);
                  setSearchArea("");
                }}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedAreaPill === area
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setCoveredOnly(!coveredOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                coveredOnly
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Covered Garage</span>
            </button>

            <button
              type="button"
              onClick={() => setCctvOnly(!cctvOnly)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                cctvOnly
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              <Camera className="h-3.5 w-3.5" />
              <span>24/7 CCTV</span>
            </button>

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={loadSpots}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
          ))}
        </div>
      ) : spots.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-16 text-center px-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-4">
            <AlertCircle className="h-7 w-7" />
          </div>
          <h3 className="text-lg font-bold">No Parking Spaces Found</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            We couldn&apos;t find any vacant garage or parking slots matching your criteria. Try adjusting your area or vehicle filter.
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSearchArea("");
              setSelectedAreaPill("All Areas");
              setVehicleType("ALL");
              setCoveredOnly(false);
              setCctvOnly(false);
            }}
            className="mt-4 rounded-xl"
          >
            Reset All Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <div
              key={spot.id}
              className="group relative flex flex-col justify-between rounded-3xl border border-border/80 bg-card p-6 shadow-sm transition-all hover:shadow-md hover:border-primary/40"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary">
                        {spot.vehicle_type === "BIKE" ? (
                          <Bike className="h-3 w-3" />
                        ) : (
                          <Car className="h-3 w-3" />
                        )}
                        {spot.vehicle_type === "BIKE" ? "Motorcycle Slot" : "Car Garage Slot"}
                      </span>
                      {spot.is_available && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Vacant
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-bold text-foreground mt-2 group-hover:text-primary transition-colors">
                      {spot.space_number_or_name}
                    </h3>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-muted-foreground">
                  <p className="font-medium text-foreground/90">{spot.property_title}</p>
                  <p className="flex items-center gap-1 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{spot.property_address}, {spot.area_neighborhood}, {spot.city}</span>
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    spot.is_covered ? "bg-muted text-foreground" : "bg-muted/40 text-muted-foreground"
                  }`}>
                    <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                    {spot.is_covered ? "Covered Shelter" : "Open Parking"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                    spot.has_cctv ? "bg-muted text-foreground" : "bg-muted/40 text-muted-foreground"
                  }`}>
                    <Camera className="h-3.5 w-3.5 text-primary" />
                    {spot.has_cctv ? "24/7 CCTV" : "Gated"}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-border/60 flex items-center justify-between gap-4">
                <div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground">
                      ৳{Number(spot.monthly_rate).toLocaleString()}
                    </span>
                    <span className="text-xs text-muted-foreground">/mo</span>
                  </div>
                  {spot.daily_rate ? (
                    <span className="text-[11px] text-muted-foreground block">
                      or ৳{Number(spot.daily_rate).toLocaleString()}/day
                    </span>
                  ) : null}
                </div>

                <Button
                  type="button"
                  onClick={() => setBookingSpot(spot)}
                  className="rounded-xl font-semibold shadow-xs"
                >
                  <Calendar className="h-4 w-4 mr-1.5" />
                  Book Slot
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {bookingSpot && (
        <ParkingBookingModal
          spot={bookingSpot}
          isOpen={Boolean(bookingSpot)}
          onClose={() => setBookingSpot(null)}
          onSuccess={() => {
            loadSpots();
          }}
        />
      )}
    </div>
  );
}
