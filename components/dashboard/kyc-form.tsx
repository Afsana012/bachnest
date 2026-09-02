"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ShieldCheck, ArrowLeft, UploadCloud, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi, uploadFile } from "@/lib/api";
import { KYCDocumentType, KYCOut, KycSubmission } from "@/lib/types";

const DOC_TYPES: Array<{ value: KYCDocumentType; label: string }> = [
  { value: "NID", label: "National ID (NID)" },
  { value: "PASSPORT", label: "Passport" },
  { value: "BIRTH_CERTIFICATE", label: "Birth Certificate" },
  { value: "STUDENT_ID", label: "Student ID" },
  { value: "EMPLOYEE_ID", label: "Employee ID" },
];

export function KycForm() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  const [existing, setExisting] = useState<KYCOut | null>(null);
  const [checking, setChecking] = useState(true);
  const [docType, setDocType] = useState<KYCDocumentType>("NID");
  const [docNumber, setDocNumber] = useState("");
  const [frontUrl, setFrontUrl] = useState("");
  const [backUrl, setBackUrl] = useState("");
  const [uploading, setUploading] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
      return;
    }

    if (!isAuthenticated) return;

    let active = true;

    async function loadExistingKyc() {
      const res = await fetchApi<KYCOut>("/kyc/me");
      if (!active) return;
      if (res.success && res.data) {
        setExisting(res.data);
        setDocType(res.data.document_type);
        setDocNumber(res.data.document_number);
      }
      setChecking(false);
    }

    loadExistingKyc();
    return () => {
      active = false;
    };
  }, [isAuthenticated, loading, router]);

  const handleUpload = async (file: File, target: "front" | "back") => {
    setUploading(target);
    const res = await uploadFile(file, "kyc");
    setUploading("");
    if (res.success && res.data) {
      if (target === "front") setFrontUrl(res.data.file_url);
      else setBackUrl(res.data.file_url);
    } else {
      alert(res.message || "Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!frontUrl) {
      alert("Upload the front side of your document first.");
      return;
    }
    setSubmitting(true);
    const payload: KycSubmission = {
      document_type: docType,
      document_number: docNumber,
      front_document_url: frontUrl,
      back_document_url: backUrl || undefined,
    };
    const res = existing
      ? await fetchApi<KYCOut>(`/kyc/${existing.id}/resubmit`, {
          method: "PATCH",
          body: JSON.stringify(payload),
        })
      : await fetchApi<KYCOut>("/kyc", {
          method: "POST",
          body: JSON.stringify(payload),
        });
    setSubmitting(false);
    if (res.success) {
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 2000);
    } else {
      alert(res.message || "Failed to submit KYC");
    }
  };

  if (loading || checking) return null;

  const isRejected = existing?.status === "REJECTED";
  const isLocked = existing?.status === "PENDING" || existing?.status === "APPROVED";

  return (
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
        ) : isLocked ? (
          <div className="py-8 text-center space-y-3">
            {existing?.status === "APPROVED" ? (
              <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto" />
            ) : (
              <UploadCloud className="h-12 w-12 text-muted-foreground/40 mx-auto animate-pulse" />
            )}
            <h3 className="text-lg font-semibold text-foreground">
              {existing?.status === "APPROVED" ? "Identity Verified" : "Under Review"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {existing?.status === "APPROVED"
                ? "Your identity is verified. You get the verified badge on your profile."
                : "Our team is reviewing your documents. This usually takes 1-2 business days."}
            </p>
            <StatusBadge status={existing?.status} />
          </div>
        ) : (
          <>
            {isRejected && (
              <div className="mb-6 p-4 rounded-xl border border-destructive/20 bg-destructive/5 flex items-start gap-3">
                <XCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-destructive">Your submission was rejected</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    {existing?.rejection_reason || "The documents were unclear."} Please upload corrected documents
                    and resubmit.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Document Type</label>
                <select
                  value={docType}
                  onChange={(e) => setDocType(e.target.value as KYCDocumentType)}
                  className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none"
                >
                  {DOC_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Front Side *</label>
                  <label
                    className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors ${
                      frontUrl ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "front")}
                    />
                    {uploading === "front" ? (
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    ) : frontUrl ? (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Front uploaded ✓</p>
                    ) : (
                      <>
                        <UploadCloud className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Click to upload</p>
                      </>
                    )}
                  </label>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Back Side (optional)</label>
                  <label
                    className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:bg-muted/30 transition-colors ${
                      backUrl ? "border-emerald-500/40 bg-emerald-500/5" : "border-border"
                    }`}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0], "back")}
                    />
                    {uploading === "back" ? (
                      <p className="text-xs text-muted-foreground">Uploading...</p>
                    ) : backUrl ? (
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Back uploaded ✓</p>
                    ) : (
                      <>
                        <UploadCloud className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                        <p className="text-xs text-muted-foreground">Click to upload</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Submitting..." : isRejected ? "Resubmit Verification" : "Submit Verification"}
              </Button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
