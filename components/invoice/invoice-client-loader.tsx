"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Invoice } from "@/lib/types";
import { fetchApi } from "@/lib/api";
import { InvoiceDocumentView } from "@/components/invoice/invoice-document-view";

export function InvoiceClientLoader({ invoiceId }: { invoiceId: string }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    async function loadInvoice() {
      setIsLoading(true);
      setError(null);
      const res = await fetchApi<Invoice>(`/invoices/${invoiceId}`);
      if (!isMounted) return;

      if (res.success && res.data) {
        setInvoice(res.data);
      } else {
        setError(res.message || "Failed to load invoice details.");
      }
      setIsLoading(false);
    }

    loadInvoice();
    return () => {
      isMounted = false;
    };
  }, [invoiceId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-muted-foreground">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm font-medium">Loading official invoice voucher...</p>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl border border-border bg-card text-card-foreground shadow-sm text-center">
        <FileText className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-lg font-bold">Invoice Not Found</h3>
        <p className="text-sm text-muted-foreground mt-1 mb-6">
          {error || "The requested invoice could not be located or you may need to sign in."}
        </p>
        <Link href="/dashboard">
          <Button variant="outline" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    );
  }

  return <InvoiceDocumentView invoice={invoice} />;
}
