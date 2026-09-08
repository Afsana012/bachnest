export type UserRole = "BACHELOR" | "OWNER" | "ADMIN" | "SUPER_ADMIN";
export type Gender = "MALE" | "FEMALE" | "OTHER";
export type KYCStatus = "UNVERIFIED" | "PENDING" | "APPROVED" | "REJECTED";
export type KYCDocumentType = "NID" | "PASSPORT" | "BIRTH_CERTIFICATE" | "STUDENT_ID" | "EMPLOYEE_ID";
export type PropertyType = "FLAT" | "SUBLET" | "MESS" | "HOSTEL";
export type RoomType = "SINGLE" | "MASTER" | "SHARED";
export type BookingStatus =
  | "REQUESTED"
  | "APPROVED_BY_OWNER"
  | "REJECTED"
  | "DEPOSIT_PAID"
  | "ACTIVE"
  | "COMPLETED"
  | "CANCELLED";
export type TenancyStatus = "ACTIVE" | "NOTICE_SERVED" | "TERMINATED" | "EVICTED";
export type AgreementStatus = "DRAFT" | "PENDING_SIGNATURE" | "SIGNED" | "EXPIRED";
export type InvoiceStatus = "DRAFT" | "ISSUED" | "PARTIALLY_PAID" | "PAID" | "OVERDUE" | "CANCELLED";
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";
export type PaymentMethod = "MOCK" | "BKASH" | "NAGAD" | "ROCKET" | "SSLCOMMERZ" | "BANK_TRANSFER" | "CASH";
export type ComplaintCategory =
  | "PLUMBING"
  | "ELECTRICAL"
  | "APPLIANCE"
  | "STRUCTURAL"
  | "INTERNET"
  | "SECURITY"
  | "NOISE"
  | "CLEANLINESS"
  | "OTHER";
export type ComplaintPriority = "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY";
export type ComplaintStatus = "OPEN" | "ACKNOWLEDGED" | "IN_PROGRESS" | "RESOLVED" | "CLOSED" | "REOPENED";
export type NoticePriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type EmergencyType = "SECURITY_INTRUDER" | "MEDICAL" | "FIRE" | "HARASSMENT" | "ACCIDENT" | "OTHER";

export type Money = number | string;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message?: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface PaginatedApiResponse<T = unknown> {
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

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  full_name: string;
  role: UserRole;
  gender: Gender;
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

export interface UserUpdate {
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  occupation?: string;
  institution_or_company?: string;
  gender?: Gender;
}

export interface KycSubmission {
  document_type: KYCDocumentType;
  document_number: string;
  front_document_url: string;
  back_document_url?: string;
  student_or_work_id_url?: string;
}

export interface KYCOut {
  id: string;
  user_id: string;
  status: KYCStatus;
  document_type: KYCDocumentType;
  document_number: string;
  front_document_url: string;
  back_document_url?: string;
  student_or_work_id_url?: string;
  rejection_reason?: string;
  verified_at?: string;
  created_at: string;
}

export interface PropertyMedia {
  id: string;
  media_url: string;
  media_type: string;
  caption?: string;
  is_cover: boolean;
  display_order: number;
}

export interface RoomSeat {
  id: string;
  room_id: string;
  seat_identifier: string;
  monthly_rent: Money;
  is_occupied: boolean;
}

export interface Room {
  id: string;
  property_id: string;
  room_number_or_name: string;
  room_type: RoomType;
  monthly_rent: Money;
  security_deposit: Money;
  has_attached_bathroom: boolean;
  has_balcony: boolean;
  has_ac: boolean;
  is_furnished: boolean;
  total_capacity: number;
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
  area_neighborhood: string;
  city: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  total_floors?: number;
  floor_number?: number;
  flat_number?: string;
  has_lift: boolean;
  has_generator: boolean;
  has_cctv: boolean;
  has_wifi: boolean;
  gate_closing_time?: string;
  visitor_policy?: string;
  is_published: boolean;
  is_verified_by_admin: boolean;
  created_at: string;
  rooms: Room[];
  media: PropertyMedia[];
}

export interface PropertyCreate {
  title: string;
  description: string;
  property_type: PropertyType;
  address_line: string;
  area_neighborhood: string;
  city: string;
  postal_code?: string;
  latitude: number;
  longitude: number;
  total_floors?: number;
  floor_number?: number;
  flat_number?: string;
  has_lift: boolean;
  has_generator: boolean;
  has_cctv: boolean;
  has_wifi: boolean;
  gate_closing_time?: string;
  visitor_policy?: string;
}

export interface RoomCreate {
  room_number_or_name: string;
  room_type: RoomType;
  monthly_rent: Money;
  security_deposit?: Money;
  has_attached_bathroom?: boolean;
  has_balcony?: boolean;
  has_ac?: boolean;
  is_furnished?: boolean;
  total_capacity?: number;
}

export interface PropertyUpdate {
  title?: string;
  description?: string;
  property_type?: PropertyType;
  address_line?: string;
  area_neighborhood?: string;
  city?: string;
  has_lift?: boolean;
  has_generator?: boolean;
  has_cctv?: boolean;
  has_wifi?: boolean;
  gate_closing_time?: string;
  visitor_policy?: string;
}

export interface RoomUpdate {
  room_number_or_name?: string;
  room_type?: RoomType;
  monthly_rent?: Money;
  security_deposit?: Money;
  has_attached_bathroom?: boolean;
  has_balcony?: boolean;
  has_ac?: boolean;
  is_furnished?: boolean;
  is_available?: boolean;
}


export interface SearchPropertyItem {
  property_id: string;
  title: string;
  property_type: PropertyType;
  area: string;
  city: string;
  latitude: number;
  longitude: number;
  starting_rent: Money;
  available_rooms: number;
  tags: string[];
  distance_km?: number;
  cover_image_url?: string;
}

export interface Booking {
  id: string;
  tenant_id: string;
  property_id: string;
  room_id: string;
  seat_id?: string;
  booking_status: BookingStatus;
  requested_move_in_date: string;
  token_deposit_amount: Money;
  preferred_visit_date?: string;
  visit_time_slot?: string;
  visit_notes?: string;
  visit_status?: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "SKIPPED";
  owner_remarks?: string;
  cancellation_reason?: string;
  created_at: string;
}

export interface BookingAdvancePayRequest {
  advance_amount: number;
  payment_method?: PaymentMethod;
  remarks?: string;
}

export interface Tenancy {
  id: string;
  booking_id?: string;
  tenant_id: string;
  owner_id: string;
  property_id: string;
  room_id: string;
  seat_id?: string;
  agreed_monthly_rent: Money;
  agreed_security_deposit: Money;
  lease_start_date: string;
  lease_end_date?: string;
  notice_period_days: number;
  status: TenancyStatus;
  agreement_status: AgreementStatus;
  digital_agreement_url?: string;
  created_at: string;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  tenancy_id: string;
  tenant_id: string;
  billing_month_year: string;
  base_rent: Money;
  service_charge: Money;
  electricity_bill: Money;
  water_bill: Money;
  gas_bill: Money;
  internet_bill: Money;
  other_adjustments: Money;
  late_fee: Money;
  total_amount: Money;
  paid_amount: Money;
  due_date: string;
  status: InvoiceStatus;
  created_at: string;
}

export interface CheckoutResponse {
  payment_id: string;
  transaction_reference: string;
  amount: Money;
  payment_url?: string;
}

export interface Payment {
  id: string;
  invoice_id: string;
  tenant_id: string;
  transaction_reference: string;
  amount: Money;
  payment_method: PaymentMethod;
  status: PaymentStatus;
  paid_at?: string;
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
  category: ComplaintCategory;
  priority: ComplaintPriority;
  status: ComplaintStatus;
  sla_deadline: string;
  evidence_urls?: string[];
  repair_cost?: Money;
  cost_bearer?: string;
  resolution_notes?: string;
  resolved_at?: string;
  created_at: string;
}

export interface Notice {
  id: string;
  property_id: string;
  owner_id: string;
  title: string;
  content: string;
  priority: NoticePriority;
  is_active: boolean;
  is_read: boolean;
  created_at: string;
}

export interface Review {
  id: string;
  tenancy_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  is_public: boolean;
  created_at: string;
}

export interface EmergencyAlert {
  id: string;
  user_id: string;
  property_id?: string;
  alert_type: EmergencyType;
  emergency_message?: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  resolved_at?: string;
  created_at: string;
}

export interface CompatibilityResult {
  candidate_user_id: string;
  candidate_name: string;
  compatibility_score: number;
  matched_factors: string[];
}

export interface AdminDashboardStats {
  total_users: number;
  verified_properties: number;
  active_tenancies: number;
  open_complaints: number;
  active_sos: number;
}

export interface AuditLog {
  id: string;
  actor_id?: string;
  action_type: string;
  entity_name: string;
  entity_id?: string;
  ip_address?: string;
  created_at: string;
}

export type ParkingVehicleType = "BIKE" | "CAR";
export type ParkingRentalPlan = "DAILY" | "MONTHLY";
export type ParkingBookingStatus = "ACTIVE" | "EXPIRED" | "CANCELLED";

export interface ParkingSpace {
  id: string;
  property_id: string;
  space_number_or_name: string;
  vehicle_type: ParkingVehicleType;
  monthly_rate: number | string;
  daily_rate?: number | string | null;
  is_covered: boolean;
  has_cctv: boolean;
  is_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface ParkingSpaceCreate {
  space_number_or_name: string;
  vehicle_type: ParkingVehicleType;
  monthly_rate: number;
  daily_rate?: number;
  is_covered: boolean;
  has_cctv: boolean;
}

export interface ParkingBooking {
  id: string;
  user_id: string;
  parking_space_id: string;
  rental_plan: ParkingRentalPlan;
  vehicle_registration_number: string;
  start_date: string;
  end_date?: string | null;
  total_amount: number | string;
  status: ParkingBookingStatus;
  created_at: string;
  updated_at: string;
  parking_space?: ParkingSpace;
}

export interface ParkingBookingCreate {
  rental_plan: ParkingRentalPlan;
  vehicle_registration_number: string;
  start_date: string;
  end_date?: string;
}

export interface ParkingSearchItem {
  id: string;
  property_id: string;
  property_title: string;
  property_address: string;
  area_neighborhood: string;
  city: string;
  space_number_or_name: string;
  vehicle_type: ParkingVehicleType;
  monthly_rate: number | string;
  daily_rate?: number | string | null;
  is_covered: boolean;
  has_cctv: boolean;
  is_available: boolean;
  owner_name: string;
  owner_phone: string;
}

export interface AgreementSignRequest {
  signature_name: string;
  agreed_terms: boolean;
}

export interface DigitalAgreement {
  tenancy_id: string;
  agreement_status: AgreementStatus;
  property_title: string;
  property_address: string;
  area_neighborhood: string;
  city: string;
  room_number_or_name: string;
  owner_name: string;
  owner_phone: string;
  tenant_name: string;
  tenant_phone: string;
  tenant_nid_or_id?: string | null;
  agreed_monthly_rent: number | string;
  agreed_security_deposit: number | string;
  lease_start_date: string;
  lease_end_date?: string | null;
  notice_period_days: number;
  gate_closing_time?: string | null;
  visitor_policy?: string | null;
  signed_at?: string | null;
  signature_name?: string | null;
}

export type RoommateLookingType = "ROOM_WANTED" | "FLATSHARE" | "HAVE_ROOM_NEED_ROOMMATE";
export type RoommateOccupationCategory = "STUDENT" | "JOB_HOLDER" | "FREELANCER" | "OTHER";

export interface RoommateProfile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  gender: Gender;
  occupation: string;
  occupation_category: RoommateOccupationCategory;
  institution_or_company: string;
  preferred_areas: string[];
  budget_max: Money;
  looking_for: RoommateLookingType;
  move_in_date: string;
  lifestyle_tags: string[];
  bio: string;
  is_kyc_verified: boolean;
  trust_score: number;
  phone_visible: boolean;
  phone?: string;
  email?: string;
  created_at: string;
}

export type DepositRefundStatus =
  | "REQUESTED"
  | "INSPECTION_PENDING"
  | "DEDUCTIONS_PROPOSED"
  | "SETTLED"
  | "DISPUTED"
  | "REJECTED";

export interface DepositDeductionItem {
  reason: string;
  amount: Money;
  note?: string;
}

export interface DepositClaimCreate {
  tenancy_id: string;
  tenant_payout_method: string;
  tenant_payout_account: string;
  move_out_date: string;
  tenant_notes?: string;
}

export interface DepositClaimSettle {
  deductions: DepositDeductionItem[];
  transaction_reference?: string;
  landlord_remarks?: string;
}

export interface DepositClaimOut {
  id: string;
  tenancy_id: string;
  tenant_id: string;
  owner_id: string;
  status: DepositRefundStatus;
  total_deposit_amount: Money;
  requested_refund_amount: Money;
  deduction_amount: Money;
  net_refund_amount: Money;
  deduction_breakdown: DepositDeductionItem[];
  tenant_payout_method: string;
  tenant_payout_account: string;
  move_out_date: string;
  tenant_notes?: string;
  landlord_remarks?: string;
  transaction_reference?: string;
  settled_at?: string;
  created_at: string;
  updated_at: string;
  property_title?: string;
  room_name?: string;
  tenant_name?: string;
  owner_name?: string;
}

export interface ComplaintCreateRequest {
  property_id: string;
  room_id?: string;
  title: string;
  description: string;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  evidence_urls?: string[];
}

export interface ComplaintStatusUpdate {
  status: ComplaintStatus;
  resolution_notes?: string;
  repair_cost?: Money;
  cost_bearer?: string;
}

export interface UserTrustProfile {
  user_id: string;
  full_name: string;
  role: string;
  trust_score: number;
  is_kyc_verified: boolean;
  total_reviews: number;
  avg_rating: number;
}

