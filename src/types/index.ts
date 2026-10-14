export type UserRole = 'client' | 'pro' | 'admin';

export type AvailabilityStatus = 'available_now' | 'available_today' | 'by_appointment' | 'off_hours';

export type ContactChannel = 'app_chat' | 'phone' | 'whatsapp' | 'email';

export type PaymentMethod = 'cash' | 'transfer' | 'mercadopago' | 'other';

export type CommissionStatus = 'pending_review' | 'pending_payment' | 'paid' | 'disputed' | 'cancelled';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type JobStatus = 
  | 'contact_initiated'
  | 'pro_responded'
  | 'in_coordination'
  | 'work_in_progress'
  | 'closed_pending_commission'
  | 'closed_commission_paid'
  | 'under_review'
  | 'cancelled';

export interface Category {
  id: string;
  name: string;
  iconName: string;
  description: string;
  emergencyEligible: boolean;
  popular?: boolean;
}

export interface Review {
  id: string;
  clientName: string;
  rating: number; // 1-5
  comment: string;
  date: string;
  isInAppVerified: boolean; // verified job completed through the app
  serviceName: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  zone: string;
  avatarUrl?: string;
  createdAt: string;
  proProfileId?: string;
  isGoogleAuth?: boolean;
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  name: string;
  commercialName: string;
  photoUrl: string;
  isCompany: boolean;
  rating: number;
  reviewCount: number;
  verifiedInAppReviewsCount: number;
  experienceYears: number;
  categories: string[]; // category IDs
  specialties: string[];
  coverageZones: string[];
  exactAddressProtected: string;
  availability: AvailabilityStatus;
  acceptsEmergencies: boolean;
  scheduleText: string;
  workingDays: string;
  responseTimeText: string;
  bio: string;
  portfolioPhotos: { url: string; title: string; category: string }[];
  pricingType: 'diagnostic_visit' | 'free_quote' | 'fixed_indicative';
  pricingNote: string;
  allowedChannels: ContactChannel[];
  phone: string;
  email: string;
  whatsappPhone: string;
  reviews: Review[];
  totalJobsCount: number;
  
  // Security & Identity verification (DNI)
  dniNumber: string;
  dniFrontUrl?: string;
  dniBackUrl?: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
}

export interface MilestoneState {
  proConfirmedAt?: string;
  proActorName?: string;
  clientConfirmedAt?: string;
  clientActorName?: string;
  note?: string;
}

export interface JobHistoryEvent {
  id: string;
  timestamp: string;
  actorRole: UserRole;
  actorName: string;
  action: string;
  channel?: ContactChannel;
  details?: string;
}

export interface ChatMessage {
  id: string;
  senderRole: 'client' | 'pro';
  senderName: string;
  text: string;
  timestamp: string;
}

export interface CommissionPaymentRecord {
  id: string;
  date: string;
  amount: number;
  paymentMethod: string;
  referenceNumber: string;
  note: string;
  status: 'confirmed' | 'pending_validation';
}

export interface ServiceJob {
  id: string;
  code: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientZone: string;
  proId: string;
  proName: string;
  proCommercialName: string;
  categoryId: string;
  categoryName: string;
  description: string;
  isEmergency: boolean;
  initialChannel: ContactChannel;
  createdAt: string;
  status: JobStatus;
  
  // Financials & Estimates
  estimatedPrice?: number;
  proFinalPriceReported?: number;
  clientFinalPriceReported?: number;
  hasPriceMismatch?: boolean;
  priceMismatchReason?: string;
  
  // Payments
  proPaymentMethod?: PaymentMethod;
  clientPaymentMethod?: PaymentMethod;
  proPaymentConfirmed: boolean;
  clientPaymentConfirmed: boolean;
  receiptNote?: string;
  
  // Commission
  commission: {
    ratePercent: number;
    grossAmount: number;
    platformAmount: number;
    proAmount: number;
    status: CommissionStatus;
    paidAt?: string;
    paymentRef?: string;
    adminNote?: string;
  };

  // Milestone Audit Trail
  milestones: {
    contact_initiated: MilestoneState;
    pro_responded: MilestoneState;
    job_accepted: MilestoneState;
    price_agreed: MilestoneState;
    visit_scheduled: MilestoneState;
    on_the_way?: MilestoneState;
    arrived?: MilestoneState;
    work_started: MilestoneState;
    work_completed: MilestoneState;
    payment_reported: MilestoneState;
    client_confirmed: MilestoneState;
    closed_or_review: MilestoneState;
  };

  historyEvents: JobHistoryEvent[];
  chatMessages: ChatMessage[];
  reviewSubmitted?: {
    rating: number;
    comment: string;
    createdAt: string;
  };
}

export interface AppReport {
  id: string;
  jobId?: string;
  reporterRole: UserRole;
  reporterName: string;
  reason: string;
  details: string;
  status: 'pending' | 'resolved';
  createdAt: string;
  adminResolution?: string;
}

export interface AppState {
  currentRole: UserRole;
  currentUser: UserAccount | null;
  users: UserAccount[];
  commissionRatePercent: number;
  professionals: ProfessionalProfile[];
  jobs: ServiceJob[];
  reports: AppReport[];
  commissionPayments: CommissionPaymentRecord[];
}
