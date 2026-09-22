import React from 'react';
import { motion } from 'motion/react';

interface SectionHeadingProps {
  eyebrow: string;
  title: string | React.ReactNode;
  subtitle?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
  light?: boolean;
  badgeColor?: 'blue' | 'orange' | 'emerald';
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = 'left',
  className = '',
  light = false,
  badgeColor = 'blue',
}) => {
  const badgeClasses = {
    blue: 'border-[#0066FF]/30 bg-[#0066FF]/10 text-[#0066FF] dark:text-[#38bdf8]',
    orange: 'border-[#FF6600]/30 bg-[#FF6600]/10 text-[#FF6600] dark:text-[#FF8533]',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
  };

  const alignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center mx-auto',
    right: 'text-right items-end ml-auto',
  };

  return (
    <div className={`flex flex-col ${alignmentClasses[align]} max-w-4xl ${className}`}>
      {/* Eyebrow badge */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-mono-tech text-xs tracking-widest uppercase mb-4 ${badgeClasses[badgeColor]}`}
      >
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
        {eyebrow}
      </motion.div>

      {/* Main Title */}
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className={`font-heading font-extrabold uppercase leading-[1.02] tracking-tight ${
          light ? 'text-slate-900' : 'text-slate-900 dark:text-white'
        } text-3xl sm:text-4xl md:text-5xl lg:text-6xl`}
      >
        {title}
      </motion.h2>

      {/* Subtitle */}
      {subtitle && (
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className={`mt-4 text-base sm:text-lg md:text-xl font-normal leading-relaxed ${
            light ? 'text-slate-600' : 'text-slate-600 dark:text-gray-400'
          } max-w-2xl`}
        >
          {subtitle}
        </motion.p>
      )}
    </div>
  );
};
