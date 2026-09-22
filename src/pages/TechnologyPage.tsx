import React, { useEffect, useState } from 'react';
import { SectionHeading } from '../components/ui/SectionHeading';
import { updatePageSeo } from '../services/seoService';
import { 
  Terminal, 
  Cpu, 
  Wifi, 
  ShieldCheck, 
  Activity, 
  Code2, 
  Layers, 
  Lock, 
  Check, 
  Copy,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TechnologyPage: React.FC = () => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    updatePageSeo({
      title: 'CyberFreight Logistics Technology Platform | NEXORA',
      description: 'Explore the NEXORA CyberFreight platform: Satellite IoT telematics, predictive machine-learning voyage optimization, and enterprise API integrations.',
    });
  }, []);

  const sampleApiPayload = `{
  "status": "success",
  "data": {
    "consignment_id": "NX-4829-2026",
    "carrier": "NEXORA Ocean Line Express",
    "telemetry": {
      "gps": { "lat": 27.8423, "lng": 34.2882 },
      "speed_knots": 19.4,
      "temp_celsius": 18.2,
      "humidity_pct": 52,
      "shock_g_max": 0.08,
      "container_seal_intact": true
    },
    "milestones": {
      "origin": "Shanghai Pudong Mega Hub (PVG)",
      "current_corridor": "Suez Maritime Transit Corridor",
      "destination": "Port of Rotterdam (RTM)",
      "progress_pct": 68,
      "eta_utc": "2026-08-28T14:00:00Z"
    },
    "customs": {
      "status": "ELECTRONIC_PRE_CLEARED",
      "declaration_ref": "EU-ICS2-998124",
      "green_channel": true
    }
  }
}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(sampleApiPayload);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white transition-colors duration-200">
      {/* Hero */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        <div className="max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4">
            <Cpu className="w-3.5 h-3.5" />
            <span>CYBERFREIGHT PROPRIETARY ENGINE</span>
          </div>
          <h1 className="font-heading font-black uppercase text-4xl sm:text-6xl md:text-7xl tracking-tight text-slate-950 dark:text-white leading-none">
            INTELLIGENT SUPPLY <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              CHAIN ARCHITECTURE.
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-gray-300 font-light max-w-2xl leading-relaxed">
            Eliminating blind spots across ocean, air, and overland routes with edge IoT sensors, satellite AIS telemetry, and automated machine learning.
          </p>
        </div>
      </section>

      {/* 4 Pillars Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Activity,
              title: 'Predictive Voyage Routing',
              desc: 'Dynamic ocean current and jetstream analysis calculating optimum speed vectors to avoid storms and congestion.',
            },
            {
              icon: Wifi,
              title: 'Satellite IoT Sensor Mesh',
              desc: 'Continuous real-time telemetry: cryogenic temperature (-80°C), humidity, barometric pressure, and container breach alarms.',
            },
            {
              icon: ShieldCheck,
              title: 'Automated HS Customs AI',
              desc: 'Harmonized code audit and single-window digital filing 72 hours prior to vessel arrival with 99.7% first-pass clearance.',
            },
            {
              icon: Layers,
              title: 'Enterprise ERP Webhooks',
              desc: 'Seamless JSON REST and GraphQL streaming directly into SAP, Oracle, NetSuite, and Microsoft Dynamics.',
            },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div
                key={i}
                className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 p-6 sm:p-8 rounded-3xl space-y-4 hover:border-[#0066FF]/40 transition-all shadow-lg"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#0066FF]/10 dark:bg-[#0066FF]/15 flex items-center justify-center text-[#0066FF] dark:text-[#38bdf8]">
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-heading font-bold text-xl uppercase text-slate-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-gray-400 font-light leading-relaxed">
                  {item.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Developer API & Webhook JSON Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/15 rounded-3xl p-6 sm:p-12 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Description */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono-tech text-xs uppercase">
                <Code2 className="w-3.5 h-3.5" /> DEVELOPER READY API
              </div>
              <h2 className="font-heading font-extrabold text-2xl sm:text-4xl text-slate-900 dark:text-white uppercase leading-tight">
                REST & GraphQL API Webhooks
              </h2>
              <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                Connect your internal ERP or warehouse management system directly with our sub-second telemetry streams. 
                Trigger purchase order line updates, automatic invoice verification, and temperature alerts without manual intervention.
              </p>
              <div className="pt-2">
                <Link
                  to="/quote"
                  className="inline-flex items-center gap-2 px-6 py-3.5 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-lg shadow-[#0066FF]/20"
                >
                  <span>REQUEST API DEVELOPER ACCESS</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Code Window */}
            <div className="lg:col-span-7 bg-slate-950 dark:bg-[#02050E] border border-slate-800 dark:border-white/10 rounded-2xl overflow-hidden shadow-2xl">
              <div className="flex items-center justify-between px-4 py-3 bg-slate-900 dark:bg-[#070D1D] border-b border-slate-800 dark:border-white/10 font-mono-tech text-xs text-gray-400">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span className="ml-2 text-gray-300">GET /api/v1/shipments/NX-4829-2026/telemetry</span>
                </div>
                <button
                  onClick={handleCopyCode}
                  className="flex items-center gap-1.5 text-gray-400 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'COPIED' : 'COPY'}</span>
                </button>
              </div>

              <pre className="p-4 text-xs font-mono-tech text-[#38bdf8] overflow-x-auto leading-relaxed">
                <code>{sampleApiPayload}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
