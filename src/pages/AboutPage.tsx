import React, { useEffect } from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { updatePageSeo } from '../services/seoService';
import { 
  ShieldCheck, 
  Globe2, 
  Target, 
  Award, 
  Plane, 
  Ship, 
  Truck, 
  Building2, 
  Users, 
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AboutPage: React.FC = () => {
  useEffect(() => {
    updatePageSeo({
      title: 'About NEXORA LOGISTICS | Global Multi-Modal Freight Network',
      description: 'Learn about NEXORA LOGISTICS: Our mission to eradicate global supply chain friction, our executive leadership, global fleet assets, and sovereign certifications.',
    });
  }, []);

  const leadership = [
    {
      name: 'Alexander Vane',
      role: 'Chief Executive Officer',
      bio: 'Former VP of Global Air Freight at Maersk & DHL Global Forwarding with 22 years pioneering Eurasian trade corridors.',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Dr. Elena Rostova',
      role: 'Chief Technology Officer',
      bio: 'PhD in Distributed Systems (MIT). Architected high-frequency algorithmic routing and satellite IoT mesh systems.',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Marcus Sterling',
      role: 'Chief Operating Officer',
      bio: '30+ years managing deepwater container superhubs in Rotterdam, Singapore, and Dubai Jebel Ali.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
    },
    {
      name: 'Aisha Al-Mansoor',
      role: 'VP Global Customs & Compliance',
      bio: 'Licensed customs broker and former WCO advisor specializing in single-window electronic tariff architectures.',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80',
    },
  ];

  const fleetAssets = [
    { icon: Plane, label: 'Dedicated Cargo Aircraft Charters', value: '14 B777F & B747-8F Jets' },
    { icon: Ship, label: 'Contracted Annual Container Slots', value: '120,000+ TEU Capacity' },
    { icon: Truck, label: 'Continental Road Fleet', value: '4,500+ Euro 6 & EV Trucks' },
    { icon: Building2, label: 'Bonded High-Bay Warehousing', value: '3.2M sq. meters Worldwide' },
  ];

  const certifications = [
    'AEO-F (Authorized Economic Operator - Full Status)',
    'IATA Certified Air Cargo Agent',
    'ISO 9001:2026 Quality Management Standard',
    'ISO 14001:2026 Environmental Management',
    'C-TPAT Tier 3 Certified Validation',
    'CEIV GDP (Good Distribution Practice - Pharma)',
  ];

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="max-w-4xl mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <span>THE NEXORA STORY</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            ERADICATING <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              GLOBAL SUPPLY FRICTION.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            We founded NEXORA on a fundamental conviction: modern global commerce requires an intelligent, deterministic logistics grid—not fragmented spreadsheets and guesswork.
          </p>
        </div>

        {/* Brand Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-24">
          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-3xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-[#0066FF]/10 dark:bg-[#0066FF]/20 text-[#0066FF] dark:text-[#38bdf8] flex items-center justify-center">
              <Target className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white">
              Our Sovereign Mission
            </h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base font-light leading-relaxed">
              To engineer the world's most resilient multi-modal freight network—combining deep physical capacity with edge IoT computing to deliver absolute cargo certainty to the world's leading enterprises.
            </p>
          </div>

          <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-8 sm:p-12 rounded-3xl space-y-4 shadow-xl">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Globe2 className="w-6 h-6" />
            </div>
            <h2 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white">
              Our Global Vision
            </h2>
            <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base font-light leading-relaxed">
              A transparent, zero-demurrage, carbon-accountable global supply web where any enterprise can move raw materials or finished goods between any two points on earth in hours, not weeks.
            </p>
          </div>
        </div>

        {/* Global Physical Assets & Fleet Matrix */}
        <div className="mb-24">
          <SectionHeading
            eyebrow="GLOBAL PHYSICAL INFRASTRUCTURE"
            title={
              <>
                CAPITAL ASSETS & <br />
                <span className="text-[#0066FF]">COMMITTED CAPACITY</span>
              </>
            }
            subtitle="Deep asset backing that guarantees space allocations across ocean, air, and overland routes during peak market crunches."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {fleetAssets.map((asset, i) => {
              const Icon = asset.icon;
              return (
                <div
                  key={i}
                  className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-6 rounded-2xl space-y-4 shadow-lg"
                >
                  <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-white/5 flex items-center justify-center text-[#0066FF] dark:text-[#38bdf8]">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-heading font-black text-xl text-slate-900 dark:text-white">
                      {asset.value}
                    </div>
                    <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 mt-1">
                      {asset.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Leadership Team */}
        <div className="mb-24">
          <SectionHeading
            eyebrow="EXECUTIVE GOVERNANCE"
            title={
              <>
                VETERAN FREIGHT & <br />
                <span className="text-[#0066FF]">TECHNOLOGY LEADERSHIP</span>
              </>
            }
            subtitle="Led by industry pioneers with decades of direct operational mastery across maritime, aviation, customs, and distributed AI systems."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mt-12">
            {leadership.map((exec, i) => (
              <div
                key={i}
                className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl p-6 space-y-4"
              >
                <img
                  src={exec.avatar}
                  alt={exec.name}
                  className="w-full aspect-square rounded-2xl object-cover grayscale hover:grayscale-0 transition-all duration-500"
                />
                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                    {exec.name}
                  </h3>
                  <p className="text-xs font-mono-tech text-[#0066FF] dark:text-[#38bdf8] uppercase mt-0.5 font-bold">
                    {exec.role}
                  </p>
                </div>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-light leading-relaxed">
                  {exec.bio}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Compliance & Sovereign Certifications */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-12 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <Award className="w-6 h-6 text-amber-500 dark:text-amber-400" />
            <h2 className="font-heading font-extrabold text-2xl uppercase text-slate-900 dark:text-white">
              Sovereign Certifications & Audited Standards
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certifications.map((cert, i) => (
              <div
                key={i}
                className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 flex items-center gap-3 text-xs font-mono-tech text-slate-800 dark:text-gray-200"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{cert}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
