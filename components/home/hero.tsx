"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, MapPin, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("Dhanmondi");

  const popularAreas = ["Dhanmondi", "Mirpur", "Uttara", "Bashundhara R/A", "Mohakhali", "Banani"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/properties?q=${encodeURIComponent(query)}&area=${encodeURIComponent(area)}`);
  };

  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-semibold text-primary mb-6 shadow-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>Verified Bachelor Housing Network in Bangladesh</span>
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl max-w-4xl mx-auto leading-tight md:leading-[1.15]">
          Find verified bachelor homes, seats & sublets with{" "}
          <span className="text-primary">
            total trust
          </span>
        </h1>

        <p className="mt-6 max-w-2xl mx-auto text-base sm:text-lg text-muted-foreground leading-relaxed">
          Zero landlord harassment, PostGIS radius search, 100% KYC verified owners, automated digital agreements, and 24/7 real-time SOS security.
        </p>

        {/* Search Container */}
        <div className="mt-10 max-w-3xl mx-auto rounded-3xl border border-border/80 bg-card/70 p-3 shadow-xl backdrop-blur-2xl">
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-2.5">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by landmark, university or road..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 h-12 border-0 bg-transparent shadow-none focus-visible:ring-0 text-sm sm:text-base"
              />
            </div>

            <div className="relative w-full sm:w-48">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
              <select
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full h-12 rounded-xl bg-muted/40 pl-9 pr-3 text-sm font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {popularAreas.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>

            <Button type="submit" size="lg" className="w-full sm:w-auto h-12 px-6 rounded-2xl font-semibold gap-2 shadow-md">
              <span>Find Home</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          {/* Quick Filter Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 px-2 text-xs text-muted-foreground">
            <span className="font-medium mr-1">Popular:</span>
            {popularAreas.slice(0, 4).map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setArea(a); router.push(`/properties?area=${a}`); }}
                className="rounded-lg bg-muted/60 px-2.5 py-1 text-xs font-medium hover:bg-muted hover:text-foreground transition-colors"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
