import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ExternalLink, ArrowRight } from 'lucide-react';
import { CASE_STUDIES_DATA } from '../../data/mockData';
import { updatePageSeo } from '../../services/seoService';

export const CaseStudiesAdminPage: React.FC = () => {
  React.useEffect(() => {
    updatePageSeo({
      title: 'Enterprise Case Studies | NEXORA Admin',
      description: 'Manage verified enterprise logistics deployments and client efficiency benchmarks.',
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Case Studies &amp; Benchmarks
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Verified efficiency gains and operational success records.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {CASE_STUDIES_DATA.map((cs) => (
          <div
            key={cs.id}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-md bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs font-bold uppercase">
                  {cs.client}
                </span>
                <span className="font-mono-tech text-xs text-slate-500">{cs.industry}</span>
              </div>

              <h2 className="font-heading font-bold text-lg text-slate-950 dark:text-white uppercase">
                {cs.title}
              </h2>

              <p className="text-xs text-slate-600 dark:text-gray-300 font-sans">
                {cs.summary}
              </p>

              <div className="grid grid-cols-3 gap-2 pt-2 font-mono-tech text-xs">
                {(cs.results || []).map((m, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5">
                    <div className="font-bold text-slate-900 dark:text-white">{m.metric}</div>
                    <div className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-400">
                Industry: {cs.industry}
              </span>
              <Link
                to="/case-studies"
                className="text-xs font-mono-tech font-bold text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1 hover:underline"
              >
                <span>View Public</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
