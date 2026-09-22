import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  Unsubscribe 
} from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType, cleanForFirestore } from './firebase';
import { 
  Shipment, 
  QuoteRequest, 
  ContactMessage, 
  BlogPost, 
  TrackingEvent,
  CompanyInfo,
  QuoteStatus,
  QuotePriceBreakdown,
  generateDynamicQuoteReference
} from '../types';
import { 
  INITIAL_SHIPMENTS, 
  BLOG_POSTS_DATA 
} from '../data/mockData';

const SHIPMENTS_KEY = 'nexora_shipments_v1';
const QUOTES_KEY = 'nexora_quotes_v1';
const MESSAGES_KEY = 'nexora_messages_v1';
const SUBSCRIBERS_KEY = 'nexora_subscribers_v1';
const BLOGS_KEY = 'nexora_blogs_v1';
const COMPANY_INFO_KEY = 'nexora_company_info_v1';

// Tombstone keys to prevent deleted records from resurrecting via snapshots or fallback defaults
const DELETED_SHIPMENTS_KEY = 'nexora_deleted_shipment_ids_v1';
const DELETED_QUOTES_KEY = 'nexora_deleted_quote_ids_v1';
const DELETED_MESSAGES_KEY = 'nexora_deleted_message_ids_v1';

// In-memory active subscriber registry for instantaneous state broadcasting across components
const shipmentListeners = new Set<(shipments: Shipment[]) => void>();
const quoteListeners = new Set<(quotes: QuoteRequest[]) => void>();
const messageListeners = new Set<(messages: ContactMessage[]) => void>();
const blogListeners = new Set<(blogs: BlogPost[]) => void>();

function getDeletedShipmentKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_SHIPMENTS_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markShipmentDeleted(id: string, trackingNumber?: string) {
  try {
    const set = getDeletedShipmentKeys();
    if (id) set.add(id.trim().toUpperCase());
    if (trackingNumber) set.add(trackingNumber.trim().toUpperCase());
    localStorage.setItem(DELETED_SHIPMENTS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Storage error marking shipment deleted', e);
  }
}

function isShipmentDeleted(s: Shipment): boolean {
  const set = getDeletedShipmentKeys();
  return (
    set.has(s.id.trim().toUpperCase()) ||
    set.has(s.trackingNumber.trim().toUpperCase())
  );
}

function getDeletedQuoteKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_QUOTES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markQuoteDeleted(id: string, refNumber?: string) {
  try {
    const set = getDeletedQuoteKeys();
    if (id) set.add(id.trim().toUpperCase());
    if (refNumber) set.add(refNumber.trim().toUpperCase());
    localStorage.setItem(DELETED_QUOTES_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Storage error marking quote deleted', e);
  }
}

function isQuoteDeleted(q: QuoteRequest): boolean {
  const set = getDeletedQuoteKeys();
  return (
    set.has(q.id.trim().toUpperCase()) ||
    (q.referenceNumber ? set.has(q.referenceNumber.trim().toUpperCase()) : false)
  );
}

function getDeletedMessageKeys(): Set<string> {
  try {
    const raw = localStorage.getItem(DELETED_MESSAGES_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function markMessageDeleted(id: string) {
  try {
    const set = getDeletedMessageKeys();
    if (id) set.add(id.trim());
    localStorage.setItem(DELETED_MESSAGES_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {
    console.warn('Storage error marking message deleted', e);
  }
}

function notifyShipmentSubscribers(shipments: Shipment[]) {
  shipmentListeners.forEach((cb) => {
    try {
      cb(shipments);
    } catch (e) {
      console.warn('Error in shipment subscriber callback', e);
    }
  });
}

function notifyQuoteSubscribers(quotes: QuoteRequest[]) {
  quoteListeners.forEach((cb) => {
    try {
      cb(quotes);
    } catch (e) {
      console.warn('Error in quote subscriber callback', e);
    }
  });
}

function notifyMessageSubscribers(messages: ContactMessage[]) {
  messageListeners.forEach((cb) => {
    try {
      cb(messages);
    } catch (e) {
      console.warn('Error in message subscriber callback', e);
    }
  });
}

function notifyBlogSubscribers(blogs: BlogPost[]) {
  blogListeners.forEach((cb) => {
    try {
      cb(blogs);
    } catch (e) {
      console.warn('Error in blog subscriber callback', e);
    }
  });
}

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  id: 'primary',
  companyName: 'NEXORA LOGISTICS GLOBAL INC.',
  tradeName: 'NEXORA LOGISTICS',
  tagline: 'Deterministic Multi-Modal Freight Forwarding & Autonomous Supply Chain Control',
  description: 'NEXORA is a premier international logistics engineering and multi-modal freight network operating across 85+ sovereign trade lanes. We combine Tier-1 air, deepwater ocean, cross-border rail, and temperature-controlled pharma logistics with real-time IoT tracking.',
  foundedYear: 2008,
  website: 'https://nexoralogistics.com',
  
  // Contact details
  primaryEmail: 'gillesawo6@gmail.com',
  supportEmail: 'gillesawo6@gmail.com',
  quotesEmail: 'gillesawo6@gmail.com',
  customsEmail: 'gillesawo6@gmail.com',
  mediaEmail: 'gillesawo6@gmail.com',
  
  primaryPhone: '+31 10 892 4000',
  tollFreePhone: '+1 (800) 555-NEXO',
  emergencyPhone: '+31 10 892 4099',
  whatsappPhone: '+31 10 892 4000',
  whatsappMessage: 'Hello, I would like to make an enquiry about your logistics services.',
  faxNumber: '+31 10 892 4001',

  // Live Chat & Support Integrations
  tawkPropertyId: '',
  tawkWidgetId: 'default',
  enableWhatsApp: true,
  enableLiveChat: true,

  // Headquarters
  hqAddress: 'Wilhelminakade 902, 3072 AP Rotterdam',
  hqCity: 'Rotterdam',
  hqCountry: 'Netherlands',
  hqPostalCode: '3072 AP',
  hqCoordinates: { lat: 51.9054, lng: 4.4925 },

  // Hours
  businessHours: 'Monday – Friday: 08:00 – 18:00 CET',
  dispatchDeskHours: '24/7/365 Continuous Watch',
  emergencyResponseHours: 'Immediate (< 15 Min SLA)',

  // Certifications & Tax
  registrationNumber: 'KvK 24491028 (Netherlands Commercial Register)',
  taxId: 'NL859203918B01 / EORI NL859203918',
  dunsNumber: '49-201-8492',
  iataCode: '01-4-8921/2026',
  fmcNumber: 'FMC-OTI #029418N',
  aeoCertificate: 'AEOF-NL-849281 (Customs Simplifications & Security)',
  isoCertifications: 'ISO 9001:2015, ISO 14001:2015, GDP Pharma Compliant',

  // Social & Web Portals
  linkedinUrl: 'https://linkedin.com/company/nexora-logistics',
  twitterUrl: 'https://x.com/nexora_logistics',
  githubUrl: 'https://github.com/nexora-logistics/cyberfreight-sdk',
  portalUrl: 'https://portal.nexoralogistics.com',

  // Banking & Financial Settlements
  bankName: 'ING Bank N.V. (Corporate Treasury Desk)',
  bankAccountName: 'NEXORA Logistics Global B.V.',
  iban: 'NL82 INGB 0001 2345 67',
  swiftBic: 'INGBNL2A',
  bankCurrency: 'EUR / USD / GBP Multi-Currency Clearing',

  lastUpdated: '2026-08-24T18:00:00.000Z',
  updatedBy: 'System Administrator',
};

let firestoreInitialized = false;

// Initial Seeding to ensure Firestore is populated for multi-device sync
async function seedInitialFirestoreData() {
  if (firestoreInitialized) return;
  firestoreInitialized = true;

  try {
    const shipmentsColl = collection(db, 'shipments');
    const snap = await getDocs(shipmentsColl);
    if (snap.empty) {
      console.log('Seeding initial shipments into Firestore...');
      for (const s of INITIAL_SHIPMENTS) {
        await setDoc(doc(db, 'shipments', s.id), cleanForFirestore(s));
      }
    }
  } catch (err) {
    console.warn('Firestore initial shipments seed notice:', err);
  }

  try {
    const quotesColl = collection(db, 'quotes');
    const snap = await getDocs(quotesColl);
    if (snap.empty) {
      const initialQuotes = storageService.getQuotes();
      for (const q of initialQuotes) {
        await setDoc(doc(db, 'quotes', q.id), cleanForFirestore(q));
      }
    }
  } catch (err) {
    console.warn('Firestore initial quotes seed notice:', err);
  }

  try {
    // Contact messages are strictly protected in firestore.rules (allow read: if isAuthorizedUser()).
    // Only check or seed messages if an authorized operator/admin session is active.
    if (auth.currentUser) {
      const messagesColl = collection(db, 'messages');
      const snap = await getDocs(messagesColl);
      if (snap.empty) {
        const initialMsgs = storageService.getContactMessages();
        for (const m of initialMsgs) {
          await setDoc(doc(db, 'messages', m.id), cleanForFirestore(m));
        }
      }
    }
  } catch (err: any) {
    // Only log if it's not an expected permission denial for unauthenticated visitors
    if (err?.code !== 'permission-denied') {
      console.warn('Firestore initial messages seed notice:', err);
    }
  }

  try {
    const companyDocRef = doc(db, 'company_info', 'primary');
    const companySnap = await getDoc(companyDocRef);
    if (!companySnap.exists()) {
      await setDoc(companyDocRef, cleanForFirestore(DEFAULT_COMPANY_INFO));
    }
  } catch (err) {
    console.warn('Firestore company_info seed notice:', err);
  }
}

if (typeof window !== 'undefined') {
  // Defer initial seeding by 1.5s to let auth & connection establish smoothly
  setTimeout(() => {
    seedInitialFirestoreData().catch(() => {});
  }, 1500);
}

// Normalizes and sanitizes shipment GPS, location coordinates and metadata
export function sanitizeShipmentRecord(s: Shipment): Shipment {
  if (!s) return s;
  let updated: Shipment = { ...s };

  const isOriginCameroon =
    (s.origin?.country || s.shipper?.country || '').toLowerCase().includes('cameroon') ||
    (s.origin?.city || s.shipper?.city || '').toLowerCase().includes('buea');

  const isDestChina =
    (s.destination?.country || s.receiver?.country || '').toLowerCase().includes('china') ||
    (s.destination?.city || s.receiver?.city || '').toLowerCase().includes('shanghai');

  // Fix for Buea, Cameroon shipments or specific tracking IDs
  if (isOriginCameroon || s.trackingNumber?.toUpperCase() === 'NX-5314-2026') {
    const originLat = 4.1560;
    const originLng = 9.2410;
    const destLat = isDestChina ? 31.1443 : (s.destination?.lat || 31.1443);
    const destLng = isDestChina ? 121.8083 : (s.destination?.lng || 121.8083);

    // Fix origin if pointing to Milan / wrong coordinates
    if (s.origin?.lat !== originLat || (s.origin?.facility && s.origin.facility.includes('Milano'))) {
      updated.origin = {
        ...s.origin,
        city: s.origin?.city || 'Buea',
        country: s.origin?.country || 'Cameroon',
        code: s.origin?.code || 'BUE',
        lat: originLat,
        lng: originLng,
        facility: 'Buea Regional Air & Cargo Hub',
        address: s.origin?.address?.replace(/Milano Central Express Hub/gi, 'Buea Regional Air & Cargo Hub') || 'Commercial Avenue, Buea, Cameroon',
      };
    }

    if (isDestChina && (s.destination?.lat !== destLat || (s.destination?.facility && s.destination.facility.includes('Calabria')))) {
      updated.destination = {
        ...s.destination,
        city: s.destination?.city || 'Shanghai',
        country: s.destination?.country || 'China',
        code: s.destination?.code || 'PVG',
        lat: destLat,
        lng: destLng,
        facility: 'NEXORA Pudong Mega Air Cargo Hub 04',
        address: s.destination?.address?.replace(/Calabria Regional Fulfillment Center/gi, 'NEXORA Pudong Mega Air Cargo Hub 04') || 'Pudong International Airport, Shanghai, China',
      };
    }

    // Fix intercontinental transport mode & carrier vessel
    if (isDestChina && (s.transportMode === 'Land Transport' || !s.transportMode)) {
      updated.transportMode = 'Air Freight';
      updated.serviceLevel = 'Air Priority Express';
    }
    if (updated.vesselOrFlightNumber?.includes('Ground-IT')) {
      updated.vesselOrFlightNumber = 'ET-Cargo-3914 (B777-F)';
    }

    // Fix live current location if pointing to Milan / Italy
    const curLat = s.currentLocation?.lat || 0;
    const curLng = s.currentLocation?.lng || 0;
    if (curLat > 40 && curLng > 5 && curLng < 15) {
      const prog = typeof s.progressPercent === 'number' ? s.progressPercent : 30;
      const midLat = originLat + (destLat - originLat) * (prog / 100);
      const midLng = originLng + (destLng - originLng) * (prog / 100);
      updated.currentLocation = {
        ...s.currentLocation,
        lat: midLat,
        lng: midLng,
        city: prog > 5 ? `Transit Air Corridor (${prog}% Completed)` : 'Buea',
        country: prog > 5 ? 'International Air Space' : 'Cameroon',
        address: prog > 5 
          ? `Buea (BUE) → Shanghai (PVG) Air Corridor [Transit Security Hold — ${prog}% Traversed]` 
          : 'Buea Regional Air & Cargo Hub, Buea, Cameroon',
        speedKnots: s.currentLocation?.speedKnots || 495,
        temperatureCelsius: s.currentLocation?.temperatureCelsius || 19.5,
      };
    }

    // Fix events if any event had "Milano Central Express Hub"
    if (s.events && s.events.length > 0) {
      updated.events = s.events.map((ev) => {
        let loc = ev.location || '';
        if (loc.includes('Milano Central Express Hub')) {
          loc = loc.replace(/Milano Central Express Hub/gi, 'Buea Regional Air & Cargo Hub');
        }
        let lat = ev.lat;
        let lng = ev.lng;
        if (typeof lat === 'number' && lat > 40 && typeof lng === 'number' && lng > 5 && lng < 15) {
          lat = originLat;
          lng = originLng;
        }
        return {
          ...ev,
          location: loc,
          lat: lat || originLat,
          lng: lng || originLng,
        };
      });
    }
  }

  // Strip legacy synthetic "Transit Corridor" waypoints if milestones or other waypoints exist
  if (updated.waypoints && Array.isArray(updated.waypoints)) {
    const hasMilestonesOrStops = (updated.events && updated.events.length > 1) || updated.waypoints.length > 2;
    if (hasMilestonesOrStops) {
      updated.waypoints = updated.waypoints.filter((w) => {
        if (!w || !w.name) return false;
        return !w.name.toLowerCase().includes('transit corridor');
      });
    }
  }

  return updated;
}

export const storageService = {
  // ================= REAL-TIME FIRESTORE SUBSCRIPTIONS =================
  subscribeToShipments(callback: (shipments: Shipment[]) => void): Unsubscribe {
    shipmentListeners.add(callback);
    // Emit current local state immediately
    callback(storageService.getShipments());

    let firestoreUnsub: Unsubscribe = () => {};
    try {
      const shipmentsColl = collection(db, 'shipments');
      firestoreUnsub = onSnapshot(
        shipmentsColl,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs
              .map((d) => sanitizeShipmentRecord(d.data() as Shipment))
              .filter((s) => !isShipmentDeleted(s));
            localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(list));
            notifyShipmentSubscribers(list);
          } else {
            const local = storageService.getShipments();
            notifyShipmentSubscribers(local);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'shipments');
          callback(storageService.getShipments());
        }
      );
    } catch (e) {
      console.warn('Firestore subscribe error', e);
      callback(storageService.getShipments());
    }

    return () => {
      shipmentListeners.delete(callback);
      firestoreUnsub();
    };
  },

  subscribeToQuotes(callback: (quotes: QuoteRequest[]) => void): Unsubscribe {
    quoteListeners.add(callback);
    // Emit current local state immediately
    callback(storageService.getQuotes());

    let firestoreUnsub: Unsubscribe = () => {};
    try {
      const quotesColl = collection(db, 'quotes');
      firestoreUnsub = onSnapshot(
        quotesColl,
        (snapshot) => {
          if (!snapshot.empty) {
            const list = snapshot.docs
              .map((d) => d.data() as QuoteRequest)
              .filter((q) => !isQuoteDeleted(q));
            localStorage.setItem(QUOTES_KEY, JSON.stringify(list));
            notifyQuoteSubscribers(list);
          } else {
            notifyQuoteSubscribers(storageService.getQuotes());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'quotes');
          callback(storageService.getQuotes());
        }
      );
    } catch (e) {
      console.warn('Firestore subscribe quotes error', e);
      callback(storageService.getQuotes());
    }

    return () => {
      quoteListeners.delete(callback);
      firestoreUnsub();
    };
  },

  subscribeToMessages(callback: (messages: ContactMessage[]) => void): Unsubscribe {
    messageListeners.add(callback);
    callback(storageService.getContactMessages());

    let firestoreUnsub: Unsubscribe = () => {};
    try {
      const messagesColl = collection(db, 'messages');
      firestoreUnsub = onSnapshot(
        messagesColl,
        (snapshot) => {
          if (!snapshot.empty) {
            const deletedKeys = getDeletedMessageKeys();
            const list = snapshot.docs
              .map((d) => d.data() as ContactMessage)
              .filter((m) => !deletedKeys.has(m.id));
            localStorage.setItem(MESSAGES_KEY, JSON.stringify(list));
            notifyMessageSubscribers(list);
          } else {
            notifyMessageSubscribers(storageService.getContactMessages());
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'messages');
          callback(storageService.getContactMessages());
        }
      );
    } catch (e) {
      console.warn('Firestore subscribe messages error', e);
      callback(storageService.getContactMessages());
    }

    return () => {
      messageListeners.delete(callback);
      firestoreUnsub();
    };
  },

  // ================= SHIPMENTS =================
  getShipments(): Shipment[] {
    try {
      const data = localStorage.getItem(SHIPMENTS_KEY);
      if (!data) {
        localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(INITIAL_SHIPMENTS));
        return INITIAL_SHIPMENTS.map(sanitizeShipmentRecord).filter((s) => !isShipmentDeleted(s));
      }
      const parsed: Shipment[] = JSON.parse(data);
      return parsed.map(sanitizeShipmentRecord).filter((s) => !isShipmentDeleted(s));
    } catch {
      return INITIAL_SHIPMENTS.map(sanitizeShipmentRecord).filter((s) => !isShipmentDeleted(s));
    }
  },

  async fetchShipmentsFromFirestore(): Promise<Shipment[]> {
    try {
      const snap = await getDocs(collection(db, 'shipments'));
      if (snap.empty) {
        const local = this.getShipments();
        for (const s of local) {
          await setDoc(doc(db, 'shipments', s.id), s);
        }
        return local;
      }
      const remoteShipments = snap.docs
        .map((d) => sanitizeShipmentRecord(d.data() as Shipment))
        .filter((s) => !isShipmentDeleted(s));
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(remoteShipments));
      return remoteShipments;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'shipments');
      return this.getShipments();
    }
  },

  getShipmentByTracking(trackingNumber: string): Shipment | null {
    if (!trackingNumber) return null;
    const cleanQuery = trackingNumber.trim().toUpperCase();
    const shipments = this.getShipments();
    const found = shipments.find(
      (s) =>
        s.trackingNumber?.toUpperCase() === cleanQuery ||
        s.id?.toUpperCase() === cleanQuery ||
        s.barcodeValue?.toUpperCase() === cleanQuery ||
        s.carrierReference?.toUpperCase() === cleanQuery ||
        s.containerNumber?.toUpperCase() === cleanQuery
    );
    return found || null;
  },

  async fetchShipmentByTrackingAsync(trackingNumber: string): Promise<Shipment | null> {
    if (!trackingNumber) return null;
    const clean = trackingNumber.trim().toUpperCase();
    
    // First try direct document lookup if ID or trackingNumber matches document key
    try {
      const directDoc = await getDoc(doc(db, 'shipments', trackingNumber));
      if (directDoc.exists()) {
        const found = directDoc.data() as Shipment;
        this.saveShipmentLocal(found);
        return found;
      }
    } catch {
      // Continue to full scan
    }

    try {
      const snap = await getDocs(collection(db, 'shipments'));
      const matchDoc = snap.docs.find((d) => {
        const data = d.data() as Shipment;
        return (
          data.trackingNumber?.toUpperCase() === clean ||
          d.id?.toUpperCase() === clean ||
          data.id?.toUpperCase() === clean ||
          data.barcodeValue?.toUpperCase() === clean ||
          data.carrierReference?.toUpperCase() === clean ||
          data.containerNumber?.toUpperCase() === clean
        );
      });
      if (matchDoc) {
        const found = matchDoc.data() as Shipment;
        this.saveShipmentLocal(found);
        return found;
      }
    } catch (err) {
      console.warn('Firestore tracking lookup fallback', err);
    }

    // Fallback to local memory / cache
    return this.getShipmentByTracking(trackingNumber);
  },

  saveShipmentLocal(shipment: Shipment): void {
    const sanitized = sanitizeShipmentRecord(shipment);
    const shipments = this.getShipments();
    const index = shipments.findIndex((s) => s.id === sanitized.id);
    if (index >= 0) {
      shipments[index] = sanitized;
    } else {
      shipments.unshift(sanitized);
    }
    try {
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(shipments));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  saveShipment(shipment: Shipment): void {
    const sanitized = sanitizeShipmentRecord(shipment);
    this.saveShipmentLocal(sanitized);

    // Direct Firestore sync
    setDoc(doc(db, 'shipments', sanitized.id), cleanForFirestore(sanitized)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `shipments/${sanitized.id}`);
    });
  },

  createShipment(shipmentData: Omit<Shipment, 'id'> & { id?: string }): Shipment {
    const shipments = this.getShipments();
    const newShipment: Shipment = sanitizeShipmentRecord({
      ...shipmentData,
      id: shipmentData.id || `shp-${Date.now().toString().slice(-6)}`,
    });
    shipments.unshift(newShipment);
    try {
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(shipments));
    } catch (e) {
      console.error('Storage error', e);
    }

    // Direct Firestore write
    setDoc(doc(db, 'shipments', newShipment.id), cleanForFirestore(newShipment)).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `shipments/${newShipment.id}`);
    });

    return newShipment;
  },

  updateShipment(id: string, updates: Partial<Shipment>): Shipment | null {
    const shipments = this.getShipments();
    const index = shipments.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const merged = sanitizeShipmentRecord({ ...shipments[index], ...updates });
    shipments[index] = merged;
    try {
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(shipments));
    } catch (e) {
      console.error('Storage error', e);
    }

    // Firestore update
    updateDoc(doc(db, 'shipments', id), cleanForFirestore(updates) as { [x: string]: any }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `shipments/${id}`);
    });

    return shipments[index];
  },

  async deleteShipment(idOrTracking: string): Promise<boolean> {
    if (!idOrTracking) return false;
    const clean = idOrTracking.trim().toUpperCase();
    const current = this.getShipments();
    const target = current.find(
      (s) => s.id.toUpperCase() === clean || s.trackingNumber.toUpperCase() === clean
    );
    const idToDelete = target ? target.id : idOrTracking;
    const trackingToDelete = target ? target.trackingNumber : idOrTracking;

    // 1. Mark in tombstone set so it can never resurrect
    markShipmentDeleted(idToDelete, trackingToDelete);

    // 2. Remove from local list
    const remaining = current.filter(
      (s) => s.id.toUpperCase() !== clean && s.trackingNumber.toUpperCase() !== clean
    );
    try {
      localStorage.setItem(SHIPMENTS_KEY, JSON.stringify(remaining));
    } catch (e) {
      console.error('Storage error', e);
    }

    // 3. Immediately broadcast to all local subscribers
    notifyShipmentSubscribers(remaining);

    // 4. Delete from Firestore asynchronously
    try {
      await deleteDoc(doc(db, 'shipments', idToDelete));
      if (trackingToDelete && trackingToDelete !== idToDelete) {
        await deleteDoc(doc(db, 'shipments', trackingToDelete)).catch(() => {});
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `shipments/${idToDelete}`);
    }

    return true;
  },

  addTrackingEvent(shipmentId: string, event: Omit<TrackingEvent, 'id'>): Shipment | null {
    const shipments = this.getShipments();
    const shipment = shipments.find((s) => s.id === shipmentId);
    if (!shipment) return null;

    const newEvent: TrackingEvent = {
      ...event,
      id: `ev-${Date.now()}`,
    };

    shipment.events.unshift(newEvent);
    shipment.status = event.status;
    shipment.lastUpdated = `${event.date} ${event.time}`;

    if (event.status === 'Delivered') {
      shipment.progressPercent = 100;
    }

    this.saveShipment(shipment);
    return shipment;
  },

  // ================= QUOTE REQUESTS =================
  getQuotes(): QuoteRequest[] {
    try {
      const data = localStorage.getItem(QUOTES_KEY);
      if (!data) {
        const initialQuotes: QuoteRequest[] = [
          {
            id: 'quote-001',
            referenceNumber: 'QT-2026-00124',
            createdAt: '2026-08-20T14:20:00Z',
            fullName: 'Alexander Wright',
            companyName: 'Quantum Robotics Ltd',
            email: 'a.wright@quantum-robotics.co.uk',
            phone: '+44 20 7946 0912',
            originCity: 'Manchester',
            originCountry: 'United Kingdom',
            destCity: 'Tokyo',
            destCountry: 'Japan',
            service: 'Air Freight',
            cargoType: 'Precision Industrial Automation Arms',
            cargoDescription: 'High-precision robotic manipulator arms in climate-sealed shockproof flight cases.',
            packageType: 'Crate',
            pieces: 4,
            weightKg: 3400,
            volumeCbm: 4.92,
            dimensions: { lengthCm: 220, widthCm: 140, heightCm: 160 },
            declaredValue: 245000,
            declaredValueCurrency: 'USD',
            specialRequirements: ['Temperature-Monitored', 'High-Value Security Escort', 'Customs Brokerage Assistance'],
            status: 'Under Review',
            estimatedCostUsd: 18450,
            estimatedTransitDays: 3,
            pricing: {
              currency: 'USD',
              subtotal: 17200,
              discountTotal: 500,
              taxTotal: 1750,
              totalAmount: 18450,
              transitTimeDays: 3,
              validUntil: '2026-09-10',
              paymentTerms: 'Net 30 Days / Corporate Settlement',
              pricingNotes: 'Includes dedicated charter space and tarmac security supervision at Tokyo Haneda.',
              lineItems: [
                { id: 'ch-01', category: 'freight', description: 'Air Freight Linehaul (MAN -> HND)', amount: 14200 },
                { id: 'ch-02', category: 'fuel', description: 'Bunker & Fuel Surcharge (FSC/BAF)', amount: 1400 },
                { id: 'ch-03', category: 'handling', description: 'Airport Terminal Handling (THC)', amount: 650 },
                { id: 'ch-04', category: 'insurance', description: 'All-Risk Marine & Air Cargo Insurance ($250k valuation)', amount: 550 },
                { id: 'ch-05', category: 'customs', description: 'Export Customs Declarations & Carnet Brokerage', amount: 400 },
                { id: 'ch-06', category: 'tax', description: 'Regulatory Security Surcharge & Airport Duties', amount: 1750 },
                { id: 'ch-07', category: 'discount', description: 'Corporate High-Volume Partner Discount', amount: -500 },
              ],
            },
            activityLog: [
              {
                id: 'act-1',
                timestamp: '2026-08-20T14:20:00Z',
                actor: 'Customer',
                actorName: 'Alexander Wright',
                action: 'Quote Requested',
                details: 'Submitted request for 3,400 kg precision automation arms via Air Freight.',
              },
              {
                id: 'act-2',
                timestamp: '2026-08-21T08:30:00Z',
                actor: 'Admin',
                actorName: 'Operations Lead',
                action: 'Status Changed to Under Review',
                details: 'Routing feasibility and tarmac charter space checked with Frankfurt dispatch desk.',
              },
            ],
          },
          {
            id: 'quote-002',
            referenceNumber: 'QT-2026-00189',
            createdAt: '2026-08-21T09:15:00Z',
            fullName: 'Clara Lindemann',
            companyName: 'Bavaria Solar AG',
            email: 'c.lindemann@bavariasolar.de',
            phone: '+49 89 2018 440',
            originCity: 'Hamburg',
            originCountry: 'Germany',
            destCity: 'Houston',
            destCountry: 'United States',
            service: 'Ocean Freight',
            cargoType: 'Commercial Solar Inverter Skids (4x 40ft High Cube)',
            packageType: 'Container',
            pieces: 4,
            weightKg: 38000,
            volumeCbm: 260,
            dimensions: { lengthCm: 1200, widthCm: 240, heightCm: 260 },
            declaredValue: 520000,
            declaredValueCurrency: 'USD',
            specialRequirements: ['Customs Clearance Assistance', 'Port Drayage'],
            status: 'Sent',
            sentAt: '2026-08-21T11:45:00Z',
            sentBy: 'NEXORA Rate Desk',
            validUntil: '2026-09-04',
            estimatedCostUsd: 14200,
            estimatedTransitDays: 16,
            pricing: {
              currency: 'USD',
              subtotal: 12800,
              discountTotal: 0,
              taxTotal: 1400,
              totalAmount: 14200,
              transitTimeDays: 16,
              validUntil: '2026-09-04',
              paymentTerms: 'Bill of Lading Release Upon Payment',
              pricingNotes: 'Fixed bunker adjustment factor locked for 14 calendar days.',
              lineItems: [
                { id: 'ch-11', category: 'freight', description: 'Ocean Freight FCL (Hamburg -> Houston 4x40HC)', amount: 9800 },
                { id: 'ch-12', category: 'fuel', description: 'Low Sulfur Fuel Recovery (LSS/BAF)', amount: 1500 },
                { id: 'ch-13', category: 'handling', description: 'Terminal Handling Charges (Origin & Destination THC)', amount: 950 },
                { id: 'ch-14', category: 'customs', description: 'US Customs AMS Filing & ISF Entry', amount: 350 },
                { id: 'ch-15', category: 'other', description: 'Chassis & Port Congestion Mitigation Fee', amount: 200 },
                { id: 'ch-16', category: 'tax', description: 'Harbor Maintenance & Merchandise Processing Fees', amount: 1400 },
              ],
            },
            activityLog: [
              {
                id: 'act-11',
                timestamp: '2026-08-21T09:15:00Z',
                actor: 'Customer',
                actorName: 'Clara Lindemann',
                action: 'Quote Requested',
                details: 'Submitted request for 4x 40ft High Cube containers.',
              },
              {
                id: 'act-12',
                timestamp: '2026-08-21T11:45:00Z',
                actor: 'Admin',
                actorName: 'Pricing Lead',
                action: 'Official Proposal Sent to Customer',
                details: 'Sent binding itemized quote for $14,200 USD valid until Sept 4, 2026.',
              },
            ],
          },
        ];
        localStorage.setItem(QUOTES_KEY, JSON.stringify(initialQuotes));
        return initialQuotes.filter((q) => !isQuoteDeleted(q));
      }
      const parsed: QuoteRequest[] = JSON.parse(data);
      // Ensure all stored quotes have referenceNumber and activityLog
      let hasChanges = false;
      parsed.forEach((q, idx) => {
        if (!q.referenceNumber) {
          q.referenceNumber = `QT-2026-${(10000 + idx).toString().slice(-5)}`;
          hasChanges = true;
        }
        if (!q.activityLog) {
          q.activityLog = [
            {
              id: `act-init-${idx}`,
              timestamp: q.createdAt || new Date().toISOString(),
              actor: 'Customer',
              actorName: q.fullName,
              action: 'Quote Requested',
              details: `Initial freight quote submission for ${q.service}.`,
            },
          ];
          hasChanges = true;
        }
        // Normalize legacy statuses
        if ((q.status as string) === 'Pending') {
          q.status = 'Pending Review';
          hasChanges = true;
        } else if ((q.status as string) === 'Reviewing') {
          q.status = 'Under Review';
          hasChanges = true;
        } else if ((q.status as string) === 'Quoted') {
          q.status = 'Sent';
          hasChanges = true;
        } else if ((q.status as string) === 'Booked') {
          q.status = 'Accepted';
          hasChanges = true;
        }
      });
      if (hasChanges) {
        localStorage.setItem(QUOTES_KEY, JSON.stringify(parsed));
      }
      return parsed.filter((q) => !isQuoteDeleted(q));
    } catch {
      return [];
    }
  },

  async fetchQuotesFromFirestore(): Promise<QuoteRequest[]> {
    try {
      const snap = await getDocs(collection(db, 'quotes'));
      if (snap.empty) {
        const local = this.getQuotes();
        for (const q of local) {
          await setDoc(doc(db, 'quotes', q.id), q);
        }
        return local;
      }
      const remoteQuotes = snap.docs.map((d) => d.data() as QuoteRequest);
      localStorage.setItem(QUOTES_KEY, JSON.stringify(remoteQuotes));
      return remoteQuotes;
    } catch (err) {
      handleFirestoreError(err, OperationType.LIST, 'quotes');
      return this.getQuotes();
    }
  },

  getQuoteById(id: string): QuoteRequest | null {
    if (!id) return null;
    const quotes = this.getQuotes();
    const cleanId = id.trim().toLowerCase();
    return quotes.find((q) => q.id.toLowerCase() === cleanId || q.referenceNumber?.toLowerCase() === cleanId) || null;
  },

  getQuoteByReference(refOrId: string): QuoteRequest | null {
    if (!refOrId) return null;
    const clean = refOrId.trim().toLowerCase();
    const quotes = this.getQuotes();
    return quotes.find(
      (q) =>
        q.referenceNumber?.toLowerCase() === clean ||
        q.id.toLowerCase() === clean
    ) || null;
  },

  async fetchQuoteByReferenceAsync(refOrId: string): Promise<QuoteRequest | null> {
    if (!refOrId) return null;
    const clean = refOrId.trim();

    // 1. Try local cache first for instant load
    const cached = this.getQuoteByReference(clean);

    // 2. Query Firestore if available
    try {
      // Direct doc lookup
      const directDoc = await getDoc(doc(db, 'quotes', clean));
      if (directDoc.exists()) {
        const data = directDoc.data() as QuoteRequest;
        this.saveQuoteLocal(data);
        return data;
      }

      // Query collection
      const snap = await getDocs(collection(db, 'quotes'));
      const found = snap.docs.find((d) => {
        const data = d.data() as QuoteRequest;
        return (
          data.referenceNumber?.toUpperCase() === clean.toUpperCase() ||
          d.id.toUpperCase() === clean.toUpperCase() ||
          data.id.toUpperCase() === clean.toUpperCase()
        );
      });

      if (found) {
        const data = found.data() as QuoteRequest;
        this.saveQuoteLocal(data);
        return data;
      }
    } catch (e) {
      console.warn('Firestore quote fetch fallback', e);
    }

    return cached;
  },

  saveQuoteLocal(quote: QuoteRequest): void {
    const quotes = this.getQuotes();
    const index = quotes.findIndex((q) => q.id === quote.id || (q.referenceNumber && q.referenceNumber === quote.referenceNumber));
    if (index >= 0) {
      quotes[index] = quote;
    } else {
      quotes.unshift(quote);
    }
    try {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Storage error', e);
    }
  },

  saveQuote(quote: QuoteRequest): void {
    this.saveQuoteLocal(quote);
    setDoc(doc(db, 'quotes', quote.id), cleanForFirestore(quote)).catch((err) => {
      handleFirestoreError(err, OperationType.WRITE, `quotes/${quote.id}`);
    });
  },

  createQuote(
    quoteData: Omit<QuoteRequest, 'id' | 'createdAt' | 'status' | 'referenceNumber' | 'activityLog'> & {
      referenceNumber?: string;
    }
  ): QuoteRequest {
    const quotes = this.getQuotes();
    const refNumber = quoteData.referenceNumber || generateDynamicQuoteReference();
    const newQuote: QuoteRequest = {
      ...quoteData,
      id: `qt-${Date.now().toString().slice(-6)}`,
      referenceNumber: refNumber,
      createdAt: new Date().toISOString(),
      status: 'Pending Review',
      activityLog: [
        {
          id: `act-${Date.now()}`,
          timestamp: new Date().toISOString(),
          actor: 'Customer',
          actorName: quoteData.fullName,
          action: 'Quote Requested',
          details: `Requested rate quote for ${quoteData.service} (${quoteData.originCity} → ${quoteData.destCity})`,
        },
      ],
    };
    quotes.unshift(newQuote);
    try {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Storage error', e);
    }

    // Direct Firestore write with undefined fields stripped
    setDoc(doc(db, 'quotes', newQuote.id), cleanForFirestore(newQuote)).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `quotes/${newQuote.id}`);
    });

    return newQuote;
  },

  updateQuote(
    id: string,
    updates: Partial<QuoteRequest>,
    actor: 'Customer' | 'Admin' | 'System' = 'Admin',
    actionDesc?: string
  ): QuoteRequest | null {
    const quotes = this.getQuotes();
    const index = quotes.findIndex((q) => q.id === id || q.referenceNumber === id);
    if (index === -1) return null;

    const current = quotes[index];
    const newLogs = [...(current.activityLog || [])];

    if (actionDesc) {
      newLogs.unshift({
        id: `act-${Date.now()}`,
        timestamp: new Date().toISOString(),
        actor,
        actorName: actor === 'Admin' ? 'Logistics Operations' : current.fullName,
        action: actionDesc,
        details: updates.status ? `Status updated to ${updates.status}.` : undefined,
      });
    }

    const updated: QuoteRequest = {
      ...current,
      ...updates,
      updatedAt: new Date().toISOString(),
      activityLog: newLogs,
    };

    quotes[index] = updated;
    try {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(quotes));
    } catch (e) {
      console.error('Storage error', e);
    }

    // Direct Firestore update with undefined fields stripped
    updateDoc(doc(db, 'quotes', updated.id), cleanForFirestore(updated) as unknown as { [x: string]: any }).catch((err) => {
      handleFirestoreError(err, OperationType.UPDATE, `quotes/${updated.id}`);
    });

    return updated;
  },

  updateQuoteStatus(quoteId: string, status: QuoteStatus): void {
    this.updateQuote(quoteId, { status }, 'Admin', `Status updated to ${status}`);
  },

  sendQuoteToCustomer(
    quoteId: string,
    pricing: QuotePriceBreakdown,
    validUntil?: string,
    adminNotes?: string
  ): QuoteRequest | null {
    const quote = this.getQuoteById(quoteId);
    if (!quote) return null;

    const expiry = validUntil || pricing.validUntil || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const updatedPricing: QuotePriceBreakdown = {
      ...pricing,
      validUntil: expiry,
      pricingNotes: adminNotes || pricing.pricingNotes,
    };

    return this.updateQuote(
      quote.id,
      {
        status: 'Sent',
        pricing: updatedPricing,
        validUntil: expiry,
        sentAt: new Date().toISOString(),
        sentBy: 'NEXORA Rate & Pricing Desk',
        internalAdminNotes: adminNotes || quote.internalAdminNotes,
      },
      'Admin',
      `Official Proposal Dispatched (${updatedPricing.currency} ${updatedPricing.totalAmount.toLocaleString()})`
    );
  },

  acceptQuote(
    quoteId: string,
    acceptedByName: string,
    customerNotes?: string
  ): { success: boolean; quote?: QuoteRequest; error?: string } {
    const quote = this.getQuoteById(quoteId);
    if (!quote) {
      return { success: false, error: 'Quote not found.' };
    }

    if (quote.status === 'Accepted') {
      return { success: true, quote };
    }

    if (quote.status === 'Cancelled' || quote.status === 'Declined') {
      return { success: false, error: `Quote is currently marked as ${quote.status} and cannot be accepted.` };
    }

    // Check if expired
    if (quote.validUntil) {
      const today = new Date().toISOString().split('T')[0];
      if (quote.validUntil < today) {
        this.updateQuote(quote.id, { status: 'Expired' }, 'System', 'Quote marked as Expired past validity date.');
        return { success: false, error: 'This quote proposal has expired. Please request a refreshed rate calculation.' };
      }
    }

    const updated = this.updateQuote(
      quote.id,
      {
        status: 'Accepted',
        acceptedAt: new Date().toISOString(),
        acceptedByName: acceptedByName.trim(),
        acceptanceNotes: customerNotes?.trim(),
      },
      'Customer',
      `Proposal Formally Accepted by ${acceptedByName.trim()}`
    );

    return { success: true, quote: updated || undefined };
  },

  declineQuote(
    quoteId: string,
    reason?: string
  ): { success: boolean; quote?: QuoteRequest; error?: string } {
    const quote = this.getQuoteById(quoteId);
    if (!quote) {
      return { success: false, error: 'Quote not found.' };
    }

    if (quote.status === 'Accepted') {
      return { success: false, error: 'This quote was already accepted and cannot be declined.' };
    }

    const updated = this.updateQuote(
      quote.id,
      {
        status: 'Declined',
        declinedAt: new Date().toISOString(),
        declinedReason: reason?.trim() || 'No reason specified',
      },
      'Customer',
      `Proposal Declined by Customer${reason ? `: "${reason.trim()}"` : ''}`
    );

    return { success: true, quote: updated || undefined };
  },

  convertQuoteToShipment(
    quoteId: string,
    shipmentId: string,
    trackingNumber: string
  ): QuoteRequest | null {
    return this.updateQuote(
      quoteId,
      {
        convertedShipmentId: shipmentId,
        convertedTrackingNumber: trackingNumber,
      },
      'Admin',
      `Converted to Live Consignment #${trackingNumber}`
    );
  },

  async deleteQuote(idOrRef: string): Promise<boolean> {
    if (!idOrRef) return false;
    const clean = idOrRef.trim().toUpperCase();
    const current = this.getQuotes();
    const target = current.find(
      (q) => q.id.toUpperCase() === clean || (q.referenceNumber && q.referenceNumber.toUpperCase() === clean)
    );
    const idToDelete = target ? target.id : idOrRef;
    const refToDelete = target ? target.referenceNumber : idOrRef;

    // 1. Mark in tombstone set
    markQuoteDeleted(idToDelete, refToDelete);

    // 2. Remove from local list
    const remaining = current.filter(
      (q) => q.id.toUpperCase() !== clean && (q.referenceNumber ? q.referenceNumber.toUpperCase() !== clean : true)
    );
    try {
      localStorage.setItem(QUOTES_KEY, JSON.stringify(remaining));
    } catch (e) {
      console.error('Storage error', e);
    }

    // 3. Immediately broadcast to all local subscribers
    notifyQuoteSubscribers(remaining);

    // 4. Delete from Firestore asynchronously
    try {
      await deleteDoc(doc(db, 'quotes', idToDelete));
      if (refToDelete && refToDelete !== idToDelete) {
        await deleteDoc(doc(db, 'quotes', refToDelete)).catch(() => {});
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `quotes/${idToDelete}`);
    }

    return true;
  },

  // ================= CONTACT MESSAGES =================
  getMessages(): ContactMessage[] {
    return this.getContactMessages();
  },

  getContactMessages(): ContactMessage[] {
    try {
      const data = localStorage.getItem(MESSAGES_KEY);
      if (!data) {
        const initialMessages: ContactMessage[] = [
          {
            id: 'msg-01',
            createdAt: '2026-08-21 11:00 UTC',
            name: 'Dr. Hiroshi Tanaka',
            email: 'h.tanaka@kyotobio.jp',
            phone: '+81 75 311 0099',
            company: 'Kyoto Biomaterials Lab',
            department: 'Customer Support',
            subject: 'Inquiry on Cryogenic Air Charters from Osaka to Zurich',
            message:
              'We are preparing a phase 3 clinical sample transport needing constant -80C validation. Can your team confirm dry ice replenishment stops?',
            status: 'Unread',
          },
          {
            id: 'msg-02',
            createdAt: '2026-08-20 16:45 UTC',
            name: 'Sofia Al-Nuaimi',
            email: 'sofia@gulfsupplychain.ae',
            phone: '+971 50 123 4567',
            company: 'Gulf Horizon Logistics',
            department: 'Sales & Rates',
            subject: 'Long-term 4PL Control Tower Partnership RFP',
            message:
              'We would like to schedule a demonstration with your CyberFreight logistics engineering team for our regional GCC distribution network.',
            status: 'Read',
          },
        ];
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(initialMessages));
        return initialMessages;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  createContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): ContactMessage {
    const messages = this.getContactMessages();
    const newMessage: ContactMessage = {
      ...msg,
      id: `msg-${Date.now().toString().slice(-6)}`,
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 16) + ' UTC',
      status: 'Unread',
    };
    messages.unshift(newMessage);
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Storage error', e);
    }

    setDoc(doc(db, 'messages', newMessage.id), cleanForFirestore(newMessage)).catch((err) => {
      handleFirestoreError(err, OperationType.CREATE, `messages/${newMessage.id}`);
    });

    return newMessage;
  },

  createMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>): ContactMessage {
    return this.createContactMessage(msg);
  },

  updateMessageStatus(id: string, status: ContactMessage['status']): void {
    const messages = this.getContactMessages();
    const m = messages.find((item) => item.id === id);
    if (m) {
      m.status = status;
      try {
        localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
      } catch (e) {
        console.error('Storage error', e);
      }

      updateDoc(doc(db, 'messages', id), cleanForFirestore({ status })).catch((err) => {
        handleFirestoreError(err, OperationType.UPDATE, `messages/${id}`);
      });
    }
  },

  async deleteMessage(id: string): Promise<boolean> {
    if (!id) return false;
    markMessageDeleted(id);
    const messages = this.getContactMessages().filter((m) => m.id !== id);
    try {
      localStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error('Storage error', e);
    }

    notifyMessageSubscribers(messages);

    try {
      await deleteDoc(doc(db, 'messages', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `messages/${id}`);
    }

    return true;
  },

  // ================= NEWSLETTER =================
  getSubscribers(): string[] {
    try {
      const data = localStorage.getItem(SUBSCRIBERS_KEY);
      if (!data) {
        const initialSubs = [
          'supplychain.lead@tesla.com',
          'director.trade@maersk-client.dk',
          'logistics@astrazeneca.com',
        ];
        localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(initialSubs));
        return initialSubs;
      }
      return JSON.parse(data);
    } catch {
      return [];
    }
  },

  async deleteSubscriber(email: string): Promise<boolean> {
    if (!email) return false;
    const cleanEmail = email.toLowerCase().trim();
    const subs = this.getSubscribers().filter((s) => s.toLowerCase().trim() !== cleanEmail);
    try {
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
    } catch (e) {
      console.error('Storage error', e);
    }

    const subId = cleanEmail.replace(/[^a-z0-9]/g, '_');
    try {
      await deleteDoc(doc(db, 'subscribers', subId));
    } catch (err) {
      console.warn('Subscriber delete error', err);
    }

    return true;
  },

  addSubscriber(email: string): boolean {
    const subs = this.getSubscribers();
    if (subs.includes(email.toLowerCase())) {
      return false;
    }
    subs.unshift(email.toLowerCase());
    try {
      localStorage.setItem(SUBSCRIBERS_KEY, JSON.stringify(subs));
    } catch (e) {
      console.error('Storage error', e);
    }

    const subId = email.toLowerCase().replace(/[^a-z0-9]/g, '_');
    setDoc(doc(db, 'subscribers', subId), cleanForFirestore({
      email: email.toLowerCase(),
      subscribedAt: new Date().toISOString(),
    })).catch((err) => {
      console.warn('Subscriber firestore error', err);
    });

    return true;
  },

  // ================= BLOGS =================
  getBlogs(): BlogPost[] {
    try {
      const data = localStorage.getItem(BLOGS_KEY);
      if (!data) {
        localStorage.setItem(BLOGS_KEY, JSON.stringify(BLOG_POSTS_DATA));
        return BLOG_POSTS_DATA;
      }
      return JSON.parse(data);
    } catch {
      return BLOG_POSTS_DATA;
    }
  },

  saveBlog(blog: BlogPost): void {
    const blogs = this.getBlogs();
    const index = blogs.findIndex((b) => b.id === blog.id || b.slug === blog.slug);
    if (index >= 0) {
      blogs[index] = blog;
    } else {
      blogs.unshift(blog);
    }
    try {
      localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
    } catch (e) {
      console.error('Storage error', e);
    }
    notifyBlogSubscribers(blogs);
  },

  deleteBlog(id: string): boolean {
    if (!id) return false;
    const blogs = this.getBlogs().filter((b) => b.id !== id);
    try {
      localStorage.setItem(BLOGS_KEY, JSON.stringify(blogs));
    } catch (e) {
      console.error('Storage error', e);
    }
    notifyBlogSubscribers(blogs);
    return true;
  },

  // ================= COMPANY INFO & CORPORATE PROFILE =================
  subscribeToCompanyInfo(callback: (info: CompanyInfo) => void): Unsubscribe {
    try {
      const companyDocRef = doc(db, 'company_info', 'primary');
      return onSnapshot(
        companyDocRef,
        (snapshot) => {
          if (snapshot.exists()) {
            const data = snapshot.data() as CompanyInfo;
            localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(data));
            callback(data);
          } else {
            const local = storageService.getCompanyInfo();
            callback(local);
          }
        },
        (err) => {
          console.warn('CompanyInfo subscription warning:', err);
          callback(storageService.getCompanyInfo());
        }
      );
    } catch {
      callback(storageService.getCompanyInfo());
      return () => {};
    }
  },

  getCompanyInfo(): CompanyInfo {
    try {
      const data = localStorage.getItem(COMPANY_INFO_KEY);
      if (!data) {
        localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(DEFAULT_COMPANY_INFO));
        return DEFAULT_COMPANY_INFO;
      }
      const parsed: CompanyInfo = { ...DEFAULT_COMPANY_INFO, ...JSON.parse(data) };
      
      // Auto-upgrade unowned placeholder addresses to real admin email
      if (!parsed.primaryEmail || parsed.primaryEmail === 'operations@nexoralogistics.com') {
        parsed.primaryEmail = DEFAULT_COMPANY_INFO.primaryEmail;
      }
      if (!parsed.supportEmail || parsed.supportEmail === 'support@nexoralogistics.com') {
        parsed.supportEmail = DEFAULT_COMPANY_INFO.supportEmail;
      }
      if (!parsed.quotesEmail || parsed.quotesEmail === 'quotes@nexoralogistics.com') {
        parsed.quotesEmail = DEFAULT_COMPANY_INFO.quotesEmail;
      }
      
      return {
        ...parsed,
        primaryEmail: parsed.primaryEmail || DEFAULT_COMPANY_INFO.primaryEmail,
        supportEmail: parsed.supportEmail || DEFAULT_COMPANY_INFO.supportEmail,
        quotesEmail: parsed.quotesEmail || DEFAULT_COMPANY_INFO.quotesEmail,
        customsEmail: parsed.customsEmail || DEFAULT_COMPANY_INFO.customsEmail,
        mediaEmail: parsed.mediaEmail || DEFAULT_COMPANY_INFO.mediaEmail,
      };
    } catch {
      return DEFAULT_COMPANY_INFO;
    }
  },

  async saveCompanyInfo(info: CompanyInfo): Promise<void> {
    const updated: CompanyInfo = {
      ...info,
      id: 'primary',
      lastUpdated: new Date().toISOString(),
    };

    try {
      localStorage.setItem(COMPANY_INFO_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Storage error', e);
    }

    try {
      await setDoc(doc(db, 'company_info', 'primary'), cleanForFirestore(updated));
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, 'company_info/primary');
    }
  },

  async resetCompanyInfo(): Promise<CompanyInfo> {
    const resetData: CompanyInfo = {
      ...DEFAULT_COMPANY_INFO,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'System Reset',
    };
    await this.saveCompanyInfo(resetData);
    return resetData;
  },

  resetAllData(): void {
    localStorage.removeItem(DELETED_SHIPMENTS_KEY);
    localStorage.removeItem(DELETED_QUOTES_KEY);
    localStorage.removeItem(DELETED_MESSAGES_KEY);
    localStorage.removeItem(SHIPMENTS_KEY);
    localStorage.removeItem(QUOTES_KEY);
    localStorage.removeItem(MESSAGES_KEY);
    localStorage.removeItem(SUBSCRIBERS_KEY);
    localStorage.removeItem(BLOGS_KEY);
    localStorage.removeItem(COMPANY_INFO_KEY);

    const shipments = this.getShipments();
    const quotes = this.getQuotes();
    const msgs = this.getContactMessages();
    const blogs = this.getBlogs();

    notifyShipmentSubscribers(shipments);
    notifyQuoteSubscribers(quotes);
    notifyMessageSubscribers(msgs);
    notifyBlogSubscribers(blogs);
  },

  resetToDefaults(): void {
    this.resetAllData();
  },
};
