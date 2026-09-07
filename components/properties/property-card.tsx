import Link from "next/link";
import Image from "next/image";
import { MapPin, Bed, Users, CheckCircle2, Wifi, Zap } from "lucide-react";
import { Property } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { availableRoomCount, coverImage, enumLabel, formatMoney, startingRent } from "@/lib/format";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const rent = startingRent(property);
  const roomCount = availableRoomCount(property);
  const isVerified = property.is_verified_by_admin;

  return (
    <Card className="group overflow-hidden rounded-2xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-200">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <Image
            src={coverImage(property)}
            alt={property.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {isVerified && (
              <span className="inline-flex items-center gap-1 rounded-md bg-emerald-700/90 text-white backdrop-blur-md px-2 py-0.5 text-[11px] font-semibold">
                <CheckCircle2 className="h-3 w-3" />
                <span>Verified</span>
              </span>
            )}
            <span className="rounded-md bg-black/60 text-white backdrop-blur-md px-2 py-0.5 text-[11px] font-medium">
              {enumLabel(property.property_type)}
            </span>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <span className="text-xl font-bold tracking-tight">{formatMoney(rent)}</span>
              <span className="text-xs opacity-90 font-normal"> / month</span>
            </div>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          <div>
            <h3 className="font-semibold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
              {property.title}
            </h3>

            <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
              <span className="line-clamp-1">
                {property.area_neighborhood}, {property.city}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 border-t border-border pt-2.5 text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Bed className="h-3.5 w-3.5" />
              <span>
                {roomCount} {roomCount === 1 ? "Room" : "Rooms"} Available
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              <span>Bachelor Friendly</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {property.has_wifi && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                <Wifi className="h-2.5 w-2.5" /> WiFi
              </span>
            )}
            {property.has_generator && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                <Zap className="h-2.5 w-2.5" /> Generator
              </span>
            )}
            {property.has_lift && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                Lift
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
