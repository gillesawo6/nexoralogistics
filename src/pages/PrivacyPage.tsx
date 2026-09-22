import React, { useEffect } from 'react';
import { updatePageSeo } from '../services/seoService';
import { ShieldCheck, Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  useEffect(() => {
    updatePageSeo({
      title: 'Global Privacy Policy & Data Sovereignty | NEXORA LOGISTICS',
      description: 'NEXORA data privacy standards, GDPR compliance, satellite telemetry data handling, and corporate confidentiality policies.',
    });
  }, []);

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-4">
          <Lock className="w-5 h-5 text-[#0066FF]" />
          <span className="font-mono-tech text-xs text-[#0066FF] dark:text-[#38bdf8] uppercase tracking-widest font-bold">
            DATA SECURITY & COMPLIANCE
          </span>
        </div>

        <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl text-slate-950 dark:text-white tracking-tight leading-none mb-4">
          GLOBAL PRIVACY POLICY.
        </h1>
        <p className="text-xs font-mono-tech text-slate-500 dark:text-gray-500 mb-12">
          EFFECTIVE DATE: AUGUST 2026 • COMPLIANT WITH GDPR / CCPA / HIPAA
        </p>

        <div className="space-y-8 text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-6 sm:p-12 rounded-3xl shadow-xl">
          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              1. Information Collection & Telemetry
            </h2>
            <p>
              NEXORA LOGISTICS collects business contact credentials, bill of lading documentation, customs commercial invoices, and real-time cargo sensor readings (GPS coordinates, temperature, atmospheric pressure, and vibration logs) solely to fulfill freight transportation contracts.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              2. Satellite IoT & Sensor Encryption
            </h2>
            <p>
              All sensor data transmitted via Iridium satellite uplinks and cellular IoT mesh is encrypted using AES-256 and stored in sovereign data centers within the European Union and the United States in compliance with local sovereignty frameworks.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              3. Customs & Regulatory Disclosure
            </h2>
            <p>
              To ensure compliance with global customs agencies (including US CBP, EU ICS2, Singapore Customs, and WCO standards), consignment details are submitted through secure single-window digital EDI channels. We do not sell or monetize client manifest data.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
              4. Data Retention & Erasure
            </h2>
            <p>
              Under international maritime and aviation law, shipment audit logs and electronic proof-of-delivery signatures are retained for seven (7) years. Enterprise accounts may request full pseudonymization of historical records upon contract conclusion.
            </p>
          </section>

          <div className="p-4 bg-slate-50 dark:bg-[#0D1527] rounded-xl border border-slate-200 dark:border-white/5 font-mono-tech text-xs text-slate-600 dark:text-gray-400">
            For data protection officer inquiries: <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold">dpo@nexoralogistics.com</span>
          </div>
        </div>
      </div>
    </div>
  );
};
