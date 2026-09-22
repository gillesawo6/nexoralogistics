import React from 'react';
import { motion } from 'motion/react';
import { Globe2, ShieldAlert, Cpu, Route, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const IntroSection: React.FC = () => {
  const pillars = [
    {
      icon: Globe2,
      number: '01',
      title: 'Global Multi-Modal Matrix',
      desc: 'Seamless interlock between deep-sea maritime routes, scheduled air cargo charters, and continental road transit.',
      link: '/services',
    },
    {
      icon: Cpu,
      number: '02',
      title: 'Predictive Routing AI',
      desc: 'Machine-learning models calculate weather, port congestion index, and customs bottlenecks 72 hours in advance.',
      link: '/technology',
    },
    {
      icon: Route,
      number: '03',
      title: 'Granular PO Visibility',
      desc: 'IoT telemetry down to the individual SKU, continuous temperature validation, and electronic proof of delivery.',
      link: '/tracking',
    },
    {
      icon: ShieldAlert,
      number: '04',
      title: 'Zero Demurrage Guarantee',
      desc: 'Automated HS code classification and electronic single-window customs filing before vessels drop anchor.',
      link: '/quote',
    },
  ];

  return (
    <section className="relative py-24 sm:py-32 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white border-y border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase mb-6">
          <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-pulse" />
          <span>REDEFINING GLOBAL COMMERCE VELOCITY</span>
        </div>

        {/* Oversized Editorial Statement */}
        <div className="max-w-5xl">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="font-heading font-extrabold uppercase text-4xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight leading-[0.98]"
          >
            LOGISTICS SHOULD MOVE{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#0066FF] via-[#0052cc] dark:via-[#38bdf8] to-slate-900 dark:to-white">
              AS FAST AS YOUR BUSINESS.
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-8 text-lg sm:text-2xl text-slate-600 dark:text-gray-300 font-light leading-relaxed max-w-3xl"
          >
            Traditional freight forwarders rely on siloed spreadsheets and opaque port calls. 
            NEXORA operates as an intelligent nervous system for global enterprise supply chains—delivering 
            absolute visibility, surgical precision, and guaranteed capacity across every continent.
          </motion.p>
        </div>

        {/* Feature Matrix Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            return (
              <motion.div
                key={pillar.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:border-[#0066FF]/50 rounded-3xl p-7 flex flex-col justify-between transition-all duration-300 hover:shadow-xl dark:hover:shadow-[0_10px_30px_rgba(0,102,255,0.15)] hover:-translate-y-1"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-mono-tech text-xs text-[#0066FF] dark:text-[#38bdf8] font-bold tracking-widest px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-white/5 border border-blue-100 dark:border-white/10">
                      {pillar.number}
                    </span>
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 border border-slate-200/60 dark:border-white/10 group-hover:bg-[#0066FF]/10 flex items-center justify-center text-slate-700 dark:text-gray-200 group-hover:text-[#0066FF] dark:group-hover:text-[#38bdf8] transition-colors">
                      <Icon className="w-6 h-6" />
                    </div>
                  </div>

                  <h3 className="font-heading font-bold text-xl text-slate-900 dark:text-white uppercase tracking-tight mb-2.5">
                    {pillar.title}
                  </h3>

                  <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed font-light">
                    {pillar.desc}
                  </p>
                </div>

                <div className="mt-8 pt-5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
                  <Link
                    to={pillar.link}
                    className="text-xs font-mono-tech font-bold uppercase text-[#0066FF] dark:text-[#38bdf8] flex items-center gap-1 group-hover:gap-2 transition-all"
                  >
                    <span>EXPLORE CAPABILITY</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
