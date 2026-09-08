import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ParkingExplorer } from "@/components/parking/parking-explorer";

export const metadata: Metadata = {
  title: "Garage & Parking Space Rental in Dhaka | BachNest",
  description:
    "Find and book secure motorcycle slots and car garage parking near bachelor flats, universities, and offices across Dhaka.",
};

export default function ParkingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Garage & Parking Space Rental</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Find secure covered motorcycle slots and car parking spots across Dhaka with daily or monthly passes.
            </p>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-64 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
                ))}
              </div>
            }
          >
            <ParkingExplorer />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
