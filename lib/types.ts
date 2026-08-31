export type UserRole = "bachelor" | "property_owner" | "admin" | "super_admin";
export type KYCStatus = "unverified" | "pending" | "verified" | "rejected";
export type PropertyType = "apartment" | "hostel" | "sublet" | "mess";
export type GenderPreference = "male_only" | "female_only" | "any";
export type RoomType = "single" | "shared" | "master";
export type BookingStatus = "pending_owner" | "approved" | "rejected" | "agreement_signed" | "cancelled" | "completed";
export type TenancyStatus = "active" | "notice_served" | "terminated" | "expired";
export type InvoiceStatus = "unpaid" | "partially_paid" | "paid" | "overdue" | "cancelled";
export type ComplaintCategory = "plumbing" | "electrical" | "wifi" | "noise" | "cleaning" | "security" | "other";
export type ComplaintStatus = "submitted" | "acknowledged" | "in_progress" | "resolved" | "reopened" | "escalated";
export type ComplaintSeverity = "low" | "medium" | "high" | "urgent";
export type AlertSeverity = "low" | "medium" | "high" | "critical";

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedResponse<T = any> {
  success: boolean;
  message?: string;
  items: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    total_pages: number;
  };
}

export interface User {
  id: string;
  email: string;
  phone: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  avatar_url?: string;
  created_at: string;
}

export interface UserKYC {
  id: string;
  user_id: string;
  nid_number?: string;
  passport_number?: string;
  student_or_job_id?: string;
  institution_name?: string;
  status: KYCStatus;
  rejection_reason?: string;
  submitted_at?: string;
  verified_at?: string;
}

export interface PropertyMedia {
  id: string;
  media_url: string;
  media_type: "image" | "video" | "document";
  is_primary: boolean;
  caption?: string;
}

export interface RoomSeat {
  id: string;
  room_id: string;
  seat_label: string;
  seat_rent: number;
  is_available: boolean;
  is_occupied: boolean;
}

export interface Room {
  id: string;
  property_id: string;
  room_label: string;
  room_type: RoomType;
  base_rent: number;
  attached_bath: boolean;
  balcony: boolean;
  max_occupancy: number;
  current_occupancy: number;
  is_available: boolean;
  seats?: RoomSeat[];
}

export interface Property {
  id: string;
  owner_id: string;
  title: string;
  description: string;
  property_type: PropertyType;
  address_line: string;
  area: string;
  city: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  total_bedrooms: number;
  total_bathrooms: number;
  gender_preference: GenderPreference;
  base_rent: number;
  advance_deposit_months: number;
  service_charge: number;
  gas_bill_included: boolean;
  water_bill_included: boolean;
  electricity_billing_type: "prepaid" | "postpaid" | "split";
  wifi_included: boolean;
  lift_available: boolean;
  generator_backup: boolean;
  cctv_security: boolean;
  meal_system_available: boolean;
  is_verified: boolean;
  is_active: boolean;
  created_at: string;
  media?: PropertyMedia[];
  rooms?: Room[];
}

export interface Booking {
  id: string;
  tenant_id: string;
  property_id: string;
  room_id?: string;
  seat_id?: string;
  status: BookingStatus;
  move_in_date: string;
  monthly_rent: number;
  advance_deposit: number;
  service_fee: number;
  total_initial_payable: number;
  special_requests?: string;
  created_at: string;
  property?: Property;
  room?: Room;
}

export interface Tenancy {
  id: string;
  booking_id: string;
  tenant_id: string;
  property_id: string;
  room_id?: string;
  seat_id?: string;
  start_date: string;
  end_date?: string;
  monthly_rent: number;
  advance_deposit_held: number;
  status: TenancyStatus;
  notice_served_at?: string;
  notice_effective_date?: string;
  property?: Property;
}

export interface Invoice {
  id: string;
  tenancy_id: string;
  invoice_number: string;
  billing_month: number;
  billing_year: number;
  rent_amount: number;
  service_charge: number;
  utility_bill: number;
  penalty_fee: number;
  total_amount: number;
  amount_paid: number;
  status: InvoiceStatus;
  due_date: string;
  paid_at?: string;
}

export interface Complaint {
  id: string;
  tenancy_id: string;
  tenant_id: string;
  property_id: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  severity: ComplaintSeverity;
  status: ComplaintStatus;
  sla_deadline: string;
  resolved_at?: string;
  created_at: string;
}

export interface Notice {
  id: string;
  property_id: string;
  title: string;
  content: string;
  is_urgent: boolean;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  property_id?: string;
  title: string;
  description: string;
  severity: AlertSeverity;
  latitude?: number;
  longitude?: number;
  is_resolved: boolean;
  created_at: string;
}

export interface CompatibilityResult {
  candidate_id: string;
  candidate_name: string;
  compatibility_score: number;
  shared_interests: string[];
}
