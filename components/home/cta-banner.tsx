import Link from "next/link";
import { ArrowRight, Building, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CtaBanner() {
  return (
    <section className="py-16 md:py-24">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/20 p-8 sm:p-12 md:p-16 text-white shadow-2xl">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              Join the Network
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight mt-3 leading-tight">
              Are you a property owner looking for verified tenants?
            </h2>
            <p className="mt-4 text-sm sm:text-base text-emerald-100/80 leading-relaxed">
              List your apartment, room, or hostel seats in minutes. Get pre-verified bachelors with digital background checks, automated monthly collections, and guaranteed rent security.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild className="rounded-xl bg-emerald-500 text-slate-950 hover:bg-emerald-400 font-semibold gap-2">
                <Link href="/auth/register?role=property_owner">
                  <Building className="h-4 w-4" />
                  <span>List Your Property</span>
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-xl border-white/20 text-white hover:bg-white/10 gap-2">
                <Link href="/properties">
                  <KeyRound className="h-4 w-4" />
                  <span>Find a Room</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
