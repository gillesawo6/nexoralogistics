import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { INDUSTRIES_DATA } from '../../data/mockData';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, CheckCircle2, ShieldCheck } from 'lucide-react';

export const IndustriesInteractive: React.FC = () => {
  const [activeIndustryId, setActiveIndustryId] = useState(INDUSTRIES_DATA[0].id);

  const current = INDUSTRIES_DATA.find((ind) => ind.id === activeIndustryId) || INDUSTRIES_DATA[0];

  return (
    <section className="relative py-24 sm:py-32 bg-slate-100/70 dark:bg-[#02050E] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="SECTOR-SPECIFIC LOGISTICS SOLUTIONS"
            title={
              <>
                MISSION-CRITICAL <br />
                <span className="text-[#0066FF] dark:text-[#38bdf8]">INDUSTRY VERTICALS</span>
              </>
            }
            subtitle="Generic freight forwarding fails in complex verticals. Discover bespoke protocols engineered specifically for high-compliance global markets."
          />

          <Link
            to="/industries"
            data-cursor="ALL"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#0066FF] font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white transition-all shadow-sm"
          >
            <span>ALL 6 VERTICALS</span>
            <ArrowRight className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
          </Link>
        </div>

        {/* 2-Column Interactive Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Verticals Selector Pills */}
          <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
            {INDUSTRIES_DATA.map((ind) => {
              const isSelected = ind.id === activeIndustryId;
              return (
                <button
                  key={ind.id}
                  onClick={() => setActiveIndustryId(ind.id)}
                  className={`w-full text-left p-5 rounded-2xl border transition-all duration-300 flex items-center justify-between group cursor-pointer ${
                    isSelected
                      ? 'bg-white dark:bg-[#070D1D] border-[#0066FF] shadow-lg dark:shadow-[0_10px_30px_rgba(0,102,255,0.2)]'
                      : 'bg-white/60 dark:bg-[#070D1D]/40 border-slate-200/80 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/20'
                  }`}
                >
                  <div>
                    <div className="font-mono-tech text-[10px] text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase tracking-wider">
                      {ind.id.toUpperCase()} SECTOR
                    </div>
                    <div className="font-heading font-bold text-base sm:text-lg text-slate-900 dark:text-white uppercase">
                      {ind.title}
                    </div>
                  </div>

                  <span
                    className={`font-mono-tech text-xs font-bold px-2.5 py-1 rounded-lg border transition-colors ${
                      isSelected
                        ? 'bg-[#0066FF] text-white border-[#0066FF]'
                        : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 border-slate-200 dark:border-white/10 group-hover:text-slate-900 dark:group-hover:text-white'
                    }`}
                  >
                    {ind.stats[0] || 'VERIFIED'}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right: Selected Vertical Showcase */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35 }}
                className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl"
              >
                {/* Visual Banner */}
                <div className="relative h-64 sm:h-80 w-full overflow-hidden">
                  <img
                    src={current.image}
                    alt={current.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  
                  <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between text-white">
                    <div>
                      <span className="font-mono-tech text-xs text-[#38bdf8] uppercase tracking-wider block">
                        VERTICAL ARCHITECTURE
                      </span>
                      <h3 className="font-heading font-black text-2xl sm:text-3xl uppercase tracking-tight">
                        {current.title}
                      </h3>
                    </div>
                    <div className="font-mono-tech text-xs bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20">
                      {current.subtitle}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-6">
                  <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                    {current.description}
                  </p>

                  {/* Highlights from stats */}
                  <div className="space-y-3 pt-2">
                    <span className="text-xs font-mono-tech text-slate-400 dark:text-gray-500 uppercase tracking-widest block">
                      KEY INDUSTRY CAPABILITIES & METRICS:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {current.stats.map((stat, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700 dark:text-gray-300 bg-slate-50 dark:bg-[#0D1527] p-3 rounded-xl border border-slate-200/60 dark:border-white/5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                          <span>{stat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Footer Bar */}
                  <div className="pt-6 border-t border-slate-100 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
                    <span className="font-mono-tech text-xs text-emerald-500 font-bold flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> GUARANTEED COMPLIANCE SLA
                    </span>

                    <Link
                      to="/industries"
                      className="px-5 py-2.5 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-colors flex items-center gap-2 shadow-md shadow-[#0066FF]/20"
                    >
                      <span>VIEW INDUSTRY SPECS</span>
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
