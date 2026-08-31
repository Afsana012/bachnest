import Image from "next/image";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Rafiul Islam",
    role: "BUET student, Dhanmondi",
    quote:
      "Found a room within 2 days of signing up. The owner was NID-verified and the rent agreement was done fully online. No broker involved at all.",
    rating: 5,
    initials: "RI",
    image: "/images/room-interior.jpg",
  },
  {
    name: "Fariha Akter",
    role: "Working professional, Mirpur",
    quote:
      "As a female professional I was very cautious. BachNest's verification gave me confidence. The SOS feature is something every platform should have.",
    rating: 5,
    initials: "FA",
    image: "/images/room-modern.jpg",
  },
  {
    name: "Sabbir Hossain",
    role: "Property owner, Bashundhara",
    quote:
      "I listed my two flats and got verified tenants within a week. Digital rent collection saves me from running around every month.",
    rating: 5,
    initials: "SH",
    image: "/images/building-exterior.jpg",
  },
];

export function Testimonials() {
  return (
    <section className="py-16 md:py-20 border-t border-border">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-12 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary">
            What people say
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-foreground">
            Trusted by bachelors and owners across Dhaka
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-2xl border border-border bg-card overflow-hidden flex flex-col"
            >
              <div className="relative h-44 w-full shrink-0">
                <Image
                  src={t.image}
                  alt={t.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>

              <div className="p-6 flex flex-col gap-4 flex-1">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-foreground leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-3 border-t border-border">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
