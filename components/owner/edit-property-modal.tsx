"use client";

import { useState } from "react";
import { X, Loader2, CheckSquare, Square, Save, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Property, PropertyType, PropertyUpdate } from "@/lib/types";
import { fetchApi } from "@/lib/api";

const PROPERTY_TYPES: { value: PropertyType; label: string }[] = [
  { value: "FLAT", label: "Flat / Apartment" },
  { value: "SUBLET", label: "Sublet" },
  { value: "MESS", label: "Mess" },
  { value: "HOSTEL", label: "Hostel" },
];

interface EditPropertyModalProps {
  property: Property;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: Property) => void;
}

export function EditPropertyModal({ property, isOpen, onClose, onSaved }: EditPropertyModalProps) {
  const [title, setTitle] = useState(property.title || "");
  const [description, setDescription] = useState(property.description || "");
  const [propertyType, setPropertyType] = useState<PropertyType>(property.property_type || "FLAT");
  const [addressLine, setAddressLine] = useState(property.address_line || "");
  const [area, setArea] = useState(property.area_neighborhood || "");
  const [city, setCity] = useState(property.city || "Dhaka");
  const [hasLift, setHasLift] = useState(property.has_lift || false);
  const [hasGenerator, setHasGenerator] = useState(property.has_generator || false);
  const [hasCctv, setHasCctv] = useState(property.has_cctv || false);
  const [hasWifi, setHasWifi] = useState(property.has_wifi || false);
  const [gateClosingTime, setGateClosingTime] = useState(property.gate_closing_time || "");
  const [visitorPolicy, setVisitorPolicy] = useState(property.visitor_policy || "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Title is required.");
      return;
    }
    if (!addressLine.trim() || !area.trim()) {
      setError("Address line and area are required.");
      return;
    }

    setSaving(true);
    setError("");

    const payload: PropertyUpdate = {
      title: title.trim(),
      description: description.trim() || undefined,
      property_type: propertyType,
      address_line: addressLine.trim(),
      area_neighborhood: area.trim(),
      city: city.trim() || "Dhaka",
      has_lift: hasLift,
      has_generator: hasGenerator,
      has_cctv: hasCctv,
      has_wifi: hasWifi,
      gate_closing_time: gateClosingTime.trim() || undefined,
      visitor_policy: visitorPolicy.trim() || undefined,
    };

    const res = await fetchApi<Property>(`/properties/${property.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.success && res.data) {
      onSaved(res.data);
      onClose();
    } else {
      setError(res.message || "Failed to update property.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Edit Property Details</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Listing Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Spacious 3-Bed Bachelor Flat near NSU"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {PROPERTY_TYPES.map((pt) => (
                  <option key={pt.value} value={pt.value}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Area / Neighborhood *</label>
              <Input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder="e.g. Bashundhara R/A, Block D"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Address Line *</label>
              <Input
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="House 12, Road 4"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">City</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Dhaka" />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Provide details about the environment, surroundings, or rules..."
              className="w-full rounded-md border border-input bg-background p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Building Amenities</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => setHasLift(!hasLift)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasLift
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasLift ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Lift
              </button>
              <button
                type="button"
                onClick={() => setHasGenerator(!hasGenerator)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasGenerator
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasGenerator ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Generator
              </button>
              <button
                type="button"
                onClick={() => setHasCctv(!hasCctv)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasCctv
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasCctv ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                CCTV
              </button>
              <button
                type="button"
                onClick={() => setHasWifi(!hasWifi)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasWifi
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasWifi ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                High-speed WiFi
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Gate Closing Time</label>
              <Input
                value={gateClosingTime}
                onChange={(e) => setGateClosingTime(e.target.value)}
                placeholder="e.g. 11:00 PM"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Visitor Policy</label>
              <Input
                value={visitorPolicy}
                onChange={(e) => setVisitorPolicy(e.target.value)}
                placeholder="e.g. Visitors allowed till 9 PM"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="rounded-xl flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
