import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';

const STATS_DATA = [
  {
    id: 'countries',
    value: '85+',
    label: 'Countries Served',
    description: 'Sovereign custom-bonded trade lanes',
  },
  {
    id: 'sla',
    value: '99.8%',
    label: 'On-Time Delivery SLA',
    description: 'Autonomous predictive routing guarantee',
  },
  {
    id: 'teu',
    value: '2.4M',
    label: 'TEU & Air Tonnes / Yr',
    description: 'Global multi-modal cargo volume',
  },
  {
    id: 'warehousing',
    value: '1.2M+',
    label: 'm² Bonded Logistics',
    description: 'Automated high-bay ASRS hubs',
  },
  {
    id: 'telemetry',
    value: '< 60s',
    label: 'IoT Telemetry Latency',
    description: 'Live satellite orbit packet updates',
  },
  {
    id: 'support',
    value: '24/7',
    label: 'Operations Desks',
    description: 'Rotterdam, Singapore, Chicago, Dubai',
  },
];

export const StatisticsSection: React.FC = () => {
  return (
    <section className="relative py-20 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS_DATA.map((stat, idx) => (
            <motion.div
              key={stat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.08 }}
              className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-[#0066FF]/40 rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-lg group"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400 dark:text-gray-500 mb-4">
                  <span>METRIC 0{idx + 1}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 text-[#0066FF] dark:text-[#38bdf8] transition-opacity" />
                </div>
                <div className="font-heading font-black text-3xl sm:text-4xl text-slate-900 dark:text-white tracking-tight">
                  {stat.value}
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
                <div className="font-heading font-bold text-xs uppercase text-slate-800 dark:text-gray-200">
                  {stat.label}
                </div>
                <div className="text-[11px] font-mono-tech text-slate-500 dark:text-gray-400 mt-1 line-clamp-1">
                  {stat.description}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
