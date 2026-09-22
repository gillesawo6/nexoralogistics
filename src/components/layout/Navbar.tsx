import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Menu, 
  X, 
  Search, 
  ArrowRight, 
  Lock,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  useEffect(() => {
    let ticking = false;
    let lastScrolled = window.scrollY > 20;
    if (lastScrolled !== isScrolled) {
      setIsScrolled(lastScrolled);
    }

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const currentScrolled = window.scrollY > 20;
          if (currentScrolled !== lastScrolled) {
            lastScrolled = currentScrolled;
            setIsScrolled(currentScrolled);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { name: 'Services', path: '/services' },
    { name: 'Industries', path: '/industries' },
    { name: 'Technology', path: '/technology' },
    { name: 'Tracking', path: '/tracking' },
    { name: 'Case Studies', path: '/case-studies' },
    { name: 'About', path: '/about' },
    { name: 'Blog', path: '/blog' },
    { name: 'Contact', path: '/contact' },
  ];

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? 'bg-white/95 dark:bg-[#030712]/95 backdrop-blur-md border-b border-slate-200 dark:border-white/10 py-2.5 sm:py-3 shadow-md'
            : 'bg-white/80 dark:bg-[#030712]/80 backdrop-blur-sm border-b border-slate-200/50 dark:border-white/5 py-3 sm:py-4'
        }`}
      >
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Logo */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 group focus:outline-none shrink-0"
            data-cursor="NEXORA"
          >
            {/* Hexagon Mark */}
            <div className="w-8 h-8 sm:w-9 sm:h-9 2xl:w-10 2xl:h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0A255C] p-[1.5px] shadow-md shadow-[#0066FF]/20 transition-transform group-hover:scale-105 shrink-0">
              <div className="w-full h-full bg-[#0066FF] dark:bg-[#070D1D] rounded-[10px] flex items-center justify-center">
                <span className="font-heading font-extrabold text-sm sm:text-base 2xl:text-lg text-white">
                  NX<span className="text-amber-300 dark:text-[#38bdf8]">.</span>
                </span>
              </div>
            </div>

            <div className="flex flex-col">
              <span className="font-heading font-black text-base sm:text-lg 2xl:text-xl tracking-[0.14em] sm:tracking-[0.16em] text-slate-950 dark:text-white uppercase leading-none whitespace-nowrap">
                NEXORA
              </span>
              <span className="font-mono-tech text-[9px] sm:text-[10px] tracking-wider sm:tracking-widest text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase mt-0.5 whitespace-nowrap">
                GLOBAL FREIGHT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-0.5 xl:gap-1 2xl:gap-1.5 shrink">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`relative px-2 xl:px-3 2xl:px-3.5 py-1.5 2xl:py-2 rounded-lg font-heading text-[11px] xl:text-xs font-bold uppercase tracking-wide xl:tracking-wider whitespace-nowrap transition-colors ${
                    isActive 
                      ? 'text-[#0066FF] dark:text-white font-extrabold bg-blue-50/50 dark:bg-white/5' 
                      : 'text-slate-700 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="navIndicator"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#0066FF] dark:bg-[#38bdf8]"
                      transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                    />
                  )}
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Center Action Group for Small & Medium Screens (when desktop nav is hidden) */}
          <div className="flex lg:hidden items-center justify-center gap-1 sm:gap-1.5 md:gap-2 mx-auto">
            <Link
              to="/tracking"
              data-cursor="TRACK"
              className="px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-gray-100 font-mono-tech text-[10px] sm:text-[11px] uppercase border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1 font-bold whitespace-nowrap"
            >
              <Search className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
              <span>Track</span>
            </Link>

            <Link
              to="/quote"
              data-cursor="ESTIMATE"
              className="px-2 sm:px-3 md:px-3.5 py-1 sm:py-1.5 rounded-lg bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-[10px] sm:text-[11px] uppercase tracking-wider transition-all shadow-sm flex items-center gap-1 whitespace-nowrap"
            >
              <span>Quote</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
            </Link>

            <Link
              to="/admin"
              title="Admin Logistics Management Portal"
              className="p-1 sm:p-1.5 md:p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#38bdf8] transition-colors shrink-0"
            >
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            </Link>
          </div>

          {/* Desktop Header Action Buttons (Large Screens) */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-3 shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="p-2 2xl:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer shrink-0"
            >
              <AnimatePresence mode="wait" initial={false}>
                {isDark ? (
                  <motion.div
                    key="sun"
                    initial={{ scale: 0.5, rotate: -90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.5, rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Sun className="w-4 h-4 text-amber-400" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="moon"
                    initial={{ scale: 0.5, rotate: 90, opacity: 0 }}
                    animate={{ scale: 1, rotate: 0, opacity: 1 }}
                    exit={{ scale: 0.5, rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Moon className="w-4 h-4 text-slate-800" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>

            <Link
              to="/tracking"
              data-cursor="TRACK"
              className="px-3 xl:px-4 py-2 2xl:py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-900 dark:text-gray-100 font-mono-tech text-[11px] xl:text-xs tracking-wider uppercase border border-slate-200 dark:border-white/10 transition-colors flex items-center gap-1.5 xl:gap-2 font-bold cursor-pointer whitespace-nowrap shrink-0"
            >
              <Search className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
              <span>Track</span>
            </Link>

            <Link
              to="/quote"
              data-cursor="ESTIMATE"
              className="px-3.5 xl:px-5 py-2 2xl:py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-[11px] xl:text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0066FF]/20 active:scale-[0.98] flex items-center gap-1.5 cursor-pointer whitespace-nowrap shrink-0"
            >
              <span className="hidden xl:inline">Get a Quote</span>
              <span className="xl:hidden">Quote</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </Link>

            {/* Quick Admin Portal Button */}
            <Link
              to="/admin"
              title="Admin Logistics Management Portal"
              className="p-2 2xl:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:text-[#0066FF] dark:hover:text-[#38bdf8] transition-colors cursor-pointer shrink-0"
            >
              <Lock className="w-4 h-4" />
            </Link>
          </div>

          {/* Mobile & Tablet Right Controls (Theme toggle & Hamburger menu) */}
          <div className="lg:hidden flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Theme Toggle */}
            <button
              onClick={toggleTheme}
              aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
              className="p-2 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-800 dark:text-gray-200 border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-800" />}
            </button>

            {/* Mobile Hamburger Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-900 dark:text-white border border-slate-200 dark:border-white/10 focus:outline-none cursor-pointer"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6 text-slate-900 dark:text-white" />}
            </button>
          </div>
        </div>
      </header>

      {/* Full-Screen Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-40 bg-white/98 dark:bg-[#030712]/98 backdrop-blur-xl pt-20 sm:pt-24 pb-8 px-5 sm:px-8 flex flex-col justify-between overflow-y-auto lg:hidden"
          >
            <div className="space-y-6 pt-2">
              <div className="font-mono-tech text-xs text-slate-400 dark:text-gray-500 uppercase tracking-widest pb-3 border-b border-slate-200 dark:border-white/10 flex items-center justify-between">
                <span>NAVIGATION MATRIX</span>
                <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold">NEXORA v2.4</span>
              </div>

              <div className="flex flex-col space-y-2.5 sm:space-y-3">
                {navLinks.map((link, idx) => {
                  const isCurrent = location.pathname === link.path;
                  return (
                    <motion.div
                      key={link.name}
                      initial={{ opacity: 0, x: -12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                    >
                      <Link
                        to={link.path}
                        className={`font-heading font-bold text-lg sm:text-xl md:text-2xl uppercase transition-colors flex items-center justify-between py-2 px-2.5 rounded-xl ${
                          isCurrent
                            ? 'text-[#0066FF] dark:text-[#38bdf8] bg-blue-50/80 dark:bg-white/5'
                            : 'text-slate-900 dark:text-white hover:text-[#0066FF] dark:hover:text-[#38bdf8]'
                        }`}
                      >
                        <span>{link.name}</span>
                        <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${isCurrent ? 'text-[#0066FF] dark:text-[#38bdf8]' : 'text-slate-400 dark:text-gray-600'}`} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Mobile CTAs & Admin link */}
            <div className="pt-6 sm:pt-8 border-t border-slate-200 dark:border-white/10 space-y-3 mt-6">
              <Link
                to="/quote"
                className="w-full py-3.5 sm:py-4 rounded-xl bg-[#0066FF] text-white font-heading font-bold text-sm sm:text-base text-center uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-[#0066FF]/30 active:scale-[0.99]"
              >
                <span>GET A FREIGHT QUOTE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="grid grid-cols-2 gap-3">
                <Link
                  to="/tracking"
                  className="py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white font-mono-tech text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  <Search className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                  <span>TRACK CARGO</span>
                </Link>

                <Link
                  to="/admin"
                  className="py-3 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs uppercase tracking-wider text-center flex items-center justify-center gap-1.5 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>ADMIN DESK</span>
                </Link>
              </div>

              <div className="pt-3 text-center font-mono-tech text-[11px] text-slate-400 dark:text-gray-500">
                NEXORA GLOBAL LOGISTICS • 24/7 NETWORK ONLINE
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

