import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Menu, 
  Sun, 
  Moon, 
  Plus, 
  Bell, 
  Globe2, 
  Clock, 
  ShieldCheck, 
  LogOut, 
  User, 
  KeyRound, 
  Shield 
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { AccountSettingsModal } from './AccountSettingsModal';

interface AdminHeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, logout } = useAuth();
  const navigate = useNavigate();
  const isDark = theme === 'dark';
  const location = useLocation();
  const [timeUtc, setTimeUtc] = useState('');
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close user dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };

    if (userDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [userDropdownOpen]);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeUtc(now.toUTCString().slice(17, 25) + ' UTC');
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('/admin/shipments/new')) return 'New Consignment Dispatch';
    if (path.includes('/admin/shipments/')) return 'Shipment Milestones & Telemetry';
    if (path.includes('/admin/shipments')) return 'Shipments Management';
    if (path.includes('/admin/quotes')) return 'Freight Rate Quotes';
    if (path.includes('/admin/messages')) return 'Customer Transmissions & Inquiries';
    if (path.includes('/admin/services')) return 'Services & Transport Modes';
    if (path.includes('/admin/industries')) return 'Industry Verticals';
    if (path.includes('/admin/blog')) return 'Blog Intelligence & News';
    if (path.includes('/admin/case-studies')) return 'Enterprise Case Studies';
    if (path.includes('/admin/testimonials')) return 'Client Testimonials';
    if (path.includes('/admin/faqs')) return 'Knowledge Base & FAQs';
    if (path.includes('/admin/locations')) return 'Global Logistics Network Hubs';
    return 'Operations Dashboard';
  };

  const pendingQuotes = storageService.getQuotes().filter(q => q.status === 'Pending').length;

  const handleSignOut = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const displayName = profile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Operator');

  return (
    <header className="sticky top-0 z-30 bg-white/95 dark:bg-[#070D1D]/95 backdrop-blur-xl border-b border-slate-200 dark:border-white/10 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 transition-colors w-full max-w-full overflow-x-hidden">
      <div className="flex items-center justify-between gap-2 sm:gap-4 w-full min-w-0">
        {/* Left Side: Mobile Menu Button & Breadcrumb */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <button
            onClick={onToggleSidebar}
            aria-expanded={isSidebarOpen}
            aria-controls="admin-sidebar"
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-slate-950 dark:hover:text-white lg:hidden shrink-0 transition-colors cursor-pointer active:scale-95"
            aria-label={isSidebarOpen ? "Close Admin Menu" : "Open Admin Menu"}
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 truncate">
              <span className="hidden min-[380px]:inline">ADMIN CONSOLE</span>
              <span className="hidden min-[380px]:inline">/</span>
              <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase truncate">
                {location.pathname.replace('/admin/', '').split('/')[0] || 'DASHBOARD'}
              </span>
            </div>
            <h1 className="font-heading font-extrabold text-xs sm:text-base md:text-lg lg:text-xl text-slate-950 dark:text-white uppercase tracking-tight leading-tight mt-0.5 truncate" title={getPageTitle()}>
              {getPageTitle()}
            </h1>
          </div>
        </div>

        {/* Right Side: Status, UTC Clock, User Badge, Theme Toggle & Quick Action */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 lg:gap-3 shrink-0">
          {/* Live Network Status Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-mono-tech text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>GRID ONLINE (320+ HUBS)</span>
          </div>

          {/* UTC Clock */}
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 font-mono-tech text-xs">
            <Clock className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
            <span>{timeUtc}</span>
          </div>

          {/* Notifications / Pending Quotes alert */}
          <Link
            to="/admin/quotes"
            title={`${pendingQuotes} Pending Quotes`}
            className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors shrink-0"
          >
            <Bell className="w-4 h-4" />
            {pendingQuotes > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            )}
          </Link>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 border border-slate-200 dark:border-white/10 transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700" />
            )}
          </button>

          {/* User Profile Pill & Quick Sign Out */}
          {user && (
            <div className="relative shrink-0" ref={dropdownRef}>
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Current Operator Profile"
              >
                {profile?.photoURL || user.photoURL ? (
                  <img
                    src={profile?.photoURL || user.photoURL || ''}
                    alt={displayName}
                    className="w-7 h-7 rounded-lg object-cover border border-[#0066FF]/30"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-lg bg-[#0066FF] text-white font-heading font-black text-xs flex items-center justify-center">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="hidden lg:block text-left">
                  <div className="text-xs font-heading font-bold text-slate-900 dark:text-white truncate max-w-[120px]">
                    {displayName}
                  </div>
                  <div className="text-[9px] font-mono-tech text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    ONLINE
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95"
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-white/10 mb-1">
                    <div className="text-xs font-heading font-bold text-slate-900 dark:text-white truncate">
                      {displayName}
                    </div>
                    <div className="text-[10px] font-mono-tech text-slate-500 dark:text-gray-400 truncate">
                      {user.email}
                    </div>
                    <div className="text-[9px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold mt-1">
                      {profile?.department || 'Operations Dispatch'}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      setShowSettingsModal(true);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono-tech text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors uppercase tracking-wider font-bold mb-1"
                  >
                    <KeyRound className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
                    <span>Sign-In Methods</span>
                  </button>

                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-mono-tech text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors uppercase tracking-wider font-bold"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* New Shipment Button (Hidden on Mobile) */}
          <Link
            to="/admin/shipments/new"
            className="hidden sm:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading text-xs font-bold uppercase tracking-wider transition-all shadow-md shadow-[#0066FF]/25 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden md:inline">New Shipment</span>
            <span className="md:hidden">New</span>
          </Link>

          {/* Back to Client Site button (compact) */}
          <Link
            to="/"
            title="Go to Public Website"
            className="hidden min-[380px]:flex p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#38bdf8] transition-colors shrink-0"
          >
            <Globe2 className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Account Settings & Sign-In Methods Modal */}
      <AccountSettingsModal 
        isOpen={showSettingsModal} 
        onClose={() => setShowSettingsModal(false)} 
      />
    </header>
  );
};
