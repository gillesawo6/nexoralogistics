import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { SERVICES_DATA } from '../../data/mockData';
import { SectionHeading } from '../ui/SectionHeading';
import { 
  ArrowRight, 
  CheckCircle2, 
  Plane, 
  Ship, 
  Truck, 
  Warehouse, 
  FileCheck, 
  Network 
} from 'lucide-react';

export const ServicesScrollStory: React.FC = () => {
  const [activeServiceId, setActiveServiceId] = useState(SERVICES_DATA[0].id);

  const getServiceIcon = (iconName: string) => {
    switch (iconName) {
      case 'Plane': return <Plane className="w-5 h-5" />;
      case 'Ship': return <Ship className="w-5 h-5" />;
      case 'Truck': return <Truck className="w-5 h-5" />;
      case 'Warehouse': return <Warehouse className="w-5 h-5" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5" />;
      default: return <Network className="w-5 h-5" />;
    }
  };

  const currentService = SERVICES_DATA.find((s) => s.id === activeServiceId) || SERVICES_DATA[0];

  return (
    <section className="relative py-24 sm:py-32 bg-slate-100/70 dark:bg-[#02050E] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="INTEGRATED FREIGHT CAPABILITIES"
            title={
              <>
                MULTI-MODAL MODES <br />
                <span className="text-[#0066FF] dark:text-[#38bdf8]">SYNCHRONIZED AS ONE</span>
              </>
            }
            subtitle="From single high-priority aerospace charters to complete omnichannel warehousing networks, explore NEXORA's 6 foundational pillars."
          />

          <Link
            to="/services"
            data-cursor="ALL"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#0066FF] font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white transition-all shadow-sm"
          >
            <span>VIEW ALL 6 MODES</span>
            <ArrowRight className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
          </Link>
        </div>

        {/* Dynamic Selector & Showcase Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Mode Selection Tabs */}
          <div className="lg:col-span-5 space-y-3">
            {SERVICES_DATA.map((service) => {
              const isSelected = service.id === activeServiceId;
              return (
                <button
                  key={service.id}
                  onClick={() => setActiveServiceId(service.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#070D1D] border-[#0066FF] shadow-lg dark:shadow-[0_10px_30px_rgba(0,102,255,0.2)]'
                      : 'bg-white/60 dark:bg-[#070D1D]/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-colors ${
                        isSelected
                          ? 'bg-[#0066FF] text-white'
                          : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'
                      }`}
                    >
                      {getServiceIcon(service.iconName)}
                    </div>
                    <div>
                      <div className="font-mono-tech text-[10px] text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase">
                        MODE {service.number}
                      </div>
                      <div className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white uppercase">
                        {service.title}
                      </div>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 transition-transform duration-300 ${
                      isSelected ? 'text-[#0066FF] dark:text-[#38bdf8] translate-x-1' : 'text-slate-400 dark:text-gray-600 opacity-0 group-hover:opacity-100'
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Right: Rich Visual Showcase of Selected Mode */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentService.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Hero Image */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src={currentService.image}
                    alt={currentService.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  {/* Badge */}
                  <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white">
                    <div>
                      <span className="font-mono-tech text-xs text-[#38bdf8] uppercase tracking-wider block">
                        CAPABILITY PROFILE
                      </span>
                      <h3 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight">
                        {currentService.title}
                      </h3>
                    </div>
                    <div className="hidden sm:block font-mono-tech text-xs bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20">
                      LEAD TIME: {currentService.leadTime}
                    </div>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                    {currentService.description}
                  </p>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {currentService.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#0D1527] p-3 rounded-xl border border-slate-200/60 dark:border-white/5"
                      >
                        <CheckCircle2 className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                        <span className="font-medium">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Bottom Action bar */}
                  <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <div className="font-mono-tech text-xs text-slate-500 dark:text-gray-400">
                      COVERAGE: <span className="text-slate-900 dark:text-white font-bold">{currentService.coverage}</span>
                    </div>

                    <Link
                      to={`/services/${currentService.id}`}
                      className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md shadow-[#0066FF]/20"
                    >
                      <span>SPECIFY THIS SERVICE</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
};
