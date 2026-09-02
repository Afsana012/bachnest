import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertiesExplorer } from "@/components/properties/properties-explorer";

export const metadata: Metadata = {
  title: "Explore Accommodations & Roommates",
  description:
    "Browse verified bachelor flats, mess seats, sublets, and find compatible roommates across Dhaka.",
};

export default function PropertiesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Explore Verified Accommodations</h1>
            <p className="text-muted-foreground text-sm mt-1">Find bachelor flats, mess seats, and sublets across Dhaka.</p>
          </div>
          <Suspense
            fallback={
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-80 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
                ))}
              </div>
            }
          >
            <PropertiesExplorer />
          </Suspense>
        </div>
      </main>
      <Footer />
    </div>
  );
}
