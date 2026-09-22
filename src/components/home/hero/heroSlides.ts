import React from 'react';
import { 
  Anchor, 
  Plane, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  Clock, 
  Globe2, 
  Cpu 
} from 'lucide-react';

export interface HeroSlide {
  id: string;
  slideNum: string;
  category: string;
  eyebrow: string;
  badgeMode: string;
  titleLines: string[];
  description: string;
  image: string;
  imageAlt: string;
  objectPosition?: string;
  serviceLink: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  telemetry: {
    corridor: string;
    speed: string;
    sla: string;
    assetId: string;
  };
  highlightBadges: {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }[];
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 'ocean-freight',
    slideNum: '01',
    category: 'OCEAN LOGISTICS',
    eyebrow: 'GLOBAL MULTI-MODAL LOGISTICS / 24.7',
    badgeMode: 'MARITIME & DEEPWATER',
    titleLines: [
      'MOVING THE WORLD.',
      'MOVING YOUR BUSINESS.'
    ],
    description: 'Intelligent deepwater container shipping, bulk charters, and satellite-monitored port drayage orchestrated across 85+ global maritime trade lanes.',
    image: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=2400&q=85',
    imageAlt: 'International container vessel at deepwater port at dawn',
    objectPosition: 'center center',
    serviceLink: '/services/ocean-freight',
    primaryCtaText: 'TRACK CARGO',
    secondaryCtaText: 'GET A QUOTE',
    telemetry: {
      corridor: 'SHA → RTM (Suez Corridor)',
      speed: '19.4 KTS • 284° W',
      sla: '99.8% On-Time SLA',
      assetId: 'VESSEL: NEXORA VALIANT',
    },
    highlightBadges: [
      { icon: Plane, label: 'Air Priority' },
      { icon: Anchor, label: 'Ocean FCL/LCL' },
      { icon: Truck, label: 'Road Corridors' },
    ],
  },
  {
    id: 'air-freight',
    slideNum: '02',
    category: 'AIR CHARTER',
    eyebrow: 'EXPEDITED GLOBAL AIRLIFT / SPEED-OF-SOUND',
    badgeMode: 'PRIORITY AIR CHARTER',
    titleLines: [
      'CRITICAL AIR FREIGHT.',
      'ZERO COMPROMISE SPEED.'
    ],
    description: 'Next-flight-out express consolidations, nose-loading widebody charters, and temperature-validated life science corridors globally.',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=85',
    imageAlt: 'Widebody freighter aircraft loading high-priority cargo',
    objectPosition: 'center 40%',
    serviceLink: '/services/air-freight',
    primaryCtaText: 'TRACK CARGO',
    secondaryCtaText: 'GET A QUOTE',
    telemetry: {
      corridor: 'FRA → SIN (Flight NX-804)',
      speed: '512 KTS • 37,000 FT',
      sla: '99.9% On-Time SLA',
      assetId: 'B777-200F / EXPEDITE',
    },
    highlightBadges: [
      { icon: Plane, label: 'Same-Day Air Charters' },
      { icon: ShieldCheck, label: 'IATA CEIV Pharma' },
      { icon: Clock, label: '24-48h Global Transit' },
    ],
  },
  {
    id: 'overland-freight',
    slideNum: '03',
    category: 'OVERLAND INTERMODAL',
    eyebrow: 'CONTINENTAL CROSS-DOCK & HEAVY HAUL',
    badgeMode: 'SMART INTERMODAL FLEET',
    titleLines: [
      'PRECISION OVERLAND.',
      'INTELLIGENT CORRIDORS.'
    ],
    description: 'GPS-monitored fleet networks, bonded rail connections, and low-emission Euro 6 transport driving robust supply chains across Europe and the Americas.',
    image: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=2400&q=85',
    imageAlt: 'Heavy transport logistics truck on international transit highway at sunset',
    objectPosition: 'center 60%',
    serviceLink: '/services/road-freight',
    primaryCtaText: 'TRACK CARGO',
    secondaryCtaText: 'GET A QUOTE',
    telemetry: {
      corridor: 'CHI → LAX (Class-1 Corridor)',
      speed: '62 MPH • Route I-80',
      sla: '100% GPS Monitored',
      assetId: 'FLEET UNIT: NX-TRUCK-580',
    },
    highlightBadges: [
      { icon: Truck, label: 'FTL & LTL Daily Runs' },
      { icon: Cpu, label: 'Euro 6 Eco-Fleet' },
      { icon: ShieldCheck, label: 'Bonded Transit Lock' },
    ],
  },
  {
    id: 'bonded-warehousing',
    slideNum: '04',
    category: 'SMART WAREHOUSING',
    eyebrow: 'ROBOTIC HIGH-BAY & COLD-CHAIN INTEGRITY',
    badgeMode: 'AUTOMATED HUBS',
    titleLines: [
      'AUTOMATED STORAGE.',
      'SUB-ZERO INTEGRITY.'
    ],
    description: 'Ultra-secure cryo pharma zones, Class-A bonded high-bay automation, and real-time RFID inventory intelligence in 320+ strategic logistics nodes.',
    image: 'https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=2400&q=85',
    imageAlt: 'Automated high-bay warehouse with robotic storage systems',
    objectPosition: 'center center',
    serviceLink: '/services/warehousing',
    primaryCtaText: 'TRACK CARGO',
    secondaryCtaText: 'GET A QUOTE',
    telemetry: {
      corridor: 'AMS Central Hub Facility #04',
      speed: 'Temp: -20.4°C Cryo Monitored',
      sla: 'Zero-Deviation Cold Chain',
      assetId: 'AUTOMATED HIGH-BAY 12',
    },
    highlightBadges: [
      { icon: Warehouse, label: 'Bonded Free-Trade' },
      { icon: ShieldCheck, label: 'GDP / ISO 9001' },
      { icon: Globe2, label: '320+ Global Facilities' },
    ],
  },
];
