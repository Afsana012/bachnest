import Link from "next/link";
import { Home, Search, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-primary/10 text-primary mb-2 shadow-inner">
          <Compass className="h-10 w-10 animate-spin" style={{ animationDuration: "12s" }} />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">404 - Page Not Found</h1>
          <p className="text-muted-foreground text-sm">
            We couldn&apos;t find the page or accommodation listing you were looking for. It might have been moved or is no longer available.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button asChild variant="default" className="w-full sm:w-auto gap-2 rounded-xl">
            <Link href="/">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto gap-2 rounded-xl">
            <Link href="/properties">
              <Search className="h-4 w-4" />
              Browse Listings
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
