import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PropertyDetailView } from "@/components/properties/property-detail-view";
import { fetchApi } from "@/lib/api";
import { Property } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await fetchApi<Property>(`/properties/${id}`);
  if (!res.success || !res.data) {
    return {
      title: "Property Details",
    };
  }

  const property = res.data;
  return {
    title: `${property.title} | BachNest`,
    description: `${property.address_line}, ${property.area_neighborhood}, ${property.city}. ${property.description?.slice(0, 140) || ""}`,
    openGraph: {
      title: property.title,
      description: property.description || "Verified bachelor listing on BachNest",
      images: property.media?.[0]?.media_url ? [{ url: property.media[0].media_url }] : [],
    },
  };
}

export default async function PropertyDetailPage({ params }: PageProps) {
  const { id } = await params;
  const res = await fetchApi<Property>(`/properties/${id}`);

  if (!res.success || !res.data) {
    notFound();
  }

  const property = res.data;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-8">
        <PropertyDetailView property={property} />
      </main>
      <Footer />
    </div>
  );
}
