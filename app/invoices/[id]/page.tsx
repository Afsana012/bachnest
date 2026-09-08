import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { InvoiceClientLoader } from "@/components/invoice/invoice-client-loader";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  return {
    title: `Invoice #${id.slice(0, 8).toUpperCase()} | BachNest Housing`,
    description: "Official residential rent statement and payment settlement voucher.",
  };
}

export default async function InvoicePage({ params }: PageProps) {
  const { id } = await params;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <div className="print:hidden">
        <Navbar />
      </div>
      <main className="flex-1">
        <InvoiceClientLoader invoiceId={id} />
      </main>
      <div className="print:hidden">
        <Footer />
      </div>
    </div>
  );
}
