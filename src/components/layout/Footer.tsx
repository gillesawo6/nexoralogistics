import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../../services/storageService';
import { emailService } from '../../services/emailService';
import { 
  ArrowRight, 
  Check, 
  ShieldCheck, 
  Lock, 
  Clock, 
  Sparkles
} from 'lucide-react';

export const Footer: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState(() => storageService.getCompanyInfo());
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'success' | 'duplicate'>('idle');
  const [worldTimes, setWorldTimes] = useState({
    rotterdam: '',
    singapore: '',
    newyork: '',
    tokyo: '',
    dubai: '',
  });

  useEffect(() => {
    const unsub = storageService.subscribeToCompanyInfo((updated) => {
      setCompanyInfo(updated);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const updateClocks = () => {
      const now = new Date();
      const formatTime = (timeZone: string) => {
        return new Intl.DateTimeFormat('en-GB', {
          timeZone,
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
      };

      setWorldTimes({
        rotterdam: formatTime('Europe/Amsterdam'),
        singapore: formatTime('Asia/Singapore'),
        newyork: formatTime('America/New_York'),
        tokyo: formatTime('Asia/Tokyo'),
        dubai: formatTime('Asia/Dubai'),
      });
    };

    updateClocks();
    const interval = setInterval(updateClocks, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail.trim() || !newsletterEmail.includes('@')) return;

    const emailTrimmed = newsletterEmail.trim();
    const added = storageService.addSubscriber(emailTrimmed);
    if (added) {
      setNewsletterStatus('success');
      setNewsletterEmail('');
      try {
        emailService.sendNewsletterWelcomeToCustomer(emailTrimmed);
        emailService.sendNewsletterAlertToCompany(emailTrimmed);
      } catch (e) {
        console.warn('Newsletter email error:', e);
      }
    } else {
      setNewsletterStatus('duplicate');
    }

    setTimeout(() => setNewsletterStatus('idle'), 4000);
  };

  return (
    <footer className="relative bg-slate-900 text-white border-t border-slate-800 dark:border-white/10 pt-16 pb-12 overflow-hidden transition-colors duration-200">
      {/* Live World Clocks Telemetry Ticker Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16 relative z-10">
        <div className="bg-[#070D1D] border border-white/10 rounded-2xl p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 font-mono-tech text-xs shadow-lg">
          <div className="flex items-center gap-2 text-[#38bdf8] font-bold">
            <Clock className="w-4 h-4 animate-spin text-[#38bdf8]" style={{ animationDuration: '10s' }} />
            <span>GLOBAL DESK CLOCKS (LIVE):</span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-gray-300">
            <div>
              <span className="text-gray-500">RTM (HQ):</span>{' '}
              <span className="text-white font-bold">{worldTimes.rotterdam || '12:00:00'}</span>
            </div>
            <div>
              <span className="text-gray-500">SIN:</span>{' '}
              <span className="text-white font-bold">{worldTimes.singapore || '19:00:00'}</span>
            </div>
            <div>
              <span className="text-gray-500">NYC:</span>{' '}
              <span className="text-white font-bold">{worldTimes.newyork || '06:00:00'}</span>
            </div>
            <div>
              <span className="text-gray-500">TYO:</span>{' '}
              <span className="text-white font-bold">{worldTimes.tokyo || '20:00:00'}</span>
            </div>
            <div>
              <span className="text-gray-500">DXB:</span>{' '}
              <span className="text-white font-bold">{worldTimes.dubai || '15:00:00'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Multi-Column Links Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-16 border-b border-white/10">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-6">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0066FF] to-[#0A255C] p-[1.5px] shadow-md shadow-[#0066FF]/30">
                <div className="w-full h-full bg-[#070D1D] rounded-[10px] flex items-center justify-center font-heading font-extrabold text-sm text-white">
                  NX<span className="text-[#38bdf8]">.</span>
                </div>
              </div>
              <span className="font-heading font-extrabold text-xl tracking-[0.18em] text-white uppercase">
                NEXORA <span className="text-[#38bdf8]">LOGISTICS</span>
              </span>
            </Link>

            <p className="text-sm text-gray-400 font-light leading-relaxed max-w-sm">
              Global multi-modal freight forwarding, priority air charters, and intelligent supply chain orchestration connecting 85+ sovereign markets with deterministic precision.
            </p>

            {/* Newsletter Input */}
            <div className="space-y-2">
              <span className="font-mono-tech text-xs text-gray-300 uppercase tracking-wider block">
                NEXORA GLOBAL TRADE INTELLIGENCE REPORT
              </span>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-2 max-w-sm">
                <input
                  type="email"
                  value={newsletterEmail}
                  onChange={(e) => setNewsletterEmail(e.target.value)}
                  placeholder="Enter corporate email..."
                  className="bg-[#070D1D] border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 font-mono-tech focus:outline-none focus:border-[#0066FF] flex-1"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-[#0066FF]/20 cursor-pointer"
                >
                  <span>JOIN</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </form>

              {newsletterStatus === 'success' && (
                <div className="text-xs text-emerald-400 flex items-center gap-1.5 font-mono-tech pt-1">
                  <Check className="w-3.5 h-3.5" /> Subscribed to monthly trade briefings.
                </div>
              )}
              {newsletterStatus === 'duplicate' && (
                <div className="text-xs text-amber-300 font-mono-tech pt-1">
                  Email is already subscribed to reports.
                </div>
              )}
            </div>
          </div>

          {/* Col 2: Services */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
              Services
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400 font-normal">
              <li>
                <Link to="/services/air-freight" className="hover:text-[#38bdf8] transition-colors">
                  Air Freight Priority
                </Link>
              </li>
              <li>
                <Link to="/services/ocean-freight" className="hover:text-[#38bdf8] transition-colors">
                  Ocean Freight Forwarding
                </Link>
              </li>
              <li>
                <Link to="/services/road-transport" className="hover:text-[#38bdf8] transition-colors">
                  Road & Overland Transport
                </Link>
              </li>
              <li>
                <Link to="/services/warehousing" className="hover:text-[#38bdf8] transition-colors">
                  Smart Warehousing & 3PL
                </Link>
              </li>
              <li>
                <Link to="/services/customs" className="hover:text-[#38bdf8] transition-colors">
                  Customs & Brokerage
                </Link>
              </li>
              <li>
                <Link to="/services/supply-chain" className="hover:text-[#38bdf8] transition-colors">
                  4PL Supply Chain Control
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Industries & Tech */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
              Sectors & Tech
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/industries" className="hover:text-[#38bdf8] transition-colors">
                  Automotive & EV
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-[#38bdf8] transition-colors">
                  Healthcare & Biopharma
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-[#38bdf8] transition-colors">
                  High-Tech Semiconductors
                </Link>
              </li>
              <li>
                <Link to="/industries" className="hover:text-[#38bdf8] transition-colors">
                  Aerospace & AOG
                </Link>
              </li>
              <li>
                <Link to="/technology" className="hover:text-[#38bdf8] transition-colors">
                  CyberFreight Platform
                </Link>
              </li>
              <li>
                <Link to="/case-studies" className="hover:text-[#38bdf8] transition-colors">
                  Verified Case Studies
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Corporate & Portal */}
          <div>
            <h4 className="font-heading font-bold text-xs uppercase tracking-widest text-white mb-4">
              Company & Portals
            </h4>
            <ul className="space-y-2.5 text-xs text-gray-400">
              <li>
                <Link to="/tracking" className="text-[#38bdf8] font-bold hover:underline">
                  ● Live Cargo Tracking
                </Link>
              </li>
              <li>
                <Link to="/quote" className="hover:text-white transition-colors">
                  Instant Freight Estimator
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-white transition-colors">
                  About NEXORA
                </Link>
              </li>
              <li>
                <Link to="/blog" className="hover:text-white transition-colors">
                  Trade Intelligence Blog
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Help Center & FAQs
                </Link>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white transition-colors">
                  Global Office Directory
                </Link>
              </li>
              <li>
                <Link to="/admin" className="text-amber-400 flex items-center gap-1 hover:underline">
                  <Lock className="w-3 h-3" /> Admin Dashboard
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Certifications & Legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 text-xs font-mono-tech text-gray-500">
          <div className="flex flex-wrap items-center gap-4">
            <span>© {new Date().getFullYear()} {companyInfo.companyName || 'NEXORA LOGISTICS GLOBAL INC.'}</span>
            <span>•</span>
            <Link to="/privacy" className="hover:text-gray-300 transition-colors">
              Privacy Policy
            </Link>
            <span>•</span>
            <Link to="/terms" className="hover:text-gray-300 transition-colors">
              Standard Terms of Carriage
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> {companyInfo.iataCode ? `IATA ${companyInfo.iataCode}` : 'ISO 9001 / IATA / AEO'}
            </span>
            <span>•</span>
            <span className="text-gray-400">SYSTEM HEALTH: 100% OPERATIONAL</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
