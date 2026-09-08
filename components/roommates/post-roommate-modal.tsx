"use client";

import { useState } from "react";
import { X, UserPlus, Check, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gender, RoommateLookingType, RoommateOccupationCategory, RoommateProfile } from "@/lib/types";
import { saveNewRoommateProfile } from "@/lib/data/roommates";

interface PostRoommateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newProfile: RoommateProfile) => void;
}

const AVAILABLE_LIFESTYLE_TAGS = [
  "Non-Smoker",
  "Quiet Study Hours",
  "Clean & Organized",
  "Tech / IT Professional",
  "Night Owl",
  "Early Bird",
  "Halal / Home Cooked Food",
  "Pet Friendly",
  "Weekend Gamer",
  "Job Holder / Silent Room",
];

export function PostRoommateModal({ isOpen, onClose, onCreated }: PostRoommateModalProps) {
  const [fullName, setFullName] = useState("");
  const [gender, setGender] = useState<Gender>("MALE");
  const [occupationCategory, setOccupationCategory] = useState<RoommateOccupationCategory>("JOB_HOLDER");
  const [occupation, setOccupation] = useState("");
  const [institution, setInstitution] = useState("");
  const [areasInput, setAreasInput] = useState("");
  const [budget, setBudget] = useState("");
  const [lookingFor, setLookingFor] = useState<RoommateLookingType>("ROOM_WANTED");
  const [moveInDate, setMoveInDate] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>(["Non-Smoker", "Clean & Organized"]);
  const [bio, setBio] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneVisible, setPhoneVisible] = useState(true);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !occupation.trim() || !budget || !areasInput.trim()) {
      alert("Please fill in all mandatory fields.");
      return;
    }

    const preferredAreas = areasInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean);

    const newProfile: RoommateProfile = {
      id: `rm-${Date.now()}`,
      user_id: `user-${Date.now()}`,
      full_name: fullName.trim(),
      gender,
      occupation_category: occupationCategory,
      occupation: occupation.trim(),
      institution_or_company: institution.trim() || "Independent",
      preferred_areas: preferredAreas.length ? preferredAreas : ["Dhaka"],
      budget_max: Number(budget),
      looking_for: lookingFor,
      move_in_date: moveInDate || "Immediate",
      lifestyle_tags: selectedTags,
      bio: bio.trim() || "Looking for a clean, verified accommodation and respectful flatmates.",
      is_kyc_verified: true,
      trust_score: 92,
      phone_visible: phoneVisible,
      phone: phone.trim() || "+8801700000000",
      email: "bachelor@bachnest.com",
      created_at: new Date().toISOString(),
    };

    saveNewRoommateProfile(newProfile);
    onCreated(newProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[92vh] flex flex-col rounded-3xl border border-border bg-card shadow-2xl text-card-foreground overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-4 bg-muted/30">
          <div className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">Post Roommate / Flatshare Ad</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground hover:bg-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Full Name *</label>
              <Input
                placeholder="e.g. Tanvir Hasan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Gender *</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as Gender)}
                className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs focus:outline-none"
              >
                <option value="MALE">Male Bachelor</option>
                <option value="FEMALE">Female Bachelor</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Category</label>
              <select
                value={occupationCategory}
                onChange={(e) => setOccupationCategory(e.target.value as RoommateOccupationCategory)}
                className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs focus:outline-none"
              >
                <option value="JOB_HOLDER">Job Holder</option>
                <option value="STUDENT">Student</option>
                <option value="FREELANCER">Freelancer</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Designation / Role *</label>
              <Input
                placeholder="e.g. Software Dev / CSE"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Company / University</label>
              <Input
                placeholder="e.g. BRACU / Brain Station"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Looking For *</label>
              <select
                value={lookingFor}
                onChange={(e) => setLookingFor(e.target.value as RoommateLookingType)}
                className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs focus:outline-none"
              >
                <option value="ROOM_WANTED">Looking for a Room</option>
                <option value="FLATSHARE">Looking to Flatshare</option>
                <option value="HAVE_ROOM_NEED_ROOMMATE">Have Vacant Room/Seat</option>
              </select>
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Max Budget (BDT) *</label>
              <Input
                type="number"
                placeholder="e.g. 8000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                required
                className="rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Move-In Date</label>
              <Input
                type="date"
                value={moveInDate}
                onChange={(e) => setMoveInDate(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">
              Target Locations (comma-separated) *
            </label>
            <Input
              placeholder="e.g. Mirpur 2, Dhanmondi, Mohakhali"
              value={areasInput}
              onChange={(e) => setAreasInput(e.target.value)}
              required
              className="rounded-xl text-xs"
            />
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1.5">
              Select Lifestyle & Habit Tags (Helps Match Compatibility)
            </label>
            <div className="flex flex-wrap gap-1.5">
              {AVAILABLE_LIFESTYLE_TAGS.map((tag) => {
                const active = selectedTags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                      active
                        ? "bg-primary text-primary-foreground border-primary shadow-2xs"
                        : "bg-muted/40 border-border text-foreground hover:bg-muted"
                    }`}
                  >
                    {active && <Check className="h-3 w-3" />}
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="font-semibold text-muted-foreground block mb-1">About You & Expectations</label>
            <textarea
              rows={3}
              placeholder="Tell fellow bachelors about your daily routine, cleanliness standards, or flat details..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full rounded-xl border border-input bg-transparent p-3 text-xs focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="font-semibold text-muted-foreground block mb-1">Contact Phone / WhatsApp</label>
              <Input
                placeholder="+88017XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="rounded-xl text-xs"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="phone_vis"
                checked={phoneVisible}
                onChange={(e) => setPhoneVisible(e.target.checked)}
                className="rounded border-input text-primary focus:ring-primary h-4 w-4"
              />
              <label htmlFor="phone_vis" className="text-xs text-muted-foreground cursor-pointer">
                Show phone directly on profile
              </label>
            </div>
          </div>

          <div className="border-t border-border/80 pt-4 flex items-center justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl text-xs">
              Cancel
            </Button>
            <Button type="submit" className="rounded-xl text-xs font-bold shadow-xs">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" />
              Publish Roommate Ad
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
