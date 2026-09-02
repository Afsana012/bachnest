"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Optionally log error in telemetry
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-destructive/10 text-destructive mb-2 shadow-inner">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-bold tracking-tight">Something went wrong</h2>
          <p className="text-muted-foreground text-sm">
            An unexpected error occurred while loading this section. Please try again.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button onClick={() => reset()} variant="default" className="w-full sm:w-auto gap-2 rounded-xl">
            <RotateCcw className="h-4 w-4" />
            Try again
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2 rounded-xl">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
