"use client";

import { useState } from "react";
import { X, Loader2, CheckSquare, Square, Save, Bed } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Room, RoomType, RoomUpdate } from "@/lib/types";
import { fetchApi } from "@/lib/api";

const ROOM_TYPES: { value: RoomType; label: string }[] = [
  { value: "SINGLE", label: "Single" },
  { value: "MASTER", label: "Master" },
  { value: "SHARED", label: "Shared" },
];

interface EditRoomModalProps {
  room: Room;
  isOpen: boolean;
  onClose: () => void;
  onSaved: (updated: Room) => void;
}

export function EditRoomModal({ room, isOpen, onClose, onSaved }: EditRoomModalProps) {
  const [roomName, setRoomName] = useState(room.room_number_or_name || "");
  const [roomType, setRoomType] = useState<RoomType>(room.room_type || "SINGLE");
  const [monthlyRent, setMonthlyRent] = useState(String(room.monthly_rent || ""));
  const [securityDeposit, setSecurityDeposit] = useState(String(room.security_deposit || ""));
  const [hasAttachedBathroom, setHasAttachedBathroom] = useState(room.has_attached_bathroom || false);
  const [hasBalcony, setHasBalcony] = useState(room.has_balcony || false);
  const [hasAc, setHasAc] = useState(room.has_ac || false);
  const [isFurnished, setIsFurnished] = useState(room.is_furnished || false);
  const [isAvailable, setIsAvailable] = useState(room.is_available ?? true);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomName.trim()) {
      setError("Room name or number is required.");
      return;
    }
    const rentNum = Number(monthlyRent);
    if (Number.isNaN(rentNum) || rentNum <= 0) {
      setError("Please enter a valid monthly rent amount.");
      return;
    }

    setSaving(true);
    setError("");

    const payload: RoomUpdate = {
      room_number_or_name: roomName.trim(),
      room_type: roomType,
      monthly_rent: rentNum,
      security_deposit: securityDeposit ? Number(securityDeposit) : rentNum,
      has_attached_bathroom: hasAttachedBathroom,
      has_balcony: hasBalcony,
      has_ac: hasAc,
      is_furnished: isFurnished,
      is_available: isAvailable,
    };

    const res = await fetchApi<Room>(`/rooms/${room.id}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });

    setSaving(false);

    if (res.success && res.data) {
      onSaved(res.data);
      onClose();
    } else {
      setError(res.message || "Failed to update room details.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-card border border-border shadow-2xl p-6 my-8">
        <div className="flex items-center justify-between border-b border-border/60 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <Bed className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Edit Room Details</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Room Name / No. *</label>
              <Input
                value={roomName}
                onChange={(e) => setRoomName(e.target.value)}
                placeholder="e.g. Master Bed 101"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Room Type</label>
              <select
                value={roomType}
                onChange={(e) => setRoomType(e.target.value as RoomType)}
                className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {ROOM_TYPES.map((rt) => (
                  <option key={rt.value} value={rt.value}>
                    {rt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Monthly Rent (BDT) *</label>
              <Input
                type="number"
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                placeholder="e.g. 7500"
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1 block">Security Deposit (BDT)</label>
              <Input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="e.g. 7500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-2 block">Room Features & Amenities</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setHasAttachedBathroom(!hasAttachedBathroom)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasAttachedBathroom
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasAttachedBathroom ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Attached Bath
              </button>
              <button
                type="button"
                onClick={() => setHasBalcony(!hasBalcony)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasBalcony
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasBalcony ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Attached Balcony
              </button>
              <button
                type="button"
                onClick={() => setHasAc(!hasAc)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  hasAc
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {hasAc ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Air Conditioned
              </button>
              <button
                type="button"
                onClick={() => setIsFurnished(!isFurnished)}
                className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                  isFurnished
                    ? "border-primary/40 bg-primary/10 text-primary"
                    : "border-border bg-transparent text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {isFurnished ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                Furnished
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsAvailable(!isAvailable)}
              className={`w-full flex items-center justify-between rounded-xl border p-3 text-sm font-medium transition-colors ${
                isAvailable
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                  : "border-amber-500/40 bg-amber-500/10 text-amber-600 dark:text-amber-400"
              }`}
            >
              <span>Room Availability Status</span>
              <span className="font-bold">{isAvailable ? "Available for Rent" : "Currently Occupied / Hidden"}</span>
            </button>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving} className="rounded-xl">
              Cancel
            </Button>
            <Button type="submit" disabled={saving} className="rounded-xl flex items-center gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Room
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
