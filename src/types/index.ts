export type ShipmentStatus = 
  | 'Created'
  | 'Pending'
  | 'Processing'
  | 'Picked Up'
  | 'Origin Facility'
  | 'Departed Origin'
  | 'In Transit'
  | 'Arrived at Facility'
  | 'On Hold'
  | 'Customs Clearance'
  | 'Destination Facility'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Exception';

export type TransportMode = 
  | 'Air Freight' 
  | 'Ocean Freight' 
  | 'Road Transport' 
  | 'Rail Express' 
  | 'Multi-Modal'
  | 'Land Transport'
  | 'Sea Transport'
  | 'Air Transport'
  | 'Rail Transport';

export const CARRIER_OPTIONS = [
  'DHL',
  'USPS',
  'FedEx',
  'UPS',
  'RoyalMail',
  'Tradex',
  'OCEAN AFRICA LOGISTICS',
] as const;

export type CarrierName = (typeof CARRIER_OPTIONS)[number] | string;

export const PACKAGE_TYPE_OPTIONS = [
  'Pallet',
  'Carton',
  'Crate',
  'Loose',
  'Others',
  'Box',
  'Container',
  'Parcel',
  'Envelope',
] as const;

export type PackageTypeOption = (typeof PACKAGE_TYPE_OPTIONS)[number] | string;

export const generateDynamicTrackingId = (): string => {
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  const year = new Date().getFullYear();
  return `NX-${randomDigits}-${year}`;
};

export interface ShipperInfo {
  name: string;
  city: string;
  country: string;
  address?: string;
  phone?: string;
  email?: string;
}

export interface ReceiverInfo {
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone?: string;
  email?: string;
}

export interface PackageItem {
  packageNumber: number;
  type: string; // Carton, Box, Pallet, Envelope, Crate, Container, Parcel, Bag, Other
  description: string;
  length: number; // cm
  width: number; // cm
  height: number; // cm
  weight: number; // kg
}

export interface DeliveryDates {
  departureDate?: string;
  departureTime?: string;
  pickupDate?: string;
  pickupTime?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  actualDeliveryTime?: string;
}

export interface ShipmentTotals {
  volumetricWeight: number; // kg
  volume: number; // cu. m / m3
  actualWeight: number; // kg
}

export interface TrackingEvent {
  id: string;
  date: string;
  time: string;
  location: string;
  status: ShipmentStatus;
  description?: string;
  updatedBy?: string;
  remarks?: string;
  lat?: number;
  lng?: number;
  completed: boolean;
}

export interface Waypoint {
  name: string;
  lat: number;
  lng: number;
  type: 'origin' | 'transit' | 'destination';
  passed: boolean;
  timestamp?: string;
}

export interface Shipment {
  id: string;
  trackingNumber: string;
  barcodeValue?: string;
  customerName?: string;
  customerEmail?: string;
  customerCompany?: string;
  shipper?: ShipperInfo;
  receiver?: ReceiverInfo;
  packageType?: string;
  carrierReference?: string;
  product?: string;
  quantity?: number;
  paymentMode?: string;
  totalFreight?: {
    amount: number;
    currency: string;
  };
  dates?: DeliveryDates;
  comments?: string;
  packages?: PackageItem[];
  totals?: ShipmentTotals;
  origin: {
    city: string;
    country: string;
    code?: string;
    lat: number;
    lng: number;
    facility?: string;
    address?: string;
  };
  destination: {
    city: string;
    country: string;
    code?: string;
    lat: number;
    lng: number;
    facility?: string;
    address?: string;
  };
  currentLocation: {
    city: string;
    country: string;
    lat: number;
    lng: number;
    address?: string;
    speedKnots?: number;
    altitudeMeters?: number;
    temperatureCelsius?: number;
    humidityPercent?: number;
  };
  transportMode: TransportMode;
  serviceLevel?: 'Express Urgent' | 'Standard Freight' | 'Economy Cargo' | 'Temperature-Controlled Pharma' | string;
  weightKg: number;
  weightUnit?: 'kg' | 'g' | 'lb' | 'oz';
  volumeCbm: number;
  pieces: number;
  cargoDescription: string;
  status: ShipmentStatus;
  progressPercent: number;
  carrier: string;
  vesselOrFlightNumber?: string;
  containerNumber?: string;
  estimatedDelivery?: string;
  dispatchedDate?: string;
  lastUpdated: string;
  events: TrackingEvent[];
  waypoints?: Waypoint[];
  isSimulatedDemo?: boolean;
}

export type QuoteStatus = 
  | 'Pending Review'
  | 'Under Review'
  | 'Sent'
  | 'Accepted'
  | 'Declined'
  | 'Expired'
  | 'Cancelled'
  | 'Pending'
  | 'Reviewing'
  | 'Quoted'
  | 'Booked';

export type QuoteChargeCategory = 
  | 'freight' 
  | 'fuel' 
  | 'handling' 
  | 'insurance' 
  | 'customs' 
  | 'tax' 
  | 'discount' 
  | 'other';

export interface QuoteChargeItem {
  id: string;
  category: QuoteChargeCategory;
  description: string;
  amount: number;
}

export interface QuotePriceBreakdown {
  currency: string;
  lineItems: QuoteChargeItem[];
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  totalAmount: number;
  paymentTerms?: string;
  transitTimeDays?: number;
  validUntil?: string;
  pricingNotes?: string;
  preparedBy?: string;
}

export interface QuoteActivityEvent {
  id: string;
  timestamp: string;
  actor: 'Customer' | 'Admin' | 'System';
  actorName?: string;
  action: string;
  details?: string;
}

export const generateDynamicQuoteReference = (): string => {
  const randomDigits = Math.floor(10000 + Math.random() * 90000);
  const year = new Date().getFullYear();
  return `QT-${year}-${randomDigits}`;
};

export interface QuoteRequest {
  id: string;
  referenceNumber?: string;
  createdAt: string;
  updatedAt?: string;

  // Customer & Shipper
  fullName: string;
  companyName: string;
  email: string;
  phone: string;

  // Corridors & Hubs
  originCity: string;
  originCountry: string;
  originAddress?: string;
  originPostalCode?: string;

  destCity: string;
  destCountry: string;
  destAddress?: string;
  destPostalCode?: string;

  // Cargo Specifications
  service: TransportMode;
  cargoType: string;
  cargoDescription?: string;
  packageType?: string;
  pieces?: number;
  weightKg: number;
  volumeCbm?: number;
  dimensions: {
    lengthCm: number;
    widthCm: number;
    heightCm: number;
  };
  declaredValue?: number;
  declaredValueCurrency?: string;
  cargoReadyDate?: string;

  specialRequirements: string[];
  notes?: string;
  internalAdminNotes?: string;

  // Status & Pricing
  status: QuoteStatus;
  pricing?: QuotePriceBreakdown;
  estimatedCostUsd?: number;
  estimatedTransitDays?: number;

  // Timestamps & Workflow
  sentAt?: string;
  sentBy?: string;
  validUntil?: string;

  acceptedAt?: string;
  acceptedByName?: string;
  acceptanceNotes?: string;

  declinedAt?: string;
  declinedReason?: string;

  convertedShipmentId?: string;
  convertedTrackingNumber?: string;

  activityLog?: QuoteActivityEvent[];
}

export interface ContactMessage {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  subject: string;
  message: string;
  department: 'Sales & Rates' | 'Customer Support' | 'Customs Brokerage' | 'Executive Office' | 'Press & Media';
  status: 'Unread' | 'Read' | 'Responded' | 'Archived';
}

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  image?: string;
  date?: string;
  readTime?: string;
  category: 'Supply Chain AI' | 'Global Trade' | 'Maritime' | 'Sustainability' | 'Air Cargo';
  author: {
    name: string;
    role: string;
    avatar: string;
  };
  publishedAt: string;
  readingTimeMinutes: number;
  tags: string[];
  featured?: boolean;
}

export interface CaseStudy {
  id: string;
  slug: string;
  client: string;
  industry: string;
  logoText: string;
  title: string;
  summary: string;
  challenge: string;
  solution: string;
  results: {
    metric: string;
    label: string;
  }[];
  heroImage: string;
  quote: {
    text: string;
    author: string;
    role: string;
  };
}

export interface IndustryDetail {
  id: string;
  title: string;
  subtitle: string;
  tagline?: string;
  description: string;
  challenges?: string[];
  stats: string[];
  image: string;
  heroImage?: string;
}

export interface ServiceDetail {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  stats: { value: string; label: string }[];
  image: string;
  iconName: string;
  leadTime: string;
  coverage: string;
}

export interface Testimonial {
  id: string;
  client: string;
  company: string;
  role: string;
  country: string;
  countryFlag: string;
  quote: string;
  rating: number;
  serviceUsed: string;
  avatar: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Tracking & Visibility' | 'Customs & Compliance' | 'Pricing & Billing' | 'Special Cargo';
}

export interface OfficeLocation {
  id: string;
  city: string;
  country: string;
  role: 'Global Headquarters' | 'Asia-Pacific Hub' | 'EMEA Gateway' | 'Americas Superhub' | 'Middle East Gateway';
  address: string;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  timezone: string;
  warehouseCapacitySqm: string;
}

export interface CompanyInfo {
  id: string;
  companyName: string;
  tradeName: string;
  tagline: string;
  description: string;
  foundedYear: number;
  website: string;
  
  // Contact Channels
  primaryEmail: string;
  supportEmail: string;
  quotesEmail: string;
  customsEmail: string;
  mediaEmail: string;
  pressEmail?: string;
  
  primaryPhone: string;
  tollFreePhone: string;
  emergencyPhone: string;
  whatsappPhone: string;
  whatsappMessage?: string;
  faxNumber: string;

  // Live Chat & Support Integrations
  tawkPropertyId?: string;
  tawkWidgetId?: string;
  enableWhatsApp?: boolean;
  enableLiveChat?: boolean;

  // Headquarters Address
  hqAddress: string;
  hqCity: string;
  hqCountry: string;
  hqPostalCode: string;
  hqCoordinates?: { lat: number; lng: number };

  // Operations & Dispatch Hours
  businessHours: string;
  dispatchDeskHours: string;
  emergencyResponseHours: string;

  // Regulatory, Licenses & Tax
  registrationNumber: string;
  taxId: string;
  dunsNumber: string;
  iataCode: string;
  fmcNumber: string;
  aeoCertificate: string;
  isoCertifications: string;

  // Social & Portals
  linkedinUrl: string;
  twitterUrl: string;
  githubUrl?: string;
  portalUrl: string;

  // Financial & Settlement
  bankName: string;
  bankAccountName: string;
  iban: string;
  swiftBic: string;
  bankCurrency: string;

  lastUpdated: string;
  updatedBy?: string;
}
