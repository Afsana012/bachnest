"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, Save } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth, refreshUser } from "@/hooks/use-auth";
import { fetchApi, uploadFile } from "@/lib/api";
import { User } from "@/lib/types";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();

  const [fullName, setFullName] = useState("");
  const [bio, setBio] = useState("");
  const [occupation, setOccupation] = useState("");
  const [institution, setInstitution] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>();
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [syncedFor, setSyncedFor] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/auth/login");
    }
  }, [isAuthenticated, loading, router]);

  if (user && syncedFor !== user.id) {
    setSyncedFor(user.id);
    setFullName(user.full_name || "");
    setBio(user.bio || "");
    setOccupation(user.occupation || "");
    setInstitution(user.institution_or_company || "");
    setAvatarUrl(user.avatar_url);
  }

  const handleAvatarUpload = async (file: File) => {
    const res = await uploadFile(file, "avatar");
    if (res.success && res.data) {
      setAvatarUrl(res.data.file_url);
    } else {
      alert(res.message || "Upload failed");
    }
  };

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSavedMessage("");
    const res = await fetchApi<User>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        full_name: fullName,
        bio: bio || undefined,
        occupation: occupation || undefined,
        institution_or_company: institution || undefined,
        avatar_url: avatarUrl || undefined,
      }),
    });
    setSaving(false);
    if (res.success) {
      await refreshUser();
      setSavedMessage("Profile updated.");
      setTimeout(() => setSavedMessage(""), 3000);
    } else {
      alert(res.message || "Failed to save profile");
    }
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl px-4 sm:px-6">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">Profile Settings</h1>
          <p className="text-sm text-muted-foreground mb-8">
            A complete profile builds trust with landlords and future roommates.
          </p>

          <form onSubmit={saveProfile} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-5">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center text-muted-foreground overflow-hidden shrink-0">
                {avatarUrl ? (
                  <img src={avatarUrl} alt={user.full_name} className="h-full w-full object-cover" />
                ) : (
                  <UserCircle className="h-9 w-9" />
                )}
              </div>
              <div>
                <label className="text-sm font-medium block mb-1.5">Profile Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleAvatarUpload(e.target.files[0])}
                  className="text-sm text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-muted/70 cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Full Name</label>
              <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1.5" required />
            </div>

            <div>
              <label className="text-sm font-medium">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                placeholder="A short intro — e.g. final year student at DU, early bird, love cooking..."
                className="w-full mt-1.5 rounded-md border border-input bg-transparent px-3 py-2 text-sm focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Occupation</label>
                <Input
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  placeholder="Student / Engineer / ..."
                  className="mt-1.5"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Institution / Company</label>
                <Input
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="Dhaka University / Brain Station 23..."
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={saving}>
                <Save className="h-4 w-4 mr-1.5" />
                {saving ? "Saving..." : "Save Changes"}
              </Button>
              {savedMessage && <span className="text-sm text-emerald-600 dark:text-emerald-400">{savedMessage}</span>}
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}
