"use client";

import { useState } from "react";
import { ShieldAlert, PhoneCall, Radio, Users, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useSosWebSocket } from "@/hooks/use-sos-websocket";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { EmergencyAlert, EmergencyType } from "@/lib/types";
import { enumLabel, formatDate } from "@/lib/format";

const ALERT_TYPES: EmergencyType[] = ["SECURITY_INTRUDER", "MEDICAL", "FIRE", "HARASSMENT", "ACCIDENT", "OTHER"];

const DHAKA_CENTER = { latitude: 23.8103, longitude: 90.4125 };

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
  });
}

export function EmergencySosView() {
  const { user } = useAuth();
  const { isConnected, alerts } = useSosWebSocket(user?.id ?? "guest");
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alertType, setAlertType] = useState<EmergencyType>("SECURITY_INTRUDER");
  const [message, setMessage] = useState("");

  const handleSos = async () => {
    setLoading(true);
    let coords = DHAKA_CENTER;
    try {
      const position = await getCurrentPosition();
      coords = { latitude: position.coords.latitude, longitude: position.coords.longitude };
    } catch {
      coords = DHAKA_CENTER;
    }

    const res = await fetchApi<EmergencyAlert>("/emergency/trigger-sos", {
      method: "POST",
      body: JSON.stringify({
        latitude: coords.latitude,
        longitude: coords.longitude,
        alert_type: alertType,
        emergency_message: message || `${enumLabel(alertType)} assistance requested at my residence.`,
      }),
    });
    setLoading(false);
    if (res.success) {
      setTriggered(true);
    } else {
      alert(res.message || "Failed to trigger emergency SOS");
    }
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 sm:px-6">
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-1 text-xs font-semibold text-destructive mb-4">
          <Radio className="h-3.5 w-3.5 animate-pulse" />
          <span>Real-time Safety Protocol {isConnected ? "(Active)" : "(Offline)"}</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">BachNest 24/7 Safety & SOS Center</h1>
        <p className="text-muted-foreground text-sm sm:text-base mt-2">
          Instantaneous emergency broadcast to nearby verified residents, landlord, and safety hotlines.
        </p>
      </div>

      <Card className="rounded-3xl border-destructive/30 bg-gradient-to-b from-destructive/5 to-card p-8 mb-10">
        <CardContent className="p-0 flex flex-col items-center">
          <div className="w-full max-w-md space-y-4 mb-8">
            <div>
              <label className="text-sm font-medium">Emergency Type</label>
              <select
                value={alertType}
                onChange={(e) => setAlertType(e.target.value as EmergencyType)}
                disabled={loading || triggered}
                className="w-full h-11 mt-1.5 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none"
              >
                {ALERT_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {enumLabel(type)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Message (optional)</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                disabled={loading || triggered}
                rows={2}
                placeholder="Describe the situation so responders know what to expect..."
                className="w-full mt-1.5 rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
            </div>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Your live GPS coordinates are attached automatically when you trigger the alert.
            </p>
          </div>

          <button
            onClick={handleSos}
            disabled={loading || triggered}
            className={`relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full transition-transform active:scale-95 shadow-2xl ${
              triggered ? "bg-emerald-600 text-white" : "bg-destructive text-white hover:bg-destructive/90 animate-pulse"
            }`}
          >
            <div className="flex flex-col items-center gap-1">
              <ShieldAlert className="h-12 w-12" />
              <span className="font-extrabold text-lg tracking-wider">{triggered ? "ALERT SENT" : "HOLD SOS"}</span>
            </div>
          </button>

          <p className="text-xs text-muted-foreground mt-6 max-w-md">
            Pressing this button broadcasts your GPS coordinate and profile to all nearby residents, owner, and the
            BachNest emergency response dispatcher.
          </p>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card className="rounded-2xl border-border bg-card p-6 mb-10">
          <h3 className="text-sm font-semibold mb-4 flex items-center gap-2">
            <Radio className="h-4 w-4 text-destructive" /> Live Alert Feed
          </h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-destructive">{enumLabel(alert.alert_type)}</span>
                  <span className="text-xs text-muted-foreground">{formatDate(alert.created_at)}</span>
                </div>
                {alert.emergency_message && (
                  <p className="text-muted-foreground mt-1">{alert.emergency_message}</p>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="rounded-2xl p-4 text-center">
          <PhoneCall className="h-5 w-5 text-primary mx-auto mb-2" />
          <h4 className="font-bold text-sm">BachNest Security</h4>
          <p className="text-xs text-muted-foreground mt-0.5">+880 1700-000000</p>
        </Card>
        <Card className="rounded-2xl p-4 text-center">
          <PhoneCall className="h-5 w-5 text-destructive mx-auto mb-2" />
          <h4 className="font-bold text-sm">National Police / 999</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Dial 999</p>
        </Card>
        <Card className="rounded-2xl p-4 text-center">
          <Users className="h-5 w-5 text-primary mx-auto mb-2" />
          <h4 className="font-bold text-sm">Local Warden Network</h4>
          <p className="text-xs text-muted-foreground mt-0.5">Automated Dispatch</p>
        </Card>
      </div>
    </div>
  );
}
