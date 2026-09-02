import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { EmergencySosView } from "@/components/emergency/emergency-sos-view";

export const metadata: Metadata = {
  title: "24/7 Safety & SOS Center",
  description: "Instantaneous emergency broadcast to nearby verified residents, landlord, and safety hotlines.",
};

export default function EmergencyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <EmergencySosView />
      </main>
      <Footer />
    </div>
  );
}
