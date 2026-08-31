"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Bed, Users, Navigation, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchApi, fetchPaginated } from "@/lib/api";
import { CompatibilityResult, PropertyType, SearchPropertyItem } from "@/lib/types";
import { enumLabel, formatMoney } from "@/lib/format";
import Link from "next/link";

const PROPERTY_TYPES: Array<{ value: PropertyType | "all"; label: string }> = [
  { value: "all", label: "All Types" },
  { value: "FLAT", label: "Flat" },
  { value: "SUBLET", label: "Sublet" },
  { value: "MESS", label: "Mess" },
  { value: "HOSTEL", label: "Hostel" },
];

type ExploreTab = "listings" | "roommates";

function getCurrentPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation unsupported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 8000 });
  });
}

function ExploreContent() {
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<ExploreTab>(searchParams.get("tab") === "roommates" ? "roommates" : "listings");

  const [results, setResults] = useState<SearchPropertyItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get("area") || "");
  const [propertyType, setPropertyType] = useState<PropertyType | "all">(
    (searchParams.get("type") as PropertyType) || "all"
  );
  const [budgetMax, setBudgetMax] = useState("");
  const [hasWifi, setHasWifi] = useState(false);
  const [hasGenerator, setHasGenerator] = useState(false);
  const [nearbyMode, setNearbyMode] = useState(false);

  const [roommates, setRoommates] = useState<CompatibilityResult[]>([]);
  const [roommatesLoading, setRoommatesLoading] = useState(false);
  const [roommatesError, setRoommatesError] = useState("");

  const runSearch = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search.trim()) params.set("area", search.trim());
    if (propertyType !== "all") params.set("property_type", propertyType);
    if (budgetMax && !Number.isNaN(Number(budgetMax))) params.set("budget_max", budgetMax);
    if (hasWifi) params.set("has_wifi", "true");
    if (hasGenerator) params.set("has_generator", "true");
    params.set("limit", "24");

    const res = await fetchPaginated<SearchPropertyItem>(`/search/properties?${params.toString()}`);
    setResults(res.items);
    setTotal(res.meta.total);
    setLoading(false);
  }, [search, propertyType, budgetMax, hasWifi, hasGenerator]);

  const runNearbySearch = async () => {
    setLoading(true);
    setNearbyMode(true);
    try {
      const position = await getCurrentPosition();
      const params = new URLSearchParams({
        lat: String(position.coords.latitude),
        lng: String(position.coords.longitude),
        radius_km: "5",
        limit: "24",
      });
      const res = await fetchPaginated<SearchPropertyItem>(`/search/map?${params.toString()}`);
      setResults(res.items);
      setTotal(res.meta.total);
    } catch {
      alert("Could not read your location. Allow location access and try again.");
      setNearbyMode(false);
    }
    setLoading(false);
  };

  const loadRoommates = useCallback(async () => {
    setRoommatesLoading(true);
    setRoommatesError("");
    const res = await fetchApi<CompatibilityResult[]>("/search/roommates");
    if (res.success && res.data) {
      setRoommates(res.data);
    } else {
      setRoommatesError(res.message || "Sign in as a bachelor to see roommate matches.");
    }
    setRoommatesLoading(false);
  }, []);

  useEffect(() => {
    if (tab !== "listings") return;
    const t = setTimeout(runSearch, 250);
    return () => clearTimeout(t);
  }, [tab, runSearch]);

  useEffect(() => {
    if (tab !== "roommates" || roommates.length > 0 || roommatesLoading) return;
    const t = setTimeout(loadRoommates, 0);
    return () => clearTimeout(t);
  }, [tab, roommates.length, roommatesLoading, loadRoommates]);

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Explore Verified Accommodations</h1>
            <p className="text-muted-foreground text-sm mt-1">Find bachelor flats, mess seats, and sublets across Dhaka.</p>
          </div>

          <div className="flex items-center gap-6 border-b border-border mb-8">
            <button
              onClick={() => setTab("listings")}
              className={`pb-3 text-sm font-medium transition-all ${
                tab === "listings" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setTab("roommates")}
              className={`pb-3 text-sm font-medium transition-all ${
                tab === "roommates" ? "text-foreground border-b-2 border-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Roommate Matches
            </button>
          </div>

          {tab === "listings" && (
            <>
              <div className="rounded-3xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur-xl mb-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search area, neighborhood..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && runSearch()}
                      className="pl-9 h-11"
                    />
                  </div>

                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType | "all")}
                    className="w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>

                  <Input
                    placeholder="Max budget (৳)"
                    value={budgetMax}
                    onChange={(e) => setBudgetMax(e.target.value)}
                    type="number"
                    className="h-11"
                  />

                  <div className="flex gap-2">
                    <Button onClick={runSearch} className="flex-1 h-11 rounded-xl">
                      Search
                    </Button>
                    <Button
                      onClick={runNearbySearch}
                      variant="outline"
                      className={`h-11 rounded-xl shrink-0 ${nearbyMode ? "border-primary text-primary" : ""}`}
                      title="Find properties within 5 km of you"
                    >
                      <Navigation className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-3 px-1">
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input type="checkbox" checked={hasWifi} onChange={(e) => setHasWifi(e.target.checked)} className="accent-primary" />
                    WiFi
                  </label>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasGenerator}
                      onChange={(e) => setHasGenerator(e.target.checked)}
                      className="accent-primary"
                    />
                    Generator Backup
                  </label>
                  {nearbyMode && (
                    <button
                      onClick={() => {
                        setNearbyMode(false);
                        runSearch();
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      Clear near-me filter
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs text-muted-foreground mb-4">
                {loading ? "Searching..." : `${total} ${total === 1 ? "property" : "properties"} found${nearbyMode ? " within 5 km of you" : ""}`}
              </p>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-80 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
                  ))}
                </div>
              ) : results.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.map((item) => (
                    <Link
                      key={item.property_id}
                      href={`/properties/${item.property_id}`}
                      className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
                        <img
                          src={item.cover_image_url || "/images/hero-room.jpg"}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                          <span className="rounded-md bg-black/60 text-white backdrop-blur-md px-2 py-0.5 text-[11px] font-medium">
                            {enumLabel(item.property_type)}
                          </span>
                          {item.distance_km != null && (
                            <span className="rounded-md bg-primary/90 text-white backdrop-blur-md px-2 py-0.5 text-[11px] font-medium">
                              {item.distance_km.toFixed(1)} km away
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 left-3 text-white">
                          <span className="text-xl font-bold tracking-tight">{formatMoney(item.starting_rent)}</span>
                          <span className="text-xs opacity-90 font-normal"> / month</span>
                        </div>
                      </div>
                      <div className="p-4 space-y-3">
                        <h3 className="font-semibold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
                          {item.title}
                        </h3>
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="line-clamp-1">
                            {item.area}, {item.city}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-t border-border pt-2.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Bed className="h-3.5 w-3.5" />
                            {item.available_rooms} {item.available_rooms === 1 ? "room" : "rooms"} available
                          </span>
                          {item.tags.slice(0, 2).map((tag) => (
                            <span key={tag} className="rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] font-medium">
                              {enumLabel(tag)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 p-16 text-center">
                  <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-bold text-lg">No listings match your criteria</h3>
                  <p className="text-sm text-muted-foreground mt-1">Try relaxing your search terms or choosing a different area.</p>
                  <Button
                    onClick={() => {
                      setSearch("");
                      setPropertyType("all");
                      setBudgetMax("");
                      setHasWifi(false);
                      setHasGenerator(false);
                      setNearbyMode(false);
                    }}
                    className="mt-4 rounded-xl"
                  >
                    Reset Filters
                  </Button>
                </div>
              )}
            </>
          )}

          {tab === "roommates" && (
            <div>
              {roommatesLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : roommatesError ? (
                <div className="rounded-3xl border border-dashed border-border/80 p-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-bold text-lg">Roommate matching unavailable</h3>
                  <p className="text-sm text-muted-foreground mt-1">{roommatesError}</p>
                </div>
              ) : roommates.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roommates.map((match) => (
                    <Link
                      key={match.candidate_user_id}
                      href={`/users/${match.candidate_user_id}`}
                      className="rounded-2xl border border-border bg-card p-5 hover:border-foreground/20 hover:shadow-lg transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold">{match.candidate_name}</h3>
                        <span className="text-sm font-bold text-primary">{Math.round(match.compatibility_score)}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(match.compatibility_score, 100)}%` }} />
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {match.matched_factors.slice(0, 4).map((factor) => (
                          <span
                            key={factor}
                            className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground font-medium"
                          >
                            <CheckCircle2 className="h-2.5 w-2.5 text-emerald-500" />
                            {enumLabel(factor)}
                          </span>
                        ))}
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-border/80 p-16 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                  <h3 className="font-bold text-lg">No roommate candidates yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">Check back once more bachelors join the platform.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function PropertiesPage() {
  return (
    <Suspense fallback={null}>
      <ExploreContent />
    </Suspense>
  );
}
