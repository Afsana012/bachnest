"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Search,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Wifi,
  Zap,
  Bed,
  CheckCircle2,
  Sparkles,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const POPULAR_AREAS = [
  "Dhanmondi",
  "Bashundhara R/A",
  "Mirpur",
  "Uttara",
  "Mohakhali",
  "Banani",
];

const SEARCH_TABS = [
  { label: "All To-Let", type: "" },
  { label: "Single Room", type: "single" },
  { label: "Shared Seat", type: "shared" },
  { label: "Full Flat", type: "apartment" },
  { label: "Female Only", type: "female_only" },
];

export function HeroSection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState("");
  const [query, setQuery] = React.useState("");
  const [area, setArea] = React.useState("");
  const [budget, setBudget] = React.useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (area) params.set("area", area);
    if (activeTab === "single" || activeTab === "shared") {
      params.set("room_type", activeTab);
    } else if (activeTab === "apartment") {
      params.set("type", "apartment");
    } else if (activeTab === "female_only") {
      params.set("gender", "female_only");
    }
    if (budget) params.set("budget_max", budget);

    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden border-b border-border/40 bg-muted/10 py-12 md:py-20 lg:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
          
          {/* Left Column: Heading & Search Box */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3.5 py-1 text-xs font-medium text-foreground shadow-xs">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Verified Bachelor & Student Housing in Dhaka</span>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl lg:text-[3.25rem] text-foreground leading-[1.15]">
              Find verified bachelor rooms, seats & sublets with confidence
            </h1>

            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl">
              Zero landlord harassment, 100% NID-verified listings, digital rent agreements, and real-time 24/7 SOS safety network across Bangladesh.
            </p>

            {/* Tabbed Search Box */}
            <div className="rounded-2xl border border-border bg-card p-3 sm:p-4 shadow-lg">
              {/* Category Filter Tabs */}
              <div className="flex flex-wrap items-center gap-1.5 border-b border-border pb-3 mb-3">
                {SEARCH_TABS.map((tab) => (
                  <button
                    key={tab.label}
                    type="button"
                    onClick={() => setActiveTab(tab.type)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      activeTab === tab.type
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Inputs Form */}
              <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                <div className="sm:col-span-5 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search landmark, university, road..."
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div className="sm:col-span-4 relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    aria-label="Select Area"
                    className="w-full h-11 pl-9 pr-3 rounded-xl border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="">All Dhaka Areas</option>
                    {POPULAR_AREAS.map((a) => (
                      <option key={a} value={a}>{a}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <Button type="submit" className="w-full h-11 rounded-xl font-semibold gap-1.5 shadow-xs">
                    <span>Search</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </form>

              {/* Popular Area Quick Links */}
              <div className="mt-3 pt-2.5 border-t border-border/60 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                <span className="font-medium mr-1 text-foreground">Popular:</span>
                {POPULAR_AREAS.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onClick={() => {
                      setArea(a);
                      router.push(`/properties?area=${encodeURIComponent(a)}`);
                    }}
                    className="rounded-md border border-border/70 bg-muted/40 px-2 py-0.5 text-xs hover:bg-muted hover:text-foreground transition-colors"
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-2 max-w-lg">
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">5,000+</p>
                <p className="text-xs text-muted-foreground">Verified Beds & Rooms</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">0% Fee</p>
                <p className="text-xs text-muted-foreground">Zero Broker Commission</p>
              </div>
              <div>
                <p className="text-xl sm:text-2xl font-bold text-foreground">100% NID</p>
                <p className="text-xs text-muted-foreground">Owner Verified</p>
              </div>
            </div>
          </div>

          {/* Right Column: Hero Visual Showcase & Floating Feature Cards */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            
            {/* Main Showcase Image */}
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-border bg-card shadow-2xl">
              <Image
                src="/images/hero-room.jpg"
                alt="Modern verified bachelor apartment"
                fill
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

              {/* Bottom image overlay details */}
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600/90 backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold">
                    <CheckCircle2 className="h-3 w-3" /> NID Verified Property
                  </span>
                  <span className="rounded-full bg-black/50 backdrop-blur-md px-2 py-0.5 text-[11px] font-medium">
                    Dhanmondi R/A
                  </span>
                </div>
                <p className="text-sm font-semibold truncate">
                  Luxury Bachelor Studio with Balcony & WiFi
                </p>
              </div>
            </div>

            {/* Floating Card: Room Amenities */}
            <div className="absolute -top-4 -right-2 sm:-right-4 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">100% Direct Landlords</p>
                <p className="text-[11px] text-muted-foreground">No media broker charges</p>
              </div>
            </div>

            {/* Floating Card: Fast High-Speed WiFi & Backup */}
            <div className="absolute -bottom-5 -left-2 sm:-left-4 rounded-2xl border border-border bg-card/95 p-3 shadow-xl backdrop-blur-md hidden sm:flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Wifi className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">High-Speed Optical WiFi</p>
                <p className="text-[11px] text-muted-foreground">Generator & Lift Backup</p>
              </div>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
}
