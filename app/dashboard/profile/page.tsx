import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ProfileForm } from "@/components/dashboard/profile-form";

export const metadata: Metadata = {
  title: "Profile Settings",
  description: "Update your personal profile, bio, occupation, and contact details on BachNest.",
};

export default function ProfilePage() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <ProfileForm />
      </main>
      <Footer />
    </div>
  );
}
