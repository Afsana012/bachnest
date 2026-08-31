import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const gallery = [
  { src: "/images/room-modern.jpg", alt: "Modern bachelor room", label: "Modern Flat", span: "row-span-2" },
  { src: "/images/room-kitchen.jpg", alt: "Shared kitchen", label: "Shared Kitchen", span: "" },
  { src: "/images/room-study.jpg", alt: "Study room", label: "Study Room", span: "" },
  { src: "/images/room-living.jpg", alt: "Living space", label: "Living Space", span: "" },
  { src: "/images/room-apartment.jpg", alt: "Full apartment", label: "Full Apartment", span: "" },
  { src: "/images/room-minimal.jpg", alt: "Minimal room", label: "Minimal Room", span: "" },
  { src: "/images/student-room.jpg", alt: "Student room", label: "Student Room", span: "row-span-2" },
  { src: "/images/room-kitchen2.jpg", alt: "Modern kitchen", label: "Modern Kitchen", span: "" },
];

export function RoomGallery() {
  return (
    <section className="py-16 md:py-20 border-t border-border bg-muted/20">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Room showcase
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
              See what homes look like on BachNest
            </h2>
          </div>
          <Button variant="outline" asChild className="hidden sm:flex rounded-xl gap-2">
            <Link href="/properties">
              Browse all <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 auto-rows-[180px] gap-3">
          {gallery.map((item, i) => (
            <Link
              key={i}
              href="/properties"
              className={`group relative overflow-hidden rounded-2xl ${item.span}`}
            >
              <Image
                src={item.src}
                alt={item.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <span className="inline-block rounded-lg bg-white/90 px-2.5 py-1 text-xs font-semibold text-foreground">
                  {item.label}
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Button variant="outline" asChild className="mt-6 flex sm:hidden rounded-xl gap-2 w-full">
          <Link href="/properties">
            Browse all listings <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
