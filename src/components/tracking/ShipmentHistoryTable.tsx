import React from 'react';
import { TrackingEvent, ShipmentStatus } from '../../types';
import { Clock, CheckCircle2, MapPin, UserCheck, MessageSquare, History } from 'lucide-react';

interface ShipmentHistoryTableProps {
  events: TrackingEvent[];
}

export const ShipmentHistoryTable: React.FC<ShipmentHistoryTableProps> = ({ events }) => {
  const getStatusBadge = (status: ShipmentStatus) => {
    switch (status) {
      case 'Delivered':
        return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'On Hold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'In Transit':
      case 'Departed Origin':
      case 'Arrived at Facility':
        return 'bg-[#0066FF]/20 text-[#38bdf8] border-[#0066FF]/40';
      case 'Customs Clearance':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30';
      case 'Exception':
      case 'Cancelled':
        return 'bg-rose-500/20 text-rose-400 border-rose-500/30';
      default:
        return 'bg-gray-700/30 text-gray-300 border-gray-600/30';
    }
  };

  return (
    <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl space-y-6 transition-colors">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-[#0066FF]" />
          <h3 className="font-heading font-bold text-lg text-slate-950 dark:text-white uppercase tracking-wider">
            Shipment History &amp; Audit Log
          </h3>
        </div>
        <span className="font-mono-tech text-xs text-slate-500 dark:text-gray-400 font-semibold">
          {events.length} Recorded Milestone {events.length === 1 ? 'Event' : 'Events'}
        </span>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full text-left font-mono-tech text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-white/10 text-slate-500 dark:text-gray-400 uppercase text-[10px] tracking-wider font-bold">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Time</th>
              <th className="py-3 px-4">Location</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Updated By</th>
              <th className="py-3 px-4">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-white/5">
            {events.map((ev, idx) => (
              <tr key={ev.id || idx} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                <td className="py-3.5 px-4 text-slate-950 dark:text-white font-bold whitespace-nowrap">
                  {ev.date}
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-gray-300 whitespace-nowrap">
                  {ev.time}
                </td>
                <td className="py-3.5 px-4 text-slate-800 dark:text-gray-200">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span>{ev.location}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getStatusBadge(ev.status)}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {ev.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-slate-600 dark:text-gray-300">
                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3 h-3 text-slate-400" />
                    <span>{ev.updatedBy || 'admin'}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-slate-800 dark:text-gray-200">
                  <div className="font-semibold text-slate-950 dark:text-white">
                    {ev.remarks || ev.description || 'Milestone verified'}
                  </div>
                  {ev.description && ev.description !== ev.remarks && (
                    <div className="text-[11px] text-slate-500 dark:text-gray-400 mt-0.5">
                      {ev.description}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {events.map((ev, idx) => (
          <div key={ev.id || idx} className="bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 rounded-xl p-4 space-y-2.5 font-mono-tech text-xs">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <span className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${getStatusBadge(ev.status)}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {ev.status}
              </span>
              <span className="text-slate-500 dark:text-gray-400 text-[11px]">
                {ev.date} • {ev.time}
              </span>
            </div>

            <div className="flex items-start gap-1.5 text-slate-800 dark:text-gray-200 text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{ev.location}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-white/5 space-y-1">
              <div className="text-slate-950 dark:text-white font-semibold">
                {ev.remarks || ev.description || 'Milestone verified'}
              </div>
              {ev.description && ev.description !== ev.remarks && (
                <div className="text-[11px] text-slate-500 dark:text-gray-400">
                  {ev.description}
                </div>
              )}
              <div className="text-[10px] text-slate-500 flex items-center gap-1 pt-1">
                <UserCheck className="w-3 h-3 text-slate-400" />
                <span>Updated By: <strong className="text-slate-700 dark:text-gray-400 font-bold">{ev.updatedBy || 'admin'}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
