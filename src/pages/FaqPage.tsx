import React, { useEffect, useState } from 'react';
import { FAQ_DATA } from '../data/mockData';
import { updatePageSeo } from '../services/seoService';
import { ChevronDown, Search, HelpCircle, ArrowRight, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export const FaqPage: React.FC = () => {
  const [openId, setOpenId] = useState<string | null>(FAQ_DATA[0].id);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  useEffect(() => {
    updatePageSeo({
      title: 'Logistics FAQ & Compliance Knowledge Base | NEXORA',
      description: 'Find answers regarding container tracking, temperature ranges, customs clearance, demurrage guarantees, and API integration.',
    });
  }, []);

  const categories = ['all', 'tracking', 'customs', 'services', 'technology', 'pricing', 'sustainability'];

  const filtered = FAQ_DATA.filter((item) => {
    const matchesSearch = item.question.toLowerCase().includes(search.toLowerCase()) || item.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCat = activeCategory === 'all' || item.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCat;
  });

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>KNOWLEDGE BASE & PROTOCOLS</span>
          </div>
          <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl md:text-6xl tracking-tight text-slate-950 dark:text-white leading-none">
            FREQUENTLY ASKED <br />
            <span className="text-[#0066FF]">QUESTIONS.</span>
          </h1>
          <p className="mt-4 text-slate-600 dark:text-gray-400 text-sm sm:text-base font-light">
            Clear, transparent answers to every question regarding international carriage, billing, customs clearance, and cold-chain compliance.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4 mb-12">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keyword (e.g. customs, cold-chain, API, tracking)..."
              className="w-full bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 focus:border-[#0066FF] rounded-2xl pl-11 pr-4 py-3.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 font-mono-tech focus:outline-none shadow-sm"
            />
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl border text-xs font-mono-tech uppercase transition-all cursor-pointer ${
                  activeCategory === cat
                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-md'
                    : 'bg-white dark:bg-[#070D1D] border-slate-200 dark:border-white/10 text-slate-600 dark:text-gray-400 hover:text-slate-950 dark:hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {filtered.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-[#070D1D] rounded-2xl border border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 font-mono-tech text-xs shadow-sm">
              No matching questions found. Contact our 24/7 support desk directly below.
            </div>
          ) : (
            filtered.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 rounded-2xl overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    className="w-full p-6 text-left flex items-center justify-between gap-4 font-heading font-bold text-lg text-slate-900 dark:text-white uppercase focus:outline-none cursor-pointer"
                  >
                    <span className="flex items-center gap-3">
                      <span className="font-mono-tech text-xs text-[#0066FF] font-bold">Q.</span>
                      <span>{faq.question}</span>
                    </span>
                    <div
                      className={`w-8 h-8 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 transition-transform duration-300 ${
                        isOpen ? 'rotate-180 bg-[#0066FF] text-white' : 'text-slate-400 dark:text-gray-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-2 text-slate-600 dark:text-gray-300 text-sm leading-relaxed font-light border-t border-slate-100 dark:border-white/5">
                      <p>{faq.answer}</p>
                      <div className="mt-4 pt-3 flex items-center justify-between text-xs font-mono-tech text-slate-400 dark:text-gray-500">
                        <span>TAG: {faq.category.toUpperCase()}</span>
                        <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold">NEXORA VERIFIED STANDARD</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Contact CTA */}
        <div className="mt-16 text-center p-8 bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl space-y-4 shadow-xl">
          <h3 className="font-heading font-extrabold text-xl uppercase text-slate-900 dark:text-white">
            Need Direct Broker Assistance?
          </h3>
          <p className="text-slate-600 dark:text-gray-400 text-xs sm:text-sm font-light max-w-md mx-auto">
            Our 24/7 global operations desks in Rotterdam, Singapore, and Chicago are ready to assist with emergency charters and tariff rulings.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg"
            >
              <span>Connect with Operations Support</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
