import Link from "next/link";
import { MapPin, Bed, Bath, Users, ShieldCheck, Wifi, Flame, Zap } from "lucide-react";
import { Property } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface PropertyCardProps {
  property: Property;
}

export function PropertyCard({ property }: PropertyCardProps) {
  const primaryImage = property.media?.find((m) => m.is_primary)?.media_url || 
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=800&q=80";

  return (
    <Card className="group overflow-hidden rounded-3xl border-border/70 bg-card/80 hover:shadow-xl transition-all duration-300">
      <Link href={`/properties/${property.id}`} className="block">
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
          <img
            src={primaryImage}
            alt={property.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
          
          <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
            {property.is_verified && (
              <Badge variant="success" className="gap-1 bg-emerald-950/80 text-emerald-300 backdrop-blur-md">
                <ShieldCheck className="h-3 w-3" />
                <span>Verified</span>
              </Badge>
            )}
            <Badge variant="secondary" className="capitalize backdrop-blur-md bg-background/80">
              {property.property_type}
            </Badge>
          </div>

          <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between text-white">
            <div>
              <span className="text-xl font-extrabold tracking-tight">৳{property.base_rent.toLocaleString()}</span>
              <span className="text-xs opacity-80 font-normal"> / month</span>
            </div>
            <Badge variant="outline" className="text-[11px] bg-black/40 border-white/20 text-white capitalize">
              {property.gender_preference.replace("_", " ")}
            </Badge>
          </div>
        </div>

        <CardContent className="p-5">
          <h3 className="font-bold text-base leading-snug line-clamp-1 group-hover:text-primary transition-colors">
            {property.title}
          </h3>

          <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
            <span className="line-clamp-1">{property.address_line}, {property.area}</span>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5" />
              <span>{property.total_bedrooms} Bed</span>
            </div>
            <div className="flex items-center gap-1">
              <Bath className="h-3.5 w-3.5" />
              <span>{property.total_bathrooms} Bath</span>
            </div>
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{property.rooms?.length || 1} Rooms</span>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {property.wifi_included && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                <Wifi className="h-2.5 w-2.5" /> Wifi
              </span>
            )}
            {property.generator_backup && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                <Zap className="h-2.5 w-2.5" /> Generator
              </span>
            )}
            {property.gas_bill_included && (
              <span className="inline-flex items-center gap-1 rounded-md bg-muted/60 px-2 py-0.5 text-[10px] text-muted-foreground font-medium">
                <Flame className="h-2.5 w-2.5" /> Gas
              </span>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
