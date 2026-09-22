import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowRight, Radio } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="pt-32 pb-24 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white min-h-[85vh] flex items-center justify-center transition-colors duration-200">
      <div className="max-w-2xl mx-auto px-4 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono-tech text-xs tracking-widest uppercase font-bold">
          <Radio className="w-3.5 h-3.5 animate-pulse text-rose-500" />
          <span>404 // COORDINATE UNRESOLVED</span>
        </div>

        <h1 className="font-heading font-black uppercase text-6xl sm:text-8xl md:text-9xl text-slate-950 dark:text-white tracking-tight leading-none">
          404<span className="text-[#0066FF]">.</span>
        </h1>

        <h2 className="font-heading font-bold uppercase text-xl sm:text-2xl text-slate-800 dark:text-gray-200">
          Waybill Out Of Range
        </h2>

        <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-light max-w-md mx-auto">
          The requested routing corridor or document page does not exist in our global registry. 
          Return to the command center or inspect active consignments.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            to="/"
            className="px-6 py-3.5 bg-[#0066FF] hover:bg-[#0052cc] rounded-xl text-white font-heading font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-[#0066FF]/30"
          >
            <span>Return to Home Desk</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/tracking"
            className="px-6 py-3.5 bg-white dark:bg-[#070D1D] hover:bg-slate-100 dark:hover:bg-[#0D1527] border border-slate-200 dark:border-white/10 rounded-xl text-slate-900 dark:text-white font-mono-tech text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Open Tracking HUD
          </Link>
        </div>
      </div>
    </div>
  );
};
