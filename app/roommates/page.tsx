import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { RoommateExplorer } from "@/components/roommates/roommate-explorer";

export const metadata: Metadata = {
  title: "Find Compatible Roommates & Flatshares in Dhaka | BachNest",
  description:
    "Connect with verified bachelors, students, and young professionals in Dhaka. Smart lifestyle compatibility matching, verified NID trust scores, and zero broker syndicate.",
  openGraph: {
    title: "Find Bachelor Roommates in Dhaka | BachNest",
    description:
      "Find your ideal non-smoker, quiet, or tech-friendly bachelor roommate across Mirpur, Dhanmondi, Banani, Mohakhali, and Bashundhara.",
  },
};

export default function RoommatesPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <RoommateExplorer />
      </main>
      <Footer />
    </div>
  );
}
