import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const areas = [
  { name: "Dhanmondi", count: "340+", image: "/images/area-dhanmondi.jpg" },
  { name: "Bashundhara R/A", count: "210+", image: "/images/building-exterior.jpg" },
  { name: "Mirpur", count: "280+", image: "/images/building-3.jpg" },
  { name: "Uttara", count: "195+", image: "/images/building-2.jpg" },
  { name: "Mohakhali", count: "170+", image: "/images/room-apartment.jpg" },
  { name: "Banani", count: "145+", image: "/images/room-modern.jpg" },
  { name: "Gulshan", count: "130+", image: "/images/room-minimal.jpg" },
  { name: "Rayer Bazar", count: "98+", image: "/images/room-living.jpg" },
];

export function BrowseByArea() {
  return (
    <section className="py-16 md:py-20 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Popular areas
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
              Browse by location in Dhaka
            </h2>
          </div>
          <Link
            href="/properties"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {areas.slice(0, 4).map((area) => (
            <Link
              key={area.name}
              href={`/properties?area=${encodeURIComponent(area.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[3/4] block"
            >
              <Image
                src={area.image}
                alt={area.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-bold text-white">{area.name}</p>
                <p className="text-xs text-white/70 mt-0.5">{area.count} listings</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          {areas.slice(4).map((area) => (
            <Link
              key={area.name}
              href={`/properties?area=${encodeURIComponent(area.name)}`}
              className="group relative overflow-hidden rounded-2xl aspect-[4/3] block"
            >
              <Image
                src={area.image}
                alt={area.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, 25vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <p className="text-sm font-bold text-white">{area.name}</p>
                <p className="text-xs text-white/70 mt-0.5">{area.count} listings</p>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/properties"
          className="mt-6 flex sm:hidden items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          View all areas <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
