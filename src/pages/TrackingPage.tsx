import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShipmentTracker } from '../components/tracking/ShipmentTracker';
import { updatePageSeo } from '../services/seoService';
import { Radio, ShieldCheck, Clock, MapPin, Compass } from 'lucide-react';

export const TrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const queryNumber = searchParams.get('number') || '';

  useEffect(() => {
    updatePageSeo({
      title: `Live Cargo Tracking | Consignment Visibility | NEXORA LOGISTICS`,
      description: 'Track your international freight consignment in real-time. Satellite AIS vessel telemetry, flight ADS-B vectors, cold-chain thermal sensors, and customs status.',
    });
  }, []);

  return (
    <div className="pt-28 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-screen transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="max-w-3xl mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-4 font-bold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-[#0066FF]" />
            <span>SATELLITE AIS & ADS-B TELEMETRY DESK</span>
          </div>

          <h1 className="font-heading font-black uppercase text-3xl sm:text-5xl md:text-6xl text-slate-950 dark:text-white tracking-tight leading-none">
            GLOBAL CARGO <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              OBSERVABILITY COMMAND.
            </span>
          </h1>

          <p className="mt-4 text-slate-600 dark:text-gray-400 text-sm sm:text-base font-light">
            Monitor real-time coordinates, speed vectors, container thermal sensors, and milestone audit logs across all international trade lanes.
          </p>
        </div>

        {/* Tracker Embedded Component */}
        <ShipmentTracker initialTrackingNumber={queryNumber} />
      </div>
    </div>
  );
};
