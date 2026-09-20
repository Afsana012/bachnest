"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Users,
  Receipt,
  Wrench,
  Megaphone,
  Plus,
  ArrowLeftRight,
  LogOut,
  ShieldCheck,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { User } from "@/lib/types";
import { ThemeToggle } from "@/components/layout/theme-toggle";

export type OwnerTab = "overview" | "properties" | "bookings" | "tenancies" | "invoices" | "complaints" | "notices";

interface OwnerSidebarProps {
  user: User | null;
  activeTab: OwnerTab;
  onSelectTab: (tab: OwnerTab) => void;
  counts: {
    properties: number;
    pendingBookings: number;
    tenancies: number;
    invoices: number;
    openComplaints: number;
  };
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenNoticeComposer: () => void;
  onLogout: () => void;
}

export function OwnerSidebar({
  user,
  activeTab,
  onSelectTab,
  counts,
  isMobileOpen,
  onCloseMobile,
  onOpenNoticeComposer,
  onLogout,
}: OwnerSidebarProps) {
  const navItems = [
    {
      group: "Portfolio & Assets",
      items: [
        {
          key: "overview" as OwnerTab,
          label: "Dashboard Overview",
          icon: LayoutDashboard,
          count: 0,
        },
        {
          key: "properties" as OwnerTab,
          label: "My Properties",
          icon: Building2,
          count: counts.properties,
        },
        {
          key: "bookings" as OwnerTab,
          label: "Booking Requests",
          icon: CalendarCheck,
          count: counts.pendingBookings,
          isAlert: counts.pendingBookings > 0,
        },
        {
          key: "tenancies" as OwnerTab,
          label: "Tenants & Leases",
          icon: Users,
          count: counts.tenancies,
        },
      ],
    },
    {
      group: "Finance & Operations",
      items: [
        {
          key: "invoices" as OwnerTab,
          label: "Rent & Invoices",
          icon: Receipt,
          count: counts.invoices,
        },
        {
          key: "complaints" as OwnerTab,
          label: "Maintenance Tickets",
          icon: Wrench,
          count: counts.openComplaints,
          isAlert: counts.openComplaints > 0,
        },
        {
          key: "notices" as OwnerTab,
          label: "Building Notices",
          icon: Megaphone,
          count: 0,
        },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex h-full flex-col justify-between p-4 sm:p-5">
      <div className="space-y-6">
        {/* Owner Profile Header */}
        <div className="flex items-center justify-between pb-4 border-b border-border/70">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-11 w-11 rounded-2xl bg-primary/10 text-primary border border-primary/20 flex items-center justify-center font-black text-lg shrink-0 shadow-xs">
              {user?.full_name?.charAt(0).toUpperCase() || "O"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h3 className="font-extrabold text-sm text-foreground truncate">
                  {user?.full_name || "Property Owner"}
                </h3>
                {user?.is_kyc_verified && (
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                )}
              </div>
              <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Trust: {user?.trust_score ?? 95}%
                </span>
                <span className="text-[10px] text-muted-foreground">· Landlord</span>
              </div>
            </div>
          </div>
          {isMobileOpen && (
            <button
              type="button"
              onClick={onCloseMobile}
              className="lg:hidden p-1.5 rounded-xl text-muted-foreground hover:bg-muted"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Quick Action CTAs */}
        <div className="space-y-2">
          <Button
            asChild
            size="sm"
            className="w-full justify-start rounded-xl text-xs font-bold shadow-xs bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link href="/dashboard/properties/new">
              <Plus className="h-3.5 w-3.5 mr-2" /> Post New Property
            </Link>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenNoticeComposer}
            className="w-full justify-start rounded-xl text-xs font-semibold border-border/80 hover:bg-muted/70"
          >
            <Megaphone className="h-3.5 w-3.5 mr-2 text-primary" /> Broadcast Notice
          </Button>
        </div>

        {/* Categorized Navigation */}
        <div className="space-y-5">
          {navItems.map((group) => (
            <div key={group.group} className="space-y-1.5">
              <p className="px-3 text-[10px] font-bold text-muted-foreground/80 uppercase tracking-wider">
                {group.group}
              </p>
              <div className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => {
                        onSelectTab(item.key);
                        if (isMobileOpen) onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-primary-foreground" : "text-muted-foreground"}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.count > 0 && (
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? "bg-primary-foreground/20 text-primary-foreground"
                              : item.isAlert
                                ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Navigation Utilities */}
      <div className="pt-4 border-t border-border/70 space-y-2">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="w-full justify-start rounded-xl text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/60"
        >
          <Link href="/dashboard">
            <ArrowLeftRight className="h-3.5 w-3.5 mr-2" /> Switch to Bachelor View
          </Link>
        </Button>

        <div className="flex items-center justify-between px-3 py-1.5 rounded-xl bg-muted/30 border border-border/60">
          <span className="text-[11px] font-medium text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sticky Sidebar */}
      <aside className="hidden lg:block w-64 xl:w-72 shrink-0 border-r border-border bg-card/50 backdrop-blur-md rounded-3xl self-start sticky top-20 shadow-xs">
        {sidebarContent}
      </aside>

      {/* Mobile Off-Canvas Drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden animate-in fade-in duration-200">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-xs bg-card border-r border-border shadow-2xl z-50 animate-in slide-in-from-left duration-250">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
}
