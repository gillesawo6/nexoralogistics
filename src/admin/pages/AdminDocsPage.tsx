import React, { useState, useRef } from 'react';
import { 
  BookOpen, 
  Download, 
  Printer, 
  ShieldCheck, 
  Package, 
  PlusCircle, 
  MapPin, 
  Sliders, 
  FileText, 
  Building2, 
  KeyRound, 
  Layers, 
  Briefcase, 
  Award, 
  MessageSquare, 
  HelpCircle, 
  Mail, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Sparkles, 
  Compass, 
  Database,
  Lock,
  ExternalLink,
  Info
} from 'lucide-react';
import { exportElementToPdf, triggerBrowserPrint } from '../../utils/pdfGenerator';
import { updatePageSeo } from '../../services/seoService';

export const AdminDocsPage: React.FC = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('intro');
  const manualRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    updatePageSeo({
      title: 'Administrator Master Operational Guide & PDF Manual | NEXORA',
      description: 'Confidential in-depth operations manual for new website owners and administrators covering shipment creation, telemetry, dynamic quotes, and CMS management.',
    });
  }, []);

  const handleDownloadPdf = async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportSuccess(false);

    const fileName = `NEXORA-Admin-Owner-Operational-Manual.pdf`;
    const success = await exportElementToPdf({
      element: manualRef.current,
      elementId: 'nexora-admin-master-manual',
      fileName,
      onComplete: () => setIsExporting(false),
      onError: () => setIsExporting(false),
    });

    if (success) {
      setExportSuccess(true);
      setTimeout(() => setExportSuccess(false), 4000);
    }
  };

  const handlePrint = () => {
    const triggered = triggerBrowserPrint();
    if (!triggered) {
      handleDownloadPdf();
    }
  };

  const sections = [
    { id: 'intro', label: '1. Executive Owner Handover & System Architecture' },
    { id: 'shipment-lifecycle', label: '2. Creating & Dispatching Shipments (Deep Dive)' },
    { id: 'live-telemetry', label: '3. Real-Time Radar Map & Geodesic Telemetry' },
    { id: 'quotes-engine', label: '4. Freight Rate Quotation Engine & Pricing Model' },
    { id: 'inquiries-desk', label: '5. Inquiries Desk & Client Communications' },
    { id: 'cms-management', label: '6. Website Content Management (Services, Blog, Case Studies)' },
    { id: 'branding-info', label: '7. Company Info, Legal Terms & IATA Configurations' },
    { id: 'security-rbac', label: '8. User RBAC, Firebase Cloud & Database Persistence' },
    { id: 'waybill-pdf', label: '9. Official Waybill PDF Dossier & Barcode Engine' },
  ];

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & PDF Control Toolbar */}
      <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono-tech text-xs tracking-wider uppercase font-bold mb-2">
            <Lock className="w-3.5 h-3.5" />
            <span>CONFIDENTIAL • ADMINISTRATOR & CLIENT HANDOVER MANUAL</span>
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            NEXORA Platform Master Owner & Operator Manual
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm font-light mt-1">
            Comprehensive in-depth operational guide written specifically for the website owner and administrative staff to manage shipments, rate quotes, telemetry, and CMS features.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0">
          <button
            onClick={handlePrint}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-800 dark:text-gray-200 font-heading text-xs uppercase tracking-wider font-bold transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4 text-slate-600 dark:text-gray-300" />
            <span>Print Master Guide</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={isExporting}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading text-xs uppercase tracking-wider font-bold transition-all shadow-lg shadow-[#0066FF]/20 cursor-pointer disabled:opacity-50"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generating PDF...' : 'Download Master PDF (Docs)'}</span>
          </button>
        </div>
      </div>

      {exportSuccess && (
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50 rounded-xl text-emerald-800 dark:text-emerald-300 text-xs font-mono-tech flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Master Admin Documentation PDF compiled and downloaded to your computer!</span>
        </div>
      )}

      {/* Main Grid: Sticky Sidebar + Printable Document Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 hidden lg:block no-print">
          <div className="sticky top-6 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-4 shadow-sm space-y-2">
            <div className="font-heading font-extrabold text-xs uppercase tracking-widest text-slate-400 dark:text-gray-500 pb-2 border-b border-slate-100 dark:border-white/5 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>Admin Modules Index</span>
            </div>
            <nav className="space-y-1">
              {sections.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-xl font-heading text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    activeSection === item.id
                      ? 'bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-bold'
                      : 'text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <span className="truncate">{item.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                </button>
              ))}
            </nav>

            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              <div className="p-3 bg-blue-50/50 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/30 text-[11px] font-mono-tech text-slate-600 dark:text-gray-300">
                <div className="font-bold text-[#0066FF] dark:text-[#38bdf8] mb-1">CLIENT HANDOVER NOTE</div>
                Provide this downloaded PDF to the new website owner upon project completion.
              </div>
            </div>
          </div>
        </aside>

        {/* Printable/Exportable Document Canvas */}
        <main className="lg:col-span-3">
          <div
            id="nexora-admin-master-manual"
            ref={manualRef}
            className="bg-white text-slate-900 p-6 sm:p-10 md:p-12 rounded-3xl border border-slate-200 shadow-xl space-y-12 font-sans"
            style={{ minHeight: '1200px' }}
          >
            {/* Document Header Banner */}
            <div className="border-b-2 border-slate-900 pb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#0A255C] flex items-center justify-center text-white font-heading font-black text-2xl shadow-lg">
                  NX.
                </div>
                <div>
                  <div className="font-heading font-black text-2xl tracking-wider text-slate-950 uppercase leading-none">
                    NEXORA ENTERPRISE PLATFORM
                  </div>
                  <div className="font-mono-tech text-xs tracking-widest text-[#0066FF] font-bold uppercase mt-1">
                    ADMINISTRATOR & WEBSITE OWNER OPERATIONAL MASTER GUIDE
                  </div>
                </div>
              </div>

              <div className="text-right font-mono-tech text-xs text-slate-500 space-y-1">
                <div>DOC CODE: <strong>NEXORA-ADM-V4-MASTER</strong></div>
                <div>CLASSIFICATION: <strong>CONFIDENTIAL / OWNER HANDOVER</strong></div>
                <div>RELEASE VERSION: <strong>ENTERPRISE 2026.4</strong></div>
              </div>
            </div>

            {/* SECTION 1: SYSTEM ARCHITECTURE & HANDOVER */}
            <section id="intro" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <Building2 className="w-5 h-5" />
                <span>1. Executive Owner Handover & System Architecture</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Welcome to your <strong>NEXORA Freight & Logistics Management Suite</strong>. This platform provides an end-to-end digital logistics business infrastructure: a high-converting public portal for shippers and cargo owners, combined with a secured, multi-tenant administrative back-office for freight dispatchers, pricing managers, and company directors.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-1">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="font-heading font-bold text-xs uppercase text-[#0066FF] flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Database & Persistence Architecture</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Powered by <strong>Cloud Firestore</strong> with offline synchronization. All shipments, status logs, quotes, user accounts, and company settings persist securely in the cloud and reflect in real-time without manual page refreshes.
                  </p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                  <div className="font-heading font-bold text-xs uppercase text-[#0066FF] flex items-center gap-1.5">
                    <Lock className="w-4 h-4 text-amber-600" />
                    <span>Role-Based Access Control (RBAC)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Public visitors can only track shipments or request quotes. Administrative pages (<code>/admin/*</code>) are strictly guarded. Only authenticated users with approved roles can create shipments or modify company data.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 2: SHIPMENT LIFECYCLE (DEEP DIVE) */}
            <section id="shipment-lifecycle" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <Package className="w-5 h-5" />
                <span>2. Creating & Dispatching Shipments (Deep Dive)</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Creating shipments is the core daily workflow for operators. Access this at <strong>Admin &rarr; New Shipment (<code>/admin/shipments/new</code>)</strong>:
              </p>

              <div className="space-y-3 text-xs">
                {/* Step 1 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 uppercase flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[10px]">1</span>
                    <span>Using Scenario Presets vs. Custom Routing</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    At the top of the New Shipment screen, you can click any preset (such as <em>AFRICA-ASIA AIR</em>, <em>AIR CHARTER</em>, <em>OCEAN FCL</em>, <em>PHARMA COLD</em>, <em>ROAD EXPRESS</em>, or <em>RAIL EXPRESS</em>) to automatically populate authentic cargo descriptions, realistic port hubs, packaging types, and transport modes. You can customize any field afterwards.
                  </p>
                </div>

                {/* Step 2 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 uppercase flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[10px]">2</span>
                    <span>Shipper (Origin) & Consignee (Destination) Setup</span>
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 pl-1">
                    <li><strong>Origin / Shipper:</strong> Company name, physical address, city, country, contact email, and phone number.</li>
                    <li><strong>Destination / Consignee:</strong> Recipient name, destination port/warehouse address, customs clearance broker, and contact details.</li>
                  </ul>
                </div>

                {/* Step 3 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 uppercase flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[10px]">3</span>
                    <span>Package Dimensions, Weight & Special Commodity Handling</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Enter Piece Count, Gross Weight (kg), and Dimensions ($L \times W \times H$). If shipping temperature-controlled pharmaceuticals, choose <strong>Cold Chain (-20°C Active)</strong> to activate cryogenic telemetry badges and sensor graphs on the tracking screen.
                  </p>
                </div>

                {/* Step 4 */}
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 uppercase flex items-center gap-2 text-xs">
                    <span className="w-5 h-5 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[10px]">4</span>
                    <span>Real-Time Waypoint Updates & Status Milestones</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed">
                    Once created, navigate to <strong>Shipment Detail (<code>/admin/shipments/:id</code>)</strong> to append timestamped milestone scans:
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono-tech text-[10px]">
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold">1. Order Processed</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold">2. Departed Origin</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold">3. In Transit (Hub)</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold">4. Customs Cleared</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold">5. Out for Delivery</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold">6. Delivered</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold text-amber-600">7. On Hold (Customs)</span>
                    <span className="p-2 bg-white rounded border border-slate-200 text-center font-bold text-rose-600">8. Exception Delay</span>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 3: REAL-TIME RADAR MAP & TELEMETRY */}
            <section id="live-telemetry" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <Compass className="w-5 h-5" />
                <span>3. Real-Time Radar Map & Geodesic Telemetry</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                The map engine utilizes high-performance Leaflet mapping with dynamic geodesic curved arc paths to render realistic flight and maritime corridors:
              </p>

              <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl text-xs space-y-2 text-slate-800">
                <div className="font-bold text-[#0066FF] uppercase">How the Tracking Map Operates:</div>
                <ul className="list-disc list-inside space-y-1.5 leading-relaxed">
                  <li><strong>Origin & Destination Pins:</strong> Automatically geocoded from city/country names with custom departure/arrival vector icons.</li>
                  <li><strong>Active Radar Beacon:</strong> Labeled with professional standard <strong>● CURRENT LOCATION</strong> (replacing debug hardware jargon) and pulse-radar rings indicating the latest scanned position.</li>
                  <li><strong>Dynamic Telemetry Bar:</strong> Displays current coordinates (latitude/longitude), hub name, transport mode icon, and speed/altitude telemetry for air charters.</li>
                </ul>
              </div>
            </section>

            {/* SECTION 4: FREIGHT QUOTES ENGINE */}
            <section id="quotes-engine" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <FileText className="w-5 h-5" />
                <span>4. Freight Rate Quotation Engine & Pricing Model</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                The quote engine (<strong>/quote</strong>) allows shippers to obtain binding freight estimates based on industry-standard volumetric calculations:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 uppercase">Volumetric Weight Formula (IATA Air)</div>
                  <div className="p-2.5 bg-white border border-slate-200 rounded-xl font-mono-tech text-slate-800 text-[11px]">
                    Volumetric Weight (kg) = (Length × Width × Height in cm) ÷ 6000
                  </div>
                  <p className="text-slate-600">The platform automatically compares Gross Weight vs. Volumetric Weight and bills the higher Chargeable Weight.</p>
                </div>

                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                  <div className="font-bold text-slate-900 uppercase">Admin Quote Management (<code>/admin/quotes</code>)</div>
                  <p className="text-slate-600">
                    When clients submit a quote, an instant notification badge appears on the Admin Sidebar. Admins can view cargo specs, approve or adjust rates, and send direct confirmation emails to the client.
                  </p>
                </div>
              </div>
            </section>

            {/* SECTION 5: INQUIRIES & CLIENT DESK */}
            <section id="inquiries-desk" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <Mail className="w-5 h-5" />
                <span>5. Inquiries Desk & Client Communications</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                All submissions from the public Contact page (<code>/contact</code>) are routed to the <strong>Inquiries Desk (<code>/admin/messages</code>)</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 pl-1">
                <li><strong>Unread Badges:</strong> Messages are flagged as Unread until opened by an administrator.</li>
                <li><strong>One-Click Client Email Reply:</strong> Admins can click to open a pre-formatted email response with the message reference ID.</li>
                <li><strong>Status Flags:</strong> Mark messages as <em>Replied</em>, <em>Archived</em>, or <em>Flagged for Broker Action</em>.</li>
              </ul>
            </section>

            {/* SECTION 6: WEBSITE CMS & CONTENT MANAGEMENT */}
            <section id="cms-management" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <Layers className="w-5 h-5" />
                <span>6. Website Content Management (CMS)</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                The new website owner can update all marketing content without touching code:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-[#0066FF] uppercase">Services & Modes (<code>/admin/services</code>)</div>
                  <p className="text-slate-600">Add or edit freight services, transit times, rate cards, and feature lists.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-[#0066FF] uppercase">Blog & Trade Insights (<code>/admin/blog</code>)</div>
                  <p className="text-slate-600">Publish articles, trade compliance updates, and industry insights with rich formatting.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-[#0066FF] uppercase">Case Studies (<code>/admin/case-studies</code>)</div>
                  <p className="text-slate-600">Showcase completed high-value charters, cold-chain routes, and heavy industrial cargo.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-[#0066FF] uppercase">Testimonials (<code>/admin/testimonials</code>)</div>
                  <p className="text-slate-600">Manage verified client reviews and enterprise partner endorsements.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-[#0066FF] uppercase">FAQs (<code>/admin/faqs</code>)</div>
                  <p className="text-slate-600">Update questions and answers for customs, billing, and packaging requirements.</p>
                </div>
                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                  <div className="font-bold text-[#0066FF] uppercase">Global Hubs (<code>/admin/locations</code>)</div>
                  <p className="text-slate-600">Configure regional office addresses, phone numbers, and interactive map coordinates.</p>
                </div>
              </div>
            </section>

            {/* SECTION 7: COMPANY BRANDING & IATA CONFIG */}
            <section id="branding-info" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <Sliders className="w-5 h-5" />
                <span>7. Company Info, Legal Terms & IATA Configurations</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Under <strong>Admin &rarr; Company Info (<code>/admin/company-info</code>)</strong>, the site owner can tailor all corporate identity attributes:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pl-1">
                <li><strong>Company Legal Name & Slogan:</strong> Displays in the header, footer, and printable documents.</li>
                <li><strong>IATA / FIATA Carrier Code:</strong> Injected into official waybill barcodes and airway bill headers.</li>
                <li><strong>Global Support Contacts:</strong> Official operations phone, WhatsApp dispatch number, and emergency 24/7 hotline.</li>
                <li><strong>Customs Terms & Carriage Conditions:</strong> Printed automatically at the footer of generated PDF dossiers.</li>
              </ul>
            </section>

            {/* SECTION 8: USER RBAC & CLOUD PERSISTENCE */}
            <section id="security-rbac" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <KeyRound className="w-5 h-5" />
                <span>8. User Security, RBAC & Cloud Firestore</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Under <strong>Admin &rarr; User Authorization (<code>/admin/users</code>)</strong>:
              </p>
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-2 text-slate-700">
                <div className="font-bold text-slate-900 uppercase">Available User Roles:</div>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Administrator (<code>admin</code>):</strong> Full system authority — can delete consignments, modify company info, manage user accounts, and change rate pricing.</li>
                  <li><strong>Operations Operator (<code>operator</code>):</strong> Can create new shipments, update transit scans and waypoint notes, but cannot modify corporate billing or user accounts.</li>
                </ul>
              </div>
            </section>

            {/* SECTION 9: WAYBILL DOSSIER & BARCODE SYSTEM */}
            <section id="waybill-pdf" className="space-y-4">
              <div className="flex items-center gap-2 text-[#0066FF] font-heading font-black text-lg uppercase tracking-wide border-b border-slate-200 pb-2">
                <FileText className="w-5 h-5" />
                <span>9. Official Waybill PDF Dossier & Barcode Engine</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-700">
                Every shipment generated in NEXORA produces an official, carrier-grade <strong>A4 Consignment Dossier & Bill of Lading</strong>:
              </p>
              <ul className="list-disc list-inside space-y-1 text-xs text-slate-700 pl-1">
                <li><strong>Scannable Code-128 Barcodes:</strong> Scannable by standard handheld logistics laser scanners and smartphone cameras.</li>
                <li><strong>Anti-Tamper Digital Seal:</strong> Emits an automated cryptographic SHA-256 verification string and official customs clearance stamp.</li>
                <li><strong>One-Click PDF Export:</strong> Shippers or dispatchers can download or print directly with exact pixel-perfect vector alignment.</li>
              </ul>
            </section>

            {/* Signoff / Certification Footer */}
            <div className="pt-8 border-t-2 border-slate-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono-tech text-slate-500">
              <div>
                <span className="font-bold text-slate-900">ISSUED BY:</span> NEXORA ENTERPRISE SYSTEMS ARCHITECTURE
              </div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold">
                <ShieldCheck className="w-4 h-4" />
                <span>100% OPERATIONAL & PRODUCTION CERTIFIED</span>
              </div>
              <div>CONFIDENTIAL • OWNER MANUAL</div>
            </div>

          </div>
        </main>

      </div>
    </div>
  );
};
