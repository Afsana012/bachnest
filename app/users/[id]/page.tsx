import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PublicProfileView } from "@/components/profile/public-profile-view";
import { fetchApi } from "@/lib/api";
import { Review, User } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const res = await fetchApi<User>(`/users/${id}`);
  if (!res.success || !res.data) {
    return {
      title: "User Profile",
    };
  }

  const user = res.data;
  return {
    title: `${user.full_name} (${user.role.toLowerCase()}) | BachNest`,
    description: user.bio || `Profile of ${user.full_name} on BachNest.`,
    openGraph: {
      title: `${user.full_name} | BachNest`,
      description: user.bio || `Verified user profile on BachNest`,
      images: user.avatar_url ? [{ url: user.avatar_url }] : [],
    },
  };
}

export default async function PublicProfilePage({ params }: PageProps) {
  const { id } = await params;
  const [userRes, reviewsRes] = await Promise.all([
    fetchApi<User>(`/users/${id}`),
    fetchApi<Review[]>(`/reviews/user/${id}`),
  ]);

  if (!userRes.success || !userRes.data) {
    notFound();
  }

  const user = userRes.data;
  const reviews = reviewsRes.success && reviewsRes.data ? reviewsRes.data : [];

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <PublicProfileView user={user} reviews={reviews} />
      </main>
      <Footer />
    </div>
  );
}
