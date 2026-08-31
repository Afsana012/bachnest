"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, FileText, Wrench, Plus, UserCircle, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
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
  const [newComplaintCategory, setNewComplaintCategory] = useState("PLUMBING");
  const [submittingComplaint, setSubmittingComplaint] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    async function loadDashboardData() {
      const [tenRes, invRes, kycRes, compRes] = await Promise.all([
        fetchApi<Tenancy[]>("/tenancies/me"),
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
        description: `Maintenance ticket for ${newComplaintCategory.toLowerCase()}`,
        category: newComplaintCategory,
        priority: "MEDIUM",
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
        <div className="container mx-auto flex-1 flex items-center justify-center">
          <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-border pb-8 mb-8">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">Welcome, {user?.full_name?.split(" ")[0] || "User"}</h1>
              <p className="text-sm text-muted-foreground mt-2">Manage your residential leases, payments, and support tickets.</p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="px-3 py-1 font-medium capitalize shadow-sm bg-background">
                {user?.role.toLowerCase().replace("_", " ")}
              </Badge>
            </div>
          </div>

          {/* KYC Alert */}
          {(!kyc || kyc.status !== "APPROVED") && (
            <div className="mb-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-muted/40 p-5 shadow-sm">
              <div className="flex items-start gap-4">
                <ShieldAlert className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground text-sm">Action Required: Verify Identity</h3>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    Submit your National ID (NID) and Student/Job ID to unlock instant bookings, digital agreements, and priority support.
                  </p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="shrink-0 bg-background hover:bg-muted">
                Complete KYC
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Sidebar / User Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                    <UserCircle className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user?.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Phone</span>
                    <span className="font-medium">{user?.phone}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Verification</span>
                    {user?.is_kyc_verified ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 font-medium"><CheckCircle2 className="h-4 w-4"/> Verified</span>
                    ) : (
                      <span className="text-amber-600 dark:text-amber-500 font-medium">Pending</span>
                    )}
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground">Trust Score</span>
                    <span className="font-medium">{user?.trust_score ?? "New"} / 5.0</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-8">
              {/* Minimal Tabs */}
              <div className="flex items-center gap-6 border-b border-border mb-8">
                <button
                  onClick={() => setActiveTab("tenancies")}
                  className={`pb-3 text-sm font-medium transition-all ${
                    activeTab === "tenancies" 
                      ? "text-foreground border-b-2 border-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Tenancies ({tenancies.length})
                </button>
                <button
                  onClick={() => setActiveTab("invoices")}
                  className={`pb-3 text-sm font-medium transition-all ${
                    activeTab === "invoices" 
                      ? "text-foreground border-b-2 border-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Invoices ({invoices.length})
                </button>
                <button
                  onClick={() => setActiveTab("complaints")}
                  className={`pb-3 text-sm font-medium transition-all ${
                    activeTab === "complaints" 
                      ? "text-foreground border-b-2 border-foreground" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Maintenance ({complaints.length})
                </button>
              </div>

              {/* Tab Contents */}
              <div className="space-y-6">
                
                {/* TENANCIES TAB */}
                {activeTab === "tenancies" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Home className="h-5 w-5 text-muted-foreground" /> Active Agreements
                    </h2>
                    {tenancies.length > 0 ? (
                      <div className="space-y-4">
                        {tenancies.map((t) => (
                          <div key={t.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-border/80 transition-colors">
                            <div>
                              <h4 className="font-semibold text-foreground">{t.property_title || "Residential Property"}</h4>
                              <p className="text-sm text-muted-foreground mt-1">Move-in: {t.lease_start_date} • Rent: ৳{t.agreed_monthly_rent}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="capitalize bg-muted/30">
                                {t.status.replace("_", " ").toLowerCase()}
                              </Badge>
                              <Button variant="outline" size="sm">Details</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
                        <Home className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">You have no active tenancies.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* INVOICES TAB */}
                {activeTab === "invoices" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <FileText className="h-5 w-5 text-muted-foreground" /> Billing History
                    </h2>
                    {invoices.length > 0 ? (
                      <div className="space-y-4">
                        {invoices.map((inv) => (
                          <div key={inv.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground">Invoice #{inv.invoice_number}</h4>
                              <p className="text-sm text-muted-foreground mt-1">Due: {inv.due_date} • Total: ৳{inv.total_amount}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge 
                                variant={inv.status === "PAID" ? "default" : "destructive"} 
                                className="capitalize shadow-none"
                              >
                                {inv.status.toLowerCase()}
                              </Badge>
                              <Button variant="outline" size="sm">View PDF</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
                        <FileText className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No pending or past invoices found.</p>
                      </div>
                    )}
                  </div>
                )}

                {/* COMPLAINTS TAB */}
                {activeTab === "complaints" && (
                  <div>
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                      <Wrench className="h-5 w-5 text-muted-foreground" /> Support Tickets
                    </h2>
                    
                    <div className="p-5 rounded-xl border border-border bg-card shadow-sm mb-6">
                      <h3 className="text-sm font-semibold mb-4">File a new request</h3>
                      <form onSubmit={handleCreateComplaint} className="flex flex-col sm:flex-row gap-3">
                        <Input
                          placeholder="E.g. AC not cooling, sink leaking..."
                          value={newComplaintTitle}
                          onChange={(e) => setNewComplaintTitle(e.target.value)}
                          className="flex-1"
                          required
                        />
                        <div className="flex gap-3">
                          <select
                            value={newComplaintCategory}
                            onChange={(e) => setNewComplaintCategory(e.target.value)}
                            className="h-10 w-36 rounded-md border border-input bg-transparent px-3 text-sm focus:outline-none"
                          >
                            <option value="PLUMBING">Plumbing</option>
                            <option value="ELECTRICAL">Electrical</option>
                            <option value="INTERNET">Internet</option>
                            <option value="CLEANING">Cleaning</option>
                            <option value="OTHER">Other</option>
                          </select>
                          <Button type="submit" disabled={submittingComplaint} className="px-6 shrink-0">
                            <Plus className="h-4 w-4 mr-2" /> File Request
                          </Button>
                        </div>
                      </form>
                    </div>

                    {complaints.length > 0 ? (
                      <div className="space-y-4">
                        {complaints.map((c) => (
                          <div key={c.id} className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <h4 className="font-semibold text-foreground">{c.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                Category: <span className="capitalize">{c.category.toLowerCase()}</span> • Created: {new Date(c.created_at).toLocaleDateString()}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize bg-muted/30">
                              {c.status.replace("_", " ").toLowerCase()}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-12 text-center rounded-xl border border-dashed border-border bg-muted/20">
                        <Wrench className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground">No active maintenance requests.</p>
                      </div>
                    )}
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
