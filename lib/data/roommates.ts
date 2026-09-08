import { RoommateProfile } from "@/lib/types";

export const INITIAL_ROOMMATES: RoommateProfile[] = [
  {
    id: "rm-1",
    user_id: "user-rm-1",
    full_name: "Tanvir Ahmed",
    gender: "MALE",
    occupation: "Software Engineer",
    occupation_category: "JOB_HOLDER",
    institution_or_company: "Brain Station 23",
    preferred_areas: ["Mirpur", "Mohakhali", "Agargaon"],
    budget_max: 8500,
    looking_for: "FLATSHARE",
    move_in_date: "2026-10-01",
    lifestyle_tags: ["Non-Smoker", "Clean & Organized", "Tech / IT Professional", "Quiet Study Hours"],
    bio: "Full stack developer looking for a calm, hygienic 2-3 bed flatshare. Prefer working from home in quiet surroundings. Non-smoker, friendly and respectful of personal space.",
    is_kyc_verified: true,
    trust_score: 95,
    phone_visible: true,
    phone: "+8801712345678",
    email: "tanvir.engr@gmail.com",
    created_at: "2026-09-01T10:00:00Z",
  },
  {
    id: "rm-2",
    user_id: "user-rm-2",
    full_name: "Afsana Haque",
    gender: "FEMALE",
    occupation: "Medical Intern",
    occupation_category: "STUDENT",
    institution_or_company: "Dhaka Medical College",
    preferred_areas: ["Dhanmondi", "Shahbagh", "Farmgate"],
    budget_max: 9000,
    looking_for: "ROOM_WANTED",
    move_in_date: "2026-09-15",
    lifestyle_tags: ["Non-Smoker", "Quiet Study Hours", "Clean & Organized", "Early Bird"],
    bio: "Final year medical intern looking for a secure female flatshare/sublet near DMC/Shahbagh. Need a quiet environment for studying and night shift preparation.",
    is_kyc_verified: true,
    trust_score: 98,
    phone_visible: true,
    phone: "+8801812345679",
    email: "afsana.med@gmail.com",
    created_at: "2026-09-03T12:30:00Z",
  },
  {
    id: "rm-3",
    user_id: "user-rm-3",
    full_name: "Rahim Chowdhury",
    gender: "MALE",
    occupation: "BBA Student",
    occupation_category: "STUDENT",
    institution_or_company: "BRAC University",
    preferred_areas: ["Mohakhali", "Badda", "Gulshan"],
    budget_max: 7000,
    looking_for: "HAVE_ROOM_NEED_ROOMMATE",
    move_in_date: "2026-09-20",
    lifestyle_tags: ["Non-Smoker", "Weekend Gamer", "Halal / Home Cooked Food"],
    bio: "I have a spacious master bed with attached bath in South Badda (near BRACU). Need a friendly, non-smoking student or job holder roommate to share the room rent.",
    is_kyc_verified: true,
    trust_score: 91,
    phone_visible: true,
    phone: "+8801912345670",
    email: "rahim.bracu@gmail.com",
    created_at: "2026-09-04T15:45:00Z",
  },
  {
    id: "rm-4",
    user_id: "user-rm-4",
    full_name: "Kazi Nabil",
    gender: "MALE",
    occupation: "Financial Analyst",
    occupation_category: "JOB_HOLDER",
    institution_or_company: "BRAC Bank PLC",
    preferred_areas: ["Banani", "Gulshan", "Tejgaon"],
    budget_max: 12000,
    looking_for: "FLATSHARE",
    move_in_date: "2026-10-01",
    lifestyle_tags: ["Non-Smoker", "Early Bird", "Clean & Organized"],
    bio: "Bank professional seeking a roommate to take a premium 2BHK flat in Banani/Gulshan-1. Clean lifestyle, morning exercise, and prompt on-time bill split guaranteed.",
    is_kyc_verified: true,
    trust_score: 96,
    phone_visible: false,
    email: "kazi.nabil@gmail.com",
    created_at: "2026-09-05T09:15:00Z",
  },
  {
    id: "rm-5",
    user_id: "user-rm-5",
    full_name: "Sadia Rahman",
    gender: "FEMALE",
    occupation: "Computer Science Student",
    occupation_category: "STUDENT",
    institution_or_company: "North South University",
    preferred_areas: ["Bashundhara R/A", "Kuril", "Baridhara"],
    budget_max: 8000,
    looking_for: "HAVE_ROOM_NEED_ROOMMATE",
    move_in_date: "2026-09-10",
    lifestyle_tags: ["Non-Smoker", "Night Owl", "Tech / IT Professional", "Quiet Study Hours"],
    bio: "We have 1 vacant single room in a clean 3-bed female apartment in Bashundhara Block D (24/7 security & lift). Looking for a responsible female student or tech worker.",
    is_kyc_verified: true,
    trust_score: 97,
    phone_visible: true,
    phone: "+8801612345671",
    email: "sadia.nsu@gmail.com",
    created_at: "2026-09-06T11:00:00Z",
  },
  {
    id: "rm-6",
    user_id: "user-rm-6",
    full_name: "Mahmudul Hasan",
    gender: "MALE",
    occupation: "Civil Engineer",
    occupation_category: "JOB_HOLDER",
    institution_or_company: "Walton Hi-Tech",
    preferred_areas: ["Uttara", "Airport", "Khilkhet"],
    budget_max: 6500,
    looking_for: "ROOM_WANTED",
    move_in_date: "2026-10-01",
    lifestyle_tags: ["Non-Smoker", "Early Bird", "Halal / Home Cooked Food"],
    bio: "Job holder working in Uttara Sector 3. Looking for an affordable single room or 2-sharing master bed in Uttara. Very quiet, spend weekends with family outside Dhaka.",
    is_kyc_verified: true,
    trust_score: 93,
    phone_visible: true,
    phone: "+8801512345672",
    email: "mahmudul.eng@gmail.com",
    created_at: "2026-09-07T14:20:00Z",
  },
];

const LOCAL_STORAGE_KEY = "bachnest_custom_roommates";

export function getStoredRoommates(): RoommateProfile[] {
  if (typeof window === "undefined") return INITIAL_ROOMMATES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) return INITIAL_ROOMMATES;
    const custom = JSON.parse(raw) as RoommateProfile[];
    return [...custom, ...INITIAL_ROOMMATES];
  } catch {
    return INITIAL_ROOMMATES;
  }
}

export function saveNewRoommateProfile(profile: RoommateProfile): void {
  if (typeof window === "undefined") return;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    const custom = raw ? (JSON.parse(raw) as RoommateProfile[]) : [];
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify([profile, ...custom]));
  } catch (err) {
    console.error("Failed to save roommate post to local storage", err);
  }
}

export function calculateCompatibilityScore(selectedTags: string[], profileTags: string[]): number {
  if (!selectedTags.length) return 85;
  const matchCount = profileTags.filter((tag) => selectedTags.includes(tag)).length;
  const ratio = matchCount / selectedTags.length;
  return Math.min(99, Math.round(70 + ratio * 28));
}
