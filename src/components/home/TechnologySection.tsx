import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { SectionHeading } from '../ui/SectionHeading';
import { 
  Terminal, 
  Cpu, 
  Satellite, 
  Activity, 
  Layers, 
  Radio, 
  ArrowRight,
  Database,
  Lock,
  Workflow
} from 'lucide-react';

export const TechnologySection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'iot' | 'predictive' | 'controlTower' | 'api'>('iot');

  const techFeatures = {
    iot: {
      title: 'Active IoT Satellite Telemetry',
      subtitle: 'Sub-minute autonomous sensor beacons transmit location, shock, and temperature.',
      stats: '1,450,000+ Pings / Day',
      details: [
        'Starlink & Iridium low-Earth-orbit dual-redundant satellite uplink',
        'Continuous ambient humidity, g-force shock, and tilt detection',
        'Pharma cold chain active temperature dataloggers (-80°C cryogenic to +25°C)',
        'Tamper-evident smart locks with cryptographic geo-fencing triggers',
      ],
      terminalSnippet: `[NEXORA_IOT_DAEMON v4.12]
>> SATELLITE_LOCK: IRIDIUM_SV_44 (ELEVATION: 64.2°)
>> PACKET_ID: #NX-88219-TLM
>> COORD: 1°17'44.2"N 103°51'15.4"E (STRAIT OF MALACCA)
>> CONTAINER_STATUS: TAMPER_SEAL_INTACT
>> AMBIENT_TEMP: +4.2°C (TARGET: +4.0°C +/- 0.5°C) [NOMINAL]
>> G_FORCE_MAX: 0.12G [STABLE]
>> TRANSMISSION_INTERVAL: 60s`,
    },
    predictive: {
      title: 'Predictive ETA & Weather Rerouting AI',
      subtitle: 'Dynamic risk scoring before disruptions materialize at maritime ports or hubs.',
      stats: '99.4% ETA Accuracy',
      details: [
        'Continuous analysis of 450+ global marine weather satellite feeds',
        'Real-time dwell time modeling across 120 key container terminals',
        'Automated proactive mode diversion (Sea-Air hybrid reroute proposals)',
        'Carrier schedule reliability and blank sailings forecasting',
      ],
      terminalSnippet: `[NEXORA_PREDICTIVE_ENGINE]
>> CORRIDOR: SHANGHAI (SHA) -> ROTTERDAM (RTM)
>> DETECTED_ANOMALY: TYPHOON FORMATION VECTOR [EAST CHINA SEA]
>> PROJECTED_PORT_CONGESTION: +4.2 DAYS DWELL AT NINGBO
>> MITIGATION_PROPOSAL: REROUTE 400 TEU VIA SUEZ EXPRESS CORRIDOR
>> REVISED_TRANSIT_ESTIMATE: 22.4 DAYS (SLA VARIANCE: 0.0%)
>> AUTO_TRIGGER: SHIPPER_NOTIFICATION_DISPATCHED`,
    },
    controlTower: {
      title: '4PL Unified Control Tower',
      subtitle: 'One single pane of glass orchestrating all forwarders, carriers, and 3PL nodes.',
      stats: '100% SKU-Level Visibility',
      details: [
        'Single pane of glass across multi-vendor logistics ecosystems',
        'Custom exception alerting: delay thresholds, temperature spikes, dwell alarms',
        'Multi-currency automated freight audit and dispute resolution',
        'Carbon emissions accounting complying with ISO 14083 / GLEC standards',
      ],
      terminalSnippet: `[NEXORA_CONTROL_TOWER_CORE]
>> ACTIVE_CARGO_VALUE: $418,290,400 USD
>> MONITORED_LANES: 412
>> OPEN_EXCEPTIONS: 0 CRITICAL / 2 MINOR (RESOLVED)
>> CARRIER_COMPLIANCE_SCORE: 99.82%
>> FREIGHT_AUDIT_BOT: 14,200 INVOICES MATCHED (100% ACCURACY)
>> CARBON_BUDGET_SAVINGS: 382.4 MT CO2e`,
    },
    api: {
      title: 'RESTful API & Webhooks Ecosystem',
      subtitle: 'Direct developer primitives to embed global freight booking inside your product.',
      stats: '< 120ms API Response',
      details: [
        'Comprehensive OpenAPI 3.0 specification with TypeScript and Python SDKs',
        'Instant rate quote generation and carrier contract locking endpoints',
        'Webhooks triggered on milestone events (customs clear, out for delivery)',
        'Native connectors for SAP S/4HANA, Oracle SCM, Microsoft Dynamics, and Shopify',
      ],
      terminalSnippet: `POST /v2/shipments/book HTTP/1.1
Host: api.nexora.com
Authorization: Bearer nx_live_sec_8923fd8e...
Content-Type: application/json

{
  "origin": "HKG",
  "destination": "ORD",
  "service_tier": "air_priority_charter",
  "cargo": { "weight_kg": 4200, "pieces": 8 },
  "guaranteed_sla_hours": 36
}
HTTP/1.1 201 Created -> { "tracking_no": "NX-9428-HKG", "status": "CONFIRMED" }`,
    },
  };

  const current = techFeatures[activeTab];

  return (
    <section className="relative py-24 sm:py-32 bg-slate-900 dark:bg-[#030712] text-white overflow-hidden transition-colors duration-200">
      {/* Subtle tech grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="CYBERFREIGHT™ PROPRIETARY ENGINE"
            title={
              <>
                INTELLIGENT SUPPLY CHAIN <br />
                <span className="text-[#38bdf8]">ORCHESTRATION PLATFORM</span>
              </>
            }
            subtitle="Freight forwarding transformed into high-velocity code. Connect your enterprise directly to satellite beacons, autonomous customs pipelines, and global booking APIs."
          />

          <Link
            to="/technology"
            data-cursor="TECH"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 font-heading font-bold text-xs uppercase tracking-wider text-[#38bdf8] hover:text-white transition-all shadow-sm"
          >
            <span>DEEP TECH ARCHITECTURE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Tab Controls */}
        <div className="flex flex-wrap gap-2 mb-8">
          {[
            { id: 'iot', label: 'IoT Satellite Telemetry', icon: Satellite },
            { id: 'predictive', label: 'Predictive ETA AI', icon: Cpu },
            { id: 'controlTower', label: '4PL Control Tower', icon: Layers },
            { id: 'api', label: 'Developer API & EDI', icon: Terminal },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl font-heading font-bold text-xs uppercase tracking-wider transition-all cursor-pointer border ${
                  isSelected
                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30'
                    : 'bg-[#070D1D] border-white/10 text-gray-400 hover:text-white hover:border-white/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Cockpit Terminal HUD */}
        <div className="bg-[#070D1D] border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
          {/* Header Bar */}
          <div className="bg-[#0A1224] px-6 py-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="font-mono-tech text-xs text-gray-400">
                CYBERFREIGHT_CORE_NODE // {activeTab.toUpperCase()}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span className="font-mono-tech text-xs text-emerald-400 font-bold">
                SYSTEM STATUS: OPTIMAL
              </span>
            </div>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Capability Details */}
            <div className="lg:col-span-6 space-y-6">
              <div>
                <span className="font-mono-tech text-xs text-[#38bdf8] font-bold uppercase tracking-wider block mb-1">
                  ENTERPRISE CAPABILITY
                </span>
                <h3 className="font-heading font-black text-2xl sm:text-3xl text-white uppercase tracking-tight">
                  {current.title}
                </h3>
                <p className="mt-2 text-gray-300 text-sm sm:text-base font-light leading-relaxed">
                  {current.subtitle}
                </p>
              </div>

              <div className="space-y-3">
                {current.details.map((detail, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-gray-300">
                    <span className="font-mono-tech text-[#38bdf8] font-bold mt-0.5">▶</span>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono-tech text-gray-400 uppercase block">
                    TELEMETRY PERFORMANCE
                  </span>
                  <span className="font-heading font-black text-xl text-white">
                    {current.stats}
                  </span>
                </div>

                <Link
                  to="/technology"
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono-tech text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5"
                >
                  <span>Explore Architecture</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Right: Live Terminal Emulator Output */}
            <div className="lg:col-span-6">
              <div className="bg-[#030611] rounded-2xl p-5 border border-white/10 font-mono-tech text-xs sm:text-sm text-emerald-400/90 leading-relaxed shadow-inner overflow-x-auto">
                <div className="text-gray-500 mb-3 pb-2 border-b border-white/5 flex items-center justify-between text-[11px]">
                  <span>bash - nexora-cli --stream-telemetry</span>
                  <span>UTF-8</span>
                </div>
                <pre className="whitespace-pre font-mono text-[11px] sm:text-xs text-gray-200">
                  {current.terminalSnippet}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
