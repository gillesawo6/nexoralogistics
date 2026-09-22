import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { INDUSTRIES_DATA } from '../data/mockData';
import { SectionHeading } from '../components/ui/SectionHeading';
import { updatePageSeo } from '../services/seoService';
import { ArrowRight, CheckCircle2, ShieldCheck, ChevronRight } from 'lucide-react';

export const IndustriesPage: React.FC = () => {
  useEffect(() => {
    updatePageSeo({
      title: 'Industry Logistics Solutions | NEXORA LOGISTICS',
      description: 'Engineered multi-modal supply chain solutions for Automotive, E-Commerce, Healthcare & Pharma, High-Tech Semiconductors, and Heavy Energy projects.',
    });
  }, []);

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <span>TAILORED VERTICALS</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            ENGINEERED FOR <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              EVERY INDUSTRIAL SECTOR.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            Every vertical presents distinct compliance, thermal, and velocity requirements. 
            NEXORA builds dedicated workflows with specialized ground crews, bonded customs lanes, and custom telematics.
          </p>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {INDUSTRIES_DATA.map((ind, i) => (
            <motion.div
              key={ind.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-[#0066FF]/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-all"
            >
              <div>
                <div className="relative h-60 w-full overflow-hidden">
                  <img
                    src={ind.image}
                    alt={ind.title}
                    className="w-full h-full object-cover brightness-[0.85] dark:brightness-[0.7] group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/90 dark:from-[#070D1D] via-transparent to-transparent" />
                </div>

                <div className="p-6 sm:p-8 space-y-4">
                  <h3 className="font-heading font-extrabold text-xl text-slate-900 dark:text-white uppercase group-hover:text-[#0066FF] dark:group-hover:text-[#38bdf8] transition-colors">
                    {ind.title}
                  </h3>
                  <p className="text-slate-600 dark:text-gray-300 text-xs sm:text-sm font-light leading-relaxed">
                    {ind.description}
                  </p>

                  <div className="pt-2 space-y-2 font-mono-tech text-xs">
                    {(ind.stats || []).map((stat, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                        <span>{stat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 pt-0 mt-4 border-t border-slate-100 dark:border-white/5">
                <Link
                  to={`/quote?industry=${encodeURIComponent(ind.title)}`}
                  className="w-full mt-4 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-[#0066FF] text-slate-900 dark:text-white hover:text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors"
                >
                  <span>GET SECTOR RATE QUOTE</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
};
