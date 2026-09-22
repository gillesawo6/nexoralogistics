import React from 'react';

export const RouteLoadingFallback: React.FC = () => {
  return (
    <div className="w-full min-h-[60vh] flex flex-col items-center justify-center p-8">
      {/* Top indeterminate progress line */}
      <div className="fixed top-0 left-0 right-0 h-0.5 bg-slate-800 z-50 overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#0066FF] to-[#00F0FF] animate-pulse w-full" />
      </div>

      <div className="flex flex-col items-center gap-4">
        <div className="relative w-10 h-10">
          <div className="absolute inset-0 rounded-full border-2 border-slate-700/40 border-t-[#0066FF] animate-spin" />
        </div>
        <span className="text-[11px] font-mono uppercase tracking-widest text-slate-400">
          Loading...
        </span>
      </div>
    </div>
  );
};
