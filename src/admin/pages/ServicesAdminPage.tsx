import React from 'react';
import { Link } from 'react-router-dom';
import { Layers, Plane, Ship, Truck, Building2, ShieldCheck, Cpu, Clock, ExternalLink } from 'lucide-react';
import { SERVICES_DATA } from '../../data/mockData';
import { updatePageSeo } from '../../services/seoService';

export const ServicesAdminPage: React.FC = () => {
  React.useEffect(() => {
    updatePageSeo({
      title: 'Services & Modes Management | NEXORA Admin',
      description: 'Manage multi-modal logistics services, transit SLAs, and equipment specifications.',
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10">
        <div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-slate-950 dark:text-white uppercase tracking-tight">
            Services &amp; Transport Corridors
          </h1>
          <p className="text-slate-600 dark:text-gray-400 text-xs font-mono-tech mt-1">
            Global freight modes, lead time SLAs, and multi-modal handling protocols.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SERVICES_DATA.map((srv) => (
          <div
            key={srv.id}
            className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0066FF]/10 text-[#0066FF] flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono-tech text-[#0066FF] dark:text-[#38bdf8] font-bold uppercase">
                      SERVICE {srv.number}
                    </span>
                    <h2 className="font-heading font-black text-lg text-slate-950 dark:text-white uppercase">
                      {srv.title}
                    </h2>
                  </div>
                </div>

                <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg">
                  {srv.leadTime}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-gray-300 font-sans leading-relaxed">
                {srv.description}
              </p>

              <div className="space-y-1.5 font-mono-tech text-xs pt-2">
                {srv.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-slate-700 dark:text-gray-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#0066FF]" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
              <span className="text-[10px] font-mono-tech text-slate-400 uppercase">
                COVERAGE: {srv.coverage}
              </span>
              <Link
                to={`/services/${srv.id}`}
                className="inline-flex items-center gap-1.5 text-xs font-mono-tech font-bold text-[#0066FF] dark:text-[#38bdf8] hover:underline"
              >
                <span>View Public Page</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
