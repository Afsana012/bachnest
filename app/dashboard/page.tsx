"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Receipt, AlertCircle, Wrench, Plus } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { Tenancy, Invoice, UserKYC, Complaint } from "@/lib/types";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [tenancies, setTenancies] = useState<Tenancy[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [kyc, setKyc] = useState<UserKYC | null>(null);

  const [activeTab, setActiveTab] = useState<"tenancies" | "invoices" | "complaints">("tenancies");
  const [newComplaintTitle, setNewComplaintTitle] = useState("");
  const [newComplaintCategory, setNewComplaintCategory] = useState("plumbing");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    async function loadDashboardData() {
      const [tenRes, invRes, kycRes, compRes] = await Promise.all([
        fetchApi<Tenancy[]>("/bookings/tenancies"),
        fetchApi<Invoice[]>("/billing/invoices"),
        fetchApi<UserKYC>("/kyc/me"),
        fetchApi<Complaint[]>("/complaints"),
      ]);

      if (tenRes.success && tenRes.data) setTenancies(tenRes.data);
      if (invRes.success && invRes.data) setInvoices(invRes.data);
      if (kycRes.success && kycRes.data) setKyc(kycRes.data);
      if (compRes.success && compRes.data) setComplaints(compRes.data);
    }

    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated, loading, router]);

  const handleCreateComplaint = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenancies.length) {
      alert("You need an active tenancy to file a complaint.");
      return;
    }
    setSubmittingComplaint(true);
    const res = await fetchApi<Complaint>("/complaints", {
      method: "POST",
      body: JSON.stringify({
        tenancy_id: tenancies[0].id,
        property_id: tenancies[0].property_id,
        title: newComplaintTitle,
        description: `Maintenance ticket for ${newComplaintCategory}`,
        category: newComplaintCategory,
        severity: "medium",
      }),
    });
    setSubmittingComplaint(false);
    if (res.success && res.data) {
      setComplaints([res.data, ...complaints]);
      setNewComplaintTitle("");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <div className="container mx-auto max-w-5xl py-20 px-4 text-center">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">Rental Dashboard</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage active agreements, monthly invoices, maintenance tickets and verification.</p>
            </div>
            <Badge variant="luxury" className="self-start sm:self-auto py-1 px-3">
              Role: {user?.role.replace("_", " ")}
            </Badge>
          </div>

          {(!kyc || kyc.status !== "verified") && (
            <Card className="mb-8 rounded-3xl border-amber-500/30 bg-amber-500/10 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h3 className="font-bold text-amber-600 dark:text-amber-400">Complete Your KYC Verification</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Verify your NID and Student/Job ID to unlock instant bookings and verified badges.
                    </p>
                  </div>
                </div>
                <Button size="sm" className="rounded-xl self-start sm:self-auto">
                  Submit Documents
                </Button>
              </div>
            </Card>
          )}

          <div className="flex items-center gap-2 border-b border-border/60 pb-3 mb-6">
            <button
              onClick={() => setActiveTab("tenancies")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "tenancies" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tenancies ({tenancies.length})
            </button>
            <button
              onClick={() => setActiveTab("invoices")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "invoices" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Invoices ({invoices.length})
            </button>
            <button
              onClick={() => setActiveTab("complaints")}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                activeTab === "complaints" ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Maintenance ({complaints.length})
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {activeTab === "tenancies" && (
                <Card className="rounded-3xl border-border/80 bg-card/80 p-6">
                  <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Active Tenancies & Agreements</CardTitle>
                      <CardDescription>Your current residential leases</CardDescription>
                    </div>
                    <KeyRound className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent className="p-0">
                    {tenancies.length > 0 ? (
                      <div className="space-y-3">
                        {tenancies.map((t) => (
                          <div key={t.id} className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm">{t.property?.title || "Residential Tenancy"}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">Move-in: {t.start_date} • ৳{t.monthly_rent}/mo</p>
                            </div>
                            <Badge variant="success">{t.status}</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        No active tenancy. Browse listings to request a room.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "invoices" && (
                <Card className="rounded-3xl border-border/80 bg-card/80 p-6">
                  <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold">Monthly Invoices</CardTitle>
                      <CardDescription>Rent and split utility billing</CardDescription>
                    </div>
                    <Receipt className="h-5 w-5 text-primary" />
                  </CardHeader>
                  <CardContent className="p-0">
                    {invoices.length > 0 ? (
                      <div className="space-y-3">
                        {invoices.map((inv) => (
                          <div key={inv.id} className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between">
                            <div>
                              <h4 className="font-bold text-sm">Invoice #{inv.invoice_number}</h4>
                              <p className="text-xs text-muted-foreground mt-0.5">Due: {inv.due_date} • Total: ৳{inv.total_amount}</p>
                            </div>
                            <Badge variant={inv.status === "paid" ? "success" : "destructive"}>
                              {inv.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground text-xs">
                        No pending invoices.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeTab === "complaints" && (
                <div className="space-y-6">
                  <Card className="rounded-3xl border-border/80 bg-card/80 p-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg font-bold">File Maintenance Complaint</CardTitle>
                      <CardDescription>SLA guaranteed response by landlord</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <form onSubmit={handleCreateComplaint} className="flex gap-2">
                        <Input
                          placeholder="Issue title e.g. Bathroom tap leaking..."
                          value={newComplaintTitle}
                          onChange={(e) => setNewComplaintTitle(e.target.value)}
                          className="flex-1"
                          required
                        />
                        <select
                          value={newComplaintCategory}
                          onChange={(e) => setNewComplaintCategory(e.target.value)}
                          className="h-10 rounded-xl border border-input bg-background/60 px-3 text-xs text-foreground focus:outline-none"
                        >
                          <option value="plumbing">Plumbing</option>
                          <option value="electrical">Electrical</option>
                          <option value="wifi">WiFi / Internet</option>
                          <option value="cleaning">Cleaning</option>
                        </select>
                        <Button type="submit" disabled={submittingComplaint} className="rounded-xl">
                          <Plus className="h-4 w-4 mr-1" /> Submit
                        </Button>
                      </form>
                    </CardContent>
                  </Card>

                  <Card className="rounded-3xl border-border/80 bg-card/80 p-6">
                    <CardHeader className="p-0 mb-4 flex flex-row items-center justify-between">
                      <CardTitle className="text-lg font-bold">Active Tickets</CardTitle>
                      <Wrench className="h-5 w-5 text-primary" />
                    </CardHeader>
                    <CardContent className="p-0">
                      {complaints.length > 0 ? (
                        <div className="space-y-3">
                          {complaints.map((c) => (
                            <div key={c.id} className="p-4 rounded-2xl bg-muted/40 border border-border/50 flex items-center justify-between">
                              <div>
                                <h4 className="font-bold text-sm">{c.title}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">Category: {c.category} • Status: {c.status}</p>
                              </div>
                              <Badge variant={c.status === "resolved" ? "success" : "warning"}>
                                {c.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6 text-muted-foreground text-xs">
                          No open complaints.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>

            <div>
              <Card className="rounded-3xl border-border/80 bg-card/80 p-6">
                <CardHeader className="p-0 mb-4">
                  <CardTitle className="text-lg font-bold">Profile & Verification</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-3 text-xs">
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-semibold">{user?.first_name} {user?.last_name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-semibold">{user?.phone}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/40">
                    <span className="text-muted-foreground">KYC Status</span>
                    <Badge variant={user?.is_verified ? "success" : "warning"}>
                      {user?.is_verified ? "Verified" : "Pending"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
