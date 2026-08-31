import { HeroSection } from "@/components/home/hero";
import { StatsBanner } from "@/components/home/stats-banner";
import { HowItWorks } from "@/components/home/how-it-works";
import { FeaturedProperties } from "@/components/home/featured-properties";
import { BrowseByArea } from "@/components/home/browse-by-area";
import { RoomGallery } from "@/components/home/room-gallery";
import { TrustFeatures } from "@/components/home/trust-features";
import { Testimonials } from "@/components/home/testimonials";
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
        <HowItWorks />
        <FeaturedProperties properties={properties} />
        <BrowseByArea />
        <RoomGallery />
        <TrustFeatures />
        <Testimonials />
        <CtaBanner />
      </main>
      <Footer />
    </div>
  );
}
