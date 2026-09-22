import React, { useEffect, useState } from 'react';
import { CASE_STUDIES_DATA } from '../data/mockData';
import { SectionHeading } from '../components/ui/SectionHeading';
import { updatePageSeo } from '../services/seoService';
import { ArrowRight, Quote, CheckCircle2, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

export const CaseStudiesPage: React.FC = () => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  useEffect(() => {
    updatePageSeo({
      title: 'Enterprise Case Studies & ROI Reports | NEXORA LOGISTICS',
      description: 'Discover how global retailers, automotive manufacturers, and pharmaceutical leaders eliminate supply chain latency with NEXORA.',
    });
  }, []);

  const industries = ['all', 'Retail & Consumer Goods', 'Automotive & EV', 'Healthcare & Pharma'];

  const filtered = selectedIndustry === 'all'
    ? CASE_STUDIES_DATA
    : CASE_STUDIES_DATA.filter((c) => c.industry.toLowerCase().includes(selectedIndustry.toLowerCase()));

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-4xl mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <span>VERIFIED OUTCOMES</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            REAL-WORLD IMPACT. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              VERIFIED ROI RESULTS.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            See how enterprise leaders leverage NEXORA multi-modal freight networks, predictive customs, and real-time telematics to outpace market volatility.
          </p>
        </div>

        {/* Industry Filters */}
        <div className="flex flex-wrap gap-2 mb-12">
          {industries.map((ind) => (
            <button
              key={ind}
              onClick={() => setSelectedIndustry(ind)}
              className={`px-4 py-2 rounded-xl border text-xs font-mono-tech uppercase transition-all ${
                selectedIndustry === ind
                  ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30'
                  : 'bg-white dark:bg-[#070D1D] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-[#0066FF] dark:hover:text-white'
              }`}
            >
              {ind === 'all' ? 'All Industries' : ind}
            </button>
          ))}
        </div>

        {/* Studies List */}
        <div className="space-y-16">
          {filtered.map((study) => (
            <div
              key={study.id}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-xl p-6 sm:p-12 space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="font-mono-tech text-xs text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase bg-blue-50 dark:bg-[#0066FF]/15 px-3 py-1 rounded-full border border-blue-200 dark:border-transparent">
                      {study.industry}
                    </span>
                    <span className="text-xs font-mono-tech text-slate-500 dark:text-gray-400">
                      CLIENT: {study.client}
                    </span>
                  </div>

                  <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase leading-tight">
                    {study.title}
                  </h2>

                  <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                    {study.summary}
                  </p>

                  <div className="space-y-4 pt-2 font-light text-xs sm:text-sm text-slate-600 dark:text-gray-300">
                    <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5">
                      <strong className="text-slate-900 dark:text-white uppercase font-mono-tech block mb-1">
                        Operational Challenge:
                      </strong>
                      {study.challenge}
                    </div>
                    <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5">
                      <strong className="text-slate-900 dark:text-white uppercase font-mono-tech block mb-1">
                        NEXORA Engineered Solution:
                      </strong>
                      {study.solution}
                    </div>
                  </div>

                  {/* Results Highlights */}
                  <div className="grid grid-cols-3 gap-4 pt-2">
                    {study.results.map((res, i) => (
                      <div key={i} className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5">
                        <div className="font-heading font-black text-2xl sm:text-3xl text-[#0066FF] dark:text-[#38bdf8]">
                          {res.metric}
                        </div>
                        <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 mt-1">
                          {res.label}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Image & Quote Column */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="h-72 rounded-2xl overflow-hidden relative shadow-md">
                    <img
                      src={study.heroImage}
                      alt={study.title}
                      className="w-full h-full object-cover brightness-[0.9] dark:brightness-[0.8]"
                    />
                  </div>

                  {/* Quote Block */}
                  <div className="p-6 bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl relative shadow-sm">
                    <Quote className="w-8 h-8 text-[#0066FF] mb-3 opacity-60" />
                    <p className="italic text-sm text-slate-700 dark:text-gray-200">
                      "{study.quote.text}"
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200 dark:border-white/5 text-xs">
                      <span className="font-heading font-bold text-slate-900 dark:text-white block">
                        {study.quote.author}
                      </span>
                      <span className="text-slate-500 dark:text-gray-400 font-mono-tech text-[11px]">
                        {study.quote.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
