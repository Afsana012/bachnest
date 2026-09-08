"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Search,
  MapPin,
  DollarSign,
  Calendar,
  Briefcase,
  ShieldCheck,
  Plus,
  HeartHandshake,
  Phone,
  MessageCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Gender, RoommateLookingType, RoommateProfile } from "@/lib/types";
import { formatMoney, toNumber } from "@/lib/format";
import {
  calculateCompatibilityScore,
  getStoredRoommates,
} from "@/lib/data/roommates";
import { RoommateConnectModal } from "@/components/roommates/roommate-connect-modal";
import { PostRoommateModal } from "@/components/roommates/post-roommate-modal";

const DHAKA_AREAS = [
  "All Areas",
  "Mirpur",
  "Dhanmondi",
  "Mohakhali",
  "Banani",
  "Bashundhara",
  "Uttara",
  "Badda",
];

const POPULAR_HABIT_TAGS = [
  "Non-Smoker",
  "Quiet Study Hours",
  "Clean & Organized",
  "Tech / IT Professional",
  "Early Bird",
  "Night Owl",
  "Halal / Home Cooked Food",
];

export function RoommateExplorer() {
  const [roommates, setRoommates] = useState<RoommateProfile[]>(() => getStoredRoommates());
  const [search, setSearch] = useState("");
  const [selectedArea, setSelectedArea] = useState("All Areas");
  const [selectedLookingFor, setSelectedLookingFor] = useState<string>("ALL");
  const [selectedGender, setSelectedGender] = useState<string>("ALL");
  const [selectedHabitTags, setSelectedHabitTags] = useState<string[]>(["Non-Smoker"]);
  const [maxBudgetFilter, setMaxBudgetFilter] = useState<number>(15000);

  const [selectedRoommate, setSelectedRoommate] = useState<RoommateProfile | null>(null);
  const [showPostModal, setShowPostModal] = useState(false);

  const toggleHabitTag = (tag: string) => {
    if (selectedHabitTags.includes(tag)) {
      setSelectedHabitTags(selectedHabitTags.filter((t) => t !== tag));
    } else {
      setSelectedHabitTags([...selectedHabitTags, tag]);
    }
  };

  const filteredRoommates = useMemo(() => {
    return roommates.filter((rm) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = rm.full_name.toLowerCase().includes(q);
        const matchesOccupation = rm.occupation.toLowerCase().includes(q);
        const matchesInstitution = rm.institution_or_company.toLowerCase().includes(q);
        const matchesArea = rm.preferred_areas.some((a: string) => a.toLowerCase().includes(q));
        if (!matchesName && !matchesOccupation && !matchesInstitution && !matchesArea) {
          return false;
        }
      }

      if (selectedArea !== "All Areas") {
        const inArea = rm.preferred_areas.some((a: string) => a.toLowerCase().includes(selectedArea.toLowerCase()));
        if (!inArea) return false;
      }

      if (selectedLookingFor !== "ALL" && rm.looking_for !== (selectedLookingFor as RoommateLookingType)) {
        return false;
      }

      if (selectedGender !== "ALL" && rm.gender !== (selectedGender as Gender)) {
        return false;
      }

      if (toNumber(rm.budget_max) > maxBudgetFilter) {
        return false;
      }

      return true;
    });
  }, [roommates, search, selectedArea, selectedLookingFor, selectedGender, maxBudgetFilter]);

  const lookingForLabels: Record<RoommateLookingType, string> = {
    ROOM_WANTED: "Looking for Room",
    FLATSHARE: "Seeking Flatshare",
    HAVE_ROOM_NEED_ROOMMATE: "Has Vacant Room",
  };

  return (
    <div className="space-y-8">
      <div className="relative overflow-hidden rounded-3xl border border-border/80 bg-gradient-to-br from-primary/10 via-card to-background p-6 sm:p-10 shadow-lg">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-primary/15 text-primary border border-primary/20">
            <HeartHandshake className="h-3.5 w-3.5" />
            Verified Dhaka Bachelor Roommate Finder
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            Find Compatible & Verified Roommates in Dhaka
          </h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Connect directly with students, engineers, and young professionals. Zero brokers, NID verified profiles, and lifestyle compatibility scoring.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <Button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="rounded-2xl font-bold shadow-md"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Post Roommate Ad / Vacant Seat
          </Button>
          <div className="text-xs text-muted-foreground font-medium">
            Over <strong>150+ verified bachelors</strong> actively looking in Dhaka
          </div>
        </div>
      </div>

      <div className="p-5 rounded-2xl border border-border/80 bg-card shadow-xs space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by area, role, university, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 rounded-xl text-xs"
            />
          </div>

          <div>
            <select
              value={selectedLookingFor}
              onChange={(e) => setSelectedLookingFor(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs focus:outline-none"
            >
              <option value="ALL">All Accommodations</option>
              <option value="ROOM_WANTED">Looking for a Room</option>
              <option value="FLATSHARE">Looking to Flatshare</option>
              <option value="HAVE_ROOM_NEED_ROOMMATE">Have Vacant Room/Seat</option>
            </select>
          </div>

          <div>
            <select
              value={selectedGender}
              onChange={(e) => setSelectedGender(e.target.value)}
              className="w-full h-9 rounded-xl border border-input bg-transparent px-3 text-xs focus:outline-none"
            >
              <option value="ALL">All Genders</option>
              <option value="MALE">Male Bachelors</option>
              <option value="FEMALE">Female Bachelors</option>
            </select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Filter by Dhaka Neighborhood:
            </span>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span>Max Budget:</span>
              <select
                value={maxBudgetFilter}
                onChange={(e) => setMaxBudgetFilter(Number(e.target.value))}
                className="h-7 rounded-lg border border-input bg-transparent px-2 text-xs font-semibold focus:outline-none text-foreground"
              >
                <option value={7000}>Up to ৳7,000</option>
                <option value={9000}>Up to ৳9,000</option>
                <option value={12000}>Up to ৳12,000</option>
                <option value={20000}>Any Budget (৳20k+)</option>
              </select>
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {DHAKA_AREAS.map((area) => {
              const active = selectedArea === area;
              return (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                    active
                      ? "bg-primary text-primary-foreground shadow-2xs"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {area}
                </button>
              );
            })}
          </div>
        </div>

        <div className="pt-2 border-t border-border/60">
          <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block mb-2">
            My Preferred Lifestyle Habits (Click to Calculate Compatibility Match):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {POPULAR_HABIT_TAGS.map((tag) => {
              const active = selectedHabitTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleHabitTag(tag)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium border transition-all ${
                    active
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 font-bold"
                      : "bg-muted/30 border-border text-muted-foreground hover:bg-muted"
                  }`}
                >
                  {active ? `✓ ${tag}` : `+ ${tag}`}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Verified Roommates & Flatshares ({filteredRoommates.length})
          </h2>
        </div>

        {filteredRoommates.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredRoommates.map((rm) => {
              const score = calculateCompatibilityScore(selectedHabitTags, rm.lifestyle_tags);
              const cleanPhone = rm.phone?.replace(/[^0-9]/g, "");

              return (
                <div
                  key={rm.id}
                  className="rounded-3xl border border-border/80 bg-card text-card-foreground p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary font-black text-lg flex items-center justify-center border border-primary/20 shrink-0">
                          {rm.full_name.charAt(0)}
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-sm text-foreground">{rm.full_name}</h4>
                            {rm.is_kyc_verified && (
                              <span title="NID Verified"><ShieldCheck className="h-4 w-4 text-emerald-500" /></span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground truncate max-w-[170px]">
                            {rm.occupation}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          {score}% Match
                        </div>
                        <span className="block text-[10px] text-muted-foreground mt-0.5">
                          Trust: {rm.trust_score}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Briefcase className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">{rm.institution_or_company}</span>
                      <span>•</span>
                      <span className="capitalize">{rm.gender.toLowerCase()}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-muted/30 border border-border/60">
                      <span className="inline-flex items-center gap-1 font-semibold text-primary">
                        <DollarSign className="h-3.5 w-3.5" />
                        {formatMoney(rm.budget_max)}/mo
                      </span>
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {rm.move_in_date}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                        <MapPin className="h-3 w-3 text-primary" />
                        <span className="truncate">{rm.preferred_areas.join(", ")}</span>
                      </div>
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary">
                        {lookingForLabels[rm.looking_for]}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {rm.lifestyle_tags.slice(0, 3).map((tag: string) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-muted border border-border text-foreground"
                        >
                          {tag}
                        </span>
                      ))}
                      {rm.lifestyle_tags.length > 3 && (
                        <span className="px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          +{rm.lifestyle_tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground line-clamp-2">{rm.bio}</p>
                  </div>

                  <div className="pt-3 border-t border-border/70 flex items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="default"
                      size="sm"
                      onClick={() => setSelectedRoommate(rm)}
                      className="flex-1 rounded-xl font-semibold text-xs shadow-xs"
                    >
                      Connect & View Profile
                    </Button>

                    {rm.phone_visible && rm.phone && (
                      <div className="flex items-center gap-1">
                        <a
                          href={`tel:${rm.phone}`}
                          className="h-8 w-8 rounded-xl border border-border bg-muted/40 hover:bg-muted flex items-center justify-center text-foreground transition-colors"
                          title="Call"
                        >
                          <Phone className="h-3.5 w-3.5 text-emerald-500" />
                        </a>
                        {cleanPhone && (
                          <a
                            href={`https://wa.me/${cleanPhone}?text=Hi%20${encodeURIComponent(rm.full_name)},%20saw%20your%20roommate%20ad%20on%20BachNest.`}
                            target="_blank"
                            rel="noreferrer"
                            className="h-8 w-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 flex items-center justify-center text-white transition-colors"
                            title="WhatsApp"
                          >
                            <MessageCircle className="h-3.5 w-3.5" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-16 text-center rounded-3xl border border-dashed border-border bg-muted/20">
            <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
            <h3 className="font-bold text-base text-foreground">No matching roommates found</h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
              Try adjusting your area, budget, or lifestyle filters, or post your own roommate ad so others can find you!
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setSelectedArea("All Areas");
                setSelectedLookingFor("ALL");
                setSelectedGender("ALL");
              }}
              className="mt-4 rounded-xl text-xs"
            >
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {selectedRoommate && (
        <RoommateConnectModal
          roommate={selectedRoommate}
          isOpen={Boolean(selectedRoommate)}
          onClose={() => setSelectedRoommate(null)}
        />
      )}

      {showPostModal && (
        <PostRoommateModal
          isOpen={showPostModal}
          onClose={() => setShowPostModal(false)}
          onCreated={(newProfile) => {
            setRoommates((prev) => [newProfile, ...prev]);
          }}
        />
      )}
    </div>
  );
}
