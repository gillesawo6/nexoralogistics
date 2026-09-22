import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { ArrowRight, PhoneCall, ShieldCheck, Zap } from 'lucide-react';

export const FinalCta: React.FC = () => {
  return (
    <section className="relative py-28 sm:py-36 bg-slate-900 dark:bg-[#02050E] text-white border-t border-slate-800 dark:border-white/10 overflow-hidden transition-colors duration-200">
      {/* Background tech grid */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        {/* Mega Container */}
        <div className="bg-gradient-to-b from-[#070D1D] to-[#040814] border border-white/10 p-8 sm:p-16 rounded-[40px] shadow-2xl relative overflow-hidden">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/20 text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-8"
          >
            <Zap className="w-4 h-4 text-[#38bdf8]" />
            <span>START SHIPPING WITH ABSOLUTE CERTAINTY</span>
          </motion.div>

          {/* Huge Headline */}
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.94] text-white"
          >
            READY TO MOVE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#38bdf8] to-white">
              YOUR BUSINESS FORWARD?
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-base sm:text-xl text-gray-300 max-w-2xl mx-auto font-light leading-relaxed"
          >
            Get instant dynamic spot quotes or schedule an operational audit with our senior multi-modal freight engineers.
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/quote"
              data-cursor="ESTIMATE"
              className="w-full sm:w-auto px-10 py-5 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-extrabold text-sm sm:text-base uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-3 shadow-2xl shadow-[#0066FF]/40 active:scale-[0.98] cursor-pointer"
            >
              <span>GET A FREIGHT QUOTE</span>
              <ArrowRight className="w-5 h-5" />
            </Link>

            <Link
              to="/contact"
              data-cursor="TALK"
              className="w-full sm:w-auto px-8 py-5 bg-white/10 hover:bg-white/20 text-white font-heading font-bold text-sm sm:text-base uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] border border-white/10 cursor-pointer"
            >
              <PhoneCall className="w-4 h-4 text-[#38bdf8]" />
              <span>TALK TO AN EXPERT</span>
            </Link>
          </motion.div>

          {/* Badges footer */}
          <div className="mt-14 pt-8 border-t border-white/10 flex flex-wrap items-center justify-center gap-8 text-xs font-mono-tech text-gray-400 uppercase">
            <span className="flex items-center gap-1.5 font-bold text-gray-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> GUARANTEED SPACE ALLOCATIONS
            </span>
            <span>•</span>
            <span>SPOT RATES VALID 14 DAYS</span>
            <span>•</span>
            <span>NO HIDDEN SURCHARGES</span>
          </div>
        </div>
      </div>
    </section>
  );
};
