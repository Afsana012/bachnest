import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Building2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-16 md:py-20 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-border bg-card p-8 md:p-10 flex flex-col gap-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                For Property Owners
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                List your property and reach verified bachelors
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Post rooms, seats, or full apartments in minutes. Get NID-verified tenants, digital rent agreements, and automated monthly collections.
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video w-full">
              <Image
                src="/images/building-exterior.jpg"
                alt="Modern apartment building"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <Button asChild className="w-fit gap-2 rounded-xl">
              <Link href="/auth/register?role=property_owner">
                List Your Property
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border bg-muted/40 p-8 md:p-10 flex flex-col gap-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Search className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
                For Bachelors &amp; Students
              </p>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground leading-snug">
                Browse 2,500+ rooms with zero broker fee
              </h2>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                Filter by area, budget, and room type. Every owner is NID-verified. Talk directly — no middleman, no commission, no hidden charges.
              </p>
            </div>
            <div className="relative rounded-xl overflow-hidden aspect-video w-full">
              <Image
                src="/images/apartment.jpg"
                alt="Bachelor apartment interior"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <Button asChild variant="outline" className="w-fit gap-2 rounded-xl">
              <Link href="/properties">
                Browse Listings
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
