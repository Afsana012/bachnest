import Link from "next/link";
import { ArrowRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PropertyCard } from "@/components/properties/property-card";
import { Property } from "@/lib/types";

export function FeaturedProperties({ properties }: { properties: Property[] }) {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary uppercase tracking-wider mb-2">
              <Home className="h-4 w-4" />
              <span>Prime Accommodations</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight">
              Top-rated bachelor homes & seats
            </h2>
          </div>
          <Button variant="outline" asChild className="rounded-xl self-start sm:self-auto gap-2">
            <Link href="/properties">
              <span>View all listings</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        {properties && properties.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {properties.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-border/80 p-12 text-center">
            <p className="text-muted-foreground text-sm">No properties loaded. Start by exploring our active search.</p>
            <Button asChild className="mt-4 rounded-xl">
              <Link href="/properties">Browse Properties</Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
