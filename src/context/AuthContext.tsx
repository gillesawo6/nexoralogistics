import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
  User as FirebaseUser, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  linkWithPopup,
  linkWithCredential,
  unlink,
  updatePassword,
  EmailAuthProvider,
  GoogleAuthProvider,
  AuthCredential
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { 
  auth, 
  db, 
  googleProvider, 
  UserProfile, 
  AuthorizedUserRecord, 
  ROOT_ADMIN_EMAIL,
  handleFirestoreError, 
  OperationType, 
  testFirestoreConnection,
  saveAuthorizedUserRecord,
  fetchAuthorizedUsersList,
  deleteAuthorizedUserDoc,
  toggleUserAuthorization
} from '../services/firebase';

export interface PendingConflictInfo {
  email: string;
  credential: AuthCredential | null;
  message?: string;
}

export interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  authorization: AuthorizedUserRecord | null;
  isAuthorized: boolean;
  loading: boolean;
  isCheckingAuth: boolean;
  error: string | null;
  isUnauthorizedError: boolean;
  userProviders: string[];
  hasPasswordProvider: boolean;
  hasGoogleProvider: boolean;
  pendingConflict: PendingConflictInfo | null;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  resolveAndLinkConflict: (password: string) => Promise<void>;
  clearConflict: () => void;
  linkGoogleAccount: () => Promise<void>;
  unlinkGoogleAccount: () => Promise<void>;
  linkPasswordAccount: (password: string) => Promise<void>;
  changeAccountPassword: (newPassword: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthorization: () => Promise<boolean>;
  clearError: () => void;
  // Admin User Authorization Management APIs
  getAuthorizedUsers: () => Promise<AuthorizedUserRecord[]>;
  addAuthorizedUser: (record: AuthorizedUserRecord) => Promise<void>;
  deleteAuthorizedUser: (uid: string) => Promise<void>;
  toggleAuthorization: (uid: string, authorized: boolean) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [authorization, setAuthorization] = useState<AuthorizedUserRecord | null>(null);
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUnauthorizedError, setIsUnauthorizedError] = useState(false);
  const [pendingConflict, setPendingConflict] = useState<PendingConflictInfo | null>(null);

  // Derived providers list from current Firebase User
  const userProviders = user?.providerData?.map(p => p.providerId) || [];
  const hasPasswordProvider = userProviders.includes('password');
  const hasGoogleProvider = userProviders.includes('google.com');

  // Test Firestore connection on boot
  useEffect(() => {
    testFirestoreConnection();
  }, []);

  /**
   * Evaluates if a Firebase User is explicitly authorized by an administrator.
   * Authorization is strictly UID-based: Firebase UID -> authorizedUsers/{uid}
   */
  const evaluateUserAuthorization = async (
    firebaseUser: FirebaseUser
  ): Promise<{ authorized: boolean; record: AuthorizedUserRecord | null }> => {
    const userEmail = (firebaseUser.email || '').toLowerCase().trim();
    const isRootAdmin = userEmail === ROOT_ADMIN_EMAIL.toLowerCase();

    const authDocRef = doc(db, 'authorizedUsers', firebaseUser.uid);
    try {
      const authSnap = await getDoc(authDocRef);

      if (authSnap.exists()) {
        const data = authSnap.data() as AuthorizedUserRecord;
        if (data.authorized === true) {
          return { authorized: true, record: data };
        } else {
          return { authorized: false, record: data };
        }
      }

      // If document doesn't exist by UID, check if pre-approved by email
      if (userEmail) {
        const q = query(collection(db, 'authorizedUsers'), where('email', '==', userEmail));
        const emailSnap = await getDocs(q);
        if (!emailSnap.empty) {
          const preRecord = emailSnap.docs[0].data() as AuthorizedUserRecord;
          if (preRecord.authorized === true) {
            // Update record to attach the real Firebase UID
            const syncedRecord: AuthorizedUserRecord = {
              ...preRecord,
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName || preRecord.displayName || 'Authorized Operator',
              updatedAt: new Date().toISOString()
            };
            await setDoc(authDocRef, syncedRecord);
            return { authorized: true, record: syncedRecord };
          } else {
            return { authorized: false, record: preRecord };
          }
        }
      }

      // Root Admin self-bootstrap
      if (isRootAdmin) {
        const now = new Date().toISOString();
        const rootRecord: AuthorizedUserRecord = {
          uid: firebaseUser.uid,
          email: userEmail,
          authorized: true,
          role: 'admin',
          displayName: firebaseUser.displayName || 'Principal Administrator',
          department: 'Executive Administration & Systems',
          approvedAt: now,
          approvedBy: 'SYSTEM_BOOTSTRAP',
          notes: 'Master Administrator account initialized by deployment policy.',
          createdAt: now,
          updatedAt: now
        };
        await setDoc(authDocRef, rootRecord);
        return { authorized: true, record: rootRecord };
      }

      // Not found in authorization list -> ACCESS DENIED
      return { authorized: false, record: null };
    } catch (err) {
      console.warn('Error reading authorization record:', err);
      // If root admin, allow access
      if (isRootAdmin) {
        const now = new Date().toISOString();
        return {
          authorized: true,
          record: {
            uid: firebaseUser.uid,
            email: userEmail,
            authorized: true,
            role: 'admin',
            displayName: firebaseUser.displayName || 'Principal Administrator',
            department: 'Executive Administration',
            createdAt: now
          }
        };
      }
      return { authorized: false, record: null };
    }
  };

  /**
   * Syncs the user profile in Firestore `users/{uid}` after authorization is confirmed.
   */
  const syncUserProfile = async (firebaseUser: FirebaseUser, authRecord: AuthorizedUserRecord) => {
    const userDocRef = doc(db, 'users', firebaseUser.uid);
    const now = new Date().toISOString();
    const activeProviders = firebaseUser.providerData?.map(p => p.providerId).join(', ') || 'password';
    const defaultName = firebaseUser.displayName || 
      authRecord.displayName || 
      (firebaseUser.email ? firebaseUser.email.split('@')[0].replace(/[._]/g, ' ') : 'Logistics Operator');

    const defaultProfile: UserProfile = {
      uid: firebaseUser.uid,
      email: firebaseUser.email || '',
      displayName: defaultName.charAt(0).toUpperCase() + defaultName.slice(1),
      photoURL: firebaseUser.photoURL || null,
      role: authRecord.role || 'operator',
      department: authRecord.department || 'Global Operations & Freight Dispatch',
      accessLevel: authRecord.role === 'admin' ? 'Level 4 - Operations Controller' : 'Level 2 - Dispatch Operator',
      status: 'active',
      provider: activeProviders,
      createdAt: now,
      lastLoginAt: now,
    };

    try {
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        try {
          await setDoc(userDocRef, defaultProfile);
        } catch (writeErr) {
          // Handled or queued in offline cache
        }
        setProfile(defaultProfile);
      } else {
        const existingData = userSnap.data() as UserProfile;
        const updated: UserProfile = {
          ...existingData,
          provider: activeProviders,
          role: authRecord.role || existingData.role,
          lastLoginAt: now,
          ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
          ...(firebaseUser.displayName ? { displayName: firebaseUser.displayName } : {}),
        };
        try {
          await updateDoc(userDocRef, {
            lastLoginAt: now,
            provider: activeProviders,
            role: authRecord.role || existingData.role,
            ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
            ...(firebaseUser.displayName ? { displayName: firebaseUser.displayName } : {}),
          });
        } catch (updateErr) {
          // Handled or queued in offline cache
        }
        setProfile(updated);
      }
    } catch (err) {
      // Offline fallback: set profile state locally without throwing or blocking UI
      setProfile(defaultProfile);
    }
  };

  /**
   * Main Auth state subscriber with zero-flash authorization verification
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setIsCheckingAuth(true);
        const { authorized, record } = await evaluateUserAuthorization(currentUser);

        if (authorized && record) {
          setUser(currentUser);
          setAuthorization(record);
          setIsAuthorized(true);
          setIsUnauthorizedError(false);
          await syncUserProfile(currentUser, record);
        } else {
          // Explicitly Unauthorized User:
          // 1. Prevent application access
          // 2. Sign out of Firebase Auth immediately
          // 3. Clear all authentication state
          // 4. Signal unauthorized view
          await signOut(auth);
          setUser(null);
          setProfile(null);
          setAuthorization(null);
          setIsAuthorized(false);
          setIsUnauthorizedError(true);
        }
        setIsCheckingAuth(false);
      } else {
        setUser(null);
        setProfile(null);
        setAuthorization(null);
        setIsAuthorized(false);
        setIsCheckingAuth(false);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /**
   * Email/Password login with strict closed-system authorization gate
   */
  const loginWithEmail = async (email: string, pass: string) => {
    setError(null);
    setIsUnauthorizedError(false);
    setPendingConflict(null);
    setIsCheckingAuth(true);

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pass);
      const { authorized, record } = await evaluateUserAuthorization(cred.user);

      if (!authorized || !record) {
        // Sign out immediately and reject
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setAuthorization(null);
        setIsAuthorized(false);
        setIsUnauthorizedError(true);
        throw new Error('UNAUTHORIZED_ACCESS');
      }

      setUser(cred.user);
      setAuthorization(record);
      setIsAuthorized(true);
      await syncUserProfile(cred.user, record);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_ACCESS') {
        throw new Error('UNAUTHORIZED_ACCESS');
      }

      let message = 'Failed to authenticate. Please check your credentials.';
      if (
        err.code === 'auth/user-not-found' || 
        err.code === 'auth/wrong-password' || 
        err.code === 'auth/invalid-credential'
      ) {
        message = 'Invalid email or password. Only administrator-approved operator accounts can access this console.';
      } else if (err.code === 'auth/too-many-requests') {
        message = 'Too many failed login attempts. Access temporarily restricted. Try again shortly.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  /**
   * Google Sign-In with conflict detection and strict closed-system authorization gate
   */
  const loginWithGoogle = async () => {
    setError(null);
    setIsUnauthorizedError(false);
    setPendingConflict(null);
    setIsCheckingAuth(true);

    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const { authorized, record } = await evaluateUserAuthorization(cred.user);

      if (!authorized || !record) {
        // Sign out immediately and reject
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setAuthorization(null);
        setIsAuthorized(false);
        setIsUnauthorizedError(true);
        throw new Error('UNAUTHORIZED_ACCESS');
      }

      setUser(cred.user);
      setAuthorization(record);
      setIsAuthorized(true);
      await syncUserProfile(cred.user, record);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_ACCESS') {
        throw new Error('UNAUTHORIZED_ACCESS');
      }
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }

      // Handle Account Exists With Different Credential (e.g. Existing Email/Password account)
      if (
        err.code === 'auth/account-exists-with-different-credential' || 
        err.code === 'auth/credential-already-in-use' ||
        err.code === 'auth/email-already-in-use'
      ) {
        const pendingCred = GoogleAuthProvider.credentialFromError(err);
        const email = err.customData?.email || err.email || '';
        setPendingConflict({
          email,
          credential: pendingCred,
          message: 'An existing account with email/password was found. Enter your password to securely link your Google account to your existing profile.'
        });
        const conflictErr = new Error('ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL');
        setError('This email is already associated with an Email/Password account. Please enter your password to link Google.');
        throw conflictErr;
      }

      let message = 'Google authentication encountered an issue.';
      if (err.message) message = err.message;
      setError(message);
      throw new Error(message);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  /**
   * Resolves a provider conflict by signing in with email/password and linking the pending Google credential
   */
  const resolveAndLinkConflict = async (password: string) => {
    if (!pendingConflict || !pendingConflict.email) {
      throw new Error('No pending account linking operation found.');
    }

    setError(null);
    setIsCheckingAuth(true);

    try {
      // 1. Sign in with the existing email and password
      const userCred = await signInWithEmailAndPassword(auth, pendingConflict.email, password);
      
      // 2. Link the pending Google credential if available
      if (pendingConflict.credential) {
        try {
          await linkWithCredential(userCred.user, pendingConflict.credential);
        } catch (linkErr: any) {
          console.warn('Could not link credential immediately:', linkErr);
          // If already linked, continue
          if (linkErr.code !== 'auth/provider-already-linked') {
            throw linkErr;
          }
        }
      }

      // 3. Evaluate authorization for the user UID
      const { authorized, record } = await evaluateUserAuthorization(userCred.user);

      if (!authorized || !record) {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setAuthorization(null);
        setIsAuthorized(false);
        setIsUnauthorizedError(true);
        setPendingConflict(null);
        throw new Error('UNAUTHORIZED_ACCESS');
      }

      setUser(userCred.user);
      setAuthorization(record);
      setIsAuthorized(true);
      setPendingConflict(null);
      await syncUserProfile(userCred.user, record);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_ACCESS') {
        throw new Error('UNAUTHORIZED_ACCESS');
      }
      let message = 'Failed to link accounts. Please verify your existing password.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        message = 'Invalid password for existing account. Please try again.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  const clearConflict = () => {
    setPendingConflict(null);
  };

  /**
   * Connect / Link Google Account to the currently signed-in user without changing UID or password
   */
  const linkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('No active user session to link Google.');
    setError(null);

    try {
      await linkWithPopup(auth.currentUser, googleProvider);
      // Force reload auth state
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      if (authorization) {
        await syncUserProfile(updatedUser, authorization);
      }
    } catch (err: any) {
      if (err.code === 'auth/popup-closed-by-user' || err.code === 'auth/cancelled-popup-request') {
        return;
      }
      if (err.code === 'auth/provider-already-linked') {
        return;
      }
      let message = 'Failed to link Google account.';
      if (err.code === 'auth/credential-already-in-use') {
        message = 'This Google account is already linked to another user.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Disconnect / Unlink Google from the current user
   */
  const unlinkGoogleAccount = async () => {
    if (!auth.currentUser) throw new Error('No active user session.');
    if ((auth.currentUser.providerData?.length || 0) <= 1) {
      throw new Error('Cannot disconnect your only sign-in method. Please ensure Email & Password is active first.');
    }

    try {
      await unlink(auth.currentUser, 'google.com');
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      if (authorization) {
        await syncUserProfile(updatedUser, authorization);
      }
    } catch (err: any) {
      console.error('Error unlinking Google:', err);
      throw new Error(err.message || 'Failed to disconnect Google account.');
    }
  };

  /**
   * Link or Add Email & Password to the currently signed-in user (e.g. Google-only user)
   */
  const linkPasswordAccount = async (password: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
      throw new Error('No active user email available to create password credentials.');
    }
    setError(null);

    try {
      const cred = EmailAuthProvider.credential(auth.currentUser.email, password);
      await linkWithCredential(auth.currentUser, cred);
      await auth.currentUser.reload();
      const updatedUser = auth.currentUser;
      setUser(updatedUser);
      if (authorization) {
        await syncUserProfile(updatedUser, authorization);
      }
    } catch (err: any) {
      if (err.code === 'auth/provider-already-linked') {
        // If already linked, update password instead
        await updatePassword(auth.currentUser, password);
        return;
      }
      let message = 'Failed to set password credentials.';
      if (err.code === 'auth/weak-password') {
        message = 'Password should be at least 6 characters.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  /**
   * Updates or changes password for the currently signed-in user
   */
  const changeAccountPassword = async (newPassword: string) => {
    if (!auth.currentUser) throw new Error('No active user session.');
    try {
      await updatePassword(auth.currentUser, newPassword);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        throw new Error('For security reasons, please log in again before changing your password.');
      }
      throw new Error(err.message || 'Failed to update password.');
    }
  };

  const resetPassword = async (email: string) => {
    setError(null);
    try {
      await sendPasswordResetEmail(auth, email.trim());
    } catch (err: any) {
      let message = 'Unable to send password reset transmission.';
      if (err.code === 'auth/user-not-found') {
        message = 'No operator account found matching this email address in Firebase Auth.';
      } else if (err.message) {
        message = err.message;
      }
      setError(message);
      throw new Error(message);
    }
  };

  const logout = async () => {
    setError(null);
    setIsUnauthorizedError(false);
    setPendingConflict(null);
    await signOut(auth);
    setUser(null);
    setProfile(null);
    setAuthorization(null);
    setIsAuthorized(false);
  };

  const refreshAuthorization = useCallback(async (): Promise<boolean> => {
    if (!auth.currentUser) return false;
    const { authorized, record } = await evaluateUserAuthorization(auth.currentUser);
    setIsAuthorized(authorized);
    setAuthorization(record);
    return authorized;
  }, []);

  const clearError = () => {
    setError(null);
    setIsUnauthorizedError(false);
  };

  // Admin User Authorization Management wrappers
  const getAuthorizedUsers = async (): Promise<AuthorizedUserRecord[]> => {
    return await fetchAuthorizedUsersList();
  };

  const addAuthorizedUser = async (record: AuthorizedUserRecord): Promise<void> => {
    await saveAuthorizedUserRecord(record);
  };

  const deleteAuthorizedUser = async (uid: string): Promise<void> => {
    await deleteAuthorizedUserDoc(uid);
  };

  const toggleAuthorization = async (uid: string, authorized: boolean): Promise<void> => {
    await toggleUserAuthorization(uid, authorized);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        authorization,
        isAuthorized,
        loading,
        isCheckingAuth,
        error,
        isUnauthorizedError,
        userProviders,
        hasPasswordProvider,
        hasGoogleProvider,
        pendingConflict,
        loginWithEmail,
        loginWithGoogle,
        resolveAndLinkConflict,
        clearConflict,
        linkGoogleAccount,
        unlinkGoogleAccount,
        linkPasswordAccount,
        changeAccountPassword,
        resetPassword,
        logout,
        refreshAuthorization,
        clearError,
        getAuthorizedUsers,
        addAuthorizedUser,
        deleteAuthorizedUser,
        toggleAuthorization,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
