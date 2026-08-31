"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  FileKey,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Eye,
} from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";
import { AdminDashboardStats, KYCOut, Property, User } from "@/lib/types";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [activeTab, setActiveTab] = useState<"overview" | "kyc" | "properties" | "users">("overview");

  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [kycQueue, setKycQueue] = useState<KYCOut[]>([]);
  const [pendingProperties, setPendingProperties] = useState<Property[]>([]);
  const [usersList, setUsersList] = useState<User[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== "ADMIN" && user?.role !== "SUPER_ADMIN"))) {
      router.push("/dashboard");
      return;
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated, loading, activeTab]);

  const loadData = async () => {
    setDataLoading(true);
    if (activeTab === "overview") {
      const res = await fetchApi<AdminDashboardStats>("/admin/dashboard");
      if (res.success && res.data) setStats(res.data);
    } else if (activeTab === "kyc") {
      const res = await fetchApi<KYCOut[]>("/admin/kyc?status=PENDING");
      if (res.success && res.data) setKycQueue(res.data);
    } else if (activeTab === "properties") {
      const res = await fetchApi<Property[]>("/admin/properties/pending");
      if (res.success && res.data) setPendingProperties(res.data);
    } else if (activeTab === "users") {
      const res = await fetchApi<User[]>("/admin/users");
      if (res.success && res.data) setUsersList(res.data);
    }
    setDataLoading(false);
  };

  const handleKycDecision = async (kycId: string, decision: "APPROVED" | "REJECTED") => {
    const res = await fetchApi(`/admin/kyc/${kycId}/decision`, {
      method: "PATCH",
      body: JSON.stringify({ decision, rejection_reason: decision === "REJECTED" ? "Documents unclear" : null }),
    });
    if (res.success) {
      setKycQueue(kycQueue.filter((k) => k.id !== kycId));
    } else {
      alert(res.message || "Failed to submit decision");
    }
  };

  const handleVerifyProperty = async (propertyId: string) => {
    const res = await fetchApi(`/admin/properties/${propertyId}/verify`, {
      method: "PATCH",
      body: JSON.stringify({ is_verified_by_admin: true }),
    });
    if (res.success) {
      setPendingProperties(pendingProperties.filter((p) => p.id !== propertyId));
    } else {
      alert(res.message || "Failed to verify property");
    }
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-muted/20 text-foreground">
      <Navbar />
      <main className="flex-1 py-10">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6">
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold tracking-tight">Admin Console</h1>
            <p className="text-sm text-muted-foreground mt-1">Platform moderation and management.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar Navigation */}
            <div className="lg:w-64 shrink-0">
              <nav className="flex flex-col space-y-1">
                <button
                  onClick={() => setActiveTab("overview")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "overview" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab("kyc")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "kyc" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <FileKey className="h-4 w-4" />
                  KYC Verification
                  {activeTab !== "kyc" && kycQueue.length > 0 && (
                    <span className="ml-auto bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px]">
                      {kycQueue.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab("properties")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "properties" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Building2 className="h-4 w-4" />
                  Pending Properties
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === "users" ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  User Management
                </button>
              </nav>
            </div>

            {/* Main Content Area */}
            <div className="flex-1">
              {dataLoading && activeTab !== "overview" ? (
                <div className="flex items-center justify-center h-48">
                  <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : (
                <>
                  {/* OVERVIEW TAB */}
                  {activeTab === "overview" && stats && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="rounded-2xl border-border/60 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                            Total Users <Users className="h-4 w-4 opacity-50" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold">{stats.total_users}</div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-2xl border-border/60 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                            Verified Properties <Building2 className="h-4 w-4 opacity-50" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold">{stats.verified_properties}</div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-2xl border-border/60 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                            Active Tenancies <FileKey className="h-4 w-4 opacity-50" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold">{stats.active_tenancies}</div>
                        </CardContent>
                      </Card>
                      <Card className="rounded-2xl border-border/60 shadow-sm">
                        <CardHeader className="p-4 pb-2">
                          <CardTitle className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                            Open SOS / Complaints <AlertTriangle className="h-4 w-4 text-destructive opacity-80" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                          <div className="text-2xl font-bold text-destructive">
                            {stats.active_sos + stats.open_complaints}
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  {/* KYC TAB */}
                  {activeTab === "kyc" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-4">Pending KYC Submissions</h2>
                      {kycQueue.length > 0 ? (
                        kycQueue.map((kyc) => (
                          <div key={kyc.id} className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-foreground">Document: {kyc.document_type}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">User ID: {kyc.user_id}</p>
                              <p className="text-xs text-muted-foreground">ID Number: {kyc.document_number}</p>
                              <div className="mt-3 flex gap-2">
                                <a href={kyc.front_document_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline">
                                  <Eye className="h-3.5 w-3.5" /> View Front
                                </a>
                                {kyc.back_document_url && (
                                  <a href={kyc.back_document_url} target="_blank" rel="noreferrer" className="text-xs flex items-center gap-1 text-primary hover:underline">
                                    <Eye className="h-3.5 w-3.5" /> View Back
                                  </a>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" onClick={() => handleKycDecision(kyc.id, "APPROVED")}>
                                <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                              </Button>
                              <Button size="sm" variant="outline" className="text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => handleKycDecision(kyc.id, "REJECTED")}>
                                <XCircle className="h-4 w-4 mr-1.5" /> Reject
                              </Button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-card rounded-2xl border border-border/60">
                          <ShieldCheck className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">All caught up! No pending KYC requests.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PROPERTIES TAB */}
                  {activeTab === "properties" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-4">Pending Properties</h2>
                      {pendingProperties.length > 0 ? (
                        pendingProperties.map((prop) => (
                          <div key={prop.id} className="bg-card rounded-2xl border border-border/60 p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <p className="text-sm font-semibold text-foreground">{prop.title}</p>
                              <p className="text-xs text-muted-foreground mt-0.5">{prop.address_line}, {prop.area}</p>
                              <Badge variant="secondary" className="mt-2 text-[10px] uppercase">
                                {prop.property_type}
                              </Badge>
                            </div>
                            <Button size="sm" className="shrink-0" onClick={() => handleVerifyProperty(prop.id)}>
                              <CheckCircle2 className="h-4 w-4 mr-1.5" /> Verify Property
                            </Button>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 bg-card rounded-2xl border border-border/60">
                          <Building2 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                          <p className="text-sm text-muted-foreground">No properties pending verification.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* USERS TAB */}
                  {activeTab === "users" && (
                    <div className="space-y-4">
                      <h2 className="text-xl font-bold mb-4">User Management</h2>
                      <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                        <table className="w-full text-sm text-left">
                          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                            <tr>
                              <th className="px-4 py-3 font-medium">Name</th>
                              <th className="px-4 py-3 font-medium">Contact</th>
                              <th className="px-4 py-3 font-medium">Role</th>
                              <th className="px-4 py-3 font-medium">KYC</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-border/60">
                            {usersList.map((u) => (
                              <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                                <td className="px-4 py-3 font-medium text-foreground">{u.full_name}</td>
                                <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                                <td className="px-4 py-3">
                                  <Badge variant="outline" className="text-[10px] uppercase">{u.role}</Badge>
                                </td>
                                <td className="px-4 py-3">
                                  {u.is_kyc_verified ? (
                                    <span className="text-emerald-500 font-medium text-xs">Verified</span>
                                  ) : (
                                    <span className="text-amber-500 font-medium text-xs">Pending</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {usersList.length === 0 && (
                          <div className="text-center py-8 text-muted-foreground text-sm">No users found.</div>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
