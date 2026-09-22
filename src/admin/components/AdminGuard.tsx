import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Loader2, Radio } from 'lucide-react';

export const AdminGuard: React.FC<{ children?: React.ReactNode; requiredRole?: string }> = ({ 
  children,
  requiredRole 
}) => {
  const { user, authorization, isAuthorized, loading, isCheckingAuth, isUnauthorizedError } = useAuth();

  // Loading state preventing any protected content flash
  if (loading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4">
        <div className="relative flex flex-col items-center">
          {/* Pulsing ring */}
          <div className="w-16 h-16 rounded-2xl bg-[#0066FF]/20 border border-[#0066FF]/40 flex items-center justify-center mb-4 shadow-xl shadow-[#0066FF]/30">
            <Loader2 className="w-8 h-8 text-[#38bdf8] animate-spin" />
          </div>

          <div className="flex items-center gap-2 text-xs font-mono-tech text-emerald-400 font-bold uppercase tracking-wider mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>VERIFYING ACCESS CLEARANCE...</span>
          </div>

          <p className="text-[11px] font-mono-tech text-gray-500 uppercase tracking-widest">
            AUTHENTICATING AGAINST AUTHORIZATION ALLOWLIST
          </p>
        </div>
      </div>
    );
  }

  // If flagged as unauthorized by closed auth check, show the Unauthorized Access view
  if (isUnauthorizedError) {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // If user is not authenticated or not authorized, redirect to Login screen
  if (!user || !isAuthorized || !authorization) {
    return <Navigate to="/admin/login" replace />;
  }

  // Optional role check
  if (requiredRole && authorization.role !== requiredRole && authorization.role !== 'admin') {
    return <Navigate to="/admin/unauthorized" replace />;
  }

  // Verified & Authorized: render protected content
  return <>{children}</>;
};

export default AdminGuard;
