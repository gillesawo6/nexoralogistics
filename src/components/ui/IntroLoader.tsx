import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Radio } from 'lucide-react';

interface IntroLoaderProps {
  onComplete: () => void;
}

export const IntroLoader: React.FC<IntroLoaderProps> = ({ onComplete }) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING GLOBAL SATELLITE MESH');

  useEffect(() => {
    // Fast realistic progress steps without artificial lag
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(onComplete, 400);
          return 100;
        }
        const next = prev + Math.floor(Math.random() * 12) + 6;
        if (next > 30 && next < 60) {
          setStatusText('SYNCING 320+ MARITIME & AIR HUBS');
        } else if (next >= 60 && next < 90) {
          setStatusText('CALIBRATING PREDICTIVE ROUTING TELEMETRY');
        } else if (next >= 90) {
          setStatusText('NEXORA CYBERFREIGHT ONLINE');
        }
        return next > 100 ? 100 : next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {progress <= 100 && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] } }}
          className="fixed inset-0 z-[10000] bg-[#030712] flex flex-col items-center justify-center p-6 text-white select-none"
        >
          {/* Subtle tech background grids */}
          <div className="absolute inset-0 bg-grid-pattern opacity-30 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-[#0066FF]/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col items-center max-w-md w-full">
            {/* Minimal Brand Hexagon Symbol */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative mb-8"
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0066FF] to-[#052466] p-[2px] shadow-2xl shadow-[#0066FF]/30">
                <div className="w-full h-full bg-[#070D1D] rounded-2xl flex items-center justify-center">
                  <span className="font-heading font-extrabold text-2xl tracking-tighter text-white">
                    NX<span className="text-[#0066FF]">.</span>
                  </span>
                </div>
              </div>
              <div className="absolute -inset-2 rounded-2xl border border-[#0066FF]/30 animate-radar" />
            </motion.div>

            {/* Main Brand Title */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.4 }}
              className="text-center mb-8"
            >
              <h1 className="font-heading font-extrabold text-2xl tracking-[0.25em] text-white uppercase">
                NEXORA <span className="text-[#0066FF]">LOGISTICS</span>
              </h1>
              <p className="font-mono-tech text-xs tracking-widest text-gray-400 mt-1 uppercase">
                Global Intelligent Freight Network
              </p>
            </motion.div>

            {/* Telemetry Progress Bar & Counter */}
            <div className="w-full bg-[#0E1726] border border-white/10 rounded-full h-2 overflow-hidden mb-4 p-[1px]">
              <motion.div
                className="h-full bg-gradient-to-r from-[#0066FF] via-[#38bdf8] to-[#FF6600] rounded-full transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Telemetry metadata footer */}
            <div className="w-full flex items-center justify-between font-mono-tech text-xs text-gray-400">
              <div className="flex items-center gap-2">
                <Radio className="w-3.5 h-3.5 text-[#0066FF] animate-pulse" />
                <span className="truncate max-w-[240px] text-gray-300">{statusText}</span>
              </div>
              <div className="font-bold text-white tracking-wider">
                {progress.toString().padStart(2, '0')}%
              </div>
            </div>

            {/* ISO & Security badges */}
            <div className="mt-12 flex items-center gap-4 text-[11px] font-mono-tech text-gray-500 uppercase">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> C-TPAT Certified
              </span>
              <span>•</span>
              <span>IATA CEIV Pharma</span>
              <span>•</span>
              <span>ISO 9001:2026</span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
