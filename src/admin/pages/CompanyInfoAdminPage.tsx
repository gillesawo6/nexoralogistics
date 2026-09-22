import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Globe2, 
  Save, 
  RotateCcw, 
  Copy, 
  Check, 
  ExternalLink, 
  Share2, 
  Sparkles,
  Landmark,
  FileCheck2,
  PhoneCall,
  MessageSquare,
  AlertCircle,
  Hash,
  Award,
  CreditCard,
  Send,
  Headphones
} from 'lucide-react';
import { storageService } from '../../services/storageService';
import { CompanyInfo } from '../../types';
import { updatePageSeo } from '../../services/seoService';
import { useAuth } from '../../context/AuthContext';
import { sanitizeWhatsAppNumber, buildWhatsAppUrl } from '../../config/communicationConfig';
import { ConfirmDeleteModal } from '../components/ConfirmDeleteModal';
import { useToast } from '../../context/ToastContext';

export const CompanyInfoAdminPage: React.FC = () => {
  const toast = useToast();
  const { user, profile } = useAuth();
  const [formData, setFormData] = useState<CompanyInfo>(() => storageService.getCompanyInfo());
  const [activeTab, setActiveTab] = useState<'contact' | 'communication' | 'identity' | 'location' | 'compliance' | 'finance'>('contact');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  useEffect(() => {
    updatePageSeo({
      title: 'Company Info & Corporate Directory | Admin Console',
      description: 'Manage official enterprise contact channels, phone numbers, dispatch hotlines, and corporate records.',
    });

    const unsubscribe = storageService.subscribeToCompanyInfo((updated) => {
      setFormData(updated);
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.info(`Copied to clipboard: ${text}`, 'Copied');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleChange = (field: keyof CompanyInfo, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSaving(true);

    try {
      const updatedInfo: CompanyInfo = {
        ...formData,
        updatedBy: profile?.displayName || user?.displayName || user?.email || 'Admin Operator',
      };
      await storageService.saveCompanyInfo(updatedInfo);
      toast.success('Corporate directory and enterprise contact details saved successfully!', 'Settings Saved');
    } catch (err) {
      console.error('Error saving company info:', err);
      toast.error('Failed to save company information.', 'Save Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = async () => {
    setIsSaving(true);
    try {
      const reset = await storageService.resetCompanyInfo();
      setFormData(reset);
      toast.success('Company information restored to standard corporate configuration.', 'Reset Complete');
      setShowResetConfirm(false);
    } catch (err) {
      console.error('Reset error:', err);
      toast.error('Failed to reset company information.', 'Reset Error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyFormattedDossier = () => {
    const text = `
=========================================
${formData.companyName}
Trade Name: ${formData.tradeName}
Tagline: ${formData.tagline}
=========================================

PRIMARY CONTACT CHANNELS:
- Primary Phone: ${formData.primaryPhone}
- 24/7 Emergency Dispatch: ${formData.emergencyPhone}
- Toll-Free: ${formData.tollFreePhone}
- WhatsApp / Mobile: ${formData.whatsappPhone}
- Operations Email: ${formData.primaryEmail}
- Support Email: ${formData.supportEmail}
- Rate Quotes Desk: ${formData.quotesEmail}
- Customs Brokerage: ${formData.customsEmail}

GLOBAL HEADQUARTERS:
- Address: ${formData.hqAddress}
- City/Country: ${formData.hqCity}, ${formData.hqCountry} ${formData.hqPostalCode}
- Website: ${formData.website}

OPERATING HOURS:
- Business Desk: ${formData.businessHours}
- Live Dispatch Watch: ${formData.dispatchDeskHours}
- Emergency Response SLA: ${formData.emergencyResponseHours}

REGISTRATION & LICENSES:
- Commercial Registry: ${formData.registrationNumber}
- Tax / VAT / EORI: ${formData.taxId}
- DUNS: ${formData.dunsNumber}
- IATA Cargo Agent: ${formData.iataCode}
- FMC / OTI: ${formData.fmcNumber}
- AEO Certification: ${formData.aeoCertificate}
- Standards: ${formData.isoCertifications}
=========================================
`.trim();

    navigator.clipboard.writeText(text);
    toast.info('Complete corporate dossier copied to clipboard!', 'Dossier Copied');
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      {/* Page Title & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066FF]/10 dark:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs font-bold uppercase tracking-wider mb-2 border border-[#0066FF]/20">
            <Building2 className="w-3.5 h-3.5" />
            <span>GLOBAL ENTERPRISE PROFILE</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl lg:text-4xl uppercase tracking-tight text-slate-950 dark:text-white">
            Company Info & Contact Directory
          </h1>
          <p className="text-sm text-slate-600 dark:text-gray-400 mt-1 font-light">
            Manage central corporate contact channels, 24/7 operations dispatch lines, global HQ address, and statutory registrations.
          </p>
        </div>

        {/* Global Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopyFormattedDossier}
            className="px-3.5 py-2.5 rounded-xl bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 font-mono-tech text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 active:scale-95"
            title="Copy structured plain text summary"
          >
            <Share2 className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
            <span>Export Dossier</span>
          </button>

          <button
            type="button"
            onClick={() => setShowResetConfirm(true)}
            disabled={isSaving}
            className="px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-600 dark:hover:text-rose-400 text-slate-600 dark:text-gray-300 font-mono-tech text-xs font-bold tracking-wider uppercase transition-all shadow-xs flex items-center gap-2 active:scale-95 cursor-pointer"
            title="Reset to initial default template"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Defaults</span>
          </button>

          <button
            type="button"
            onClick={() => handleSave()}
            disabled={isSaving}
            className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-[#0066FF]/25 flex items-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'SAVING...' : 'SAVE CHANGES'}</span>
          </button>
        </div>
      </div>

      {/* Quick Telemetry & Verification Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Primary Phone Quick Card */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-[#0066FF]/10 flex items-center justify-center text-[#0066FF] dark:text-[#38bdf8]">
              <Phone className="w-5 h-5" />
            </div>
            <button
              onClick={() => handleCopy(formData.primaryPhone, 'card-phone')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Copy Primary Phone"
            >
              {copiedKey === 'card-phone' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold">
              Primary Switchboard
            </div>
            <a 
              href={`tel:${formData.primaryPhone.replace(/\s+/g, '')}`}
              className="font-mono-tech text-base font-extrabold text-slate-900 dark:text-white hover:text-[#0066FF] dark:hover:text-[#38bdf8] transition-colors block mt-0.5 truncate"
            >
              {formData.primaryPhone}
            </a>
            <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono-tech mt-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Rotterdam HQ Trunk</span>
            </div>
          </div>
        </div>

        {/* 24/7 Emergency Dispatch */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
              <Headphones className="w-5 h-5" />
            </div>
            <button
              onClick={() => handleCopy(formData.emergencyPhone, 'card-emergency')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Copy 24/7 Hotline"
            >
              {copiedKey === 'card-emergency' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1">
              <span>24/7 Dispatch Hotline</span>
            </div>
            <a 
              href={`tel:${formData.emergencyPhone.replace(/\s+/g, '')}`}
              className="font-mono-tech text-base font-extrabold text-slate-900 dark:text-white hover:text-rose-600 transition-colors block mt-0.5 truncate"
            >
              {formData.emergencyPhone}
            </a>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 font-mono-tech mt-1">
              Zero-downtime AOG / priority watch
            </div>
          </div>
        </div>

        {/* Primary Operations Email */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Mail className="w-5 h-5" />
            </div>
            <button
              onClick={() => handleCopy(formData.primaryEmail, 'card-email')}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Copy Operations Email"
            >
              {copiedKey === 'card-email' ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold">
              Operations Routing Email
            </div>
            <a 
              href={`mailto:${formData.primaryEmail}`}
              className="font-mono-tech text-sm font-extrabold text-slate-900 dark:text-white hover:text-[#0066FF] dark:hover:text-[#38bdf8] transition-colors block mt-0.5 truncate"
            >
              {formData.primaryEmail}
            </a>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 font-mono-tech mt-1">
              Encrypted dispatch inbox
            </div>
          </div>
        </div>

        {/* Headquarters Location */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(formData.hqAddress)}`}
              target="_blank"
              rel="noreferrer"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
              title="Open in Maps"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
          <div className="mt-3">
            <div className="text-[10px] font-mono-tech uppercase tracking-widest text-slate-500 dark:text-gray-400 font-bold">
              Global Maritime HQ
            </div>
            <div className="font-heading font-bold text-sm text-slate-900 dark:text-white mt-0.5 truncate">
              {formData.hqCity}, {formData.hqCountry}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-gray-400 font-mono-tech mt-1 truncate">
              {formData.hqAddress}
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
            activeTab === 'contact'
              ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
              : 'bg-white dark:bg-[#070D1D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          <Phone className="w-4 h-4" />
          <span>Phones & Emails</span>
        </button>

        <button
          onClick={() => setActiveTab('communication')}
          className={`px-4 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
            activeTab === 'communication'
              ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
              : 'bg-white dark:bg-[#070D1D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>WhatsApp Messaging</span>
        </button>

        <button
          onClick={() => setActiveTab('identity')}
          className={`px-4 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
            activeTab === 'identity'
              ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
              : 'bg-white dark:bg-[#070D1D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Company Identity</span>
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={`px-4 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
            activeTab === 'location'
              ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
              : 'bg-white dark:bg-[#070D1D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          <MapPin className="w-4 h-4" />
          <span>Headquarters & Hours</span>
        </button>

        <button
          onClick={() => setActiveTab('compliance')}
          className={`px-4 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
            activeTab === 'compliance'
              ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
              : 'bg-white dark:bg-[#070D1D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Licenses & Tax IDs</span>
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          className={`px-4 py-2.5 rounded-xl font-heading text-xs uppercase tracking-wider font-bold transition-all flex items-center gap-2 ${
            activeTab === 'finance'
              ? 'bg-[#0066FF] text-white shadow-md shadow-[#0066FF]/20'
              : 'bg-white dark:bg-[#070D1D] text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
          }`}
        >
          <Landmark className="w-4 h-4" />
          <span>Portals & Settlement</span>
        </button>
      </div>

      {/* Main Tab Panels Form Container */}
      <form onSubmit={handleSave} className="space-y-6">
        {/* TAB 1: PHONES & EMAILS */}
        {activeTab === 'contact' && (
          <div className="space-y-6">
            {/* Phone Numbers Group */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                    Telephone Lines & Dispatch Hotlines
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Official voice lines shown on freight documents, customs forms, and public contact directories.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Primary HQ Phone */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300">
                      Primary Phone (Switchboard) *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(formData.primaryPhone, 'primaryPhone')}
                      className="text-[10px] font-mono-tech text-[#0066FF] hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'primaryPhone' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.primaryPhone}
                    onChange={(e) => handleChange('primaryPhone', e.target.value)}
                    placeholder="+31 10 892 4000"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">General corporate switchboard line</span>
                </div>

                {/* 24/7 Emergency Dispatch */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono-tech uppercase font-bold text-rose-600 dark:text-rose-400">
                      24/7 Global Emergency Hotline *
                    </label>
                    <button
                      type="button"
                      onClick={() => handleCopy(formData.emergencyPhone, 'emergencyPhone')}
                      className="text-[10px] font-mono-tech text-rose-500 hover:underline flex items-center gap-1"
                    >
                      {copiedKey === 'emergencyPhone' ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.emergencyPhone}
                    onChange={(e) => handleChange('emergencyPhone', e.target.value)}
                    placeholder="+31 10 892 4099"
                    className="w-full px-4 py-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-300 dark:border-rose-900/40 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-rose-500"
                  />
                  <span className="text-[11px] text-rose-500/80 mt-1 block">Instant escalation for active flights, vessels, and AOG emergencies</span>
                </div>

                {/* Toll-Free Americas / Priority Line */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Toll-Free Operations Line
                  </label>
                  <input
                    type="text"
                    value={formData.tollFreePhone}
                    onChange={(e) => handleChange('tollFreePhone', e.target.value)}
                    placeholder="+1 (800) 555-NEXO"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Toll-free routing for North America & International clients</span>
                </div>

                {/* WhatsApp & Mobile Telemetry Line */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    WhatsApp & IoT Telemetry Mobile Line
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappPhone}
                    onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                    placeholder="+31 6 8924 0001"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Direct WhatsApp messaging line for drivers and cargo handlers</span>
                </div>

                {/* Corporate Fax */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Corporate Fax / Secure Electronic Telecopier
                  </label>
                  <input
                    type="text"
                    value={formData.faxNumber}
                    onChange={(e) => handleChange('faxNumber', e.target.value)}
                    placeholder="+31 10 892 4001"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Port authority and customs clearance e-fax</span>
                </div>
              </div>
            </div>

            {/* Email Routing Channels Group */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                    Corporate Email Routing Desks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Departmental inbound email addresses configured for operations, quotations, and customs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Primary Operations Email */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Primary Operations & Dispatch Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.primaryEmail}
                    onChange={(e) => handleChange('primaryEmail', e.target.value)}
                    placeholder="e.g. gillesawo6@gmail.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Central operations address used for automated dispatch and notifications</span>
                </div>

                {/* Customer Support Email */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Customer Support & Claims Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.supportEmail}
                    onChange={(e) => handleChange('supportEmail', e.target.value)}
                    placeholder="support@nexoralogistics.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Cargo inquiries, track & trace queries, and customer help</span>
                </div>

                {/* Commercial Quotes Desk Email */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Commercial Quotes & Spot Rates Desk
                  </label>
                  <input
                    type="email"
                    value={formData.quotesEmail}
                    onChange={(e) => handleChange('quotesEmail', e.target.value)}
                    placeholder="quotes@nexoralogistics.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Freight estimation and commercial pricing requests</span>
                </div>

                {/* Customs & Compliance Email */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Customs Brokerage & Compliance Desk
                  </label>
                  <input
                    type="email"
                    value={formData.customsEmail}
                    onChange={(e) => handleChange('customsEmail', e.target.value)}
                    placeholder="customs@nexoralogistics.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Tariff codes, import/export duties, and AEO clearance docs</span>
                </div>

                {/* Press & Media Email */}
                <div className="md:col-span-2">
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Corporate Press & Executive Relations
                  </label>
                  <input
                    type="email"
                    value={formData.mediaEmail}
                    onChange={(e) => handleChange('mediaEmail', e.target.value)}
                    placeholder="media@nexoralogistics.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB: WHATSAPP BUSINESS MESSAGING */}
        {activeTab === 'communication' && (
          <div className="space-y-6">
            {/* Overview / Architecture Info */}
            <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50/70 via-teal-50/50 to-blue-50/70 dark:from-[#07251C] dark:via-[#0E1B40] dark:to-[#0B1736] border border-slate-200 dark:border-white/10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25D366]/10 text-emerald-600 dark:text-emerald-400 font-mono-tech text-[10px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Direct Messaging</span>
                </div>
                <h4 className="font-heading font-black text-lg text-slate-900 dark:text-white uppercase">
                  Direct WhatsApp Messaging Controls
                </h4>
                <p className="text-xs text-slate-600 dark:text-gray-300 max-w-2xl font-light mt-1">
                  Configure the floating WhatsApp button displayed across the website for direct peer-to-peer mobile messaging with operations and dispatch.
                </p>
              </div>
            </div>

            {/* CHANNEL: WHATSAPP BUSINESS */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center font-bold">
                    <Send className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white flex items-center gap-2">
                      <span>WhatsApp Business Messaging</span>
                      <span className="text-[10px] font-mono-tech uppercase bg-[#25D366]/20 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-md font-bold">
                        wa.me Direct
                      </span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      Standardized universal WhatsApp messaging link for instant client and driver correspondence.
                    </p>
                  </div>
                </div>

                {/* Enable / Disable Switch */}
                <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.enableWhatsApp !== false}
                    onChange={(e) => handleChange('enableWhatsApp', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-[#25D366]" />
                  <span className="text-xs font-mono-tech font-bold uppercase text-slate-700 dark:text-gray-300">
                    {formData.enableWhatsApp !== false ? 'Enabled' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* WhatsApp Number */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300">
                      WhatsApp Phone Number (with Country Code) *
                    </label>
                    {formData.primaryPhone && (
                      <button
                        type="button"
                        onClick={() => handleChange('whatsappPhone', formData.primaryPhone)}
                        className="text-[11px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] hover:underline font-semibold"
                      >
                        Use Primary Phone ({formData.primaryPhone})
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    required
                    value={formData.whatsappPhone}
                    onChange={(e) => handleChange('whatsappPhone', e.target.value)}
                    placeholder={formData.primaryPhone || "+31 10 892 4000"}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#25D366]"
                  />
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-gray-400 mt-1 font-mono-tech">
                    <span>Sanitized digits: <strong className="text-emerald-500 font-bold">{sanitizeWhatsAppNumber(formData.whatsappPhone) || 'None'}</strong></span>
                    <span>Format: International E.164</span>
                  </div>
                </div>

                {/* WhatsApp Pre-filled Default Message */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Pre-filled Customer Enquiry Message
                  </label>
                  <input
                    type="text"
                    value={formData.whatsappMessage || ''}
                    onChange={(e) => handleChange('whatsappMessage', e.target.value)}
                    placeholder="Hello, I would like to make an enquiry about your logistics services."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#25D366]"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">Automatically loaded in the user's WhatsApp compose box</span>
                </div>

                {/* Live WhatsApp Link Preview & Test */}
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="text-xs font-mono-tech font-bold uppercase text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                      <span>Generated wa.me Universal URL:</span>
                    </div>
                    <code className="text-xs font-mono-tech text-emerald-600 dark:text-emerald-400 break-all select-all">
                      {buildWhatsAppUrl(formData.whatsappPhone, formData.whatsappMessage) || 'Please enter a valid phone number'}
                    </code>
                  </div>

                  {formData.whatsappPhone && (
                    <a
                      href={buildWhatsAppUrl(formData.whatsappPhone, formData.whatsappMessage)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-heading font-bold text-xs uppercase tracking-wider inline-flex items-center gap-2 shadow-sm shrink-0"
                    >
                      <span>Test WhatsApp Link</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: COMPANY IDENTITY & BRAND */}
        {activeTab === 'identity' && (
          <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                  Corporate Brand & Legal Entity Details
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Public enterprise naming conventions, brand declarations, and corporate overview text.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Full Legal Entity Name */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Full Legal Entity Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={(e) => handleChange('companyName', e.target.value)}
                  placeholder="NEXORA LOGISTICS GLOBAL INC."
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Official registered commercial name used in contracts and waybills</span>
              </div>

              {/* Trade / Brand Name */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Trade / Commercial Brand Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.tradeName}
                  onChange={(e) => handleChange('tradeName', e.target.value)}
                  placeholder="NEXORA LOGISTICS"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Short brand name displayed in headers and mobile apps</span>
              </div>

              {/* Tagline */}
              <div className="md:col-span-2">
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Corporate Tagline / Mission Statement
                </label>
                <input
                  type="text"
                  value={formData.tagline}
                  onChange={(e) => handleChange('tagline', e.target.value)}
                  placeholder="Deterministic Multi-Modal Freight Forwarding & Autonomous Supply Chain Control"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white text-sm font-medium focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Founded Year */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Year Established
                </label>
                <input
                  type="number"
                  value={formData.foundedYear}
                  onChange={(e) => handleChange('foundedYear', parseInt(e.target.value) || 2008)}
                  placeholder="2008"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Primary Website URL
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleChange('website', e.target.value)}
                  placeholder="https://nexoralogistics.com"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Comprehensive Description */}
              <div className="md:col-span-2">
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Company Overview & Freight Scope
                </label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white text-xs sm:text-sm font-normal focus:outline-none focus:border-[#0066FF]"
                  placeholder="Comprehensive corporate overview..."
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: HEADQUARTERS & HOURS */}
        {activeTab === 'location' && (
          <div className="space-y-6">
            {/* Headquarters Physical Address */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                    Global Corporate Headquarters
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Primary physical terminal address, customs jurisdiction, and geographic coordinates.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
                {/* Street Address */}
                <div className="sm:col-span-2 md:col-span-3">
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Street Address & Suite / Sector *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hqAddress}
                    onChange={(e) => handleChange('hqAddress', e.target.value)}
                    placeholder="Wilhelminakade 902, 3072 AP Rotterdam"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hqCity}
                    onChange={(e) => handleChange('hqCity', e.target.value)}
                    placeholder="Rotterdam"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Country */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.hqCountry}
                    onChange={(e) => handleChange('hqCountry', e.target.value)}
                    placeholder="Netherlands"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Postal Code */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Postal / ZIP Code
                  </label>
                  <input
                    type="text"
                    value={formData.hqPostalCode}
                    onChange={(e) => handleChange('hqPostalCode', e.target.value)}
                    placeholder="3072 AP"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </div>

            {/* Operating Hours & Dispatch Watch */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                    Operations Schedules & SLA Standards
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Dispatch shift schedules, customs filing windows, and emergency response guarantees.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Standard Business Hours */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Standard Commercial Hours
                  </label>
                  <input
                    type="text"
                    value={formData.businessHours}
                    onChange={(e) => handleChange('businessHours', e.target.value)}
                    placeholder="Monday – Friday: 08:00 – 18:00 CET"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Dispatch Desk Watch */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Live Dispatch Desk Coverage
                  </label>
                  <input
                    type="text"
                    value={formData.dispatchDeskHours}
                    onChange={(e) => handleChange('dispatchDeskHours', e.target.value)}
                    placeholder="24/7/365 Continuous Watch"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                {/* Emergency SLA */}
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Emergency Incident Response SLA
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyResponseHours}
                    onChange={(e) => handleChange('emergencyResponseHours', e.target.value)}
                    placeholder="Immediate (< 15 Min SLA)"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: COMPLIANCE, LICENSES & TAX */}
        {activeTab === 'compliance' && (
          <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
              <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                  Regulatory Registrations, Tax Identifiers & Operating Licenses
                </h3>
                <p className="text-xs text-slate-500 dark:text-gray-400">
                  Official statutory numbers printed on Air Waybills, Ocean Bills of Lading, and customs filings.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Commercial Register */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Commercial Register (KvK / Chamber of Commerce)
                </label>
                <input
                  type="text"
                  value={formData.registrationNumber}
                  onChange={(e) => handleChange('registrationNumber', e.target.value)}
                  placeholder="KvK 24491028"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* Tax ID / VAT / EORI */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Tax ID / VAT Number / EORI Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.taxId}
                  onChange={(e) => handleChange('taxId', e.target.value)}
                  placeholder="NL859203918B01 / EORI NL859203918"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* DUNS Number */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Dun & Bradstreet D-U-N-S® Number
                </label>
                <input
                  type="text"
                  value={formData.dunsNumber}
                  onChange={(e) => handleChange('dunsNumber', e.target.value)}
                  placeholder="49-201-8492"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* IATA Code */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  IATA Cargo Agent Code
                </label>
                <input
                  type="text"
                  value={formData.iataCode}
                  onChange={(e) => handleChange('iataCode', e.target.value)}
                  placeholder="01-4-8921/2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* FMC License */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Federal Maritime Commission (FMC / OTI) License
                </label>
                <input
                  type="text"
                  value={formData.fmcNumber}
                  onChange={(e) => handleChange('fmcNumber', e.target.value)}
                  placeholder="FMC-OTI #029418N"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* AEO Certificate */}
              <div>
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  Authorized Economic Operator (AEO-F) Number
                </label>
                <input
                  type="text"
                  value={formData.aeoCertificate}
                  onChange={(e) => handleChange('aeoCertificate', e.target.value)}
                  placeholder="AEOF-NL-849281"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              {/* ISO Certifications */}
              <div className="md:col-span-2">
                <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                  ISO & Quality Standards Certifications
                </label>
                <input
                  type="text"
                  value={formData.isoCertifications}
                  onChange={(e) => handleChange('isoCertifications', e.target.value)}
                  placeholder="ISO 9001:2015, ISO 14001:2015, GDP Pharma Compliant"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium text-sm focus:outline-none focus:border-[#0066FF]"
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: PORTALS & SETTLEMENT */}
        {activeTab === 'finance' && (
          <div className="space-y-6">
            {/* Social & Portals */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                  <Globe2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                    Digital Portals & Social Ecosystem
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Official social handles, client tracking portals, and developer API hubs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    LinkedIn Organization URL
                  </label>
                  <input
                    type="url"
                    value={formData.linkedinUrl}
                    onChange={(e) => handleChange('linkedinUrl', e.target.value)}
                    placeholder="https://linkedin.com/company/nexora-logistics"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    X (Twitter) Official Handle URL
                  </label>
                  <input
                    type="url"
                    value={formData.twitterUrl}
                    onChange={(e) => handleChange('twitterUrl', e.target.value)}
                    placeholder="https://x.com/nexora_logistics"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Developer API / GitHub Repository
                  </label>
                  <input
                    type="url"
                    value={formData.githubUrl || ''}
                    onChange={(e) => handleChange('githubUrl', e.target.value)}
                    placeholder="https://github.com/nexora-logistics/cyberfreight-sdk"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    CyberFreight Client Portal
                  </label>
                  <input
                    type="url"
                    value={formData.portalUrl}
                    onChange={(e) => handleChange('portalUrl', e.target.value)}
                    placeholder="https://portal.nexoralogistics.com"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </div>

            {/* Financial Wire Settlement Details */}
            <div className="bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 p-5 sm:p-7 shadow-xs">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-100 dark:border-white/10">
                <div className="w-9 h-9 rounded-xl bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-heading font-black text-base uppercase text-slate-900 dark:text-white">
                    Treasury & Freight Wire Settlement Details
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-gray-400">
                    Corporate treasury account for commercial invoice wire transfers and freight remittances.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Settlement Bank Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankName}
                    onChange={(e) => handleChange('bankName', e.target.value)}
                    placeholder="ING Bank N.V."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    Beneficiary Account Name
                  </label>
                  <input
                    type="text"
                    value={formData.bankAccountName}
                    onChange={(e) => handleChange('bankAccountName', e.target.value)}
                    placeholder="NEXORA Logistics Global B.V."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-medium text-sm focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    International IBAN Number
                  </label>
                  <input
                    type="text"
                    value={formData.iban}
                    onChange={(e) => handleChange('iban', e.target.value)}
                    placeholder="NL82 INGB 0001 2345 67"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono-tech uppercase font-bold text-slate-700 dark:text-gray-300 mb-1.5">
                    SWIFT / BIC Code
                  </label>
                  <input
                    type="text"
                    value={formData.swiftBic}
                    onChange={(e) => handleChange('swiftBic', e.target.value)}
                    placeholder="INGBNL2A"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-300 dark:border-white/15 text-slate-950 dark:text-white font-mono-tech text-sm font-semibold focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Bottom Save Bar */}
        <div className="p-4 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono-tech text-slate-500 dark:text-gray-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>
              Last updated: {new Date(formData.lastUpdated || Date.now()).toLocaleString()} by {formData.updatedBy || 'Operator'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setShowResetConfirm(true)}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-mono-tech text-xs font-bold uppercase transition-all cursor-pointer"
            >
              Reset
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-[#0066FF]/20 flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'SAVING...' : 'SAVE ALL CHANGES'}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Confirmation Modal for Resetting Company Information */}
      <ConfirmDeleteModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Corporate Profile"
        description="Are you sure you want to reset all company contact phone numbers, dispatch emails, addresses, and registration numbers back to system defaults?"
        itemBadge="Configuration Reset"
        confirmText="Reset Profile"
      />
    </div>
  );
};

export default CompanyInfoAdminPage;
