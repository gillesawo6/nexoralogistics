import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  EmailAuthProvider,
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  linkWithPopup,
  linkWithCredential,
  unlink,
  updatePassword,
  AuthCredential,
  UserCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { 
  getFirestore, 
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  collection,
  getDocs 
} from 'firebase/firestore';
import firebaseConfigJson from '../../firebase-applet-config.json';

// Root Administrator email configured for the deployment
export const ROOT_ADMIN_EMAIL = 'gillesawo6@gmail.com';

// Closed Authorization User Record Model
export interface AuthorizedUserRecord {
  uid: string;
  email: string;
  authorized: boolean;
  role: 'admin' | 'operations_manager' | 'dispatcher' | 'analyst' | 'operator' | 'user';
  displayName?: string;
  department?: string;
  approvedAt?: string;
  approvedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

// Web app's Firebase configuration from provisioning
export const firebaseConfig = {
  apiKey: firebaseConfigJson.apiKey,
  authDomain: firebaseConfigJson.authDomain,
  projectId: firebaseConfigJson.projectId,
  storageBucket: firebaseConfigJson.storageBucket,
  messagingSenderId: firebaseConfigJson.messagingSenderId,
  appId: firebaseConfigJson.appId,
};

// Initialize Firebase App singleton
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firestore with robust local caching and forced long-polling to prevent proxy/streaming connection timeouts
function initDb() {
  const databaseId = firebaseConfigJson.firestoreDatabaseId || '(default)';
  const settingsWithCache = {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    experimentalForceLongPolling: true,
  };

  try {
    return initializeFirestore(app, settingsWithCache, databaseId);
  } catch (err1) {
    try {
      // Fallback if IndexedDB multi-tab lock or persistent cache fails
      return initializeFirestore(app, {
        experimentalForceLongPolling: true,
      }, databaseId);
    } catch {
      // If already initialized, get instance
      return getFirestore(app, databaseId);
    }
  }
}

export const db = initDb();

export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): void {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
}

/**
 * Recursively removes all undefined values from objects and arrays
 * so Firestore setDoc, updateDoc, and addDoc never fail with:
 * "Unsupported field value: undefined".
 */
export function cleanForFirestore<T>(obj: T): T {
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj
      .filter((item) => item !== undefined)
      .map((item) => cleanForFirestore(item)) as unknown as T;
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return obj;
}

// Logistics User Profile interface stored in Firestore
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string | null;
  role: 'admin' | 'operations_manager' | 'dispatcher' | 'analyst' | 'operator' | 'user';
  department: string;
  accessLevel: string;
  status: 'active' | 'inactive' | 'suspended';
  provider: string;
  createdAt: string;
  lastLoginAt: string;
  phone?: string;
}

// Function to test connection to Firestore on boot with timeout protection
export async function testFirestoreConnection() {
  try {
    const testPromise = getDoc(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 2500));
    await Promise.race([testPromise, timeoutPromise]);
  } catch (error: any) {
    if (
      (error instanceof Error && (error.message.includes('offline') || error.message.includes('unavailable'))) ||
      error?.code === 'unavailable'
    ) {
      console.warn('Firestore operating in offline cache mode until backend reconnects.');
    }
  }
}

// Local storage key for cached authorization backup
const LOCAL_AUTH_CACHE_KEY = 'nexora_authorized_users_cache';

// Fetch all authorized users (Admin-only)
export async function fetchAuthorizedUsersList(): Promise<AuthorizedUserRecord[]> {
  try {
    const snap = await getDocs(collection(db, 'authorizedUsers'));
    const list: AuthorizedUserRecord[] = [];
    snap.forEach((d) => {
      list.push(d.data() as AuthorizedUserRecord);
    });

    if (list.length > 0) {
      localStorage.setItem(LOCAL_AUTH_CACHE_KEY, JSON.stringify(list));
    }
    return list;
  } catch (err) {
    console.warn('Firestore fetch authorizedUsers failed, checking local cache:', err);
    const cached = localStorage.getItem(LOCAL_AUTH_CACHE_KEY);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch {}
    }
    return [];
  }
}

// Save or update an authorized user document
export async function saveAuthorizedUserRecord(record: AuthorizedUserRecord): Promise<void> {
  const docRef = doc(db, 'authorizedUsers', record.uid);
  try {
    await setDoc(docRef, cleanForFirestore(record), { merge: true });
    // Update local cache
    const existing = await fetchAuthorizedUsersList();
    const index = existing.findIndex(u => u.uid === record.uid);
    if (index >= 0) {
      existing[index] = record;
    } else {
      existing.push(record);
    }
    localStorage.setItem(LOCAL_AUTH_CACHE_KEY, JSON.stringify(existing));
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `authorizedUsers/${record.uid}`);
    throw err;
  }
}

// Delete an authorized user record
export async function deleteAuthorizedUserDoc(uid: string): Promise<void> {
  const docRef = doc(db, 'authorizedUsers', uid);
  try {
    await deleteDoc(docRef);
    const existing = await fetchAuthorizedUsersList();
    const filtered = existing.filter(u => u.uid !== uid);
    localStorage.setItem(LOCAL_AUTH_CACHE_KEY, JSON.stringify(filtered));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `authorizedUsers/${uid}`);
    throw err;
  }
}

// Toggle authorization status
export async function toggleUserAuthorization(uid: string, newAuthorizedStatus: boolean): Promise<void> {
  const docRef = doc(db, 'authorizedUsers', uid);
  const now = new Date().toISOString();
  try {
    await updateDoc(docRef, cleanForFirestore({
      authorized: newAuthorizedStatus,
      updatedAt: now,
      ...(newAuthorizedStatus ? { approvedAt: now } : {})
    }));
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, `authorizedUsers/${uid}`);
    throw err;
  }
}

export { 
  EmailAuthProvider, 
  GoogleAuthProvider, 
  linkWithPopup, 
  linkWithCredential, 
  unlink, 
  updatePassword 
};
export type { AuthCredential, UserCredential, FirebaseUser };
