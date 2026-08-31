import { Property, Room } from "./types";

export function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function formatMoney(value: number | string | null | undefined): string {
  return `৳${toNumber(value).toLocaleString("en-US")}`;
}

export function enumLabel(value: string | null | undefined): string {
  if (!value) return "—";
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function formatDate(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function coverImage(property: Property): string {
  return (
    property.media?.find((m) => m.is_cover)?.media_url ||
    property.media?.[0]?.media_url ||
    "/images/hero-room.jpg"
  );
}

function roomStartingRent(room: Room): number {
  const seatRents = (room.seats ?? []).map((s) => toNumber(s.monthly_rent));
  const candidates = seatRents.length > 0 ? seatRents : [toNumber(room.monthly_rent)];
  return Math.min(...candidates);
}

export function startingRent(property: Property): number {
  const rooms = property.rooms ?? [];
  if (rooms.length === 0) return 0;
  return Math.min(...rooms.map(roomStartingRent));
}

export function availableRoomCount(property: Property): number {
  return (property.rooms ?? []).filter((r) => r.is_available).length;
}

export function propertyLocation(property: Property): string {
  return `${property.area_neighborhood}, ${property.city}`;
}
