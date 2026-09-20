"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  MapPin,
  ShieldCheck,
  Wifi,
  Zap,
  Camera,
  Building,
  Eye,
  ArrowLeft,
  CheckCircle2,
  Layers,
  CalendarDays,
  Clock,
  Navigation,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Booking, Property, Room, RoomSeat } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { coverImage, enumLabel, formatMoney, toNumber } from "@/lib/format";

export function PropertyDetailView({ property }: { property: Property }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const [bookingError, setBookingError] = useState<string | null>(null);

  const isOwnerOfProperty = Boolean(user && property.owner_id && user.id === property.owner_id);

  const hasCoords = Boolean(
    property.latitude &&
    property.longitude &&
    (Number(property.latitude) !== 0 || Number(property.longitude) !== 0)
  );

  const fullLocationQuery = [
    property.title,
    property.address_line,
    property.area_neighborhood,
    property.city || "Dhaka",
    "Bangladesh",
  ]
    .filter(Boolean)
    .join(", ");

  const mapQueryParam = hasCoords
    ? `${property.latitude},${property.longitude}`
    : encodeURIComponent(fullLocationQuery);

  const embedMapUrl = `https://maps.google.com/maps?q=${mapQueryParam}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const directionsUrl = hasCoords
    ? `https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(fullLocationQuery)}`;
  const googleMapsViewUrl = hasCoords
    ? `https://www.google.com/maps/search/?api=1&query=${property.latitude},${property.longitude}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullLocationQuery)}`;

  const firstAvailable = property.rooms?.find((r) => r.is_available) || property.rooms?.[0];
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(firstAvailable || null);
  const [selectedSeat, setSelectedSeat] = useState<RoomSeat | null>(
    firstAvailable?.seats?.find((s) => !s.is_occupied) ?? null
  );
  const [moveInDate, setMoveInDate] = useState("");
  const [bookingMode, setBookingMode] = useState<"visit" | "direct">("visit");
  const [visitDate, setVisitDate] = useState("");
  const [visitTimeSlot, setVisitTimeSlot] = useState("03:00 PM - 05:00 PM");
  const [visitNotes, setVisitNotes] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  const handleRoomSelect = (room: Room) => {
    setSelectedRoom(room);
    setSelectedSeat(room.seats?.find((s) => !s.is_occupied) ?? null);
  };

  const handleBooking = async () => {
    setBookingError(null);
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    if (isOwnerOfProperty) {
      setBookingError("You are the owner of this property. You cannot schedule visits for your own listing.");
      return;
    }
    if (!selectedRoom) {
      setBookingError("Please select a room first.");
      return;
    }
    const requestedDate = moveInDate || new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0];
    const defaultVisit = new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0];
    setIsBooking(true);
    const res = await fetchApi<Booking>("/bookings/request", {
      method: "POST",
      body: JSON.stringify({
        property_id: property.id,
        room_id: selectedRoom.id,
        seat_id: selectedSeat?.id,
        requested_move_in_date: requestedDate,
        preferred_visit_date: bookingMode === "visit" ? (visitDate || defaultVisit) : undefined,
        visit_time_slot: bookingMode === "visit" ? visitTimeSlot : undefined,
        visit_notes: bookingMode === "visit" ? (visitNotes.trim() || undefined) : undefined,
      }),
    });
    setIsBooking(false);
    if (res.success) {
      setBookingSuccess(true);
    } else {
      setBookingError(res.message || "Failed to submit booking request");
    }
  };

  const rooms = property.rooms ?? [];
  const galleryImages = property.media?.slice(0, 4) ?? [];
  const activeSeatPrice = selectedSeat ? toNumber(selectedSeat.monthly_rent) : null;
  const displayRent = activeSeatPrice ?? toNumber(selectedRoom?.monthly_rent);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-1 rounded-xl">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-muted">
            <Image src={coverImage(property)} alt={property.title} fill className="object-cover" />
            <div className="absolute top-4 left-4 flex gap-2">
              {property.is_verified_by_admin && (
                <Badge variant="success" className="backdrop-blur-md bg-emerald-950/80 text-emerald-300">
                  <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Property
                </Badge>
              )}
              <Badge variant="secondary" className="backdrop-blur-md bg-background/80">
                {enumLabel(property.property_type)}
              </Badge>
              {!property.is_published && (
                <Badge variant="outline" className="backdrop-blur-md bg-background/80">
                  Unpublished
                </Badge>
              )}
            </div>
          </div>

          {galleryImages.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {galleryImages.map((media) => (
                <div key={media.id} className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-muted">
                  <Image src={media.media_url} alt={media.caption || property.title} fill className="object-cover" />
                </div>
              ))}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{property.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" />
                {property.address_line}, {property.area_neighborhood}, {property.city}
              </span>
              <a
                href={directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-primary font-medium hover:underline ml-1"
              >
                <Navigation className="h-3 w-3" /> Get Directions
              </a>
            </div>
            {property.flat_number && (
              <p className="mt-1 text-xs text-muted-foreground">
                Flat {property.flat_number}
                {property.floor_number != null ? `, Floor ${property.floor_number}` : ""}
              </p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 border-y border-border/60 py-4">
            <div>
              <span className="text-xs text-muted-foreground">Available Rooms</span>
              <p className="font-semibold text-sm">{rooms.filter((r) => r.is_available).length} Rooms</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Property Type</span>
              <p className="font-semibold text-sm">{enumLabel(property.property_type)}</p>
            </div>
            <div>
              <span className="text-xs text-muted-foreground">Total Capacity</span>
              <p className="font-semibold text-sm">
                {rooms.reduce((sum, r) => sum + r.total_capacity, 0)} Seats
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold">About this accommodation</h3>
            <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {property.description || "Well-maintained bachelor accommodation with 24/7 security and full utilities."}
            </p>
            {property.visitor_policy && (
              <p className="mt-3 text-xs text-muted-foreground">
                <Eye className="inline h-3.5 w-3.5 mr-1 text-primary" />
                Visitor policy: {property.visitor_policy}
              </p>
            )}
            {property.gate_closing_time && (
              <p className="mt-1 text-xs text-muted-foreground">
                <Building className="inline h-3.5 w-3.5 mr-1 text-primary" />
                Gate closes at {property.gate_closing_time}
              </p>
            )}
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Amenities & Utilities</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                <Wifi className="h-4 w-4 text-primary" />
                <span>{property.has_wifi ? "High-Speed Wifi Included" : "No Wifi"}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                <Zap className="h-4 w-4 text-primary" />
                <span>{property.has_generator ? "Generator Backup" : "No Generator"}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <span>{property.has_cctv ? "24/7 CCTV Security" : "Standard Security"}</span>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                <Layers className="h-4 w-4 text-primary" />
                <span>{property.has_lift ? "Lift Access" : "Walk-up Building"}</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Rooms & Seats</h3>
            {rooms.length > 0 ? (
              <div className="space-y-3">
                {rooms.map((room) => {
                  const isActive = selectedRoom?.id === room.id;
                  return (
                    <button
                      key={room.id}
                      onClick={() => room.is_available && handleRoomSelect(room)}
                      disabled={!room.is_available}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        isActive
                          ? "border-primary bg-primary/5"
                          : room.is_available
                            ? "border-border bg-card hover:border-foreground/20"
                            : "border-border/60 bg-muted/30 opacity-60 cursor-not-allowed"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-semibold text-sm">{room.room_number_or_name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {enumLabel(room.room_type)} • {room.current_occupancy}/{room.total_capacity} occupied
                            {room.has_ac ? " • AC" : ""}
                            {room.has_attached_bathroom ? " • Attached Bath" : ""}
                            {room.has_balcony ? " • Balcony" : ""}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-sm">{formatMoney(room.monthly_rent)}</p>
                          <p className="text-[10px] text-muted-foreground">per month</p>
                        </div>
                      </div>
                      {isActive && room.seats && room.seats.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/60 space-y-2">
                          <p className="text-xs font-medium text-muted-foreground">Select a seat (shared room)</p>
                          <div className="flex flex-wrap gap-2">
                            {room.seats.map((seat) => (
                              <button
                                key={seat.id}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  if (!seat.is_occupied) setSelectedSeat(seat);
                                }}
                                disabled={seat.is_occupied}
                                className={`px-3 py-1.5 rounded-xl border text-xs transition-all ${
                                  selectedSeat?.id === seat.id
                                    ? "border-primary bg-primary text-primary-foreground"
                                    : seat.is_occupied
                                      ? "border-border bg-muted/50 opacity-50 cursor-not-allowed"
                                      : "border-border bg-background hover:border-primary"
                                }`}
                              >
                                {seat.seat_identifier} • {formatMoney(seat.monthly_rent)}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-border text-center text-sm text-muted-foreground">
                <Camera className="h-8 w-8 mx-auto mb-2 opacity-40" />
                The owner has not added room inventory yet.
              </div>
            )}
          </div>

          {/* ── Google Maps & Directions ── */}
          <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="p-5 pb-4 border-b border-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-muted/20">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" /> Location & Directions
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {property.address_line ? `${property.address_line}, ` : ""}{property.area_neighborhood}, {property.city}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild size="sm" className="rounded-xl text-xs gap-1.5 font-medium shadow-xs">
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer">
                    <Navigation className="h-3.5 w-3.5" /> Get Directions
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-xl text-xs gap-1.5 font-medium">
                  <a href={googleMapsViewUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-3.5 w-3.5" /> Open in Maps
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative w-full h-[320px] sm:h-[380px] bg-muted">
              <iframe
                title="Property Location on Google Maps"
                width="100%"
                height="100%"
                className="border-0 w-full h-full"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={embedMapUrl}
              />
            </div>

            <div className="p-3.5 bg-muted/40 border-t border-border/40 text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                {hasCoords
                  ? `GPS Coordinates: ${property.latitude.toFixed(5)}, ${property.longitude.toFixed(5)}`
                  : `${property.area_neighborhood}, ${property.city}`}
              </span>
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 shrink-0" /> Live Interactive Google Map
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="rounded-3xl border-border/80 bg-card/80 p-6 sticky top-24">
            <CardHeader className="p-0 mb-4">
              <span className="text-xs text-muted-foreground uppercase font-semibold">
                {selectedSeat ? "Seat Rent" : "Monthly Rent"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-extrabold text-foreground">{formatMoney(displayRent)}</span>
                <span className="text-xs text-muted-foreground">/ month</span>
              </div>
              {selectedRoom && (
                <p className="text-xs text-muted-foreground mt-1">{selectedRoom.room_number_or_name}</p>
              )}
            </CardHeader>

            <CardContent className="p-0 space-y-4">
              <div className="flex rounded-xl bg-muted/60 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setBookingMode("visit")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    bookingMode === "visit" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="h-3.5 w-3.5" /> Schedule Visit
                </button>
                <button
                  type="button"
                  onClick={() => setBookingMode("direct")}
                  className={`flex-1 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors ${
                    bookingMode === "direct" ? "bg-card text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <CalendarDays className="h-3.5 w-3.5" /> Direct Book
                </button>
              </div>

              {bookingMode === "visit" ? (
                <div className="space-y-3 pt-1">
                  <div className="p-3 rounded-2xl bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground flex items-center gap-1.5 mb-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Inspect in Person First
                    </p>
                    Visit the property, meet the landlord, and inspect the room before paying any advance.
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Preferred Visit Date *
                    </label>
                    <input
                      type="date"
                      value={visitDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="w-full h-10 mt-1 rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground flex items-center gap-1 mb-1.5">
                      <Clock className="h-3.5 w-3.5" /> Time Slot
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      {["10:00 AM - 12:00 PM", "03:00 PM - 05:00 PM", "06:00 PM - 08:00 PM"].map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setVisitTimeSlot(slot)}
                          className={`text-left px-3 py-1.5 rounded-lg border text-xs transition-colors ${
                            visitTimeSlot === slot
                              ? "border-primary bg-primary/10 text-primary font-semibold"
                              : "border-border text-muted-foreground hover:bg-muted/40"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Note for Owner (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Coming with parents / need parking info"
                      value={visitNotes}
                      onChange={(e) => setVisitNotes(e.target.value)}
                      className="w-full h-9 mt-1 rounded-xl border border-input bg-transparent px-3 text-xs focus:outline-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <div className="rounded-2xl bg-muted/40 p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Deposit</span>
                      <span className="font-semibold">
                        {formatMoney(selectedRoom ? toNumber(selectedRoom.security_deposit) : 0)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Move-in Date</span>
                      <span className="font-semibold">{moveInDate || "Flexible"}</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Preferred move-in date</label>
                    <input
                      type="date"
                      value={moveInDate}
                      onChange={(e) => setMoveInDate(e.target.value)}
                      className="w-full h-10 mt-1 rounded-xl border border-input bg-transparent px-3 text-sm focus:outline-none"
                    />
                  </div>
                </div>
              )}

              {isOwnerOfProperty ? (
                <div className="rounded-2xl bg-muted/60 border border-border p-4 text-center space-y-2.5">
                  <p className="text-xs font-semibold text-foreground">You are the owner of this property</p>
                  <p className="text-[11px] text-muted-foreground">
                    You manage bookings and room inventory for this listing from your Owner Dashboard.
                  </p>
                  <Button
                    onClick={() => router.push("/dashboard/owner")}
                    variant="outline"
                    className="w-full rounded-xl text-xs font-medium"
                    size="sm"
                  >
                    Open Owner Dashboard
                  </Button>
                </div>
              ) : bookingSuccess ? (
                <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                  <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    {bookingMode === "visit" ? "Visit Request Sent!" : "Booking Request Sent!"}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {bookingMode === "visit"
                      ? "The landlord has been notified of your requested inspection date. Track status in your dashboard."
                      : "The landlord has been notified. Check your dashboard for updates."}
                  </p>
                  <Button
                    onClick={() => router.push(user?.role === "OWNER" ? "/dashboard/owner" : "/dashboard")}
                    className="mt-3 w-full rounded-xl"
                    size="sm"
                  >
                    View in Dashboard
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookingError && (
                    <div className="rounded-2xl bg-destructive/10 border border-destructive/25 p-3 text-xs text-destructive font-medium flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{bookingError}</span>
                    </div>
                  )}
                  <Button
                    onClick={handleBooking}
                    disabled={isBooking || !selectedRoom}
                    className="w-full h-12 rounded-2xl font-semibold shadow-md"
                  >
                    {isBooking
                      ? "Submitting..."
                      : selectedRoom
                        ? bookingMode === "visit"
                          ? "Request Property Visit"
                          : "Request to Book Room"
                        : "Select a Room First"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
