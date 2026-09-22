import React, { useEffect } from 'react';
import { updatePageSeo } from '../services/seoService';
import { ShieldCheck, FileText } from 'lucide-react';

export const TermsPage: React.FC = () => {
  useEffect(() => {
    updatePageSeo({
      title: 'Standard Terms of Carriage & Tariff Rules | NEXORA LOGISTICS',
      description: 'NEXORA standard international terms of carriage, maritime liability, air waybill rules, demurrage guarantees, and FIATA guidelines.',
    });
  }, []);

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="w-5 h-5 text-[#0066FF]" />
          <span className="font-mono-tech text-xs text-[#0066FF] dark:text-[#38bdf8] uppercase tracking-widest font-bold">
            LEGAL CARRIAGE FRAMEWORK
          </span>
        </div>

        <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl text-slate-950 dark:text-white tracking-tight leading-none mb-4">
          TERMS OF CARRIAGE.
        </h1>
        <p className="text-xs font-mono-tech text-slate-500 dark:text-gray-500 mb-12">
          REVISED EDITION 2026 • FIATA / CMR / WARSAW-MONTREAL CONVENTION COMPLIANT
        </p>

        <div className="space-y-8 text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-6 sm:p-12 rounded-3xl shadow-xl">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              1. Scope of Service & Multi-Modal Forwarding
            </h2>
            <p>
              These conditions govern all international freight forwarding contracts, charter agreements, bonded warehousing, and customs brokerage services performed by NEXORA LOGISTICS GLOBAL INC. and its verified subsidiaries.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              2. Carrier Liability & All-Risk Coverage
            </h2>
            <p>
              Liability for cargo loss or physical damage is determined in accordance with applicable international maritime (Hague-Visby Rules), air carriage (Montreal Convention 1999), or road freight (CMR Convention) standards unless supplementary All-Risk First-Dollar Marine Insurance has been bound.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              3. Demurrage & Detention Guarantee Protocol
            </h2>
            <p>
              Under our Zero Demurrage Guarantee, NEXORA assumes liability for port storage fees resulting from administrative customs delays, provided all commercial documentation is received 72 hours prior to vessel berthing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              4. Payment Terms & Currency Rates
            </h2>
            <p>
              Standard enterprise billing terms are Net 30 days from digital proof of delivery. Spot rates are pegged to the agreed quotation currency (USD/EUR/SGD) and remain immune to mid-voyage bunker fuel volatility during the 14-day rate lock window.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};
