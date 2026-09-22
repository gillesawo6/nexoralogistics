import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Lock, 
  Mail, 
  KeyRound, 
  ArrowRight, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  Globe2, 
  Loader2,
  ShieldCheck,
  Shield,
  Layers,
  Radio,
  Server,
  Sparkles,
  Link2,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AdminLoginPage: React.FC = () => {
  const { 
    loginWithEmail, 
    loginWithGoogle, 
    resetPassword, 
    pendingConflict,
    resolveAndLinkConflict,
    clearConflict,
    error, 
    clearError 
  } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [localMessage, setLocalMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  // Conflict linking state
  const [conflictPassword, setConflictPassword] = useState('');
  const [showConflictPassword, setShowConflictPassword] = useState(false);
  const [linkingAccounts, setLinkingAccounts] = useState(false);

  // Forgot password modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSending, setResetSending] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setLocalMessage(null);

    if (!email || !password) {
      setLocalMessage({ type: 'error', text: 'Please enter both your work email and password.' });
      return;
    }

    setSubmitting(true);
    try {
      await loginWithEmail(email, password);
      setLocalMessage({ type: 'success', text: 'Authentication & Authorization successful. Accessing Console...' });
      setTimeout(() => navigate('/admin/dashboard'), 400);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_ACCESS') {
        navigate('/unauthorized');
        return;
      }
      setLocalMessage({ type: 'error', text: err.message || 'Authentication failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    clearError();
    setLocalMessage(null);
    setSubmitting(true);
    try {
      await loginWithGoogle();
      setLocalMessage({ type: 'success', text: 'Google SSO authenticated & cleared. Accessing Console...' });
      setTimeout(() => navigate('/admin/dashboard'), 400);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_ACCESS') {
        navigate('/unauthorized');
        return;
      }
      if (err.message === 'ACCOUNT_EXISTS_WITH_DIFFERENT_CREDENTIAL') {
        // Will show pendingConflict UI
        return;
      }
      setLocalMessage({ type: 'error', text: err.message || 'Google authentication failed.' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmLinkConflict = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!conflictPassword) return;

    setLinkingAccounts(true);
    setLocalMessage(null);
    try {
      await resolveAndLinkConflict(conflictPassword);
      setLocalMessage({ type: 'success', text: 'Google Account successfully linked to your existing profile! Loading console...' });
      setTimeout(() => navigate('/admin/dashboard'), 500);
    } catch (err: any) {
      if (err.message === 'UNAUTHORIZED_ACCESS') {
        navigate('/unauthorized');
        return;
      }
      setLocalMessage({ type: 'error', text: err.message || 'Failed to link Google account. Check your password.' });
    } finally {
      setLinkingAccounts(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetSending(true);
    try {
      await resetPassword(resetEmail);
      setLocalMessage({ type: 'success', text: `Password recovery link transmitted to ${resetEmail}. Check your inbox.` });
      setShowResetModal(false);
      setResetEmail('');
    } catch (err: any) {
      setLocalMessage({ type: 'error', text: err.message || 'Password reset failed.' });
    } finally {
      setResetSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070D1D] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#0066FF] selection:text-white relative overflow-hidden">
      {/* Background Ambience & Cyber Grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-15 pointer-events-none" />
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-[#0066FF]/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-[#38bdf8]/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Floating Bar */}
      <div className="w-full max-w-5xl mb-4 flex items-center justify-between z-10 px-2">
        <Link to="/" className="flex items-center gap-2 group text-gray-400 hover:text-white transition-colors">
          <Globe2 className="w-4 h-4 text-[#38bdf8] group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-mono-tech uppercase tracking-wider font-semibold">Back to Public Website</span>
        </Link>
        <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-400 font-bold tracking-wider">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="hidden sm:inline">FIREBASE AUTH SHIELD ONLINE</span>
        </div>
      </div>

      {/* Split-Screen Authentication Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl shadow-black/50 overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-white/10 z-10 min-h-[620px]"
      >
        {/* ================= LEFT SIDE: BRAND PANEL ================= */}
        <div className="lg:col-span-5 bg-gradient-to-br from-[#070D1D] via-[#0A1C40] to-[#040816] p-8 sm:p-10 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
          {/* Subtle Geometric Background Arcs & Patterns */}
          <div className="absolute -right-24 -top-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -right-12 -top-12 w-80 h-80 rounded-full border border-[#0066FF]/30 pointer-events-none" />
          <div className="absolute -left-20 -bottom-20 w-72 h-72 rounded-full border border-[#38bdf8]/20 pointer-events-none" />
          <div className="absolute right-10 bottom-24 w-40 h-40 rounded-full bg-[#0066FF]/10 blur-2xl pointer-events-none" />

          {/* Brand Header & Logo */}
          <div className="relative z-10">
            <Link to="/" className="inline-flex items-center gap-3.5 group">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#38bdf8] p-[1.5px] shadow-lg shadow-[#0066FF]/40 transition-transform group-hover:scale-105">
                <div className="w-full h-full bg-[#070D1D] rounded-[14px] flex items-center justify-center">
                  <span className="font-heading font-extrabold text-2xl text-white">
                    NX<span className="text-[#38bdf8]">.</span>
                  </span>
                </div>
              </div>
              <div>
                <span className="font-heading font-black text-2xl tracking-[0.16em] text-white uppercase block leading-none">
                  NEXORA
                </span>
                <span className="font-mono-tech text-[10px] tracking-widest text-[#38bdf8] uppercase mt-1 block font-bold">
                  GLOBAL LOGISTICS
                </span>
              </div>
            </Link>
          </div>

          {/* Mission Statement & Feature Highlights */}
          <div className="relative z-10 my-10 lg:my-0 space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/20 border border-[#0066FF]/40 text-[#38bdf8] font-mono-tech text-[11px] uppercase font-bold tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Next-Gen Freight Console</span>
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-white leading-tight tracking-tight uppercase">
                Unified Freight Command & Authorization
              </h2>
              <p className="mt-3 text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                Connect seamlessly using Email & Password or Google SSO. Your authorized UID connects all telemetry, route dispatches, and clearances under one single account.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs font-mono-tech text-slate-300">
                <div className="w-5 h-5 rounded-md bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center text-[#38bdf8]">
                  <Link2 className="w-3 h-3" />
                </div>
                <span>Dual Authentication (Google + Email/Password)</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono-tech text-slate-300">
                <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <ShieldCheck className="w-3 h-3" />
                </div>
                <span>UID-Bound RBAC Authorization System</span>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono-tech text-slate-300">
                <div className="w-5 h-5 rounded-md bg-sky-500/20 border border-sky-500/40 flex items-center justify-center text-sky-400">
                  <Radio className="w-3 h-3" />
                </div>
                <span>Real-Time Multi-Modal Hub Telemetry</span>
              </div>
            </div>
          </div>

          {/* System Security Notice */}
          <div className="relative z-10 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
            <span>SECURE GATEWAY v4.2</span>
            <span className="text-[#38bdf8]">256-BIT ENCRYPTION</span>
          </div>
        </div>

        {/* ================= RIGHT SIDE: FORM PANEL ================= */}
        <div className="lg:col-span-7 bg-[#FFFFFF] p-8 sm:p-10 lg:p-12 flex flex-col justify-between text-slate-900">
          <div className="max-w-md w-full mx-auto">
            {/* Top Icon Badge */}
            <div className="flex items-center justify-between mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#0066FF] shadow-xs">
                <Shield className="w-6 h-6" />
              </div>
              <div className="px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-[11px] font-mono-tech uppercase font-bold text-slate-600">
                LEVEL 4 ACCESS
              </div>
            </div>

            {/* Subhead, Headline & Instruction Sentence */}
            <div className="mb-6">
              <div className="text-xs font-mono-tech font-bold uppercase tracking-widest text-[#0066FF] mb-1">
                OPERATOR AUTHENTICATION
              </div>
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 uppercase tracking-tight">
                Log In to Console
              </h1>
              <p className="mt-1.5 text-sm text-slate-500 font-sans">
                Sign in with your authorized Google or Email/Password credentials. Both methods resolve to the same account profile.
              </p>
            </div>

            {/* Feedback Banners */}
            <AnimatePresence>
              {(localMessage || error) && !pendingConflict && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`mb-5 p-3.5 rounded-xl border flex items-start gap-2.5 text-xs font-mono-tech ${
                    localMessage?.type === 'success'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {localMessage?.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                  )}
                  <div className="flex-1 leading-relaxed font-medium">
                    {localMessage?.text || error}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* ================= ACCOUNT CONFLICT & LINKING CARD ================= */}
            <AnimatePresence>
              {pendingConflict && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-6 p-5 rounded-2xl bg-amber-50 border border-amber-200 text-slate-900 shadow-lg"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 text-amber-800 font-heading font-bold text-sm uppercase">
                      <Link2 className="w-4 h-4 text-amber-600" />
                      <span>Existing Account Found</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearConflict}
                      className="p-1 rounded-lg hover:bg-amber-200/60 text-slate-500 hover:text-slate-900"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3 font-sans">
                    An account with email <strong className="font-mono text-amber-900">{pendingConflict.email}</strong> is already registered. To link Google Sign-In to your existing account without losing your password or creating duplicate profiles, enter your password below:
                  </p>

                  <form onSubmit={handleConfirmLinkConflict} className="space-y-3">
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-700" />
                      <input
                        type={showConflictPassword ? 'text' : 'password'}
                        value={conflictPassword}
                        onChange={(e) => setConflictPassword(e.target.value)}
                        placeholder="Enter existing account password"
                        required
                        className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-white border border-amber-300 text-slate-900 placeholder-slate-400 text-xs font-mono-tech focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConflictPassword(!showConflictPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showConflictPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={clearConflict}
                        className="px-3 py-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-mono-tech font-bold uppercase transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={linkingAccounts}
                        className="flex-1 py-2 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-heading font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {linkingAccounts ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Linking Accounts...</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Link Google & Sign In</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {!pendingConflict && (
              <>
                {/* Social Login Button: Continue with Google */}
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  disabled={submitting}
                  className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-xs hover:shadow-md active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed mb-5"
                >
                  {/* Google SVG Logo */}
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
                  <span>{submitting ? 'Connecting Google...' : 'Continue with Google'}</span>
                </button>

                {/* Divider: OR CONTINUE WITH */}
                <div className="relative flex items-center justify-center mb-5">
                  <div className="border-t border-slate-200 w-full" />
                  <span className="bg-white px-3 font-mono-tech text-[10px] uppercase text-slate-400 font-bold shrink-0">
                    OR CONTINUE WITH
                  </span>
                </div>

                {/* Email / Password Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-mono-tech uppercase text-slate-700 font-bold mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@nexora-logistics.com"
                        required
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono-tech focus:outline-none focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-mono-tech uppercase text-slate-700 font-bold">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowResetModal(true)}
                        className="text-[11px] font-mono-tech font-bold text-[#0066FF] hover:text-[#0052cc] hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        required
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono-tech focus:outline-none focus:bg-white focus:border-[#0066FF] focus:ring-2 focus:ring-[#0066FF]/20 transition-all"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit CTA Button with Arrow Icon */}
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#0066FF]/25 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3 group"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In to Console</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Small Administrative Footer Note */}
          <div className="max-w-md w-full mx-auto mt-6 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-slate-500 font-mono-tech text-[11px]">
            <Server className="w-3.5 h-3.5 text-[#0066FF] shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Authorized personnel only. Operator accounts are provisioned exclusively through the Firebase Console.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Password Reset Modal */}
      <AnimatePresence>
        {showResetModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center gap-2 text-xs font-mono-tech text-[#0066FF] uppercase font-bold mb-2">
                <KeyRound className="w-4 h-4" />
                <span>Password Recovery Transmission</span>
              </div>
              <h3 className="font-heading font-bold text-lg text-slate-900 mb-2 uppercase">
                Reset Clearance Key
              </h3>
              <p className="text-xs text-slate-600 mb-4">
                Enter your registered operator email. We will transmit an official Firebase password reset dispatch.
              </p>

              <form onSubmit={handleResetPassword} className="space-y-4">
                <div>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="operator@nexora-logistics.com"
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder-slate-400 text-xs font-mono-tech focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowResetModal(false)}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-mono-tech text-slate-700 uppercase"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetSending}
                    className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-xs font-heading font-bold uppercase text-white shadow-md flex items-center gap-1.5"
                  >
                    {resetSending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                    <span>Send Reset Email</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
