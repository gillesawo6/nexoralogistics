import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FAQ_DATA } from '../../data/mockData';
import { SectionHeading } from '../ui/SectionHeading';
import { ChevronDown, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FaqSection: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0].id);

  const toggleFaq = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section className="relative py-24 sm:py-32 bg-slate-100/70 dark:bg-[#02050E] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <SectionHeading
            align="center"
            eyebrow="CLEAR TRANSPARENT OPERATIONS"
            title={
              <>
                FREQUENTLY ASKED <br />
                <span className="text-[#0066FF] dark:text-[#38bdf8]">QUESTIONS & PROTOCOLS</span>
              </>
            }
            subtitle="Everything you need to know about booking, tracking accuracy, customs pre-clearance, and enterprise SLA guarantees."
          />
        </div>

        {/* Accordion Container */}
        <div className="space-y-4">
          {FAQ_DATA.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white dark:bg-[#070D1D] border rounded-2xl overflow-hidden transition-all duration-300 ${
                  isOpen ? 'border-[#0066FF] shadow-lg dark:shadow-[0_10px_25px_rgba(0,102,255,0.15)]' : 'border-slate-200 dark:border-white/10'
                }`}
              >
                <button
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-lg sm:text-xl text-slate-900 dark:text-white uppercase focus:outline-none cursor-pointer"
                >
                  <span className="flex items-center gap-3.5">
                    <span className="font-mono-tech text-xs text-[#0066FF] dark:text-[#38bdf8] font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10">
                      Q.
                    </span>
                    <span>{faq.question}</span>
                  </span>
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform duration-300 ${
                      isOpen 
                        ? 'rotate-180 bg-[#0066FF] text-white' 
                        : 'bg-slate-100 dark:bg-white/5 text-slate-500 dark:text-gray-400'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light border-t border-slate-100 dark:border-white/5">
                        <p>{faq.answer}</p>
                        <div className="mt-4 pt-3 flex items-center justify-between text-xs font-mono-tech text-slate-400 dark:text-gray-500">
                          <span>CATEGORY: {faq.category.toUpperCase()}</span>
                          <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> VERIFIED NEXORA STANDARD
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* Bottom CTA Card */}
        <div className="mt-12 text-center p-8 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl shadow-lg">
          <p className="text-slate-700 dark:text-gray-300 text-sm">Have specific hazardous goods or multi-country tariff inquiries?</p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/faq"
              className="px-5 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-800 dark:text-white font-mono-tech text-xs uppercase tracking-wider transition-colors"
            >
              Browse Full Knowledge Base
            </Link>
            <Link
              to="/contact"
              className="px-6 py-3 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#0066FF]/30 active:scale-95"
            >
              <span>Speak with a Customs Specialist</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
