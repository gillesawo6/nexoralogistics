import React from 'react';
import { ShipmentStatus } from '../../types';

interface StatusBadgeProps {
  status: ShipmentStatus | string;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  className = '',
  size = 'md'
}) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'In Transit':
        return 'bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] border-[#0066FF]/30';
      case 'Delivered':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'On Hold':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Customs Clearance':
      case 'Customs Cleared':
        return 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30';
      case 'Booked':
      case 'Accepted':
        return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
      case 'Pending':
      case 'Pending Review':
        return 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
      case 'Out for Delivery':
        return 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
      case 'Reviewing':
      case 'Under Review':
        return 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';
      case 'Quoted':
      case 'Sent':
        return 'bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] border-[#0066FF]/30';
      case 'Declined':
        return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30';
      case 'Expired':
        return 'bg-rose-500/10 text-rose-500 dark:text-rose-400 border-rose-500/25';
      case 'Cancelled':
        return 'bg-slate-500/10 text-slate-500 dark:text-slate-400 border-slate-500/20';
      case 'Unread':
        return 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30 font-bold';
      case 'Read':
      case 'Archived':
        return 'bg-slate-500/10 text-slate-600 dark:text-gray-400 border-slate-500/20';
      default:
        return 'bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-gray-300 border-slate-300 dark:border-white/15';
    }
  };

  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-mono-tech uppercase tracking-wider font-semibold rounded-md border ${sizeClasses} ${getBadgeStyle()} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      <span>{status}</span>
    </span>
  );
};
