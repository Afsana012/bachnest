"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft, Plus, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/use-auth";
import { fetchApi, uploadFile } from "@/lib/api";
import { Property } from "@/lib/types";

export function CreatePropertyForm() {
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
      <div className="py-20 text-center">
        <p className="text-muted-foreground">You must be logged in as a Property Owner to post a listing.</p>
        <Button onClick={() => router.push("/dashboard")} className="mt-4 rounded-xl">
          Go to Dashboard
        </Button>
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
    <div className="container mx-auto max-w-2xl px-4 sm:px-6">
      <button
        onClick={() => router.push("/dashboard/owner")}
        className="flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Owner Hub
      </button>

      <div className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6 pb-6 border-b border-border">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <Home className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold">List a New Property</h1>
            <p className="text-sm text-muted-foreground">Fill in the basic property details to attract bachelors.</p>
          </div>
        </div>

        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-xs text-destructive mb-6">
            {error}
          </div>
        )}

        {success ? (
          <div className="py-12 text-center space-y-3">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
              <Plus className="h-6 w-6" />
            </div>
            <h2 className="text-lg font-bold">Property Published Successfully!</h2>
            <p className="text-sm text-muted-foreground">Redirecting to properties feed...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Property Title</label>
              <Input
                required
                placeholder="E.g. Modern Bachelor Flat near DU"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Property Type</label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-transparent px-3 text-sm focus:outline-none"
              >
                <option value="FLAT">Flat</option>
                <option value="SUBLET">Sublet</option>
                <option value="MESS">Mess</option>
                <option value="HOSTEL">Hostel</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Area / Neighborhood</label>
                <Input
                  required
                  placeholder="E.g. Dhanmondi, Mirpur"
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
                <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3 text-muted-foreground">
                  <ImagePlus className="h-5 w-5" />
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
                  className="mt-4 rounded-xl"
                  onClick={() => document.getElementById("image-upload")?.click()}
                >
                  Browse Files
                </Button>
              </div>

              {previews.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mt-3">
                  {previews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-border group">
                      <img src={src} alt="preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(i)}
                        className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" disabled={submitting} className="w-full h-11 rounded-xl font-semibold">
              {submitting ? "Publishing Property..." : "Publish Property"}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
