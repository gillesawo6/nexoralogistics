import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, ExternalLink, CheckCircle2 } from 'lucide-react';
import { INDUSTRIES_DATA } from '../../data/mockData';
import { updatePageSeo } from '../../services/seoService';

export const IndustriesAdminPage: React.FC = () => {
  React.useEffect(() => {
    updatePageSeo({
      title: 'Industry Verticals Management | NEXORA Admin',
      description: 'Review customized logistics architectures across high-value global industries.',
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Industry Vertical Solutions
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Engineered supply chains for specialized vertical markets.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INDUSTRIES_DATA.map((ind) => (
          <div
            key={ind.id}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="h-36 rounded-xl overflow-hidden relative">
                <img
                  src={ind.image}
                  alt={ind.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <span className="absolute bottom-2 left-2 text-white font-heading font-bold text-sm uppercase">
                  {ind.title}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 line-clamp-3">
                {ind.description}
              </p>

              <div className="space-y-1 font-mono-tech text-[11px] pt-1">
                {(ind.stats || []).map((s, i) => (
                  <div key={i} className="flex items-center gap-1.5 text-slate-700 dark:text-gray-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                    <span>{s}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-400">
                {ind.challenges?.length || 0} Special Protocols
              </span>
              <Link
                to="/industries"
                className="text-xs font-mono-tech font-bold text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1 hover:underline"
              >
                <span>View Public</span>
                <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
