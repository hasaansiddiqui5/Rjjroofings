export type Role = 'ADMIN' | 'STAFF';

export type BookingStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULED';

export type UrgencyLevel = 'STANDARD' | 'EMERGENCY_STORM';

export type RoofType = 'SHINGLE' | 'METAL' | 'TILE' | 'FLAT_TPO' | 'UNSURE';

export type ContactMethod = 'PHONE' | 'EMAIL' | 'TEXT';

export interface ProcessStep {
  stepNumber: string;
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  estimatedDuration: number; // minutes
  priceNote: string;
  image: string;
  icon: string;
  active: boolean;
  displayOrder: number;
  whatsIncluded: string[];
  processSteps: ProcessStep[];
  faqs: ServiceFAQ[];
}

export interface CustomerItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  tags: string[];
  insuranceClaim: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BookingPhoto {
  id: string;
  url: string;
  caption?: string;
}

export interface EmailDispatchRecord {
  id: string;
  to: string;
  subject: string;
  type: 'CUSTOMER_CONFIRMATION' | 'ADMIN_NEW_ALERT' | 'EMERGENCY_PRIORITY_ALERT' | 'STATUS_UPDATE' | 'REMINDER_24H';
  sentAt: string;
  previewText: string;
}

export interface BookingItem {
  id: string;
  referenceCode: string;
  cancelToken: string;
  serviceId: string;
  serviceName: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string; // YYYY-MM-DD in America/Chicago
  timeSlot: string; // HH:mm in America/Chicago
  durationMinutes: number;
  urgency: UrgencyLevel;
  status: BookingStatus;
  roofType: RoofType;
  roofAgeYears: number;
  issueDescription: string;
  insuranceClaim: boolean;
  preferredContact: ContactMethod;
  propertyAddress: string;
  propertyCity: string;
  propertyZip: string;
  internalNotes: string;
  photos: BookingPhoto[];
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHoursDay {
  id: string;
  dayOfWeek: number; // 0 = Sun, 1 = Mon ... 6 = Sat
  dayName: string;
  openTime: string; // "07:30"
  closeTime: string; // "18:00"
  isClosed: boolean;
  breakStart: string; // "12:00" or ""
  breakEnd: string; // "13:00" or ""
}

export interface BlockedDateItem {
  id: string;
  date: string; // YYYY-MM-DD
  reason: string;
  isHoliday: boolean;
}

export interface ProjectItem {
  id: string;
  title: string;
  slug: string;
  category:
    | 'Residential Shingle'
    | 'Standing Seam Metal'
    | 'Storm Restoration'
    | 'Commercial TPO'
    | 'Gutters & Exterior';
  location: string;
  completedAt: string;
  description: string;
  beforeImage: string;
  afterImage: string;
  featured: boolean;
  displayOrder: number;
  roofSquare: string;
  materialUsed: string;
  durationDays: string;
}

export interface TestimonialItem {
  id: string;
  authorName: string;
  authorRole: string;
  serviceType: string;
  rating: number;
  quote: string;
  outcome: string;
  featured: boolean;
  verified: boolean;
  createdAt: string;
}

export interface ContactMessageItem {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  isRead: boolean;
  repliedAt?: string;
  createdAt: string;
}

export interface SiteSettings {
  businessName: string;
  tagline: string;
  phone: string;
  email: string;
  address: string;
  serviceArea: string;
  timezone: string;
  heroHeadline: string;
  heroSubline: string;
  statYearsExperience: string;
  statRoofsCompleted: string;
  statHappyHomeowners: string;
  statServiceAreaCities: string;
  slotIntervalMinutes: number;
  bufferTravelMinutes: number;
  minNoticeHours: number;
  maxAdvanceDays: number;
  emergencyBypassNotice: boolean;
  notificationEmail: string;
  seoTitle: string;
  seoDescription: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
  lastLoginAt: string;
  createdAt: string;
}

export interface ActivityLogItem {
  id: string;
  actorName: string;
  action: string;
  entityType: 'Booking' | 'Service' | 'Customer' | 'Project' | 'Setting' | 'Auth' | 'Hours';
  entityId?: string;
  details: string;
  createdAt: string;
}

export interface AppDatabaseState {
  settings: SiteSettings;
  services: ServiceItem[];
  bookings: BookingItem[];
  customers: CustomerItem[];
  businessHours: BusinessHoursDay[];
  blockedDates: BlockedDateItem[];
  projects: ProjectItem[];
  testimonials: TestimonialItem[];
  contactMessages: ContactMessageItem[];
  users: UserAccount[];
  activityLogs: ActivityLogItem[];
  emailLogs: EmailDispatchRecord[];
}
