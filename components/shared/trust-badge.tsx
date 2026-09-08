"use client";

import { ShieldCheck, Star, Award, CheckCircle2 } from "lucide-react";
import { UserTrustProfile } from "@/lib/types";

interface TrustBadgeProps {
  profile?: UserTrustProfile;
  score?: number;
  isKycVerified?: boolean;
  role?: string;
  size?: "sm" | "md" | "lg";
  showDetails?: boolean;
}

export function TrustBadge({
  profile,
  score,
  isKycVerified = true,
  role = "BACHELOR",
  size = "md",
  showDetails = true,
}: TrustBadgeProps) {
  const trustScore = profile ? profile.trust_score : (score ?? 85.0);
  const kyc = profile ? profile.is_kyc_verified : isKycVerified;
  const userRole = profile ? profile.role : role;
  const avgRating = profile?.avg_rating || 4.9;
  const reviewCount = profile?.total_reviews || 0;

  // Determine trust tier
  let tierLabel = "Verified Member";
  let tierColor = "border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400";

  if (trustScore >= 90) {
    tierLabel = userRole === "OWNER" ? "Super-Host Landlord" : "Platinum Bachelor";
    tierColor = "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  } else if (trustScore >= 70) {
    tierLabel = userRole === "OWNER" ? "Trusted Landlord" : "Verified Bachelor";
    tierColor = "border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400";
  }

  if (size === "sm") {
    return (
      <div className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-semibold ${tierColor}`}>
        <ShieldCheck className="h-3 w-3 shrink-0" />
        <span>{tierLabel}</span>
        {kyc && <CheckCircle2 className="h-2.5 w-2.5 ml-0.5 opacity-80" />}
      </div>
    );
  }

  return (
    <div className={`rounded-xl border p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${tierColor}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/80 shadow-xs">
          <Award className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <h4 className="font-bold text-sm leading-tight">{tierLabel}</h4>
            {kyc && (
              <span className="inline-flex items-center gap-0.5 rounded px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-600/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="h-2.5 w-2.5" /> NID Verified
              </span>
            )}
          </div>
          <p className="text-xs opacity-85 mt-0.5">
            BachNest Two-Way Reputation & Trust Framework
          </p>
        </div>
      </div>

      {showDetails && (
        <div className="flex items-center gap-4 text-xs pt-2 sm:pt-0 border-t sm:border-t-0 border-current/20">
          <div className="text-right sm:text-right">
            <span className="opacity-75 block text-[10px] uppercase font-semibold">Trust Score</span>
            <span className="font-black text-base">{Math.round(trustScore)}/100</span>
          </div>

          <div className="text-right sm:text-right">
            <span className="opacity-75 block text-[10px] uppercase font-semibold">Rating</span>
            <div className="flex items-center gap-1 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
              <span>{avgRating.toFixed(1)}</span>
              {reviewCount > 0 && <span className="opacity-70 font-normal">({reviewCount})</span>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
