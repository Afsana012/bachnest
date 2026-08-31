import { HeroSection } from "@/components/home/hero";
import { StatsBanner } from "@/components/home/stats-banner";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { TrustFeatures } from "@/components/home/trust-features";
import { CtaBanner } from "@/components/home/cta-banner";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Property } from "@/lib/types";
import { fetchApi } from "@/lib/api";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const response = await fetchApi<Property[]>("/properties?page=1&size=6");
  const properties = response.success && response.data ? response.data : [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <StatsBanner />
        <FeaturedProperties properties={properties} />
        <TrustFeatures />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
