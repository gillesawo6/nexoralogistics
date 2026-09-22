import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storageService } from '../services/storageService';
import { emailService } from '../services/emailService';
import { updatePageSeo } from '../services/seoService';
import { CompanyInfo } from '../types';
import { 
  Building2, 
  Mail, 
  Phone, 
  Clock, 
  CheckCircle2, 
  Send, 
  MapPin, 
  ShieldCheck,
  Globe2,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Inbox
} from 'lucide-react';
import { buildWhatsAppUrl } from '../config/communicationConfig';
import { WhatsAppIcon } from '../components/communication/WhatsAppButton';
import { useToast } from '../context/ToastContext';

export const ContactPage: React.FC = () => {
  const toast = useToast();
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => storageService.getCompanyInfo());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [company, setCompany] = useState('');
  const [department, setDepartment] = useState<'Sales & Rates' | 'Customer Support' | 'Customs Brokerage' | 'Executive Office' | 'Press & Media'>('Sales & Rates');
  const [subject, setSubject] = useState('Commercial Freight Inquiry');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    updatePageSeo({
      title: 'Contact NEXORA LOGISTICS | 24/7 Global Operations Desks',
      description: 'Contact NEXORA global logistics hubs in Rotterdam, Singapore, Dubai, Chicago, and Tokyo. 24/7 operations, carrier relations, and rate booking.',
    });

    const unsubscribe = storageService.subscribeToCompanyInfo((updated) => {
      setCompanyInfo(updated);
    });

    return () => unsubscribe();
  }, []);

  const offices = [
    {
      city: `${companyInfo.hqCity} (Global HQ)`,
      country: companyInfo.hqCountry,
      address: companyInfo.hqAddress,
      phone: companyInfo.primaryPhone,
      email: companyInfo.primaryEmail,
      hours: companyInfo.dispatchDeskHours || '24/7 Deepwater Command',
    },
    {
      city: 'Singapore (Asia Pacific Hub)',
      country: 'Singapore',
      address: '10 Changi Coast Road, Logistics Park',
      phone: '+65 6789 2100',
      email: 'singapore.ops@nexoralogistics.com',
      hours: '24/7 Air Freight Control',
    },
    {
      city: 'Chicago (Americas Superhub)',
      country: 'United States',
      address: '400 S Wacker Dr, Suite 2400, Chicago, IL',
      phone: '+1 312 555 0199',
      email: 'americas.ops@nexoralogistics.com',
      hours: '24/7 Rail & Intermodal',
    },
    {
      city: 'Dubai (Middle East & Africa)',
      country: 'United Arab Emirates',
      address: 'Jebel Ali Free Zone, Building 14-B',
      phone: '+971 4 881 9900',
      email: 'dubai.ops@nexoralogistics.com',
      hours: '24/7 Crossdock Gateway',
    },
  ];

  const [submittedMessage, setSubmittedMessage] = useState<{ id: string; targetCompanyEmail: string } | null>(null);

  const getDepartmentCompanyEmail = (dept: string) => {
    if (dept === 'Sales & Rates' && companyInfo.quotesEmail) return companyInfo.quotesEmail;
    if (dept === 'Customer Support' && companyInfo.supportEmail) return companyInfo.supportEmail;
    if (dept === 'Customs Brokerage' && (companyInfo.customsEmail || companyInfo.supportEmail)) return companyInfo.customsEmail || companyInfo.supportEmail;
    if (dept === 'Press & Media') return companyInfo.mediaEmail || companyInfo.pressEmail || companyInfo.primaryEmail;
    return companyInfo.primaryEmail;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      toast.warning('Please complete required fields: Name, Email, and Message.', 'Missing Information');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const created = storageService.createContactMessage({
        name,
        email,
        phone,
        company,
        department,
        subject,
        message,
      });

      // 1. Send high-priority inquiry email directly to the company's department mailbox
      emailService.sendContactMessageToCompany(created);

      // 2. Send automated acknowledgment & ticket receipt to the customer's email
      emailService.sendContactConfirmationToCustomer(created);

      const targetCompanyEmail = getDepartmentCompanyEmail(department);
      setSubmittedMessage({ id: created.id, targetCompanyEmail });
      setLoading(false);
      setSubmitted(true);
      toast.success(`Inquiry ticket #${created.id} registered. Receipt delivered to ${created.email}.`, 'Inquiry Dispatched');
    }, 600);
  };

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <Globe2 className="w-3.5 h-3.5" />
            <span>GLOBAL DISPATCH DIRECTORY</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            CONNECT WITH <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              NEXORA OPERATIONS.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            Our multi-modal operations desks operate 24 hours a day, 365 days a year across 4 continents.
          </p>
        </div>

        {/* Contact Form & Primary Desk Info */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-24">
          {/* Form */}
          <div className="lg:col-span-7 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl">
            {submitted ? (
              <div className="text-center py-10 space-y-6">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/10">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white">
                    Transmission Dispatched
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 text-sm max-w-md mx-auto font-light mt-2">
                    Thank you, <span className="text-slate-950 dark:text-white font-bold">{name}</span>. Your inquiry has been automatically transmitted to our operations team.
                  </p>
                </div>

                {/* Email Delivery Audit Status */}
                <div className="bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 font-mono-tech text-xs">
                  <div className="text-[11px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                    <span>Automated Email Routing Active</span>
                  </div>
                  
                  <div className="flex items-start gap-2.5 text-slate-800 dark:text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Delivered to Operations:</span>{' '}
                      <span className="text-slate-900 dark:text-white">{submittedMessage?.targetCompanyEmail || companyInfo.primaryEmail}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 text-slate-800 dark:text-gray-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">Receipt Sent to Sender:</span>{' '}
                      <span className="text-slate-900 dark:text-white">{email}</span>
                    </div>
                  </div>

                  {submittedMessage?.id && (
                    <div className="pt-2 border-t border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 text-[11px] flex items-center justify-between">
                      <span>Ticket Reference: <strong className="text-[#0066FF] dark:text-[#38bdf8]">#{submittedMessage.id}</strong></span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">Target SLA: &lt; 2 Hours</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setMessage('');
                    }}
                    className="px-5 py-2.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-white transition-colors cursor-pointer shadow-md shadow-[#0066FF]/20"
                  >
                    Send Another Inquiry
                  </button>

                  <Link
                    to="/quote"
                    className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 rounded-xl font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white transition-colors cursor-pointer"
                  >
                    Calculate Instant Rate
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <h3 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
                  Send An Operations Transmission
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. David Vance"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                      Corporate Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. david@enterprise.com"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="e.g. Global Tech Corp"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                      Department *
                    </label>
                    <select
                      value={department}
                      onChange={(e) => setDepartment(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    >
                      <option>Sales & Rates</option>
                      <option>Customer Support</option>
                      <option>Customs Brokerage</option>
                      <option>Executive Office</option>
                      <option>Press & Media</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                      Inquiry Subject *
                    </label>
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                    >
                      <option>Commercial Freight Inquiry</option>
                      <option>Urgent Air Charter Requirement</option>
                      <option>Customs & Tariff Classification</option>
                      <option>Enterprise ERP / API Webhook Integration</option>
                      <option>Carrier & Network Partner Relations</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-mono-tech text-slate-600 dark:text-gray-400 uppercase">
                    Consignment Details & Message *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Describe cargo specifications, origin/destination corridors, or technical integration questions..."
                    className="w-full bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 focus:border-[#0066FF] rounded-xl px-4 py-3 text-slate-900 dark:text-white text-xs font-mono-tech focus:outline-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-xl shadow-[#0066FF]/25 disabled:opacity-50 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>{loading ? 'TRANSMITTING...' : 'DISPATCH MESSAGE'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Quick Direct Desk Contacts */}
          <div className="lg:col-span-5 space-y-6">
            {/* Direct Dual Communication Cards */}
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold">
                <MessageSquare className="w-4 h-4" />
                <span>INSTANT COMMUNICATION CHANNELS</span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white">
                Live Messaging & Support
              </h3>

              <div className="space-y-3">
                {/* WhatsApp Action Card */}
                {companyInfo.enableWhatsApp !== false && (
                  <a
                    href={buildWhatsAppUrl(companyInfo.whatsappPhone, companyInfo.whatsappMessage)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 rounded-2xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/30 transition-all group cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shrink-0">
                        <WhatsAppIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold font-mono-tech uppercase text-slate-900 dark:text-white">
                          Chat via WhatsApp
                        </div>
                        <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400">
                          {companyInfo.whatsappPhone || '+31 6 8924 0001'} (Direct Messaging)
                        </div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-[#25D366] transition-transform group-hover:translate-x-0.5" />
                  </a>
                )}
              </div>
            </div>

            {/* Emergency 24/7 Desk */}
            <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
              <div className="flex items-center gap-2 text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase font-bold">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>24/7 CRITICAL WATCH DESK</span>
              </div>

              <h3 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white">
                Emergency AOG & Priority Charters
              </h3>

              <p className="text-slate-600 dark:text-gray-300 text-sm font-light leading-relaxed">
                For time-sensitive aircraft on ground (AOG) parts, temperature-critical biopharma excursions, or emergency aircraft charters:
              </p>

              <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 space-y-3 font-mono-tech text-xs">
                <div className="flex items-center gap-3 text-slate-900 dark:text-white">
                  <Phone className="w-4 h-4 text-rose-500" />
                  <a href={`tel:${companyInfo.emergencyPhone.replace(/\s+/g, '')}`} className="font-bold text-sm hover:underline">
                    {companyInfo.emergencyPhone} (24/7 Hotline)
                  </a>
                </div>
                <div className="flex items-center gap-3 text-slate-600 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
                  <a href={`mailto:${companyInfo.primaryEmail}`} className="hover:underline">
                    {companyInfo.primaryEmail}
                  </a>
                </div>
                <div className="flex items-center gap-3 text-emerald-600 dark:text-emerald-400 font-bold">
                  <Clock className="w-4 h-4" />
                  <span>SLA Response: {companyInfo.emergencyResponseHours || '< 15 Minutes'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Global Hubs Grid */}
        <div>
          <h2 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white mb-8">
            Global Office Directory
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {offices.map((office, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-6 rounded-2xl space-y-4 hover:border-[#0066FF]/40 transition-all shadow-md"
              >
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white uppercase">
                    {office.city}
                  </h3>
                  <div className="text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] font-bold">
                    {office.country}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono-tech text-slate-600 dark:text-gray-300">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0 mt-0.5" />
                    <span>{office.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" />
                    <span>{office.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500 shrink-0" />
                    <span className="truncate">{office.email}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5 text-[11px] font-mono-tech text-emerald-600 dark:text-emerald-400 font-bold">
                  ● {office.hours}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
