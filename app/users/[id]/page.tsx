"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserCircle, Star, ShieldCheck, CalendarDays } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent } from "@/components/ui/card";
import { fetchApi } from "@/lib/api";
import { Review, User } from "@/lib/types";
import { enumLabel, formatDate } from "@/lib/format";

export default function PublicProfilePage() {
  const params = useParams();
  const id = params?.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      if (!id) return;
      const [userRes, reviewsRes] = await Promise.all([
        fetchApi<User>(`/users/${id}`),
        fetchApi<Review[]>(`/reviews/user/${id}`),
      ]);
      if (userRes.success && userRes.data) {
        setUser(userRes.data);
      } else {
        setNotFound(true);
      }
      if (reviewsRes.success && reviewsRes.data) {
        setReviews(reviewsRes.data);
      }
      setLoading(false);
    }
    loadProfile();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-3xl py-20 px-4 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </div>
        <Footer />
      </div>
    );
  }

  if (notFound || !user) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-3xl py-20 px-4 text-center">
          <h2 className="text-2xl font-bold">Profile Not Found</h2>
        </div>
        <Footer />
      </div>
    );
  }

  const averageRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <Card className="rounded-3xl border-border bg-card p-8 mb-8">
            <CardContent className="p-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
                  {user.avatar_url ? (
                    <img src={user.avatar_url} alt={user.full_name} className="h-full w-full object-cover" />
                  ) : (
                    <UserCircle className="h-11 w-11" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-semibold">{user.full_name}</h1>
                    {user.is_kyc_verified && <ShieldCheck className="h-5 w-5 text-emerald-500" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {enumLabel(user.role)}
                    {user.occupation ? ` • ${user.occupation}` : ""}
                    {user.institution_or_company ? ` • ${user.institution_or_company}` : ""}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarDays className="h-3.5 w-3.5" /> Joined {formatDate(user.created_at)}
                    </span>
                    {averageRating != null && (
                      <span className="flex items-center gap-1">
                        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                        {averageRating.toFixed(1)} ({reviews.length} {reviews.length === 1 ? "review" : "reviews"})
                      </span>
                    )}
                    <span>Trust score: {user.trust_score}/100</span>
                  </div>
                </div>
              </div>

              {user.bio && <p className="text-sm text-muted-foreground mt-6 leading-relaxed">{user.bio}</p>}
            </CardContent>
          </Card>

          <h2 className="text-lg font-semibold mb-4">Reviews</h2>
          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((review) => (
                <Card key={review.id} className="rounded-2xl border-border bg-card p-5">
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${star <= review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-muted-foreground">{formatDate(review.created_at)}</span>
                  </div>
                  {review.comment && <p className="text-sm text-muted-foreground">{review.comment}</p>}
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center rounded-2xl border border-dashed border-border bg-muted/20">
              <Star className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No public reviews yet. Reviews appear after both parties submit them at the end of a tenancy.
              </p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
