"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronDown,
  Menu,
  X,
  LogOut,
  LayoutDashboard,
  ShieldAlert,
  Plus,
  Compass,
  FileText,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ThemeToggle } from "@/components/layout/theme-toggle";

const NAV_ITEMS = [
  { label: "Browse Properties", href: "/properties" },
  { label: "Single Rooms", href: "/properties?room_type=single" },
  { label: "Shared Seats", href: "/properties?room_type=shared" },
  { label: "Flats & Sublets", href: "/properties?type=apartment" },
  { label: "Mess & Hostels", href: "/properties?type=hostel" },
];

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const [isBrowseOpen, setIsBrowseOpen] = React.useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = React.useState(false);
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  const browseRef = React.useRef<HTMLDivElement>(null);
  const userMenuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (browseRef.current && !browseRef.current.contains(event.target as Node)) {
        setIsBrowseOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  React.useEffect(() => {
    setIsBrowseOpen(false);
    setIsUserMenuOpen(false);
    setIsMobileOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-lg">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl overflow-hidden border border-border/80 bg-background shadow-xs">
              <Image
                src="/logo.png"
                alt="BachNest Logo"
                width={36}
                height={36}
                className="object-cover rounded-xl"
                priority
              />
            </div>
            <span className="font-semibold text-foreground">BachNest</span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            <div className="relative" ref={browseRef}>
              <button
                type="button"
                onClick={() => setIsBrowseOpen(!isBrowseOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isBrowseOpen || pathname.startsWith("/properties")
                    ? "bg-muted text-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <span>Browse</span>
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${
                    isBrowseOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isBrowseOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
                  {NAV_ITEMS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setIsBrowseOpen(false)}
                      className="block px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-muted transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <Link
                    href="/properties?gender=female_only"
                    onClick={() => setIsBrowseOpen(false)}
                    className="block px-3 py-2 rounded-lg text-sm text-primary font-medium hover:bg-muted transition-colors"
                  >
                    Female-Only Accommodations
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/properties?tab=roommates"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname.includes("roommates")
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              Roommates
            </Link>

            <Link
              href="/emergency"
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === "/emergency"
                  ? "bg-destructive/10 text-destructive"
                  : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              }`}
            >
              <ShieldAlert className="h-4 w-4" />
              <span>SOS Hub</span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Button
            asChild
            variant="outline"
            size="sm"
            className="hidden sm:inline-flex rounded-lg gap-1.5 text-xs font-semibold"
          >
            <Link href={isAuthenticated ? "/dashboard?tab=post-property" : "/auth/register?role=property_owner"}>
              <Plus className="h-3.5 w-3.5" />
              <span>Post To-Let</span>
            </Link>
          </Button>

          <ThemeToggle />

          {isAuthenticated && user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-border bg-muted/40 hover:bg-muted transition-colors"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-xs">
                  {user.full_name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="hidden md:inline-block text-xs font-medium pr-1 text-foreground">
                  {user.full_name}
                </span>
                <ChevronDown className="hidden md:inline-block h-3.5 w-3.5 text-muted-foreground mr-1" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-56 rounded-xl border border-border bg-popover p-1.5 shadow-lg z-50 animate-in fade-in-50 zoom-in-95">
                  <div className="px-3 py-2 border-b border-border mb-1">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-semibold text-foreground truncate">
                        {user.full_name}
                      </p>
                      {user.is_kyc_verified && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
                  </div>

                  <Link
                    href="/dashboard"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=bookings"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Compass className="h-4 w-4 text-muted-foreground" />
                    <span>My Bookings</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=billing"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>Invoices</span>
                  </Link>

                  <Link
                    href="/dashboard?tab=complaints"
                    onClick={() => setIsUserMenuOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-popover-foreground hover:bg-muted transition-colors"
                  >
                    <Wrench className="h-4 w-4 text-muted-foreground" />
                    <span>Complaints</span>
                  </Link>

                  <div className="my-1 border-t border-border" />

                  <button
                    type="button"
                    onClick={() => {
                      setIsUserMenuOpen(false);
                      logout();
                    }}
                    className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild className="rounded-lg text-xs font-medium">
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button size="sm" asChild className="rounded-lg text-xs font-medium">
                <Link href="/auth/register">Get Started</Link>
              </Button>
            </div>
          )}

          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-4 space-y-3 animate-in slide-in-from-top duration-150">
          <Button asChild className="w-full justify-center gap-1.5 rounded-lg text-xs font-semibold" size="sm">
            <Link href={isAuthenticated ? "/dashboard?tab=post-property" : "/auth/register?role=property_owner"}>
              <Plus className="h-3.5 w-3.5" />
              <span>Post To-Let</span>
            </Link>
          </Button>

          <div className="space-y-1">
            <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Browse
            </p>
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="block px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/properties?gender=female_only"
              className="block px-2 py-1.5 rounded-lg text-sm text-primary font-medium hover:bg-muted transition-colors"
            >
              Female-Only Accommodations
            </Link>
            <Link
              href="/properties?tab=roommates"
              className="block px-2 py-1.5 rounded-lg text-sm text-foreground hover:bg-muted transition-colors"
            >
              Roommate Match
            </Link>
            <Link
              href="/emergency"
              className="block px-2 py-1.5 rounded-lg text-sm text-destructive font-medium hover:bg-destructive/10 transition-colors"
            >
              SOS Emergency Hub
            </Link>
          </div>

          <div className="pt-2 border-t border-border">
            {isAuthenticated && user ? (
              <div className="space-y-2">
                <div className="px-2">
                  <p className="text-xs font-semibold">{user.full_name}</p>
                  <p className="text-[11px] text-muted-foreground">{user.email}</p>
                </div>
                <Button variant="outline" size="sm" asChild className="w-full justify-start rounded-lg">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={logout}
                  className="w-full justify-start rounded-lg text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" asChild className="rounded-lg">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="rounded-lg">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
