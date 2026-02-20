
export enum Language {
  ENGLISH = 'en',
  HINDI = 'hi',
  HINGLISH = 'hing'
}

export enum UserRole {
  OWNER = 'OWNER',
  STAFF = 'STAFF'
}

export enum BusinessType {
  KIRANA = 'Kirana',
  WHOLESALER = 'Wholesaler',
  TRANSPORT = 'Transport',
  CONSTRUCTION = 'Construction',
  MANUFACTURING = 'Manufacturing',
  OTHER = 'Other'
}

export interface BusinessProfile {
  businessName: string;
  businessType: BusinessType;
  city: string;
  state: string;
  gst?: string;
}

export interface UserPreferences {
  whatsappAlerts: boolean;
  emailAlerts: boolean;
  dailyReports: boolean;
}

export interface User {
  id: string;
  name: string;
  mobile: string; // Acts as unique identifier for mobile auth
  email?: string; // For Google auth
  role: UserRole;
  business?: BusinessProfile;
  preferences?: UserPreferences;
  createdAt: number;
}

export enum AuthStatus {
  IDLE = 'IDLE',
  AUTHENTICATED = 'AUTHENTICATED',
  UNAUTHENTICATED = 'UNAUTHENTICATED',
  ONBOARDING_REQUIRED = 'ONBOARDING_REQUIRED'
}

export enum RecordStatus {
  PENDING_CONFIRMATION = 'PENDING_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  DISPUTED = 'DISPUTED',
  SETTLED = 'SETTLED'
}

export enum EventType {
  USER_REGISTERED = 'UserRegistered',
  BUSINESS_UPDATED = 'BusinessUpdated',
  RECORD_CREATED = 'RecordCreated',
  RECORD_CONFIRMED = 'RecordConfirmed',
  PAYMENT_ADDED = 'PaymentAdded',
  DISPUTE_RAISED = 'DisputeRaised',
  RECORD_SETTLED = 'RecordSettled'
}

// Event Sourcing: The source of truth
export interface SaakshyEvent {
  id: string;
  recordId?: string; // Optional because some events are user-level, not record-level
  userId?: string;
  type: EventType;
  timestamp: number;
  actorId: string; // User ID who performed action
  payload: any; // Flexible payload based on event type
  hash: string; // Cryptographic hash of previous state + current payload
}

// Projection: The current state derived from events
export interface TradeRecord {
  id: string;
  creatorId: string;
  counterpartyName: string;
  counterpartyMobile: string;
  role: 'SELLER' | 'BUYER';
  originalAmount: number;
  remainingAmount: number;
  dueDate: string; // ISO Date
  note?: string;
  status: RecordStatus;
  createdAt: number;
  events: SaakshyEvent[]; // History trace
  paymentHistory: {
    amount: number;
    date: number;
    loggedBy: string;
  }[];
  disputeReason?: string;
}

export interface TrustMetrics {
  totalConfirmed: number;
  onTimePercentage: number;
  avgDelayDays: number;
  disputeCount: number;
  relationshipDays: number;
}
