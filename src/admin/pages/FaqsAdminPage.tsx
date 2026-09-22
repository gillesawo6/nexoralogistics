import React, { useState } from 'react';
import { HelpCircle, Search, ChevronDown } from 'lucide-react';
import { FAQ_DATA } from '../../data/mockData';
import { updatePageSeo } from '../../services/seoService';

export const FaqsAdminPage: React.FC = () => {
  const [search, setSearch] = useState('');

  React.useEffect(() => {
    updatePageSeo({
      title: 'Knowledge Base & FAQs | NEXORA Admin',
      description: 'Frequently asked questions on tracking, customs, charters, and temperature compliance.',
    });
  }, []);

  const filtered = FAQ_DATA.filter(f => 
    f.question.toLowerCase().includes(search.toLowerCase()) ||
    f.answer.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Knowledge Base &amp; FAQs
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Standard operating procedures and client inquiries knowledge base.
          </p>
        </div>
      </div>

      <div className="relative font-mono-tech text-xs">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search FAQs by question, category, or answer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:border-[#0066FF]"
        />
      </div>

      <div className="space-y-4">
        {filtered.map((item, i) => (
          <div
            key={i}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 rounded-md bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-[10px] uppercase font-bold">
                {item.category}
              </span>
            </div>
            <h3 className="font-heading font-bold text-base text-slate-950 dark:text-white uppercase">
              {item.question}
            </h3>
            <p className="text-xs text-slate-600 dark:text-gray-300 font-sans leading-relaxed pt-1">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
