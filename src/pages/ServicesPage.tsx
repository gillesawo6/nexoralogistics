import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { SERVICES_DATA } from '../data/mockData';
import { SectionHeading } from '../components/ui/SectionHeading';
import { updatePageSeo } from '../services/seoService';
import { 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Globe2, 
  ShieldCheck, 
  Plane, 
  Ship, 
  Truck, 
  Warehouse, 
  FileCheck, 
  Network 
} from 'lucide-react';

export const ServicesPage: React.FC = () => {
  useEffect(() => {
    updatePageSeo({
      title: 'Global Freight & Supply Chain Services | NEXORA LOGISTICS',
      description: 'Comprehensive multi-modal logistics services: Air Freight, Ocean FCL/LCL, Overland Trucking, Automated Warehousing, Customs Brokerage, and 4PL Control Tower.',
    });
  }, []);

  const getIcon = (name: string) => {
    switch (name) {
      case 'Plane': return <Plane className="w-6 h-6 text-[#38bdf8]" />;
      case 'Ship': return <Ship className="w-6 h-6 text-[#0066FF]" />;
      case 'Truck': return <Truck className="w-6 h-6 text-[#FF6600]" />;
      case 'Warehouse': return <Warehouse className="w-6 h-6 text-emerald-400" />;
      case 'FileCheck': return <FileCheck className="w-6 h-6 text-purple-400" />;
      default: return <Network className="w-6 h-6 text-[#38bdf8]" />;
    }
  };

  const comparisonMatrix = [
    { mode: 'Air Freight Priority', speed: '1-3 Days', cost: '$$$$', carbon: 'High', reliability: '99.8%', bestFor: 'High-value, time-critical, pharma, electronics' },
    { mode: 'Ocean Freight (FCL/LCL)', speed: '14-30 Days', cost: '$', carbon: 'Low', reliability: '96.5%', bestFor: 'Bulk volume, heavy machinery, consumer goods' },
    { mode: 'Overland Road Freight', speed: '2-5 Days', cost: '$$', carbon: 'Moderate', reliability: '98.9%', bestFor: 'Cross-border regional, door-to-door, FTL/LTL' },
    { mode: 'Smart Warehousing & 3PL', speed: 'Same-day Pick/Pack', cost: '$$', carbon: 'Optimized', reliability: '99.98%', bestFor: 'Omnichannel fulfillment, bonded inventory' },
    { mode: 'Customs & Compliance', speed: '< 2 Hours Clear', cost: 'Fixed Fee', carbon: 'Neutral', reliability: '100%', bestFor: 'Tariff classification, duty deferment' },
  ];

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Page Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <span>MULTI-MODAL CAPABILITIES</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            GLOBAL LOGISTICS <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              ENGINEERED FOR SCALE.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            From emergency sub-24h aircraft charters to 20,000 TEU container convoys and bonded robotics fulfillment, NEXORA delivers frictionless global velocity.
          </p>
        </div>
      </section>

      {/* Detailed Services Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {SERVICES_DATA.map((service, index) => {
          const isEven = index % 2 === 1;
          return (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.6 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-[#0066FF]/40 rounded-3xl overflow-hidden shadow-xl p-6 sm:p-10 transition-colors"
            >
              <div className={`grid grid-cols-1 lg:grid-cols-12 gap-8 items-center ${isEven ? 'lg:flex-row-reverse' : ''}`}>
                {/* Text Col */}
                <div className={`lg:col-span-7 space-y-6 ${isEven ? 'lg:order-2' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-white/5 flex items-center justify-center">
                        {getIcon(service.iconName)}
                      </div>
                      <div>
                        <span className="font-mono-tech text-xs text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase">
                          SERVICE {service.number}
                        </span>
                        <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 dark:text-white uppercase">
                          {service.title}
                        </h2>
                      </div>
                    </div>

                    <div className="hidden sm:flex items-center gap-1.5 font-mono-tech text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-[#0D1527] px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/5">
                      <Clock className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                      <span>{service.leadTime}</span>
                    </div>
                  </div>

                  <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                    {service.description}
                  </p>

                  {/* Capabilities List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {service.features.map((feat, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-gray-300">
                        <CheckCircle2 className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Operational Stats Row */}
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    {service.stats.map((stat, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-[#0D1527] p-3 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                          {stat.value}
                        </div>
                        <div className="text-[10px] font-mono-tech text-slate-500 dark:text-gray-400 mt-0.5">
                          {stat.label}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* CTAs */}
                  <div className="pt-4 flex flex-wrap items-center gap-4">
                    <Link
                      to={`/services/${service.id}`}
                      data-cursor="VIEW"
                      className="px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-[#0066FF]/20"
                    >
                      <span>DEEP-DIVE SPECIFICATIONS</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>

                    <Link
                      to={`/quote?service=${encodeURIComponent(service.title)}`}
                      className="px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-white font-mono-tech text-xs uppercase tracking-wider border border-slate-200 dark:border-white/10 transition-colors"
                    >
                      Request Rate Card
                    </Link>
                  </div>
                </div>

                {/* Image Col */}
                <div className={`lg:col-span-5 h-72 sm:h-96 rounded-2xl overflow-hidden relative ${isEven ? 'lg:order-1' : ''}`}>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-full object-cover brightness-[0.9] dark:brightness-[0.75] hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 dark:from-[#070D1D] via-transparent to-black/20" />
                  <div className="absolute bottom-4 left-4 bg-black/70 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 text-[11px] font-mono-tech text-white">
                    GLOBAL COVERAGE: {service.coverage}
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </section>

      {/* Multi-Modal Comparison Matrix Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <SectionHeading
          eyebrow="MULTI-MODAL DECISION ENGINE"
          title={
            <>
              FREIGHT MODALITY <br />
              <span className="text-[#0066FF]">COMPARISON MATRIX</span>
            </>
          }
          subtitle="Compare speed, cost-effectiveness, and carbon profile to select the optimal transport route for your supply chain."
        />

        <div className="mt-8 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono-tech">
              <thead className="bg-slate-100 dark:bg-[#0D1527] text-slate-700 dark:text-gray-400 uppercase border-b border-slate-200 dark:border-white/10">
                <tr>
                  <th className="p-4 sm:p-5">Transport Mode</th>
                  <th className="p-4 sm:p-5">Avg Transit</th>
                  <th className="p-4 sm:p-5">Cost Index</th>
                  <th className="p-4 sm:p-5">CO2 Profile</th>
                  <th className="p-4 sm:p-5">Historical SLA</th>
                  <th className="p-4 sm:p-5">Optimal Cargo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-white/5 text-slate-700 dark:text-gray-300">
                {comparisonMatrix.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                    <td className="p-4 sm:p-5 font-bold text-slate-950 dark:text-white uppercase">{row.mode}</td>
                    <td className="p-4 sm:p-5 text-[#0066FF] dark:text-[#38bdf8] font-bold">{row.speed}</td>
                    <td className="p-4 sm:p-5 text-amber-600 dark:text-amber-400 font-bold">{row.cost}</td>
                    <td className="p-4 sm:p-5">{row.carbon}</td>
                    <td className="p-4 sm:p-5 text-emerald-600 dark:text-emerald-400 font-bold">{row.reliability}</td>
                    <td className="p-4 sm:p-5 text-slate-500 dark:text-gray-400">{row.bestFor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ServicesPage;
