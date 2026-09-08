"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Printer,
  X,
  Loader2,
  Building2,
  UserCheck,
  AlertCircle,
  PenTool,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DigitalAgreement, Tenancy } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { formatDate, formatMoney } from "@/lib/format";

interface DigitalAgreementModalProps {
  tenancyId: string;
  isOpen: boolean;
  onClose: () => void;
  onSigned: () => void;
}

export function DigitalAgreementModal({
  tenancyId,
  isOpen,
  onClose,
  onSigned,
}: DigitalAgreementModalProps) {
  const [agreement, setAgreement] = useState<DigitalAgreement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [signatureName, setSignatureName] = useState("");
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signError, setSignError] = useState("");

  const loadAgreement = useCallback(async () => {
    setLoading(true);
    setError("");
    const res = await fetchApi<DigitalAgreement>(`/tenancies/${tenancyId}/agreement`);
    if (res.success && res.data) {
      setAgreement(res.data);
      if (!signatureName && res.data.tenant_name) {
        setSignatureName(res.data.tenant_name);
      }
    } else {
      setError(res.message || "Failed to load digital tenancy contract.");
    }
    setLoading(false);
  }, [tenancyId, signatureName]);

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(loadAgreement, 0);
      return () => clearTimeout(t);
    }
  }, [isOpen, loadAgreement]);

  if (!isOpen) return null;

  const handleSign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      setSignError("Please check the box confirming you agree to all contract terms.");
      return;
    }
    if (!signatureName.trim()) {
      setSignError("Please type your full legal name as your electronic signature.");
      return;
    }

    setSigning(true);
    setSignError("");

    const res = await fetchApi<Tenancy>(`/tenancies/${tenancyId}/sign`, {
      method: "POST",
      body: JSON.stringify({
        signature_name: signatureName.trim(),
        agreed_terms: true,
      }),
    });

    setSigning(false);

    if (res.success) {
      await loadAgreement();
      onSigned();
    } else {
      setSignError(res.message || "Failed to execute digital signature.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Digital Tenancy Agreement</h3>
              <p className="text-xs text-muted-foreground font-mono">Reference #{tenancyId.slice(0, 8)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrint}
              disabled={loading || !agreement}
              className="rounded-xl"
            >
              <Printer className="h-4 w-4 mr-1.5" />
              Print / Save PDF
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-foreground print:p-0 print:overflow-visible">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Compiling agreement clauses...</p>
            </div>
          ) : error || !agreement ? (
            <div className="flex flex-col items-center justify-center py-16 text-center space-y-3">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <h4 className="font-bold text-base">Contract Unavailable</h4>
              <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
            </div>
          ) : (
            <div className="space-y-6 text-sm leading-relaxed">
              <div className="text-center pb-4 border-b border-border/70 space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary mb-2">
                  <ShieldCheck className="h-3.5 w-3.5" />
                  BachNest Certified Digital Tenancy Contract
                </div>
                <h2 className="text-xl font-black uppercase tracking-tight text-foreground">
                  Residential Tenancy Agreement
                </h2>
                <p className="text-xs text-muted-foreground">
                  Executed under the Premises Rent Control Framework of Dhaka, Bangladesh
                </p>
                <div className="pt-2">
                  {agreement.agreement_status === "SIGNED" ? (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Legally Executed & Signed
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                      <PenTool className="h-3.5 w-3.5" />
                      Pending Tenant E-Signature
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-muted/30 border border-border/60">
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    First Party (Landlord / Lessor)
                  </span>
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <Building2 className="h-4 w-4 text-primary" /> {agreement.owner_name}
                  </p>
                  <p className="text-xs text-muted-foreground">Contact: {agreement.owner_phone}</p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Second Party (Tenant / Lessee)
                  </span>
                  <p className="font-bold text-foreground text-sm flex items-center gap-1.5">
                    <UserCheck className="h-4 w-4 text-primary" /> {agreement.tenant_name}
                  </p>
                  <p className="text-xs text-muted-foreground">Contact: {agreement.tenant_phone}</p>
                  {agreement.tenant_nid_or_id && (
                    <p className="text-xs font-mono text-muted-foreground">
                      NID / Identity: {agreement.tenant_nid_or_id}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-2">
                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">1. Premises & Scope of Tenancy</h4>
                  <p className="text-xs text-muted-foreground">
                    The First Party agrees to let out, and the Second Party agrees to lease the unit identified as{" "}
                    <strong className="text-foreground">{agreement.room_number_or_name}</strong> inside the premises of{" "}
                    <strong className="text-foreground">{agreement.property_title}</strong> located at{" "}
                    <strong className="text-foreground">
                      {agreement.property_address}, {agreement.area_neighborhood}, {agreement.city}
                    </strong>.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">2. Rent, Security Deposit & Billing Schedule</h4>
                  <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                    <li>
                      <strong>Agreed Monthly Rent:</strong> {formatMoney(agreement.agreed_monthly_rent)} (BDT) payable
                      within the 1st to 5th day of every calendar month.
                    </li>
                    <li>
                      <strong>Security Deposit:</strong> {formatMoney(agreement.agreed_security_deposit)} (BDT) held as
                      token guarantee, fully refundable at the end of the tenancy after adjusting pending dues.
                    </li>
                    <li>
                      <strong>Lease Commencement Date:</strong> {formatDate(agreement.lease_start_date)}.
                    </li>
                  </ul>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">3. Notice Period & Move-Out Conditions</h4>
                  <p className="text-xs text-muted-foreground">
                    Either party wishing to terminate this tenancy must serve a mandatory{" "}
                    <strong className="text-foreground">{agreement.notice_period_days}-day formal notice</strong> via
                    the BachNest portal. Failure to serve due notice may forfeit the equivalent security deposit.
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h4 className="font-bold text-sm text-foreground">4. House Policy & Conduct</h4>
                  <ul className="text-xs text-muted-foreground list-disc pl-5 space-y-1">
                    <li>
                      <strong>Main Gate Hours:</strong> Curfew / gate closing is strictly at{" "}
                      <strong className="text-foreground">{agreement.gate_closing_time || "11:00 PM"}</strong>.
                    </li>
                    <li>
                      <strong>Visitor Policy:</strong>{" "}
                      {agreement.visitor_policy || "Permitted during daytime with prior notice to owner."}
                    </li>
                    <li>
                      The tenant undertakes to comply with local law enforcement guidelines, submit tenant verification
                      forms, and maintain peace and hygiene.
                    </li>
                  </ul>
                </div>
              </div>

              <div className="pt-4 border-t border-border/80">
                {agreement.agreement_status === "SIGNED" ? (
                  <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                      <ShieldCheck className="h-5 w-5" />
                      Digital Signature Verified
                    </div>
                    <p className="text-xs font-mono text-muted-foreground">
                      Certificate: {agreement.signature_name || `E-SIGNED BY ${agreement.tenant_name.toUpperCase()}`}
                    </p>
                    {agreement.signed_at && (
                      <p className="text-xs text-muted-foreground">
                        Timestamp: {new Date(agreement.signed_at).toUTCString()}
                      </p>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleSign} className="space-y-4 print:hidden">
                    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-5 space-y-3">
                      <h4 className="font-bold text-sm text-primary flex items-center gap-2">
                        <PenTool className="h-4 w-4" /> Execute Electronic Signature
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        Type your full legal name below to execute this tenancy contract electronically.
                      </p>

                      {signError && (
                        <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-2.5 text-xs text-destructive">
                          {signError}
                        </div>
                      )}

                      <div>
                        <label className="text-xs font-semibold text-muted-foreground block mb-1">
                          Full Legal Name
                        </label>
                        <Input
                          type="text"
                          value={signatureName}
                          onChange={(e) => setSignatureName(e.target.value)}
                          placeholder="e.g. Md. Tanvir Hasan"
                          required
                        />
                      </div>

                      <label className="flex items-start gap-2 text-xs text-muted-foreground cursor-pointer pt-1">
                        <input
                          type="checkbox"
                          checked={agreedTerms}
                          onChange={(e) => setAgreedTerms(e.target.checked)}
                          className="mt-0.5 rounded border-border"
                        />
                        <span>
                          I acknowledge that I have carefully read, understood, and agreed to all 4 clauses of this
                          Tenancy Agreement and submit my digital signature under the Information & Communication
                          Technology laws of Bangladesh.
                        </span>
                      </label>

                      <Button type="submit" disabled={signing} className="w-full rounded-xl font-bold mt-2 shadow-xs">
                        {signing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Confirm & E-Sign Agreement
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
