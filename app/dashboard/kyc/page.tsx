"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, UploadCloud } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi } from "@/lib/api";

export default function KYCPage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [docType, setDocType] = useState("NID");
  const [docNumber, setDocNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  if (loading) return null;
  if (!isAuthenticated) {
    router.push("/auth/login");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = await fetchApi("/kyc", {
      method: "POST",
      body: JSON.stringify({
        document_type: docType,
        document_number: docNumber,
        front_document_url: "mock_front_url.jpg",
        back_document_url: "mock_back_url.jpg",
      }),
    });
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      alert(res.message || "Failed to submit KYC");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6">
          <button 
            onClick={() => router.push("/dashboard")} 
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </button>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-500">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Verify Identity</h1>
                <p className="text-sm text-muted-foreground mt-1">Upload your documents for a verified badge.</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <ShieldCheck className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-foreground">Verification Submitted</h3>
                <p className="text-sm text-muted-foreground mt-2">Your documents are under review. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Type</label>
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none"
                  >
                    <option value="NID">National ID (NID)</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="STUDENT_ID">Student ID</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Document Number</label>
                  <Input 
                    required 
                    placeholder="E.g. 1234567890" 
                    value={docNumber} 
                    onChange={(e) => setDocNumber(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Upload Documents</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer">
                    <UploadCloud className="h-8 w-8 text-muted-foreground mb-3" />
                    <p className="text-sm font-medium text-foreground">Click to upload front & back images</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB)</p>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Verification"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
