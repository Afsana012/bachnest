export type UserRole = "bachelor" | "property_owner" | "admin" | "super_admin";
export type KYCStatus = "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
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
  full_name: string;
  role: string;
  gender: string;
  is_active: boolean;
  is_phone_verified: boolean;
  is_email_verified: boolean;
  is_kyc_verified: boolean;
  avatar_url?: string;
  bio?: string;
  occupation?: string;
  institution_or_company?: string;
  trust_score: number;
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
  booking_id?: string;
  tenant_id: string;
  owner_id: string;
  property_id: string;
  room_id: string;
  seat_id?: string;
  agreed_monthly_rent: number;
  agreed_security_deposit: number;
  lease_start_date: string;
  lease_end_date?: string;
  notice_period_days: number;
  status: string;
  agreement_status: string;
  digital_agreement_url?: string;
  created_at: string;
  property_title?: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenancy_id: string;
  tenant_id: string;
  billing_month_year: string;
  base_rent: number;
  service_charge: number;
  electricity_bill: number;
  water_bill: number;
  gas_bill: number;
  internet_bill: number;
  other_adjustments: number;
  late_fee: number;
  total_amount: number;
  paid_amount: number;
  due_date: string;
  status: string;
  created_at: string;
}

export interface Complaint {
  id: string;
  property_id: string;
  room_id?: string;
  tenancy_id?: string;
  tenant_id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  sla_deadline: string;
  evidence_urls?: string[];
  repair_cost?: number;
  cost_bearer?: string;
  resolution_notes?: string;
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

export interface KYCOut {
  id: string;
  user_id: string;
  status: KYCStatus;
  document_type: string;
  document_number: string;
  front_document_url: string;
  back_document_url?: string;
  student_or_work_id_url?: string;
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
}

export interface AdminDashboardStats {
  total_users: number;
  verified_properties: number;
  active_tenancies: number;
  open_complaints: number;
  active_sos: number;
}
