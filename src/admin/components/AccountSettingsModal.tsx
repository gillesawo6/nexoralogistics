import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldCheck, 
  Mail, 
  KeyRound, 
  Link2, 
  Unlink, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  X, 
  Copy, 
  Check, 
  User, 
  Lock, 
  Eye, 
  EyeOff,
  Sparkles,
  ShieldAlert
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ConfirmDeleteModal } from './ConfirmDeleteModal';

interface AccountSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    profile, 
    authorization, 
    userProviders, 
    hasPasswordProvider, 
    hasGoogleProvider, 
    linkGoogleAccount, 
    unlinkGoogleAccount, 
    linkPasswordAccount,
    changeAccountPassword
  } = useAuth();

  const [copiedUid, setCopiedUid] = useState(false);
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);

  // Password setting / updating form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Handle ESC key press to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen || !user) return null;

  const handleCopyUid = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopiedUid(true);
      setTimeout(() => setCopiedUid(false), 2000);
    }
  };

  const handleConnectGoogle = async () => {
    setStatusMessage(null);
    setLoadingAction('connect_google');
    try {
      await linkGoogleAccount();
      setStatusMessage({ type: 'success', text: 'Google Account successfully linked! You can now log in with either Google or Email/Password.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to connect Google account.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDisconnectGoogle = () => {
    if (!hasPasswordProvider && userProviders.length <= 1) {
      setStatusMessage({ type: 'error', text: 'Cannot disconnect Google because it is your only sign-in method. Set a password first.' });
      return;
    }
    setShowDisconnectConfirm(true);
  };

  const executeDisconnectGoogle = async () => {
    setShowDisconnectConfirm(false);
    setStatusMessage(null);
    setLoadingAction('disconnect_google');
    try {
      await unlinkGoogleAccount();
      setStatusMessage({ type: 'success', text: 'Google account disconnected successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to disconnect Google account.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const handleSavePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'Passwords do not match.' });
      return;
    }

    setLoadingAction('save_password');
    try {
      if (hasPasswordProvider) {
        await changeAccountPassword(newPassword);
        setStatusMessage({ type: 'success', text: 'Password successfully updated!' });
      } else {
        await linkPasswordAccount(newPassword);
        setStatusMessage({ type: 'success', text: 'Password credential successfully linked to your account!' });
      }
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to update password.' });
    } finally {
      setLoadingAction(null);
    }
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl my-auto rounded-3xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 p-6 sm:p-8 shadow-2xl relative text-slate-900 dark:text-white max-h-[85vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header Badge */}
        <div className="flex items-center gap-2 text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold mb-2">
          <ShieldCheck className="w-4 h-4" />
          <span>Operator Security & Identity Profile</span>
        </div>
        <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-950 dark:text-white uppercase tracking-tight mb-2">
          Account Clearance & Sign-In Methods
        </h2>
        <p className="text-xs text-slate-600 dark:text-gray-400 font-sans mb-6">
          Manage your linked authentication credentials and clearance identifiers. Both Google and Password connect to this single authorized profile.
        </p>

        {/* Notification Banner */}
        <AnimatePresence>
          {statusMessage && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-2xl border flex items-start gap-3 text-xs font-mono-tech ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                  : 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Operator Identity Card */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6">
          <div className="flex items-center gap-3 mb-3">
            {profile?.photoURL || user.photoURL ? (
              <img
                src={profile?.photoURL || user.photoURL || ''}
                alt="Avatar"
                className="w-12 h-12 rounded-xl object-cover border border-[#0066FF]/30"
              />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-[#0066FF] text-white font-heading font-black text-lg flex items-center justify-center">
                {(user.displayName || user.email || 'O').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-slate-900 dark:text-white truncate">
                  {profile?.displayName || user.displayName || 'Authorized Operator'}
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono-tech text-[10px] font-bold uppercase border border-emerald-500/20">
                  {authorization?.role || 'AUTHORIZED'}
                </span>
              </div>
              <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 truncate">
                {user.email}
              </div>
              <div className="text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase mt-0.5">
                {authorization?.department || 'Operations Dispatch'}
              </div>
            </div>
          </div>

          {/* UID Box */}
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 flex items-center justify-between gap-2">
            <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 truncate">
              <span>Firebase UID: </span>
              <strong className="text-slate-900 dark:text-white font-bold">{user.uid}</strong>
            </div>
            <button
              onClick={handleCopyUid}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200/60 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/20 text-[10px] font-mono-tech text-slate-700 dark:text-gray-300 transition-colors cursor-pointer shrink-0"
              title="Copy Firebase UID"
            >
              {copiedUid ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>{copiedUid ? 'COPIED' : 'COPY'}</span>
            </button>
          </div>
        </div>

        {/* ================= SIGN-IN METHODS SECTION ================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-2">
            <h3 className="font-mono-tech text-xs uppercase font-bold text-slate-700 dark:text-gray-300 tracking-wider">
              SIGN-IN METHODS & LINKED PROVIDERS
            </h3>
            <span className="text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] font-bold">
              {userProviders.length} ACTIVE {userProviders.length === 1 ? 'PROVIDER' : 'PROVIDERS'}
            </span>
          </div>

          {/* Provider 1: Email & Password */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] shrink-0">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Email & Password
                  </span>
                  {hasPasswordProvider ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  {user.email || 'Email/Password Authentication'}
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                setShowPasswordForm(!showPasswordForm);
                setStatusMessage(null);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-800 dark:text-white font-mono-tech text-xs font-bold uppercase transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{hasPasswordProvider ? 'Change Password' : 'Set Password'}</span>
            </button>
          </div>

          {/* Inline Password Setup / Update Form */}
          <AnimatePresence>
            {showPasswordForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleSavePassword}
                className="p-4 rounded-2xl bg-blue-50/50 dark:bg-[#0066FF]/5 border border-blue-200 dark:border-[#0066FF]/20 space-y-3"
              >
                <div className="font-heading font-bold text-xs uppercase text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  <span>{hasPasswordProvider ? 'Update Access Password' : 'Add Password Credential'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase text-slate-600 dark:text-gray-400 mb-1">
                      New Password (min 6 chars)
                    </label>
                    <div className="relative">
                      <input
                        type={showPass ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-3 pr-8 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-xs font-mono-tech text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono-tech uppercase text-slate-600 dark:text-gray-400 mb-1">
                      Confirm Password
                    </label>
                    <input
                      type={showPass ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-300 dark:border-white/15 text-xs font-mono-tech text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="text-[10px] font-mono-tech text-slate-500 hover:text-slate-800 dark:hover:text-gray-200 flex items-center gap-1 cursor-pointer"
                  >
                    {showPass ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showPass ? 'Hide characters' : 'Show characters'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowPasswordForm(false)}
                      className="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-white/10 text-xs font-mono-tech uppercase text-slate-700 dark:text-gray-300 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loadingAction === 'save_password'}
                      className="px-4 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-heading font-bold uppercase text-white shadow-md flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    >
                      {loadingAction === 'save_password' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                      <span>Save Password</span>
                    </button>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>

          {/* Provider 2: Google Authentication */}
          <div className="p-4 rounded-2xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24Z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.04 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                  />
                </svg>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-bold text-sm text-slate-900 dark:text-white">
                    Google Sign-In
                  </span>
                  {hasGoogleProvider ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Connected
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono-tech font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
                      Not Connected
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">
                  Single Sign-On with Google Workspace & Accounts
                </p>
              </div>
            </div>

            <div className="shrink-0">
              {hasGoogleProvider ? (
                <button
                  type="button"
                  onClick={handleDisconnectGoogle}
                  disabled={loadingAction === 'disconnect_google'}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 text-rose-700 dark:text-rose-400 font-mono-tech text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loadingAction === 'disconnect_google' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Unlink className="w-3.5 h-3.5" />
                  )}
                  <span>Disconnect Google</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleConnectGoogle}
                  disabled={loadingAction === 'connect_google'}
                  className="w-full sm:w-auto px-3.5 py-1.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
                >
                  {loadingAction === 'connect_google' ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Link2 className="w-3.5 h-3.5" />
                  )}
                  <span>Connect Google</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Security Rule Note */}
        <div className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-start gap-2.5 text-slate-500 dark:text-gray-400 font-mono-tech text-[11px]">
          <ShieldAlert className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8] shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            Connecting or disconnecting sign-in methods maintains your exact Firebase UID and all authorization privileges without creating duplicate accounts.
          </p>
        </div>

        {/* Confirmation Modal for Google Account Disconnection */}
        <ConfirmDeleteModal
          isOpen={showDisconnectConfirm}
          onClose={() => setShowDisconnectConfirm(false)}
          onConfirm={executeDisconnectGoogle}
          isDeleting={loadingAction === 'disconnect_google'}
          title="Disconnect Google Account"
          description="Are you sure you want to disconnect your Google account from this profile? You will still be able to sign in using your email and password."
          itemName={user.email || undefined}
          itemBadge="Single Sign-On"
          confirmText="Disconnect Google"
        />
      </motion.div>
    </div>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(modalContent, document.body);
};
