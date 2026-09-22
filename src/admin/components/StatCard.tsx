import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  subtitle?: string;
  trend?: string;
  trendPositive?: boolean;
  color?: 'blue' | 'emerald' | 'amber' | 'purple' | 'rose';
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  subtitle,
  trend,
  trendPositive = true,
  color = 'blue',
  onClick,
}) => {
  const colorMap = {
    blue: {
      border: 'hover:border-[#0066FF]/40',
      iconBg: 'bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8]',
      accent: 'text-[#0066FF] dark:text-[#38bdf8]',
    },
    emerald: {
      border: 'hover:border-emerald-500/40',
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
      accent: 'text-emerald-600 dark:text-emerald-400',
    },
    amber: {
      border: 'hover:border-amber-500/40',
      iconBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
      accent: 'text-amber-600 dark:text-amber-400',
    },
    purple: {
      border: 'hover:border-purple-500/40',
      iconBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
      accent: 'text-purple-600 dark:text-purple-400',
    },
    rose: {
      border: 'hover:border-rose-500/40',
      iconBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
      accent: 'text-rose-600 dark:text-rose-400',
    },
  };

  const currentTheme = colorMap[color];

  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-5 transition-all duration-200 shadow-sm hover:shadow-md ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 ' + currentTheme.border : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="font-mono-tech text-xs tracking-wider uppercase text-slate-500 dark:text-gray-400 font-medium">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${currentTheme.iconBg}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="font-heading font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span
            className={`font-mono-tech text-xs font-semibold ${
              trendPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            {trend}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-2 text-xs font-mono-tech text-slate-500 dark:text-gray-400 flex items-center gap-1.5">
          {subtitle}
        </p>
      )}
    </div>
  );
};
