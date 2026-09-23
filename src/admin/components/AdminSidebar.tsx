import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  FileText, 
  Mail, 
  Layers, 
  Briefcase, 
  BookOpen, 
  Award, 
  MessageSquare, 
  HelpCircle, 
  MapPin, 
  ArrowLeft, 
  LogOut, 
  X,
  ShieldCheck,
  Globe2,
  UserCheck,
  KeyRound,
  Building2
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';
import { AccountSettingsModal } from './AccountSettingsModal';

interface AdminSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, profile, logout } = useAuth();
  const [showSettingsModal, setShowSettingsModal] = React.useState(false);
  const quotesCount = storageService.getQuotes().filter(q => q.status === 'Pending' || q.status === 'Reviewing').length;
  const messagesCount = storageService.getContactMessages().filter(m => m.status === 'Unread').length;

  const mainNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Shipments', path: '/admin/shipments', icon: Package },
    { name: 'New Shipment', path: '/admin/shipments/new', icon: PlusCircle, isHighlight: true },
  ];

  const managementNav = [
    { name: 'Company Info', path: '/admin/company-info', icon: Building2 },
    { name: 'User Authorization', path: '/admin/users', icon: ShieldCheck },
    { name: 'Rate Quotes', path: '/admin/quotes', icon: FileText, badge: quotesCount > 0 ? quotesCount : null },
    { name: 'Inquiries & Desk', path: '/admin/messages', icon: Mail, badge: messagesCount > 0 ? messagesCount : null },
    { name: 'Services & Modes', path: '/admin/services', icon: Layers },
    { name: 'Industries', path: '/admin/industries', icon: Briefcase },
    { name: 'Blog & Articles', path: '/admin/blog', icon: BookOpen },
    { name: 'Case Studies', path: '/admin/case-studies', icon: Award },
    { name: 'Testimonials', path: '/admin/testimonials', icon: MessageSquare },
    { name: 'FAQs', path: '/admin/faqs', icon: HelpCircle },
    { name: 'Global Hubs', path: '/admin/locations', icon: MapPin },
    { name: 'Owner Manual (PDF)', path: '/admin/docs', icon: BookOpen, isOwnerGuide: true },
  ];

  const handleSignOut = async () => {
    try {
      await logout();
      onClose();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const displayName = profile?.displayName || user?.displayName || (user?.email ? user.email.split('@')[0] : 'Operator');
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile Backdrop with smooth fade transition */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className={`fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Sidebar Container */}
      <aside
        id="admin-sidebar"
        role="dialog"
        aria-modal="true"
        aria-label="Admin Navigation Menu"
        className={`fixed top-0 bottom-0 left-0 z-50 w-[84vw] max-w-[288px] lg:w-72 bg-white dark:bg-[#070D1D] border-r border-slate-200 dark:border-white/10 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 overscroll-contain ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
          <Link 
            to="/admin/dashboard" 
            onClick={onClose}
            className="flex items-center gap-3 group min-w-0"
          >
            {/* Hexagon Mark */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0A255C] p-[1.5px] shadow-md shadow-[#0066FF]/30 transition-transform group-hover:scale-105 shrink-0">
              <div className="w-full h-full bg-[#0066FF] dark:bg-[#070D1D] rounded-[10px] flex items-center justify-center">
                <span className="font-heading font-extrabold text-lg text-white">
                  NX<span className="text-amber-300 dark:text-[#38bdf8]">.</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col min-w-0">
              <span className="font-heading font-black text-lg tracking-[0.16em] text-slate-950 dark:text-white uppercase leading-none truncate">
                NEXORA
              </span>
              <span className="font-mono-tech text-[10px] tracking-widest text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase mt-1 flex items-center gap-1 truncate">
                <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                ADMIN CONSOLE
              </span>
            </div>
          </Link>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-600 hover:text-slate-950 dark:text-gray-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 lg:hidden transition-colors cursor-pointer shrink-0"
            aria-label="Close Navigation Menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Navigation Body */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 space-y-6 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-white/10">
          {/* Main Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono-tech tracking-widest uppercase text-slate-400 dark:text-gray-500 font-bold">
              OPERATIONS
            </div>
            <nav className="space-y-1">
              {mainNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
                        : item.isHighlight
                        ? 'text-[#0066FF] dark:text-[#38bdf8] hover:bg-[#0066FF]/10 dark:hover:bg-[#0066FF]/15'
                        : 'text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span>{item.name}</span>
                  </div>
                  {item.isHighlight && (
                    <span className="px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/40 text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8]">
                      +ADD
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Management Group */}
          <div>
            <div className="px-3 pb-2 text-[10px] font-mono-tech tracking-widest uppercase text-slate-400 dark:text-gray-500 font-bold">
              MANAGEMENT &amp; DATA
            </div>
            <nav className="space-y-1">
              {managementNav.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2 rounded-xl font-heading text-xs uppercase tracking-wider font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20 font-bold'
                        : 'text-slate-600 dark:text-gray-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono-tech font-bold bg-rose-500 text-white animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>
        </div>

        {/* Authenticated User Profile & Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-white/10 space-y-3 bg-slate-50/70 dark:bg-[#030712]/80">
          {/* User Card */}
          {user && (
            <div className="p-2.5 rounded-xl bg-white dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 flex items-center gap-3 shadow-xs">
              {profile?.photoURL || user.photoURL ? (
                <img
                  src={profile?.photoURL || user.photoURL || ''}
                  alt={displayName}
                  className="w-9 h-9 rounded-lg object-cover border border-[#0066FF]/30 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0066FF] to-[#38bdf8] flex items-center justify-center text-white font-heading font-black text-sm shrink-0 shadow-sm">
                  {userInitial}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <span className="font-heading font-bold text-xs text-slate-900 dark:text-white truncate">
                    {displayName}
                  </span>
                  <ShieldCheck className="w-3 h-3 text-emerald-500 shrink-0" />
                </div>
                <div className="text-[10px] font-mono-tech text-slate-500 dark:text-gray-400 truncate">
                  {user.email}
                </div>
                <div className="text-[9px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] truncate uppercase font-bold mt-0.5">
                  {profile?.department || 'Operations Dispatch'}
                </div>
              </div>
            </div>
          )}

          {/* Account Settings / Sign-In Methods button */}
          {user && (
            <button
              onClick={() => setShowSettingsModal(true)}
              className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-blue-50/50 hover:bg-blue-50 dark:bg-white/5 dark:hover:bg-white/10 text-[#0066FF] dark:text-[#38bdf8] border border-blue-200/60 dark:border-white/10 font-mono-tech text-xs tracking-wider uppercase font-bold transition-all shadow-xs"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-3.5 h-3.5" />
                <span>Sign-In Methods</span>
              </div>
              <span className="text-[10px] bg-blue-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[#0066FF] dark:text-gray-300">
                {user.providerData?.length || 1}
              </span>
            </button>
          )}

          {/* Back to Client Site button */}
          <Link
            to="/"
            onClick={onClose}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-300 dark:border-white/10 font-mono-tech text-xs tracking-wider uppercase font-bold transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <Globe2 className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8] group-hover:rotate-45 transition-transform" />
              <span>Public Website</span>
            </div>
            <ArrowLeft className="w-3.5 h-3.5 rotate-45 text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
          </Link>

          {/* Sign Out Button */}
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl text-slate-600 hover:text-rose-600 dark:text-gray-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-mono-tech text-xs tracking-wider uppercase transition-colors"
          >
            <div className="flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </div>
            <span className="text-[10px] text-gray-400">Firebase</span>
          </button>
        </div>
      </aside>

      {/* Account Settings & Linked Sign-In Methods Modal */}
      <AccountSettingsModal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
      />
    </>
  );
};
