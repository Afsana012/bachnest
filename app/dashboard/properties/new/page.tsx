"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Plus, X } from "lucide-react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi, uploadFile } from "@/lib/api";
import { Property } from "@/lib/types";

export default function PostPropertyPage() {
  const router = useRouter();
  const { isAuthenticated, user, loading } = useAuth();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [propertyType, setPropertyType] = useState("FLAT");
  const [addressLine, setAddressLine] = useState("");
  const [area, setArea] = useState("");
  const [rent, setRent] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  if (loading) return null;
  if (!isAuthenticated || user?.role !== "OWNER") {
    return (
      <div className="min-h-screen flex flex-col bg-background text-foreground">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <p>You must be logged in as a Property Owner to post a To-Let.</p>
        </div>
        <Footer />
      </div>
    );
  }

  const handleFiles = (selected: FileList | null) => {
    if (!selected) return;
    const next = [...files, ...Array.from(selected)].slice(0, 8);
    setFiles(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
  };

  const removeImage = (index: number) => {
    const next = files.filter((_, i) => i !== index);
    setFiles(next);
    setPreviews(next.map((file) => URL.createObjectURL(file)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    const res = await fetchApi<Property>("/properties", {
      method: "POST",
      body: JSON.stringify({
        title,
        description,
        property_type: propertyType,
        address_line: addressLine,
        area_neighborhood: area,
        city: "Dhaka",
        latitude: 23.8103,
        longitude: 90.4125,
        has_lift: false,
        has_generator: false,
        has_cctv: false,
        has_wifi: true,
      }),
    });

    if (!res.success || !res.data) {
      setSubmitting(false);
      setError(res.message || "Failed to create property");
      return;
    }

    const propertyId = res.data.id;

    if (rent) {
      await fetchApi(`/properties/${propertyId}/rooms`, {
        method: "POST",
        body: JSON.stringify({
          room_number_or_name: "Room 1",
          room_type: "MASTER",
          monthly_rent: Number(rent),
          security_deposit: Number(rent),
          has_attached_bathroom: true,
          total_capacity: 2,
        }),
      });
    }

    if (files.length) {
      const urls: string[] = [];
      for (const file of files) {
        const upload = await uploadFile(file, "properties");
        if (upload.success && upload.data) {
          urls.push(upload.data.file_url);
        }
      }
      if (urls.length) {
        await fetchApi(`/properties/${propertyId}/media`, {
          method: "POST",
          body: JSON.stringify(
            urls.map((url, index) => ({
              media_url: url,
              media_type: "IMAGE",
              is_cover: index === 0,
              display_order: index,
            }))
          ),
        });
      }
    }

    await fetchApi(`/properties/${propertyId}/publish?is_published=true`, { method: "PATCH" });

    setSubmitting(false);
    setSuccess(true);
    setTimeout(() => router.push("/properties"), 1500);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Navbar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-2xl px-4 sm:px-6">
          <button
            onClick={() => router.push("/dashboard")}
            className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Dashboard
          </button>

          <div className="rounded-2xl border border-border bg-card p-8 shadow-sm">
            <div className="flex items-center gap-4 border-b border-border pb-6 mb-6">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Home className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">Post a New To-Let</h1>
                <p className="text-sm text-muted-foreground mt-1">Add your property details to start getting tenants.</p>
              </div>
            </div>

            {success ? (
              <div className="py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500 mx-auto mb-4">
                  <Plus className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Property Posted!</h3>
                <p className="text-sm text-muted-foreground mt-2">Your listing is now live. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Title</label>
                  <Input
                    required
                    placeholder="E.g. Modern Bachelor Flat in Dhanmondi"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Type</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full h-11 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none"
                  >
                    <option value="FLAT">Flat</option>
                    <option value="SUBLET">Sublet</option>
                    <option value="MESS">Mess</option>
                    <option value="HOSTEL">Hostel</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Area / Neighborhood</label>
                    <Input
                      required
                      placeholder="E.g. Dhanmondi"
                      value={area}
                      onChange={(e) => setArea(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Address</label>
                    <Input
                      required
                      placeholder="E.g. House 12, Road 5"
                      value={addressLine}
                      onChange={(e) => setAddressLine(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Monthly Rent (৳)</label>
                  <Input
                    required
                    type="number"
                    min={0}
                    placeholder="E.g. 15000"
                    value={rent}
                    onChange={(e) => setRent(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <textarea
                    required
                    placeholder="Describe the facilities, rules, and environment..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full min-h-[120px] rounded-lg border border-input bg-transparent px-3 py-2 text-sm focus:outline-none resize-y"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Property Images</label>
                  <div className="border-2 border-dashed border-border rounded-xl p-8 text-center flex flex-col items-center justify-center hover:bg-muted/30 transition-colors cursor-pointer">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
                      <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="text-sm font-medium text-foreground">Click to upload property images</p>
                    <p className="text-xs text-muted-foreground mt-1">JPG, PNG (Max 5MB per image)</p>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      id="image-upload"
                      onChange={(e) => {
                        handleFiles(e.target.files);
                        e.target.value = "";
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => document.getElementById("image-upload")?.click()}
                    >
                      Select Files
                    </Button>
                  </div>
                  {previews.length > 0 && (
                    <div className="grid grid-cols-4 gap-2">
                      {previews.map((src, index) => (
                        <div key={src} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                          <img src={src} alt={`Upload ${index + 1}`} className="h-full w-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/60 text-white flex items-center justify-center"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting ? "Posting..." : "Post Property"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
