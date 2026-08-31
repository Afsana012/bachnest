import { ShieldCheck, MapPin, FileText, BellRing, UserCheck, CreditCard } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function TrustFeatures() {
  const features = [
    {
      title: "100% Verified Identity (KYC)",
      description: "Both bachelors and landlords undergo NID and institutional background verification to eliminate trust barriers.",
      icon: UserCheck,
    },
    {
      title: "PostGIS Radius Search",
      description: "Pinpoint accommodations within a 1km - 5km radius of your university campus or workplace with accurate geo-fencing.",
      icon: MapPin,
    },
    {
      title: "Legally Binding Digital Agreements",
      description: "Instant, digitally stamped rental agreements with predefined notice periods and transparent deposit terms.",
      icon: FileText,
    },
    {
      title: "Transparent Digital Billing",
      description: "Automated monthly rent invoices with split utility charges (prepaid/postpaid electricity, wifi, gas) and bKash checkout.",
      icon: CreditCard,
    },
    {
      title: "Maintenance Ticket SLAs",
      description: "Submit plumbing, electric, or internet complaints with SLA guarantees and track landlord resolution in real-time.",
      icon: ShieldCheck,
    },
    {
      title: "Real-time Emergency SOS",
      description: "One-click SOS alert system broadcasting instantaneous safety alerts to nearby residents, landlord, and helpline.",
      icon: BellRing,
    },
  ];

  return (
    <section className="py-16 md:py-24 bg-muted/30 border-y border-border/60">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="text-xs font-semibold text-primary uppercase tracking-wider">Engineered for Reliability</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2">
            Why Bangladesh bachelors choose BachNest
          </h2>
          <p className="mt-3 text-muted-foreground text-sm sm:text-base">
            We solved the traditional problems of bachelor tenancy through automation, transparency, and safety protocols.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <Card key={idx} className="rounded-3xl border-border/70 bg-card/60 p-2 hover:border-primary/40 transition-colors">
                <CardContent className="p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-5">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-foreground">{feat.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
