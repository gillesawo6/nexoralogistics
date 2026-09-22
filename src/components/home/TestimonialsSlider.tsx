import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TESTIMONIALS_DATA } from '../../data/mockData';
import { SectionHeading } from '../ui/SectionHeading';
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react';

export const TestimonialsSlider: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [isPaused]);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS_DATA.length) % TESTIMONIALS_DATA.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS_DATA.length);
  };

  const current = TESTIMONIALS_DATA[currentIndex];

  return (
    <section
      className="relative py-24 sm:py-32 bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-white border-t border-slate-200 dark:border-white/10 overflow-hidden transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <SectionHeading
            eyebrow="GLOBAL EXECUTIVE ENDORSEMENTS"
            title={
              <>
                TRUSTED BY <br />
                <span className="text-[#0066FF] dark:text-[#38bdf8]">SUPPLY CHAIN LEADERS</span>
              </>
            }
            subtitle="What procurement directors, operations VPs, and logistics executives say about partnering with NEXORA."
          />

          {/* Slider Arrow Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              data-cursor="PREV"
              className="p-3.5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:bg-[#0066FF] hover:text-white text-slate-700 dark:text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="Previous review"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              data-cursor="NEXT"
              className="p-3.5 rounded-2xl bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 hover:bg-[#0066FF] hover:text-white text-slate-700 dark:text-white transition-all shadow-md active:scale-95 cursor-pointer"
              title="Next review"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Testimonial Main Panel */}
        <div className="bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-3xl p-6 sm:p-12 relative overflow-hidden shadow-xl">
          <Quote className="absolute right-8 bottom-8 w-36 h-36 text-slate-100 dark:text-white/5 pointer-events-none" />

          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="space-y-8 relative z-10"
            >
              {/* Rating stars */}
              <div className="flex items-center gap-1.5">
                {[...Array(current.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
                ))}
                <span className="ml-2 font-mono-tech text-xs text-slate-500 dark:text-gray-400 uppercase tracking-wider">
                  5.0 VERIFIED ENTERPRISE ACCOUNT
                </span>
              </div>

              {/* Quote */}
              <p className="font-heading font-normal text-xl sm:text-2xl md:text-3xl lg:text-4xl text-slate-900 dark:text-white leading-relaxed tracking-tight max-w-4xl">
                "{current.quote}"
              </p>

              {/* Author Details */}
              <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-slate-100 dark:border-white/10">
                <div className="flex items-center gap-4">
                  <img
                    src={current.avatar}
                    alt={current.client}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-200 dark:border-white/20 shadow-md"
                  />
                  <div>
                    <h4 className="font-heading font-bold text-lg text-slate-900 dark:text-white">
                      {current.client}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-gray-400">
                      {current.role} • <span className="text-slate-900 dark:text-white font-medium">{current.company}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono-tech text-slate-500 dark:text-gray-400">
                  <span className="flex items-center gap-1.5 bg-slate-100 dark:bg-white/5 px-3.5 py-1.5 rounded-xl text-slate-800 dark:text-white border border-slate-200/60 dark:border-white/5">
                    <span>{current.countryFlag}</span>
                    <span>{current.country}</span>
                  </span>
                  <span className="hidden sm:inline text-[#0066FF] dark:text-[#38bdf8] font-bold">
                    {current.serviceUsed}
                  </span>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-100 dark:border-white/10">
            {TESTIMONIALS_DATA.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentIndex === i ? 'w-8 bg-[#0066FF]' : 'w-2 bg-slate-200 dark:bg-white/20 hover:bg-slate-300 dark:hover:bg-white/40'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
