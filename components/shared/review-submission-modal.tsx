"use client";

import { useState } from "react";
import { Star, X, CheckCircle2, AlertCircle, Loader2, Shield } from "lucide-react";
import { Review, Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";

interface ReviewSubmissionModalProps {
  tenancy: Tenancy;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (review: Review) => void;
}

const QUICK_TAGS = [
  "Prompt Rent Payment",
  "Respectful of House Rules",
  "Cleanliness & Hygiene",
  "Fast Maintenance Response",
  "Transparent Communication",
  "Quiet & Orderly",
  "Highly Recommended",
];

export function ReviewSubmissionModal({
  tenancy,
  isOpen,
  onClose,
  onSuccess,
}: ReviewSubmissionModalProps) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [comment, setComment] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const fullComment = [
      selectedTags.length > 0 ? `Highlights: ${selectedTags.join(", ")}` : "",
      comment.trim(),
    ]
      .filter(Boolean)
      .join("\n\n");

    setIsLoading(true);
    try {
      const res = await fetchApi<Review>("/reviews", {
        method: "POST",
        body: JSON.stringify({
          tenancy_id: tenancy.id,
          rating,
          comment: fullComment || undefined,
        }),
      });

      if (res.success && res.data) {
        onSuccess(res.data);
        onClose();
      } else {
        setError(res.message || "Failed to submit review.");
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to submit review.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl p-6 md:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <Star className="h-6 w-6 fill-amber-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-foreground">Two-Way Trust Rating</h2>
            <p className="text-xs text-muted-foreground">Agreement #{tenancy.id.slice(0, 8)} Review & Endorsement</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Star Rating Selector */}
          <div className="text-center py-3 bg-muted/20 rounded-xl border border-border/60">
            <span className="text-xs font-semibold text-muted-foreground block mb-2 uppercase tracking-wider">
              Overall Experience
            </span>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating ?? rating) >= star;
                return (
                  <button
                    key={star}
                    type="button"
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(null)}
                    onClick={() => setRating(star)}
                    className="p-1 rounded-lg hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`h-8 w-8 ${
                        active ? "fill-amber-400 text-amber-400" : "text-muted-foreground/40"
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-foreground mt-2 block">
              {rating === 5 ? "Exceptional (5/5)" :
               rating === 4 ? "Great (4/5)" :
               rating === 3 ? "Average (3/5)" :
               rating === 2 ? "Below Average (2/5)" : "Poor (1/5)"}
            </span>
          </div>

          {/* Quick Tag Pills */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-2">
              Endorsement Highlights
            </label>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_TAGS.map((tag) => {
                const isSelected = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`rounded-full px-2.5 py-1 text-[11px] font-medium border transition-colors ${
                      isSelected
                        ? "border-primary bg-primary text-primary-foreground font-semibold"
                        : "border-border bg-background hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    {isSelected && "✓ "}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Written Review (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Share your experience to help future bachelors and landlords..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:border-primary focus:outline-none resize-none"
            />
          </div>

          {/* Blind Review Shield Notice */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 flex items-start gap-2.5 text-xs text-muted-foreground">
            <Shield className="h-4 w-4 text-primary shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Blind Review Policy:</strong> Your review is confidential and will only appear publicly once the other party submits theirs, preventing retaliatory feedback.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <CheckCircle2 className="h-3.5 w-3.5" />
              )}
              Submit Verified Review
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
