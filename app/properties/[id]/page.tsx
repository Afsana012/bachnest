"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { MapPin, ShieldCheck, Wifi, Flame, Zap, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Property, Room } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const id = params?.id as string;

  const [property, setProperty] = useState<Property | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [isBooking, setIsBooking] = useState(false);

  useEffect(() => {
    async function loadProperty() {
      if (!id) return;
      setLoading(true);
      const res = await fetchApi<Property>(`/properties/${id}`);
      if (res.success && res.data) {
        setProperty(res.data);
        if (res.data.rooms && res.data.rooms.length > 0) {
          setSelectedRoom(res.data.rooms[0]);
        }
      }
      setLoading(false);
    }
    loadProperty();
  }, [id]);

  const handleBooking = async () => {
    if (!isAuthenticated) {
      router.push("/auth/login");
      return;
    }
    setIsBooking(true);
    const payload = {
      property_id: id,
      room_id: selectedRoom?.id,
      move_in_date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
      special_requests: "Standard move-in",
    };
    const res = await fetchApi("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    setIsBooking(false);
    if (res.success) {
      setBookingSuccess(true);
    } else {
      alert(res.message || "Failed to submit booking request");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-5xl py-20 px-4 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="mt-3 text-sm text-muted-foreground">Loading property details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-5xl py-20 px-4 text-center">
          <h2 className="text-2xl font-bold">Property Not Found</h2>
          <Button onClick={() => router.push("/properties")} className="mt-4 rounded-xl">
            Return to Explore
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const primaryImage = property.media?.find((m) => m.is_primary)?.media_url || 
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80";

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-8">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="mb-4 gap-1 rounded-xl">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-muted">
                <img src={primaryImage} alt={property.title} className="h-full w-full object-cover" />
                <div className="absolute top-4 left-4 flex gap-2">
                  {property.is_verified && (
                    <Badge variant="success" className="backdrop-blur-md bg-emerald-950/80 text-emerald-300">
                      <ShieldCheck className="h-3.5 w-3.5 mr-1" /> Verified Property
                    </Badge>
                  )}
                  <Badge variant="secondary" className="backdrop-blur-md bg-background/80 capitalize">
                    {property.property_type}
                  </Badge>
                </div>
              </div>

              <div>
                <h1 className="text-3xl font-extrabold tracking-tight">{property.title}</h1>
                <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{property.address_line}, {property.area}, {property.city}</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 border-y border-border/60 py-4">
                <div>
                  <span className="text-xs text-muted-foreground">Gender Allowed</span>
                  <p className="font-semibold text-sm capitalize">{(property as any).gender_preference?.replace("_", " ") || "Any"}</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Available Rooms</span>
                  <p className="font-semibold text-sm">{property.rooms?.length || 1} Rooms</p>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground">Property Type</span>
                  <p className="font-semibold text-sm capitalize">{property.property_type}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold">About this accommodation</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
                  {property.description || "Well-maintained bachelor accommodation with 24/7 security, high-speed wifi, and full kitchen facilities."}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-bold mb-3">Amenities & Utilities</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                    <Wifi className="h-4 w-4 text-primary" />
                    <span>{property.wifi_included ? "High-Speed Wifi Included" : "Wifi Extra"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                    <Flame className="h-4 w-4 text-primary" />
                    <span>{property.gas_bill_included ? "Gas Bill Included" : "Gas Bill Split"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                    <Zap className="h-4 w-4 text-primary" />
                    <span>{property.generator_backup ? "Generator Backup" : "No Generator"}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 rounded-2xl bg-muted/40 text-xs font-medium">
                    <ShieldCheck className="h-4 w-4 text-primary" />
                    <span>{property.cctv_security ? "24/7 CCTV Security" : "Standard Security"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Booking Sidebar */}
            <div className="space-y-6">
              <Card className="rounded-3xl border-border/80 bg-card/80 p-6 sticky top-24">
                <CardHeader className="p-0 mb-4">
                  <span className="text-xs text-muted-foreground uppercase font-semibold">Monthly Rent</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-foreground">৳{Number((selectedRoom as any)?.monthly_rent || 0).toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground">/ month</span>
                  </div>
                </CardHeader>

                <CardContent className="p-0 space-y-4">
                  <div className="rounded-2xl bg-muted/40 p-3 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Security Deposit</span>
                      <span className="font-semibold">৳{Number((selectedRoom as any)?.security_deposit || 0).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Charge</span>
                      <span className="font-semibold">৳0 (Included)</span>
                    </div>
                  </div>

                  {bookingSuccess ? (
                    <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 text-emerald-500 mx-auto mb-2" />
                      <h4 className="font-bold text-sm text-emerald-600 dark:text-emerald-400">Booking Request Sent!</h4>
                      <p className="text-xs text-muted-foreground mt-1">The landlord has been notified. Check your dashboard for updates.</p>
                      <Button onClick={() => router.push("/dashboard")} className="mt-3 w-full rounded-xl" size="sm">
                        View in Dashboard
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={handleBooking} disabled={isBooking} className="w-full h-12 rounded-2xl font-semibold shadow-md">
                      {isBooking ? "Submitting..." : "Request to Book Room"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
