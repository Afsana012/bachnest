"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardClientView } from "@/components/dashboard/dashboard-client-view";

export function DashboardSearchParamsReader() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const payment = searchParams.get("payment");
  const paymentResult = payment === "success" || payment === "failed" ? payment : null;

  useEffect(() => {
    if (paymentResult) {
      router.replace("/dashboard", { scroll: false });
    }
  }, [paymentResult, router]);

  return <DashboardClientView initialPaymentResult={paymentResult} />;
}
