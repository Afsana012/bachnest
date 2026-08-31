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
    <section className="relative h-[520px] sm:h-[560px] md:h-[600px] w-full overflow-hidden">
      <Image
        src="/images/hero-room.jpg"
        alt="Modern bachelor apartment interior"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/45" />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-4 sm:px-6 text-center">
        <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl leading-tight">
          Find your next bachelor home in Dhaka
        </h1>

        <p className="mt-4 max-w-xl text-sm sm:text-base text-white/80 leading-relaxed">
          Browse verified rooms, seats, sublets and full apartments.
          Every listing is NID-verified. Zero broker fees.
        </p>

        <form
          onSubmit={handleSearch}
          className="mt-8 flex w-full max-w-2xl flex-col sm:flex-row items-stretch gap-0 rounded-2xl bg-white dark:bg-card p-2 shadow-2xl"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="University, landmark or road..."
              className="h-12 w-full rounded-xl bg-transparent pl-10 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            />
          </div>

          <div className="hidden sm:block w-px bg-border my-2" />

          <div className="relative sm:w-48">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              aria-label="Select area"
              className="h-12 w-full rounded-xl bg-transparent pl-9 pr-3 text-sm text-foreground focus:outline-none appearance-none"
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
            className="h-12 rounded-xl px-6 font-semibold gap-2 shrink-0"
          >
            <span className="hidden sm:inline">Search</span>
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-white/70">
          <span>Popular:</span>
          {AREAS.slice(0, 4).map((a) => (
            <button
              key={a}
              type="button"
              onClick={() => router.push(`/properties?area=${encodeURIComponent(a)}`)}
              className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-white/90 hover:bg-white/20 transition-colors"
            >
              {a}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
