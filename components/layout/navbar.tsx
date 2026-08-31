"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, Compass, ShieldAlert, LayoutDashboard, LogIn, UserPlus, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Badge } from "@/components/ui/badge";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();

  const navLinks = [
    { label: "Explore", href: "/properties", icon: Compass },
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "SOS Hub", href: "/emergency", icon: ShieldAlert, highlight: true },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-bold tracking-tight text-xl transition-opacity hover:opacity-90">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Building2 className="h-5 w-5" />
          </div>
          <span className="bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            BachNest
          </span>
          <Badge variant="luxury" className="hidden sm:inline-flex text-[10px]">
            BD Verified
          </Badge>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary/10 text-primary font-semibold"
                    : link.highlight
                    ? "text-destructive hover:bg-destructive/10"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                }`}
              >
                <Icon className={`h-4 w-4 ${link.highlight ? "text-destructive" : ""}`} />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          {isAuthenticated && user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard" className="flex items-center gap-2 text-sm font-medium">
                <span className="hidden sm:inline-block text-muted-foreground">Hello,</span>
                <span className="font-semibold">{user.first_name}</span>
                <Badge variant={user.is_verified ? "success" : "warning"} className="text-[10px] uppercase">
                  {user.is_verified ? "Verified" : "KYC Pending"}
                </Badge>
              </Link>
              <Button variant="ghost" size="icon-sm" onClick={logout} title="Sign Out">
                <LogOut className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login" className="flex items-center gap-1.5">
                  <LogIn className="h-4 w-4" />
                  <span>Sign In</span>
                </Link>
              </Button>
              <Button size="sm" asChild className="rounded-xl shadow-sm">
                <Link href="/auth/register" className="flex items-center gap-1.5">
                  <UserPlus className="h-4 w-4" />
                  <span>Get Started</span>
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
