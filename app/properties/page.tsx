"use client";

import { useState, useEffect } from "react";
import { Search, MapPin, Bed } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyCard } from "@/components/properties/property-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Property } from "@/lib/types";
import { fetchApi } from "@/lib/api";

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [area, setArea] = useState("all");
  const [gender, setGender] = useState("all");
  const [propertyType, setPropertyType] = useState("all");

  const areas = ["all", "Dhanmondi", "Mirpur", "Uttara", "Bashundhara R/A", "Mohakhali", "Banani"];

  useEffect(() => {
    async function loadProperties() {
      setLoading(true);
      const res = await fetchApi<Property[]>("/properties?size=20");
      if (res.success && res.data) {
        setProperties(res.data);
      }
      setLoading(false);
    }
    loadProperties();
  }, []);

  const filtered = properties.filter((p) => {
    const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase()) || p.address_line.toLowerCase().includes(search.toLowerCase());
    const matchesArea = area === "all" || p.area.toLowerCase() === area.toLowerCase();
    const matchesGender = gender === "all" || p.gender_preference === gender;
    const matchesType = propertyType === "all" || p.property_type === propertyType;
    return matchesSearch && matchesArea && matchesGender && matchesType;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Explore Verified Accommodations</h1>
            <p className="text-muted-foreground text-sm mt-1">Find bachelor flats, mess seats, and sublets across Dhaka.</p>
          </div>

          {/* Filter Bar */}
          <div className="rounded-3xl border border-border/80 bg-card/70 p-4 shadow-sm backdrop-blur-xl mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search title, street..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-11"
                />
              </div>

              <div>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Locations</option>
                  {areas.filter(a => a !== "all").map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">Any Gender Preference</option>
                  <option value="male_only">Male Only (Bachelor)</option>
                  <option value="female_only">Female Only</option>
                </select>
              </div>

              <div>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full h-11 rounded-xl border border-input bg-background/60 px-3 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="all">All Property Types</option>
                  <option value="apartment">Apartment</option>
                  <option value="hostel">Hostel</option>
                  <option value="sublet">Sublet</option>
                  <option value="mess">Mess</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-3xl bg-muted/40 animate-pulse border border-border/40" />
              ))}
            </div>
          ) : filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-border/80 p-16 text-center">
              <Bed className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-bold text-lg">No listings match your criteria</h3>
              <p className="text-sm text-muted-foreground mt-1">Try relaxing your search terms or choosing a different area.</p>
              <Button onClick={() => { setSearch(""); setArea("all"); setGender("all"); setPropertyType("all"); }} className="mt-4 rounded-xl">
                Reset Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
