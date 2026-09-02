import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { CreatePropertyForm } from "@/components/owner/create-property-form";

export const metadata: Metadata = {
  title: "List a New Property",
  description: "Post a new bachelor flat, sublet, or mess listing on BachNest.",
};

export default function PostPropertyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <CreatePropertyForm />
      </main>
      <Footer />
    </div>
  );
}
