import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { KycForm } from "@/components/dashboard/kyc-form";

export const metadata: Metadata = {
  title: "Identity Verification (KYC)",
  description: "Verify your identity with National ID, Passport, or Student ID on BachNest.",
};

export default function KYCPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <KycForm />
      </main>
      <Footer />
    </div>
  );
}
