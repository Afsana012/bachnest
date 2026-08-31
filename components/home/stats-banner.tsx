import { ShieldCheck, Users, Home, Clock } from "lucide-react";

export function StatsBanner() {
  const stats = [
    { label: "Verified Listings", value: "2,500+", icon: Home, detail: "Physical verification & geo-tagged" },
    { label: "Active Bachelors", value: "14,000+", icon: Users, detail: "Students & working professionals" },
    { label: "KYC Success Rate", value: "99.4%", icon: ShieldCheck, detail: "Govt NID & Student ID verified" },
    { label: "SOS Response Time", value: "< 2 Mins", icon: Clock, detail: "24/7 dedicated emergency line" },
  ];

  return (
    <section className="border-y border-border/60 bg-card/40 backdrop-blur-md py-10">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:gap-8">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon className="h-5 w-5" />
                </div>
                <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm font-semibold text-foreground/90 mt-1">{stat.label}</span>
                <span className="text-xs text-muted-foreground mt-0.5">{stat.detail}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
