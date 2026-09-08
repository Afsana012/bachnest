"use client";

import { useState } from "react";
import { Globe, Trash2, DoorOpen, Plus, Megaphone, ChevronDown, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { Notice, Property, Room, RoomSeat, RoomType } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { enumLabel, formatMoney } from "@/lib/format";
import { EditPropertyModal } from "./edit-property-modal";
import { EditRoomModal } from "./edit-room-modal";

const ROOM_TYPES: RoomType[] = ["SINGLE", "MASTER", "SHARED"];

export function PropertyManager({ properties, onChanged }: { properties: Property[]; onChanged: () => void }) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showRoomForm, setShowRoomForm] = useState(false);
  const [showNoticeForm, setShowNoticeForm] = useState(false);

  const [roomName, setRoomName] = useState("");
  const [roomType, setRoomType] = useState<RoomType>("SINGLE");
  const [roomRent, setRoomRent] = useState("");
  const [roomCapacity, setRoomCapacity] = useState("1");

  const [noticeTitle, setNoticeTitle] = useState("");
  const [noticeContent, setNoticeContent] = useState("");

  const [busy, setBusy] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const toggleProperty = async (propertyId: string) => {
    if (expandedId === propertyId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(propertyId);
    setShowRoomForm(false);
    setShowNoticeForm(false);

    const [roomsRes, noticesRes] = await Promise.all([
      fetchApi<Room[]>(`/properties/${propertyId}/rooms`),
      fetchApi<Notice[]>(`/properties/${propertyId}/notices`),
    ]);
    setRooms(roomsRes.success && roomsRes.data ? roomsRes.data : []);
    setNotices(noticesRes.success && noticesRes.data ? noticesRes.data : []);
  };

  const togglePublish = async (property: Property) => {
    const res = await fetchApi<Property>(`/properties/${property.id}/publish?is_published=${!property.is_published}`, {
      method: "PATCH",
    });
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to update publish status");
    }
  };

  const deleteProperty = async (property: Property) => {
    if (!confirm(`Delete "${property.title}"? This removes its rooms and seats too.`)) return;
    const res = await fetchApi(`/properties/${property.id}`, { method: "DELETE" });
    if (res.success) {
      onChanged();
    } else {
      alert(res.message || "Failed to delete property");
    }
  };

  const addRoom = async (propertyId: string) => {
    if (!roomName.trim() || !roomRent) {
      alert("Room name and rent are required.");
      return;
    }
    setBusy(true);
    const res = await fetchApi<Room>(`/properties/${propertyId}/rooms`, {
      method: "POST",
      body: JSON.stringify({
        room_number_or_name: roomName.trim(),
        room_type: roomType,
        monthly_rent: Number(roomRent),
        total_capacity: Number(roomCapacity) || 1,
      }),
    });
    setBusy(false);
    if (res.success && res.data) {
      setRooms([...rooms, res.data]);
      setRoomName("");
      setRoomRent("");
      setRoomCapacity("1");
      setShowRoomForm(false);
      onChanged();
    } else {
      alert(res.message || "Failed to add room");
    }
  };

  const deleteRoom = async (roomId: string) => {
    if (!confirm("Delete this room?")) return;
    const res = await fetchApi(`/rooms/${roomId}`, { method: "DELETE" });
    if (res.success) {
      setRooms(rooms.filter((r) => r.id !== roomId));
      onChanged();
    } else {
      alert(res.message || "Failed to delete room");
    }
  };

  const addSeat = async (roomId: string, seatIdentifier: string, monthlyRent: string) => {
    if (!seatIdentifier.trim() || !monthlyRent) {
      alert("Seat label and rent are required.");
      return;
    }
    setBusy(true);
    const res = await fetchApi<RoomSeat>(`/rooms/${roomId}/seats`, {
      method: "POST",
      body: JSON.stringify({ seat_identifier: seatIdentifier.trim(), monthly_rent: Number(monthlyRent) }),
    });
    setBusy(false);
    if (res.success && res.data) {
      setRooms(rooms.map((r) => (r.id === roomId ? { ...r, seats: [...(r.seats ?? []), res.data] } : r)));
      onChanged();
    } else {
      alert(res.message || "Failed to add seat");
    }
  };

  const deleteSeat = async (roomId: string, seatId: string) => {
    const res = await fetchApi(`/seats/${seatId}`, { method: "DELETE" });
    if (res.success) {
      setRooms(
        rooms.map((r) => (r.id === roomId ? { ...r, seats: (r.seats ?? []).filter((s) => s.id !== seatId) } : r))
      );
      onChanged();
    } else {
      alert(res.message || "Failed to delete seat");
    }
  };

  const publishNotice = async (propertyId: string) => {
    if (!noticeTitle.trim() || !noticeContent.trim()) {
      alert("Notice title and content are required.");
      return;
    }
    setBusy(true);
    const res = await fetchApi<Notice>(`/properties/${propertyId}/notices`, {
      method: "POST",
      body: JSON.stringify({ title: noticeTitle.trim(), content: noticeContent.trim() }),
    });
    setBusy(false);
    if (res.success && res.data) {
      setNotices([res.data, ...notices]);
      setNoticeTitle("");
      setNoticeContent("");
      setShowNoticeForm(false);
    } else {
      alert(res.message || "Failed to publish notice");
    }
  };

  return (
    <div className="space-y-4">
      {properties.map((property) => (
        <div key={property.id} className="p-5 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h4 className="font-semibold text-foreground">{property.title}</h4>
              <p className="text-sm text-muted-foreground mt-0.5">
                {property.address_line}, {property.area_neighborhood}, {property.city}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <StatusBadge status={property.property_type} />
                {property.is_verified_by_admin ? (
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Admin Verified</span>
                ) : (
                  <span className="text-[11px] text-amber-500 font-medium">Awaiting verification</span>
                )}
                <span className="text-[11px] text-muted-foreground">{property.rooms?.length ?? 0} rooms</span>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => setEditingProperty(property)}>
                <Pencil className="h-4 w-4 mr-1.5" />
                Edit
              </Button>
              <Button variant="outline" size="sm" onClick={() => togglePublish(property)}>
                <Globe className="h-4 w-4 mr-1.5" />
                {property.is_published ? "Unpublish" : "Publish"}
              </Button>
              <Button variant="ghost" size="sm" onClick={() => toggleProperty(property.id)}>
                Manage
                <ChevronDown className={`h-4 w-4 ml-1 transition-transform ${expandedId === property.id ? "rotate-180" : ""}`} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteProperty(property)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {expandedId === property.id && (
            <div className="mt-5 pt-5 border-t border-border/60 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold flex items-center gap-2">
                    <DoorOpen className="h-4 w-4 text-muted-foreground" /> Rooms & Seats
                  </h5>
                  <Button variant="outline" size="sm" onClick={() => setShowRoomForm(!showRoomForm)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Add Room
                  </Button>
                </div>

                {showRoomForm && (
                  <div className="mb-4 p-4 rounded-xl bg-muted/30 grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Input placeholder="Room name (e.g. Bed 1)" value={roomName} onChange={(e) => setRoomName(e.target.value)} />
                    <select
                      value={roomType}
                      onChange={(e) => setRoomType(e.target.value as RoomType)}
                      className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                    >
                      {ROOM_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {enumLabel(type)}
                        </option>
                      ))}
                    </select>
                    <Input placeholder="Rent (৳)" type="number" value={roomRent} onChange={(e) => setRoomRent(e.target.value)} />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Capacity"
                        type="number"
                        value={roomCapacity}
                        onChange={(e) => setRoomCapacity(e.target.value)}
                        className="w-20"
                      />
                      <Button size="sm" disabled={busy} onClick={() => addRoom(property.id)} className="shrink-0">
                        Save
                      </Button>
                    </div>
                  </div>
                )}

                {rooms.length > 0 ? (
                  <div className="space-y-3">
                    {rooms.map((room) => (
                      <div key={room.id} className="rounded-xl border border-border/70 p-4">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold">{room.room_number_or_name}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {enumLabel(room.room_type)} • {formatMoney(room.monthly_rent)}/mo • {room.current_occupancy}/
                              {room.total_capacity} occupied
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setEditingRoom(room)} title="Edit Room">
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <AddSeatControl disabled={busy} onAdd={(label, rent) => addSeat(room.id, label, rent)} />
                            <Button variant="ghost" size="sm" onClick={() => deleteRoom(room.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        {room.seats && room.seats.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/50">
                            {room.seats.map((seat) => (
                              <span
                                key={seat.id}
                                className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1 text-xs ${
                                  seat.is_occupied
                                    ? "border-border bg-muted/50 text-muted-foreground"
                                    : "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                }`}
                              >
                                {seat.seat_identifier} • {formatMoney(seat.monthly_rent)}
                                <button onClick={() => deleteSeat(room.id, seat.id)} className="text-destructive hover:text-destructive/70">
                                  ×
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground py-4 text-center rounded-xl border border-dashed border-border">
                    No rooms yet. Add your first room so tenants can book it.
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-3">
                  <h5 className="text-sm font-semibold flex items-center gap-2">
                    <Megaphone className="h-4 w-4 text-muted-foreground" /> Building Notices
                  </h5>
                  <Button variant="outline" size="sm" onClick={() => setShowNoticeForm(!showNoticeForm)}>
                    <Plus className="h-4 w-4 mr-1.5" /> Post Notice
                  </Button>
                </div>

                {showNoticeForm && (
                  <div className="mb-4 p-4 rounded-xl bg-muted/30 space-y-3">
                    <Input
                      placeholder="Notice title (e.g. Water supply maintenance)"
                      value={noticeTitle}
                      onChange={(e) => setNoticeTitle(e.target.value)}
                    />
                    <textarea
                      placeholder="Details your tenants should know..."
                      value={noticeContent}
                      onChange={(e) => setNoticeContent(e.target.value)}
                      rows={2}
                      className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
                    />
                    <Button size="sm" disabled={busy} onClick={() => publishNotice(property.id)}>
                      Publish Notice
                    </Button>
                  </div>
                )}

                {notices.length > 0 ? (
                  <div className="space-y-2">
                    {notices.map((notice) => (
                      <div key={notice.id} className="rounded-xl border border-border/70 p-3 text-sm">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-medium">{notice.title}</span>
                          <StatusBadge status={notice.priority} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{notice.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No notices posted for this building yet.</p>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {editingProperty && (
        <EditPropertyModal
          property={editingProperty}
          isOpen={true}
          onClose={() => setEditingProperty(null)}
          onSaved={() => {
            setEditingProperty(null);
            onChanged();
          }}
        />
      )}

      {editingRoom && (
        <EditRoomModal
          room={editingRoom}
          isOpen={true}
          onClose={() => setEditingRoom(null)}
          onSaved={(updated) => {
            setRooms((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
            setEditingRoom(null);
            onChanged();
          }}
        />
      )}
    </div>
  );
}

function AddSeatControl({ disabled, onAdd }: { disabled: boolean; onAdd: (label: string, rent: string) => void }) {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [rent, setRent] = useState("");

  if (!open) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" /> Seat
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input placeholder="Label" value={label} onChange={(e) => setLabel(e.target.value)} className="h-8 w-24 text-xs" />
      <Input
        placeholder="Rent"
        type="number"
        value={rent}
        onChange={(e) => setRent(e.target.value)}
        className="h-8 w-20 text-xs"
      />
      <Button
        size="sm"
        variant="outline"
        disabled={disabled}
        className="h-8"
        onClick={() => {
          onAdd(label, rent);
          setLabel("");
          setRent("");
          setOpen(false);
        }}
      >
        Add
      </Button>
    </div>
  );
}
