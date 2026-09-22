import React from 'react';
import { motion } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock, Mail, Globe2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const { clearError } = useAuth();

  const handleReturnToLogin = () => {
    clearError();
    navigate('/admin/login');
  };

  return (
    <div className="min-h-screen bg-slate-900 dark:bg-[#070D1D] flex flex-col justify-center items-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#0066FF] selection:text-white relative overflow-hidden transition-colors">
      {/* Ambient background glow */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-20 w-80 h-80 bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Bar */}
      <div className="w-full max-w-lg mb-6 flex items-center justify-between z-10 px-2">
        <Link 
          to="/" 
          onClick={clearError}
          className="flex items-center gap-2 group text-slate-400 hover:text-white transition-colors"
        >
          <Globe2 className="w-4 h-4 text-[#38bdf8] group-hover:rotate-45 transition-transform" />
          <span className="text-xs font-mono-tech uppercase tracking-wider font-semibold">Public Portal</span>
        </Link>
        <div className="flex items-center gap-1.5 text-xs font-mono-tech text-rose-400 font-bold uppercase tracking-wider">
          <Lock className="w-3.5 h-3.5" />
          <span>RESTRICTED ACCESS GATEWAY</span>
        </div>
      </div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-lg bg-white dark:bg-[#0D1527] rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 p-8 sm:p-10 text-center relative z-10 overflow-hidden transition-colors"
      >
        {/* Decorative top accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-600" />

        {/* Shield Icon Badge */}
        <div className="w-20 h-20 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-500 dark:text-rose-400 mx-auto flex items-center justify-center mb-6 shadow-lg shadow-rose-500/10">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Title */}
        <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight mb-3">
          Unauthorized Access
        </h1>

        {/* Closed System Notice */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 mb-6 text-left">
          <p className="text-sm font-sans text-slate-700 dark:text-gray-200 leading-relaxed">
            Your account is not authorized to access this application.
          </p>
          <p className="text-xs font-sans text-slate-500 dark:text-gray-400 mt-2 leading-relaxed">
            Please contact the administrator if you believe this is an error.
          </p>
        </div>

        {/* Security Invariant Explanation */}
        <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-8 text-center">
          CLOSED ACCESS SYSTEM • ADMINISTRATOR PRE-APPROVAL MANDATORY
        </div>

        {/* Action Button */}
        <div className="space-y-3">
          <button
            onClick={handleReturnToLogin}
            className="w-full py-3.5 px-6 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-sm uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0066FF]/25 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Login</span>
          </button>

          <Link
            to="/contact"
            onClick={clearError}
            className="inline-flex items-center gap-2 text-xs font-mono-tech text-slate-500 hover:text-slate-900 dark:text-gray-400 dark:hover:text-white pt-2 transition-colors uppercase tracking-wider"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Contact System Administrator</span>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UnauthorizedPage;
