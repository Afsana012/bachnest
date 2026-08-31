"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, MapPin, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const AREAS = ["Dhanmondi", "Bashundhara R/A", "Mirpur", "Uttara", "Mohakhali", "Banani"];

export function HeroSection() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [area, setArea] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (area) params.set("area", area);
    router.push(`/properties?${params.toString()}`);
  };

  return (
    <section className="relative h-[560px] sm:h-[600px] md:h-[680px] w-full overflow-hidden flex items-center justify-center">
      {/* Background Image - Clean, no floating gimmicks */}
      <Image
        src="/images/hero-room.jpg"
        alt="Modern bachelor apartment interior"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />

      {/* Main Content Box */}
      <div className="relative z-10 flex w-full flex-col items-center justify-center px-4 sm:px-6 text-center mt-8">
        
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 backdrop-blur-md px-4 py-1.5 text-xs font-semibold text-white/90 shadow-lg mb-6">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Join 14,000+ Bachelors in Dhaka
        </div>

        <h1 className="max-w-4xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl leading-[1.15]">
          Find your perfect bachelor <br className="hidden sm:block" />
          home without the hassle.
        </h1>

        <p className="mt-6 max-w-2xl text-base sm:text-lg text-white/80 leading-relaxed font-medium">
          Zero broker fees. 100% NID-verified listings. Secure your room, seat, or full apartment with our digital rental network.
        </p>

        {/* Search Form - Zillow/Airbnb style */}
        <form
          onSubmit={handleSearch}
          className="mt-10 flex w-full max-w-3xl flex-col sm:flex-row items-stretch gap-0 rounded-2xl bg-white dark:bg-card p-2 shadow-2xl border border-white/10"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search university, landmark or area..."
              className="h-14 w-full rounded-xl bg-transparent pl-12 pr-4 text-base text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="hidden sm:block w-px bg-border my-2 mx-1" />

          <div className="relative sm:w-56">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label="Select area"
              className="h-14 w-full rounded-xl bg-transparent pl-12 pr-4 text-base text-foreground focus:outline-none appearance-none"
            >
              <option value="">All areas</option>
              {AREAS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <Button
            type="submit"
            size="lg"
            className="h-14 rounded-xl px-8 font-bold gap-2 shrink-0 text-base"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="h-5 w-5" />
          </Button>
        </form>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-2.5 text-sm text-white/80 font-medium">
          <span>Trending searches:</span>
          {AREAS.slice(0, 4).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => router.push(`/properties?area=${encodeURIComponent(a)}`)}
              className="rounded-full border border-white/30 bg-white/10 backdrop-blur-sm px-4 py-1.5 text-white hover:bg-white/25 transition-all duration-300"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
