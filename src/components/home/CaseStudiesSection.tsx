import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { CASE_STUDIES_DATA } from '../../data/mockData';
import { SectionHeading } from '../ui/SectionHeading';
import { ArrowRight, Quote } from 'lucide-react';

export const CaseStudiesSection: React.FC = () => {
  return (
    <section className="relative py-24 sm:py-32 bg-slate-100/70 dark:bg-[#02050E] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="PROVEN VALUE CREATION"
            title={
              <>
                MISSION-CRITICAL <br />
                <span className="text-[#0066FF] dark:text-[#38bdf8]">SUCCESS STORIES</span>
              </>
            }
            subtitle="Explore how Fortune 500 enterprises and hyper-growth disruptors optimize supply chain velocity and slash operational risk with NEXORA."
          />

          <Link
            to="/case-studies"
            data-cursor="ALL"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-[#0066FF] font-heading font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white transition-all shadow-sm"
          >
            <span>VIEW ALL CASE STUDIES</span>
            <ArrowRight className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
          </Link>
        </div>

        {/* Case Studies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {CASE_STUDIES_DATA.map((study, idx) => (
            <motion.div
              key={study.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.15 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-[#0066FF]/40 rounded-3xl overflow-hidden shadow-xl flex flex-col justify-between group transition-colors"
            >
              <div>
                {/* Image Banner */}
                <div className="relative h-56 w-full overflow-hidden">
                  <img
                    src={study.heroImage}
                    alt={study.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
                  <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-lg border border-white/20 text-[11px] font-mono-tech text-[#38bdf8] uppercase">
                    {study.industry}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 sm:p-8 space-y-4">
                  <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                    CLIENT: <span className="text-slate-900 dark:text-white font-bold">{study.client}</span>
                  </div>

                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white uppercase group-hover:text-[#0066FF] dark:group-hover:text-[#38bdf8] transition-colors line-clamp-2">
                    {study.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-gray-300 font-light leading-relaxed line-clamp-3">
                    {study.summary}
                  </p>

                  {/* Highlight Metrics */}
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {study.results.slice(0, 2).map((res, rIdx) => (
                      <div key={rIdx} className="bg-slate-50 dark:bg-[#0D1527] p-3 rounded-xl border border-slate-200/60 dark:border-white/5">
                        <div className="font-heading font-black text-xl text-[#0066FF] dark:text-[#38bdf8]">
                          {res.metric}
                        </div>
                        <div className="text-[10px] font-mono-tech text-slate-500 dark:text-gray-400 mt-0.5 line-clamp-1 uppercase">
                          {res.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Quote / CTA */}
              <div className="p-6 pt-0 border-t border-slate-100 dark:border-white/10 mt-4">
                <div className="italic text-xs text-slate-600 dark:text-gray-400 line-clamp-2 mb-4 pt-4 flex gap-2">
                  <Quote className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />
                  <span>"{study.quote.text}"</span>
                </div>

                <Link
                  to={`/case-studies`}
                  className="w-full py-3 rounded-xl bg-slate-100 hover:bg-[#0066FF] dark:bg-white/5 dark:hover:bg-[#0066FF] text-slate-800 dark:text-white hover:text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <span>READ FULL REPORT</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
