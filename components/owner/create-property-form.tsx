"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  Home,
  ArrowLeft,
  Plus,
  X,
  ImagePlus,
  MapPin,
  Navigation,
  Loader2,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi, uploadFile } from "@/lib/api";
import { Property, PropertyType, RoomType } from "@/lib/types";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "FLAT", label: "Flat / Apartment" },
  { value: "SUBLET", label: "Sublet" },
  { value: "MESS", label: "Mess" },
  { value: "HOSTEL", label: "Hostel" },
];

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "SINGLE", label: "Single" },
  { value: "MASTER", label: "Master" },
  { value: "SHARED", label: "Shared" },
];

type GpsStatus = "idle" | "detecting" | "detected" | "failed";

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
        checked
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
      }`}
    >
      {checked ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
      {label}
    </button>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-sm font-semibold text-foreground border-b border-border/60 pb-2 mb-4 mt-6">{children}</h3>
  );
}

export function CreatePropertyForm() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  // --- Basic Info ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState<PropertyType>("FLAT");

  // --- Location ---
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("Dhaka");
  const [postalCode, setPostalCode] = useState("");
  const [floorNumber, setFloorNumber] = useState("");
  const [flatNumber, setFlatNumber] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [gpsStatus, setGpsStatus] = useState<GpsStatus>("idle");

  // --- Amenities ---
  const [hasLift, setHasLift] = useState(false);
  const [hasGenerator, setHasGenerator] = useState(false);
  const [hasCctv, setHasCctv] = useState(false);
  const [hasWifi, setHasWifi] = useState(false);
  const [gateClosingTime, setGateClosingTime] = useState("");
  const [visitorPolicy, setVisitorPolicy] = useState("");

  // --- Default Room ---
  const [roomName, setRoomName] = useState("Room 1");
  const [roomType, setRoomType] = useState<RoomType>("MASTER");
  const [monthlyRent, setMonthlyRent] = useState("");
  const [securityDeposit, setSecurityDeposit] = useState("");
  const [totalCapacity, setTotalCapacity] = useState("2");
  const [hasAttachedBathroom, setHasAttachedBathroom] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);
  const [hasAc, setHasAc] = useState(false);
  const [isFurnished, setIsFurnished] = useState(false);

  // --- Media ---
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // --- State ---
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (!isAuthenticated || user?.role !== "OWNER") {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">You must be logged in as a Property Owner to post a listing.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4 rounded-xl">
          Go to Dashboard
        </Button>
      </div>
    );
  }

  const detectGps = async () => {
    if (!navigator.geolocation) {
      setGpsStatus("failed");
      return;
    }
    setGpsStatus("detecting");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(String(pos.coords.latitude));
        setLongitude(String(pos.coords.longitude));
        setGpsStatus("detected");
      },
      () => {
        setGpsStatus("failed");
      },
      { timeout: 10000 }
    );
  };

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)].slice(0, 8);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const removeImage = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      setError("Please detect or enter the property GPS coordinates.");
      return;
    }
    if (!monthlyRent) {
      setError("Monthly rent is required.");
      return;
    }

    setSubmitting(true);
    setError("");

    const res = await fetchApi<Property>("/properties", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        property_type: propertyType,
        address_line: addressLine,
        area_neighborhood: area,
        city,
        postal_code: postalCode || undefined,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        floor_number: floorNumber ? parseInt(floorNumber) : undefined,
        flat_number: flatNumber || undefined,
        has_lift: hasLift,
        has_generator: hasGenerator,
        has_cctv: hasCctv,
        has_wifi: hasWifi,
        gate_closing_time: gateClosingTime || undefined,
        visitor_policy: visitorPolicy || undefined,
      }),
    });

    if (!res.success || !res.data) {
      setSubmitting(false);
      setError(res.message || "Failed to create property");
      return;
    }

    const propertyId = res.data.id;

    await fetchApi(`/properties/${propertyId}/rooms`, {
      method: "POST",
      body: JSON.stringify({
        room_number_or_name: roomName,
        room_type: roomType,
        monthly_rent: Number(monthlyRent),
        security_deposit: securityDeposit ? Number(securityDeposit) : Number(monthlyRent),
        has_attached_bathroom: hasAttachedBathroom,
        has_balcony: hasBalcony,
        has_ac: hasAc,
        is_furnished: isFurnished,
        total_capacity: parseInt(totalCapacity) || 2,
      }),
    });

    if (files.length) {
      const urls: string[] = [];
      for (const file of files) {
        const upload = await uploadFile(file, "properties");
        if (upload.success && upload.data) urls.push(upload.data.file_url);
      }
      if (urls.length) {
        await fetchApi(`/properties/${propertyId}/media`, {
          method: "POST",
          body: JSON.stringify(
            urls.map((url, index) => ({
              media_url: url,
              media_type: "IMAGE",
              is_cover: index === 0,
              display_order: index,
            }))
          ),
        });
      }
    }

    await fetchApi(`/properties/${propertyId}/publish?is_published=true`, { method: "PATCH" });

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push("/dashboard/owner"), 1500);
  };

  if (success) {
    return (
      <div className="container mx-auto max-w-2xl px-4 sm:px-6 py-20 text-center">
        <div className="h-16 w-16 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
          <Home className="h-8 w-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold">Property Listed!</h2>
        <p className="text-sm text-muted-foreground mt-2">Redirecting to your Owner Hub...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 sm:px-6">
      <button
        onClick={() => router.push("/dashboard/owner")}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Owner Hub
      </button>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">List a New Property</h1>
            <p className="text-sm text-muted-foreground">Fill in the details to attract verified bachelors.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Basic Info ── */}
          <SectionTitle>Basic Information</SectionTitle>

          <div className="space-y-2">
            <label className="text-sm font-medium">Property Title *</label>
            <Input
              placeholder="E.g. Spacious 2-bed flat in Mirpur-10"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description *</label>
            <textarea
              placeholder="Describe your property, nearby landmarks, rules, etc."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              required
              className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Property Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROPERTY_TYPES.map((pt) => (
                <button
                  key={pt.value}
                  type="button"
                  onClick={() => setPropertyType(pt.value)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    propertyType === pt.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground hover:bg-muted/50"
                  }`}
                >
                  {pt.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── Location ── */}
          <SectionTitle>Location</SectionTitle>

          <div className="space-y-2">
            <label className="text-sm font-medium">Full Address *</label>
            <Input
              placeholder="House no, road, block..."
              value={addressLine}
              onChange={(e) => setAddressLine(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Area / Neighbourhood *</label>
              <Input
                placeholder="Mirpur-10, Dhanmondi-15..."
                value={area}
                onChange={(e) => setArea(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">City *</label>
              <Input
                placeholder="Dhaka"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Postal Code</label>
              <Input placeholder="1216" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Floor No.</label>
              <Input type="number" placeholder="3" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Flat No.</label>
              <Input placeholder="3B" value={flatNumber} onChange={(e) => setFlatNumber(e.target.value)} />
            </div>
          </div>

          {/* GPS */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              GPS Coordinates *
            </label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={detectGps}
                disabled={gpsStatus === "detecting"}
                className="shrink-0"
              >
                {gpsStatus === "detecting" ? (
                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4 mr-1.5" />
                )}
                {gpsStatus === "detecting"
                  ? "Detecting..."
                  : gpsStatus === "detected"
                  ? "Re-detect GPS"
                  : "Auto-detect GPS"}
              </Button>
              {gpsStatus === "detected" && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  ✓ Location captured
                </span>
              )}
              {gpsStatus === "failed" && (
                <span className="text-xs text-destructive">GPS failed — enter manually below</span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Latitude</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="23.8103"
                  value={latitude}
                  onChange={(e) => { setLatitude(e.target.value); setGpsStatus("idle"); }}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Longitude</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="90.4125"
                  value={longitude}
                  onChange={(e) => { setLongitude(e.target.value); setGpsStatus("idle"); }}
                  required
                />
              </div>
            </div>
          </div>

          {/* ── Amenities ── */}
          <SectionTitle>Amenities & Rules</SectionTitle>

          <div className="flex flex-wrap gap-2">
            <Toggle checked={hasLift} onChange={setHasLift} label="Lift" />
            <Toggle checked={hasGenerator} onChange={setHasGenerator} label="Generator" />
            <Toggle checked={hasCctv} onChange={setHasCctv} label="CCTV" />
            <Toggle checked={hasWifi} onChange={setHasWifi} label="Wi-Fi" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Gate Closing Time</label>
              <Input
                type="time"
                value={gateClosingTime}
                onChange={(e) => setGateClosingTime(e.target.value)}
                placeholder="22:00"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Visitor Policy</label>
              <Input
                placeholder="E.g. No visitors after 10 PM"
                value={visitorPolicy}
                onChange={(e) => setVisitorPolicy(e.target.value)}
              />
            </div>
          </div>

          {/* ── Default Room ── */}
          <SectionTitle>Default Room</SectionTitle>
          <p className="text-xs text-muted-foreground -mt-3 mb-3">
            You can add more rooms from the Owner Hub after listing.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Name *</label>
              <Input
                placeholder="Room 1, Master Bed..."
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Room Type *</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="h-10 w-full rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>{rt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Monthly Rent (৳) *</label>
              <Input
                type="number"
                placeholder="8000"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Security Deposit (৳)</label>
              <Input
                type="number"
                placeholder="Same as rent"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Capacity (persons)</label>
              <Input
                type="number"
                min="1"
                placeholder="2"
                value={totalCapacity}
                onChange={(e) => setTotalCapacity(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Toggle checked={hasAttachedBathroom} onChange={setHasAttachedBathroom} label="Attached Bathroom" />
            <Toggle checked={hasBalcony} onChange={setHasBalcony} label="Balcony" />
            <Toggle checked={hasAc} onChange={setHasAc} label="AC" />
            <Toggle checked={isFurnished} onChange={setIsFurnished} label="Furnished" />
          </div>

          {/* ── Photos ── */}
          <SectionTitle>Photos (up to 8)</SectionTitle>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-3">
              {previews.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border group">
                  <Image src={src} alt={`Upload preview ${i + 1}`} fill unoptimized className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 rounded-md bg-black/60 text-white text-[10px] px-1.5 py-0.5">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          {files.length < 8 && (
            <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground hover:bg-muted/30 transition-colors w-fit">
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
              />
              <ImagePlus className="h-4 w-4" />
              Add Photos
            </label>
          )}

          {/* ── Submit ── */}
          <div className="pt-2">
            <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl font-semibold">
              {submitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Listing Property...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Publish Listing
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
