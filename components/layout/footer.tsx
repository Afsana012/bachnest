import Image from "next/image";
import Link from "next/link";
import { ShieldCheck, PhoneCall, MapPin, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/60 bg-muted/20 backdrop-blur-sm">
      <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:gap-12">
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5 font-bold tracking-tight text-lg">
              <div className="relative flex h-8 w-8 items-center justify-center rounded-lg overflow-hidden border border-border/80 bg-background shadow-xs">
                <Image
                  src="/logo.png"
                  alt="BachNest Logo"
                  width={32}
                  height={32}
                  className="object-cover rounded-lg"
                />
              </div>
              <span className="font-semibold text-foreground">BachNest</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Bangladesh&apos;s first verified rental lifecycle and co-living platform for bachelors and property owners.
            </p>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-emerald-500" />
              <span>100% KYC & NID Verified Listings</span>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">Platform</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/properties" className="transition-colors hover:text-foreground">Browse Properties</Link></li>
              <li><Link href="/properties?type=MESS" className="transition-colors hover:text-foreground">Bachelor Messes</Link></li>
              <li><Link href="/properties?type=HOSTEL" className="transition-colors hover:text-foreground">Hostels</Link></li>
              <li><Link href="/emergency" className="transition-colors hover:text-foreground">Emergency SOS Hub</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">For Owners & Tenants</h4>
            <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">
              <li><Link href="/auth/register?role=property_owner" className="transition-colors hover:text-foreground">List a Property</Link></li>
              <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Digital Tenancies</Link></li>
              <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Automated Invoicing</Link></li>
              <li><Link href="/dashboard" className="transition-colors hover:text-foreground">Maintenance Requests</Link></li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-semibold tracking-wider text-foreground uppercase">Support & Safety</h4>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <PhoneCall className="h-4 w-4 text-primary" />
              <span>24/7 Hotline: +880 1700-000000</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-4 w-4 text-primary" />
              <span>support@bachnest.com</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span>Dhaka, Bangladesh</span>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between border-t border-border/40 pt-8 sm:flex-row text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} BachNest Technologies. All rights reserved.</p>
          <div className="mt-4 flex gap-6 sm:mt-0">
            <Link href="#" className="hover:text-foreground">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground">Safety Standards</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
