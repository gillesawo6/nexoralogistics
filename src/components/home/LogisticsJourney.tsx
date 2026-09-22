import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { SectionHeading } from '../ui/SectionHeading';
import { 
  Package, 
  Truck, 
  Warehouse, 
  FileCheck2, 
  Plane, 
  Building2, 
  CheckCircle,
  Clock,
  ShieldCheck,
  Cpu
} from 'lucide-react';

export const LogisticsJourney: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'step-1',
      number: '01',
      name: 'Origin Booking & Digital PO Ingestion',
      icon: Package,
      phase: 'ORIGIN PROTOCOL',
      timeframe: 'T-00:00:00',
      description: 'Your enterprise ERP/TMS pushes EDI/API orders into NEXORA CyberFreight. Cargo dimensions, weight, HS classifications, and dangerous goods declarations are verified automatically within 180 seconds.',
      specs: [
        'Automated HS code tariff assignment via AI models',
        'Instant multi-carrier space allocation confirmation',
        'Digital bill of lading (e-BL) pre-generation',
      ],
      badge: 'API AUTOMATION',
    },
    {
      id: 'step-2',
      number: '02',
      name: 'First-Mile Pickup & Bonded Inbound',
      icon: Truck,
      phase: 'ORIGIN CONSOLIDATION',
      timeframe: 'T+04:00:00',
      description: 'GPS-tracked dedicated fleet dispatches to supplier dock. Cargo is scanned, palletized, tamper-sealed with RFID smart seals, and routed to nearest NEXORA bonded consolidation hub.',
      specs: [
        'Smart RFID geo-sealed container lock engagement',
        'Real-time tare weight & volumetric tare scan',
        'Instant supplier sign-off via cryptographic e-POD',
      ],
      badge: 'FIRST MILE TELEMETRY',
    },
    {
      id: 'step-3',
      number: '03',
      name: 'Automated Export Customs Pre-Clearance',
      icon: FileCheck2,
      phase: 'REGULATORY CLEARANCE',
      timeframe: 'T+12:00:00',
      description: 'Customs brokers lodge paperwork through government single windows before physical wheels turn. Export permits, dual-use checks, and phytosanitary certificates clear without demurrage risk.',
      specs: [
        'Direct AEO / C-TPAT green-lane priority filing',
        '99.98% zero-hold customs inspection record',
        'Digital single-window duty & tariff tax calculation',
      ],
      badge: 'AEO GREEN LANE',
    },
    {
      id: 'step-4',
      number: '04',
      name: 'International Multi-Modal Transit',
      icon: Plane,
      phase: 'GLOBAL CORRIDOR',
      timeframe: 'T+24:00:00',
      description: 'Cargo is airborne on priority widebody freighters or steaming on express container lines. Live IoT sensors transmit cabin temperature, humidity, g-force shock, and satellite coordinates every 60 seconds.',
      specs: [
        'Sub-minute Starlink & Iridium satellite telemetry',
        'Pharma cold chain (-80°C to +25°C) active validation',
        'Dynamic mid-transit rerouting for port labor disruptions',
      ],
      badge: 'SATELLITE IOT BEACON',
    },
    {
      id: 'step-5',
      number: '05',
      name: 'Destination Ramp Transfer & 3PL Sort',
      icon: Warehouse,
      phase: 'DESTINATION INTAKE',
      timeframe: 'T+48:00:00',
      description: 'Priority ramp transfer directly off tarmac to NEXORA bonded warehouse. High-speed robotic sortation breaks bulk for multi-channel distribution or forward-stocking fulfillment.',
      specs: [
        'Sub-2-hour ramp transfer from touchdown to sorting dock',
        'Robotic automated storage & retrieval (ASRS)',
        'Serial-level barcode & batch expiry verification',
      ],
      badge: 'ROBOTIC SORTATION',
    },
    {
      id: 'step-6',
      number: '06',
      name: 'Final-Mile White Glove Delivery & e-POD',
      icon: Building2,
      phase: 'FINAL FULFILLMENT',
      timeframe: 'T+72:00:00',
      description: 'Dedicated last-mile fleet executes delivery inside specified 30-minute delivery windows. Live cryptographic proof-of-delivery syncs back to your ERP with photo verification.',
      specs: [
        'Strict 30-minute SLA appointment delivery windows',
        'Uncrating, debris removal & inside white-glove placement',
        'Real-time API webhook callback to client SAP/Oracle ERP',
      ],
      badge: 'CRYPTOGRAPHIC e-POD',
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeading
          eyebrow="DETERMINISTIC END-TO-END EXECUTION"
          title={
            <>
              THE 6-PHASE <br />
              <span className="text-[#0066FF] dark:text-[#38bdf8]">SUPPLY CHAIN ENGINE</span>
            </>
          }
          subtitle="Every shipment follows an uncompromised chain of custody governed by real-time IoT beacons, automated customs clearance, and dedicated freight specialists."
        />

        {/* Phase Navigation Tabs */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const isSelected = activeStep === idx;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStep(idx)}
                className={`p-4 rounded-2xl text-left border transition-all duration-300 flex flex-col justify-between group cursor-pointer ${
                  isSelected
                    ? 'bg-[#0066FF] border-[#0066FF] text-white shadow-lg shadow-[#0066FF]/30'
                    : 'bg-white dark:bg-[#070D1D] border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/30 text-slate-700 dark:text-gray-300'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className={`font-mono-tech text-xs font-bold ${isSelected ? 'text-blue-100' : 'text-[#0066FF] dark:text-[#38bdf8]'}`}>
                    {step.number}
                  </span>
                  <Icon className={`w-5 h-5 ${isSelected ? 'text-white' : 'text-slate-500 dark:text-gray-400 group-hover:text-slate-900 dark:group-hover:text-white'}`} />
                </div>
                <div>
                  <div className={`text-[10px] font-mono-tech uppercase tracking-wider ${isSelected ? 'text-blue-100' : 'text-slate-400 dark:text-gray-500'}`}>
                    PHASE {idx + 1}
                  </div>
                  <div className={`font-heading font-bold text-xs sm:text-sm uppercase line-clamp-1 mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
                    {step.name.split('&')[0]}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* Deep-Dive Card for the Active Step */}
        <div className="mt-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.35 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-10 shadow-xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left Text Detail */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3 py-1 rounded-full bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs font-bold uppercase border border-[#0066FF]/20">
                      {steps[activeStep].phase}
                    </span>
                    <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" />
                      TIMELINE: {steps[activeStep].timeframe}
                    </span>
                    <span className="font-mono-tech text-xs text-emerald-500 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" /> {steps[activeStep].badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-black text-2xl sm:text-3xl md:text-4xl text-slate-900 dark:text-white uppercase tracking-tight">
                    {steps[activeStep].name}
                  </h3>

                  <p className="text-slate-600 dark:text-gray-300 text-sm sm:text-base leading-relaxed font-light">
                    {steps[activeStep].description}
                  </p>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-xs font-mono-tech text-slate-400 dark:text-gray-500 uppercase tracking-widest block">
                      OPERATIONAL PROTOCOL SPECIFICATIONS:
                    </span>
                    {steps[activeStep].specs.map((spec, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-800 dark:text-gray-200">
                        <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span>{spec}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Right Interactive Telemetry Box */}
                <div className="lg:col-span-5 bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
                    <div className="flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-[#0066FF] dark:text-[#38bdf8]" />
                      <span className="font-mono-tech text-xs font-bold text-slate-900 dark:text-white uppercase">
                        STAGE AUDIT TELEMETRY
                      </span>
                    </div>
                    <span className="font-mono-tech text-[10px] text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      VERIFIED SLA
                    </span>
                  </div>

                  <div className="space-y-4 font-mono-tech text-xs">
                    <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                      <span>PROTOCOL COMPLIANCE:</span>
                      <span className="text-slate-900 dark:text-white font-bold">100% ISO-9001 / IATA</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                      <span>LATENCY TO ERP SYNC:</span>
                      <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold">&lt; 420 ms</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                      <span>SECURITY ENCRYPTION:</span>
                      <span className="text-slate-900 dark:text-white font-bold">AES-256 GCM</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 dark:text-gray-400">
                      <span>CUSTODY ESCALATION:</span>
                      <span className="text-emerald-500 font-bold">AUTOMATED DISPATCH</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${((activeStep + 1) / steps.length) * 100}%` }}
                        transition={{ duration: 0.5 }}
                        className="h-full bg-[#0066FF]"
                      />
                    </div>
                    <div className="mt-2 flex justify-between text-[10px] font-mono-tech text-slate-500 dark:text-gray-400">
                      <span>ORIGIN</span>
                      <span>STAGE {activeStep + 1} OF 6</span>
                      <span>FULFILLMENT</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
