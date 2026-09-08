"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, Download, Printer, X, Edit3, Loader2, AlertCircle } from "lucide-react";
import { DMPFormData } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { downloadDmpPolicePdf } from "@/lib/dmp-police-pdf";
import { formatDate, formatMoney } from "@/lib/format";

interface DMPVerificationModalProps {
  tenancyId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function DMPVerificationModal({
  tenancyId,
  isOpen,
  onClose,
}: DMPVerificationModalProps) {
  const [data, setData] = useState<DMPFormData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [maritalStatus, setMaritalStatus] = useState("Single / Bachelor");
  const [emergencyName, setEmergencyName] = useState("");
  const [emergencyPhone, setEmergencyPhone] = useState("");
  const [emergencyRelation, setEmergencyRelation] = useState("Parent / Guardian");

  useEffect(() => {
    if (!isOpen) return;

    async function loadData() {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchApi<DMPFormData>(`/tenancies/${tenancyId}/dmp-form`);
        if (res.success && res.data) {
          setData(res.data);
          setFatherName(res.data.tenant.father_name || "");
          setMotherName(res.data.tenant.mother_name || "");
          setPermanentAddress(res.data.tenant.permanent_address || "");
          setMaritalStatus(res.data.tenant.marital_status || "Single / Bachelor");
          setEmergencyName(res.data.tenant.emergency_contact_name || "");
          setEmergencyPhone(res.data.tenant.emergency_contact_phone || "");
          setEmergencyRelation(res.data.tenant.emergency_contact_relation || "Parent / Guardian");
        } else {
          setError(res.message || "Failed to load DMP form data.");
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to load DMP form data.";
        setError(msg);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [tenancyId, isOpen]);

  if (!isOpen) return null;

  function getCurrentFormData(): DMPFormData | null {
    if (!data) return null;
    return {
      ...data,
      tenant: {
        ...data.tenant,
        father_name: fatherName || data.tenant.father_name,
        mother_name: motherName || data.tenant.mother_name,
        permanent_address: permanentAddress || data.tenant.permanent_address,
        marital_status: maritalStatus,
        emergency_contact_name: emergencyName || data.tenant.emergency_contact_name,
        emergency_contact_phone: emergencyPhone || data.tenant.emergency_contact_phone,
        emergency_contact_relation: emergencyRelation || data.tenant.emergency_contact_relation,
      },
    };
  }

  function handleDownload() {
    const current = getCurrentFormData();
    if (current) {
      downloadDmpPolicePdf(current);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-card border border-border shadow-2xl p-6 md:p-8 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          aria-label="Close dialog"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Official Header */}
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-sm shrink-0">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Dhaka Metropolitan Police (DMP) · CIMS Compliance
              </span>
              <h2 className="text-xl font-black tracking-tight text-foreground">
                Tenant Verification Form (ভাড়াটিয়া নিবন্ধন ফরম)
              </h2>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
            Standard official verification document for bachelor and residential tenants submitting particulars to their local Dhaka Police Station (থানা).
          </p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isLoading ? (
          <div className="py-16 text-center text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
            <p className="text-xs">Generating official DMP verification profile...</p>
          </div>
        ) : data ? (
          <div className="space-y-6">
            {/* Action Bar */}
            <div className="flex items-center justify-between border-b border-border pb-3">
              <span className="text-xs font-semibold text-muted-foreground">
                Tracking Ref: <span className="font-mono text-foreground font-bold">#DMP-BN-{data.tenancy_id.slice(0, 8).toUpperCase()}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
              >
                <Edit3 className="h-3.5 w-3.5" />
                {isEditing ? "Done Editing" : "Edit / Add Details"}
              </button>
            </div>

            {/* Editable Form Preview */}
            <div className="space-y-4 text-xs">
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Part I: Tenant Citizen Particulars
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Full Name:</span>
                    <span className="font-semibold text-foreground text-sm">{data.tenant.full_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">National ID / Passport:</span>
                    <span className="font-mono font-semibold text-foreground">
                      {data.tenant.nid_number || "Verified via KYC"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Father&apos;s Name:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="Father's full name"
                        value={fatherName}
                        onChange={(e) => setFatherName(e.target.value)}
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs mt-0.5"
                      />
                    ) : (
                      <span className="font-medium text-foreground">{fatherName || "Recorded in NID records"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Mother&apos;s Name:</span>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="Mother's full name"
                        value={motherName}
                        onChange={(e) => setMotherName(e.target.value)}
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs mt-0.5"
                      />
                    ) : (
                      <span className="font-medium text-foreground">{motherName || "Recorded in NID records"}</span>
                    )}
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Permanent Address (গ্রাম/মহল্লা, ডাকঘর, থানা, জেলা):</span>
                    {isEditing ? (
                      <input
                        type="text"
                        placeholder="e.g. Vill: Shampur, PO: Mirzapur, PS: Tangail Sadar, Dist: Tangail"
                        value={permanentAddress}
                        onChange={(e) => setPermanentAddress(e.target.value)}
                        className="w-full rounded border border-border bg-background px-2 py-1 text-xs mt-0.5"
                      />
                    ) : (
                      <span className="font-medium text-foreground">{permanentAddress || "As stated in NID database"}</span>
                    )}
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Profession & Company / University:</span>
                    <span className="font-medium text-foreground">
                      {data.tenant.occupation} ({data.tenant.institution_or_company || "Dhaka"})
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Emergency Contact:</span>
                    {isEditing ? (
                      <div className="flex gap-1.5 mt-0.5">
                        <input
                          type="text"
                          placeholder="Name"
                          value={emergencyName}
                          onChange={(e) => setEmergencyName(e.target.value)}
                          className="flex-1 rounded border border-border bg-background px-2 py-1 text-xs"
                        />
                        <input
                          type="text"
                          placeholder="Phone"
                          value={emergencyPhone}
                          onChange={(e) => setEmergencyPhone(e.target.value)}
                          className="w-28 rounded border border-border bg-background px-2 py-1 text-xs"
                        />
                      </div>
                    ) : (
                      <span className="font-medium text-foreground">
                        {emergencyName ? `${emergencyName} (${emergencyRelation}): ${emergencyPhone}` : "Guardian contact recorded"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Premises Particulars */}
              <div className="rounded-xl border border-border bg-muted/20 p-4 space-y-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                  Part II: Rented Premises & Landlord
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground block text-[11px]">Premises Address:</span>
                    <span className="font-semibold text-foreground">
                      {data.property.title}, {data.property.address_line}, {data.property.area_neighborhood}, {data.property.city}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Flat & Room:</span>
                    <span className="font-medium text-foreground">
                      Flat: {data.property.flat_number || "Standard Flat"} | Room: {data.room?.room_number_or_name || "Assigned"}
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Lease Start & Monthly Rent:</span>
                    <span className="font-medium text-foreground">
                      Started: {formatDate(data.lease_start_date)} • {formatMoney(data.monthly_rent)}/mo
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Landlord Name:</span>
                    <span className="font-semibold text-foreground">{data.owner.full_name}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[11px]">Landlord Mobile:</span>
                    <span className="font-mono text-foreground">{data.owner.phone}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-end gap-3 pt-4 border-t border-border">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
              >
                <Printer className="h-3.5 w-3.5" />
                Print Form
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-5 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
              >
                <Download className="h-3.5 w-3.5" />
                Download Official DMP Form (PDF)
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
