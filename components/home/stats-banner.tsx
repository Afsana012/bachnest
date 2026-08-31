import { ShieldCheck, Users, Home, Clock } from "lucide-react";

export function StatsBanner() {
  const stats = [
    { label: "Verified Listings", value: "2,500+", icon: Home, detail: "Physical verification & geo-tagged" },
    { label: "Active Bachelors", value: "14,000+", icon: Users, detail: "Students & working professionals" },
    { label: "KYC Success Rate", value: "99.4%", icon: ShieldCheck, detail: "Govt NID & Student ID verified" },
    { label: "SOS Response Time", value: "< 2 Mins", icon: Clock, detail: "24/7 dedicated emergency line" },
  ];

  return (
    <section className="border-y border-border/60 bg-card/40 backdrop-blur-md py-12 lg:py-16">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:gap-12">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="flex flex-col items-center text-center p-2 group">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted border border-border text-foreground mb-4 transition-transform duration-300 group-hover:-translate-y-1 group-hover:bg-primary/10 group-hover:border-primary/20 group-hover:text-primary">
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="text-sm font-bold text-foreground/90 mt-1">{stat.label}</span>
                <span className="text-xs text-muted-foreground mt-1 max-w-[160px] mx-auto leading-relaxed">{stat.detail}</span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
