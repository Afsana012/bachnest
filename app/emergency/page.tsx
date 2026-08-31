"use client";

import { useState } from "react";
import { ShieldAlert, PhoneCall, Radio, Users } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { useSosWebSocket } from "@/hooks/use-sos-websocket";
import { fetchApi } from "@/lib/api";

export default function EmergencyPage() {
  const { isConnected, alerts } = useSosWebSocket();
  const [triggered, setTriggered] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSos = async () => {
    setLoading(true);
    const res = await fetchApi("/emergency/trigger-sos", {
      method: "POST",
      body: JSON.stringify({
        title: "EMERGENCY SOS ALERT",
        description: "Emergency assistance requested at current residence location.",
        severity: "critical",
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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
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

          <Card className="rounded-3xl border-destructive/30 bg-gradient-to-b from-destructive/5 to-card p-8 text-center mb-10">
            <CardContent className="p-0 flex flex-col items-center">
              <button
                onClick={handleSos}
                disabled={loading || triggered}
                className={`relative flex h-36 w-36 sm:h-44 sm:w-44 items-center justify-center rounded-full transition-transform active:scale-95 shadow-2xl ${
                  triggered
                    ? "bg-emerald-600 text-white"
                    : "bg-destructive text-white hover:bg-destructive/90 animate-pulse"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <ShieldAlert className="h-12 w-12" />
                  <span className="font-extrabold text-lg tracking-wider">{triggered ? "ALERT SENT" : "HOLD SOS"}</span>
                </div>
              </button>

              <p className="text-xs text-muted-foreground mt-6 max-w-md">
                Pressing this button broadcasts your GPS coordinate and profile to all nearby residents, owner, and the BachNest emergency response dispatcher.
              </p>
            </CardContent>
          </Card>

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
      </main>
      <Footer />
    </div>
  );
}
