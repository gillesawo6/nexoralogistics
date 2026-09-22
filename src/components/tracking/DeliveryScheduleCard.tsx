import React from 'react';
import { Shipment, ShipmentStatus } from '../../types';
import { Calendar, Clock, CheckCircle2, AlertTriangle, ShieldCheck, ArrowRight } from 'lucide-react';

interface DeliveryScheduleCardProps {
  shipment: Shipment;
}

export const DeliveryScheduleCard: React.FC<DeliveryScheduleCardProps> = ({ shipment }) => {
  const { dates, status, progressPercent, estimatedDelivery, dispatchedDate } = shipment;

  const getStatusBadge = (st: ShipmentStatus) => {
    switch (st) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40';
      case 'On Hold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'In Transit':
      case 'Departed Origin':
      case 'Arrived at Facility':
        return 'bg-[#0066FF]/20 text-[#38bdf8] border-[#0066FF]/40';
      case 'Customs Clearance':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Exception':
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/40';
      default:
        return 'bg-gray-700/30 text-gray-300 border-gray-600/30';
    }
  };

  const departureDate = dates?.departureDate || dispatchedDate?.split(' ')[0] || '2026-08-21';
  const departureTime = dates?.departureTime || (dispatchedDate?.includes(':') ? dispatchedDate.split(' ').slice(1).join(' ') : '19:00 pm');
  const pickupDate = dates?.pickupDate || dates?.departureDate || '2026-08-24';
  const pickupTime = dates?.pickupTime || '17:00 pm';
  const expectedDelivery = dates?.expectedDeliveryDate || estimatedDelivery || '2026-08-24';
  const actualDeliveryDate = dates?.actualDeliveryDate;
  const actualDeliveryTime = dates?.actualDeliveryTime;

  return (
    <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden transition-colors">
      {/* Header with Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-white/10 mb-6">
        <div>
          <div className="text-xs font-mono-tech text-slate-500 dark:text-gray-400 uppercase tracking-wider font-semibold">
            CONSIGNMENT LIFECYCLE &amp; DISPATCH SCHEDULE
          </div>
          <div className="font-heading font-black text-xl sm:text-2xl text-slate-950 dark:text-white uppercase mt-0.5">
            Operational Timeline &amp; Status
          </div>
        </div>

        {/* Big Status Badge */}
        <div className="flex items-center gap-3">
          <div
            className={`px-4 py-2 rounded-xl border font-mono-tech text-xs sm:text-sm font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm ${getStatusBadge(
              status
            )}`}
          >
            <span className="w-2.5 h-2.5 rounded-full bg-current animate-pulse" />
            <span>STATUS: {status}</span>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6 bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5">
        <div className="flex items-center justify-between text-xs font-mono-tech mb-2">
          <span className="text-[#0066FF] dark:text-[#38bdf8] font-bold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
            TRANSIT PROGRESS
          </span>
          <span className="text-slate-900 dark:text-white font-bold">{progressPercent}% COMPLETE</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-white/5 h-2.5 rounded-full overflow-hidden border border-slate-300 dark:border-white/10 p-[1px]">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 via-[#0066FF] to-[#38bdf8] rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, Math.max(5, progressPercent))}%` }}
          />
        </div>
      </div>

      {/* 4 Date / Time Columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono-tech text-xs">
        {/* Departure Date */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-emerald-500" /> Departure Date
          </div>
          <div className="text-slate-900 dark:text-white font-bold text-sm">
            {departureDate}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {departureTime}
          </div>
        </div>

        {/* Pick-up Date */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-[#0066FF] dark:text-[#38bdf8]" /> Pick-up Date
          </div>
          <div className="text-slate-900 dark:text-white font-bold text-sm">
            {pickupDate}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {pickupTime}
          </div>
        </div>

        {/* Expected Delivery Date */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1.5 font-bold">
            <Calendar className="w-3.5 h-3.5 text-amber-500" /> Expected Delivery
          </div>
          <div className="text-[#0066FF] dark:text-[#38bdf8] font-bold text-sm">
            {expectedDelivery}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-[11px]">
            Target Consignee Dropoff
          </div>
        </div>

        {/* Actual Delivery or Estimated Status */}
        <div className="bg-slate-50 dark:bg-[#0D1527] p-4 rounded-xl border border-slate-200 dark:border-white/5 space-y-1">
          <div className="text-slate-500 dark:text-gray-400 text-[10px] uppercase flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Actual Delivery
          </div>
          <div className="text-slate-900 dark:text-white font-bold text-sm">
            {actualDeliveryDate ? actualDeliveryDate : (status === 'Delivered' ? 'Completed' : 'Pending in Corridor')}
          </div>
          <div className="text-slate-500 dark:text-gray-400 text-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-slate-400" /> {actualDeliveryTime || (status === 'Delivered' ? 'Signature Verified' : 'In Transit')}
          </div>
        </div>
      </div>
    </div>
  );
};
