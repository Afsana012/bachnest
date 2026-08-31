import Image from "next/image";
import { Search, FileCheck, Key } from "lucide-react";

const steps = [
  {
    icon: Search,
    step: "01",
    title: "Search & filter",
    description:
      "Browse by area, budget, room type, and distance from your university or workplace.",
  },
  {
    icon: FileCheck,
    step: "02",
    title: "Verify & shortlist",
    description:
      "Every listing shows NID-verified owner details, real photos, and utility breakdown upfront.",
  },
  {
    icon: Key,
    step: "03",
    title: "Move in digitally",
    description:
      "Sign a digital rent agreement, pay your advance online, and move in — no broker, no cash.",
  },
];

export function HowItWorks() {
  return (
    <section className="py-16 md:py-20 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div className="relative rounded-2xl overflow-hidden aspect-[4/3] w-full">
            <Image
              src="/images/room-interior.jpg"
              alt="Modern bachelor room interior"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-primary">
              Simple process
            </p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
              Find and move in — in 3 steps
            </h2>

            <div className="mt-10 flex flex-col gap-8">
              {steps.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <div key={s.step} className="flex gap-5">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-muted-foreground mb-1">Step {s.step}</p>
                      <h3 className="text-base font-semibold text-foreground">{s.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{s.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
