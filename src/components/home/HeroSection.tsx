import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, Variants } from 'motion/react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Search, 
  Radio, 
  ShieldCheck, 
  Pause, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Compass
} from 'lucide-react';
import { HERO_SLIDES, HeroSlide } from './hero/heroSlides';
import { MaskedHeadline } from './hero/MaskedHeadline';

const AUTOPLAY_INTERVAL = 6500; // 6.5 seconds display time per slide
const TRANSITION_DURATION = 0.88; // 880ms physical push
const TRANSITION_LOCK_MS = 950; // Lock rapid spam clicking during transition

export const HeroSection: React.FC = () => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = Next (In from Right, Out to Left), -1 = Prev (In from Left, Out to Right)
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [trackingInput, setTrackingInput] = useState('');
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  
  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const navigate = useNavigate();

  // Subtle parallax effect on scroll
  const { scrollY } = useScroll();
  const heroImageY = useTransform(scrollY, [0, 800], [0, 60]);
  const heroOpacity = useTransform(scrollY, [0, 600], [1, 0.7]);

  const slideCount = HERO_SLIDES.length;

  // Detect prefers-reduced-motion
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Preload secondary slide images with delay so LCP image loads unimpeded
  useEffect(() => {
    const timer = setTimeout(() => {
      HERO_SLIDES.slice(1).forEach((slide) => {
        const img = new Image();
        img.src = slide.image;
      });
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const triggerSlideChange = useCallback((newIndex: number, newDirection: 1 | -1) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setDirection(newDirection);
    setCurrentSlideIndex(newIndex);

    setTimeout(() => {
      setIsTransitioning(false);
    }, TRANSITION_LOCK_MS);
  }, [isTransitioning]);

  const goToNextSlide = useCallback(() => {
    const nextIndex = (currentSlideIndex + 1) % slideCount;
    // Next: Incoming enters from RIGHT (100% -> 0%), Outgoing exits to LEFT (0% -> -100%)
    triggerSlideChange(nextIndex, 1);
  }, [currentSlideIndex, slideCount, triggerSlideChange]);

  const goToPrevSlide = useCallback(() => {
    const prevIndex = (currentSlideIndex - 1 + slideCount) % slideCount;
    // Prev: Incoming enters from LEFT (-100% -> 0%), Outgoing exits to RIGHT (0% -> 100%)
    triggerSlideChange(prevIndex, -1);
  }, [currentSlideIndex, slideCount, triggerSlideChange]);

  const goToSlide = (targetIndex: number) => {
    if (targetIndex === currentSlideIndex || isTransitioning) return;
    const newDir: 1 | -1 = targetIndex > currentSlideIndex ? 1 : -1;
    triggerSlideChange(targetIndex, newDir);
  };

  // Autoplay timer without expensive 40ms interval re-renders
  useEffect(() => {
    if (isPaused || isTransitioning) return;

    const timer = setTimeout(() => {
      goToNextSlide();
    }, AUTOPLAY_INTERVAL);

    return () => clearTimeout(timer);
  }, [isPaused, isTransitioning, currentSlideIndex, goToNextSlide]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT') return;
      if (e.key === 'ArrowRight') {
        goToNextSlide();
      } else if (e.key === 'ArrowLeft') {
        goToPrevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNextSlide, goToPrevSlide]);

  // Mobile Touch Swipe Handling
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchEndXRef.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current !== null && touchEndXRef.current !== null) {
      const deltaX = touchStartXRef.current - touchEndXRef.current;
      const minSwipeDistance = 45;
      if (deltaX > minSwipeDistance) {
        goToNextSlide();
      } else if (deltaX < -minSwipeDistance) {
        goToPrevSlide();
      }
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  const handleHeroTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingInput.trim()) {
      navigate(`/tracking?number=${encodeURIComponent(trackingInput.trim().toUpperCase())}`);
    } else {
      navigate('/tracking');
    }
  };

  const currentSlide: HeroSlide = HERO_SLIDES[currentSlideIndex];

  // ============================================================================
  // BACKGROUND IMAGE PUSH TRANSITION VARIANTS
  // When Next (dir === 1): Incoming from RIGHT (100%), Outgoing to LEFT (-100%)
  // When Prev (dir === -1): Incoming from LEFT (-100%), Outgoing to RIGHT (100%)
  // Both images stay mounted and visible simultaneously in mode="sync"
  // ============================================================================
  const imagePushVariants: Variants = {
    initial: (dir: 1 | -1) => ({
      x: prefersReducedMotion ? '0%' : dir === 1 ? '100%' : '-100%',
      opacity: prefersReducedMotion ? 0 : 1,
      scale: prefersReducedMotion ? 1 : 1.04,
    }),
    animate: {
      x: '0%',
      opacity: 1,
      scale: 1,
      transition: {
        x: {
          duration: prefersReducedMotion ? 0.3 : TRANSITION_DURATION,
          ease: [0.76, 0, 0.24, 1], // Cinematic horizontal push cubic-bezier
        },
        scale: {
          duration: TRANSITION_DURATION,
          ease: [0.76, 0, 0.24, 1],
        },
        opacity: {
          duration: 0.3,
        },
      },
    },
    exit: (dir: 1 | -1) => ({
      x: prefersReducedMotion ? '0%' : dir === 1 ? '-100%' : '100%',
      opacity: prefersReducedMotion ? 0 : 1,
      scale: prefersReducedMotion ? 1 : 1.02,
      transition: {
        x: {
          duration: prefersReducedMotion ? 0.3 : TRANSITION_DURATION,
          ease: [0.76, 0, 0.24, 1], // Exactly synchronous with incoming image
        },
        scale: {
          duration: TRANSITION_DURATION,
          ease: [0.76, 0, 0.24, 1],
        },
        opacity: {
          duration: 0.3,
        },
      },
    }),
  };

  // ============================================================================
  // CONTENT STAGGER & MASKED TIMING VARIANTS
  // ============================================================================
  const contentContainerVariants: Variants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.15,
      },
    },
    exit: {
      opacity: 0,
      y: -12,
      transition: {
        duration: 0.22,
        ease: 'easeOut',
      },
    },
  };

  const eyebrowVariants: Variants = {
    initial: {
      y: '100%',
      opacity: 0,
    },
    animate: {
      y: '0%',
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: [0.25, 1, 0.5, 1],
      },
    },
    exit: {
      y: '-100%',
      opacity: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  const subtitleVariants: Variants = {
    initial: {
      opacity: 0,
      y: 18,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.45, // Settles after headline character reveal begins
        ease: [0.25, 1, 0.5, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -10,
      transition: {
        duration: 0.2,
      },
    },
  };

  const actionsVariants: Variants = {
    initial: {
      opacity: 0,
      y: 16,
    },
    animate: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        delay: 0.55, // Settles smoothly as phase 4 completes
        ease: [0.25, 1, 0.5, 1],
      },
    },
    exit: {
      opacity: 0,
      y: -8,
      transition: {
        duration: 0.18,
      },
    },
  };

  return (
    <section 
      className="relative min-h-[100vh] min-h-[720px] lg:min-h-[860px] w-full flex flex-col justify-between overflow-hidden bg-[#030712] text-white select-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Nexora Logistics Hero Showcase"
    >
      {/* 
        ========================================================================
        1. BACKGROUND IMAGE PUSH LAYER (PHYSICAL HORIZONTAL PUSH)
        Simultaneous visibility of outgoing and incoming image layers in sync mode.
        ========================================================================
      */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <AnimatePresence initial={false} custom={direction} mode="sync">
          <motion.div
            key={`slide-bg-${currentSlide.id}`}
            custom={direction}
            variants={imagePushVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="absolute inset-0 w-full h-full will-change-transform"
          >
            <motion.div 
              style={{ y: heroImageY, opacity: heroOpacity }}
              className="relative w-full h-full"
            >
              <img
                src={currentSlide.image}
                alt={currentSlide.imageAlt}
                style={{ objectPosition: currentSlide.objectPosition || 'center center' }}
                className="w-full h-full object-cover brightness-[0.76] sm:brightness-[0.80] contrast-[1.08] saturate-[1.15]"
                loading="eager"
                decoding="async"
                fetchPriority={currentSlideIndex === 0 ? "high" : "auto"}
              />

              {/* Gradient Overlays: Deep, subtle, and non-intrusive */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#030712] via-[#030712]/30 to-[#030712]/60" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#030712]/90 via-[#030712]/40 to-transparent/10" />
              <div className="absolute inset-0 bg-radial-gradient opacity-25" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 
        ========================================================================
        2. HERO CONTENT CONTAINER (MASKED HEADLINE & COORDINATED MOTION)
        ========================================================================
      */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex-1 flex flex-col justify-center pt-28 sm:pt-32 md:pt-36 lg:pt-40 pb-24 sm:pb-28 md:pb-32">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`content-${currentSlide.id}`}
            variants={contentContainerVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="w-full flex flex-col justify-center"
          >
            {/* Eyebrow Label with Masked Overflow Reveal */}
            <div className="overflow-hidden mb-3 sm:mb-4">
              <motion.div variants={eyebrowVariants} className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0066FF]/40 bg-[#0066FF]/15 text-[#38bdf8] font-mono-tech text-xs tracking-widest uppercase backdrop-blur-md">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF] animate-ping" />
                  {currentSlide.eyebrow}
                </div>
                <span className="hidden sm:inline-block px-2.5 py-1 rounded-md bg-white/10 text-white/80 font-mono-tech text-[10px] uppercase font-bold tracking-wider">
                  {currentSlide.badgeMode}
                </span>
              </motion.div>
            </div>

            {/* Masked Character/Word Headline Reveal */}
            <MaskedHeadline 
              lines={currentSlide.titleLines} 
              reducedMotion={prefersReducedMotion} 
            />

            {/* Subtitle Description */}
            <motion.p 
              variants={subtitleVariants}
              className="mt-4 sm:mt-5 text-sm sm:text-base md:text-lg lg:text-xl text-gray-200 max-w-3xl leading-relaxed font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)]"
            >
              {currentSlide.description}
            </motion.p>

            {/* Quick Hero Tracking & Call-To-Action Suite */}
            <motion.div 
              variants={actionsVariants}
              className="mt-6 sm:mt-8 flex flex-col lg:flex-row items-stretch lg:items-center gap-3.5 max-w-4xl"
            >
              {/* Quick Tracking Form */}
              <form
                onSubmit={handleHeroTrackSubmit}
                className="flex-1 flex flex-col sm:flex-row items-stretch gap-2 bg-[#070D1D]/90 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl shadow-2xl"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="absolute left-4 w-4 sm:w-5 h-4 sm:h-5 text-gray-400" />
                  <input
                    type="text"
                    value={trackingInput}
                    onChange={(e) => setTrackingInput(e.target.value.toUpperCase())}
                    onFocus={() => setIsPaused(true)}
                    onBlur={() => setIsPaused(false)}
                    placeholder="TRACK SHIPMENT (E.G. NX-4829-2026)"
                    className="w-full bg-transparent pl-11 sm:pl-12 pr-4 py-3 sm:py-3.5 text-white placeholder-gray-400 font-mono-tech text-xs sm:text-sm tracking-wider uppercase focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  data-cursor="TRACK"
                  className="px-5 sm:px-6 py-3 sm:py-3.5 bg-[#0066FF] hover:bg-[#0052cc] text-white font-heading font-bold uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shrink-0 shadow-lg shadow-[#0066FF]/30 active:scale-[0.98] cursor-pointer"
                >
                  <span>{currentSlide.primaryCtaText}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Secondary Action CTA */}
              <div className="flex items-center gap-2.5">
                <Link
                  to="/quote"
                  data-cursor="ESTIMATE"
                  className="w-full sm:w-auto px-6 sm:px-7 py-3.5 sm:py-4 bg-white/10 hover:bg-white/20 text-white font-heading font-bold uppercase tracking-wider rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 backdrop-blur-md text-center shrink-0"
                >
                  <span>{currentSlide.secondaryCtaText}</span>
                </Link>

                <Link
                  to={currentSlide.serviceLink}
                  data-cursor="EXPLORE"
                  className="hidden sm:inline-flex px-5 py-4 bg-[#0066FF]/10 hover:bg-[#0066FF]/20 text-[#38bdf8] font-heading font-bold uppercase tracking-wider rounded-xl border border-[#0066FF]/30 transition-all items-center justify-center gap-1.5 backdrop-blur-md shrink-0"
                >
                  <span>CORRIDOR</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </motion.div>

            {/* Mode Highlights & Trust Assurance */}
            <motion.div 
              variants={actionsVariants}
              className="mt-8 sm:mt-10 pt-5 sm:pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs font-mono-tech text-gray-400 uppercase"
            >
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {currentSlide.highlightBadges.map((badge, idx) => {
                  const IconComp = badge.icon;
                  return (
                    <span key={idx} className="flex items-center gap-2 text-white/90">
                      <IconComp className="w-4 h-4 text-[#38bdf8]" />
                      <span>{badge.label}</span>
                    </span>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 text-[11px] text-gray-400">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> $500M+ CARGO INSURED
                </span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">AEO / C-TPAT GOLD</span>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 
        ========================================================================
        3. LIVE SATELLITE HUD TELEMETRY WIDGET (SYNCHRONIZED WITH ACTIVE SLIDE)
        ========================================================================
      */}
      <div className="absolute top-28 sm:top-32 md:top-36 right-6 lg:right-8 z-20 hidden xl:flex flex-col gap-3 pointer-events-none">
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={`hud-${currentSlide.id}`}
            initial={{ opacity: 0, scale: 0.96, x: 20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.96, x: -20 }}
            transition={{ duration: 0.45, delay: 0.4 }}
            className="bg-[#070D1D]/85 backdrop-blur-xl border border-white/15 p-4 rounded-2xl font-mono-tech text-xs text-gray-300 w-72 shadow-2xl shadow-black/50"
          >
            <div className="flex items-center justify-between text-[10px] text-gray-400 mb-2.5 border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5 text-[#38bdf8] font-bold">
                <Radio className="w-3.5 h-3.5 text-[#0066FF] animate-pulse" /> LIVE TELEMETRY
              </span>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex justify-between">
                <span className="text-gray-400">CORRIDOR:</span>
                <span className="text-white font-bold truncate max-w-[140px]" title={currentSlide.telemetry.corridor}>
                  {currentSlide.telemetry.corridor}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">VECTOR:</span>
                <span className="text-emerald-400 font-bold">{currentSlide.telemetry.speed}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">SLA TARGET:</span>
                <span className="text-[#38bdf8] font-bold">{currentSlide.telemetry.sla}</span>
              </div>
              <div className="flex justify-between pt-1 border-t border-white/5 text-[10px]">
                <span className="text-gray-500">ASSET:</span>
                <span className="text-gray-300 font-mono">{currentSlide.telemetry.assetId}</span>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* 
        ========================================================================
        4. CONTROLS, SLIDE TABS & DURATION PROGRESS BARS (LAYER 5)
        ========================================================================
      */}
      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full mt-auto pb-6 sm:pb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Slide Indicator Tabs */}
        <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {HERO_SLIDES.map((slide, idx) => {
            const isActive = idx === currentSlideIndex;
            return (
              <button
                key={slide.id}
                onClick={() => goToSlide(idx)}
                disabled={isTransitioning}
                aria-label={`Go to slide ${idx + 1}: ${slide.category}`}
                className={`group text-left px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl border transition-all flex flex-col justify-between min-w-[130px] sm:min-w-[150px] relative overflow-hidden backdrop-blur-md ${
                  isActive
                    ? 'bg-[#070D1D]/90 border-[#0066FF] text-white shadow-lg shadow-blue-500/10'
                    : 'bg-[#070D1D]/40 border-white/10 text-gray-400 hover:border-white/25 hover:text-gray-200'
                } ${isTransitioning ? 'cursor-not-allowed opacity-90' : 'cursor-pointer'}`}
              >
                {/* Active Slide Progress Underlay */}
                {isActive && (
                  <div
                    key={`hero-progress-line-${currentSlideIndex}`}
                    className="absolute bottom-0 left-0 h-[3px] bg-gradient-to-r from-[#0066FF] to-[#38bdf8]"
                    style={{
                      width: isPaused ? '100%' : '100%',
                      animation: isPaused || prefersReducedMotion ? 'none' : `hero-progress ${AUTOPLAY_INTERVAL}ms linear forwards`,
                    }}
                  />
                )}

                <div className="flex items-center justify-between w-full">
                  <span className="font-mono-tech text-[10px] font-bold tracking-widest text-[#38bdf8]">
                    {slide.slideNum}
                  </span>
                  <span className="text-[9px] font-mono-tech text-gray-500 group-hover:text-gray-300 uppercase">
                    CORRIDOR
                  </span>
                </div>
                <span className="font-heading font-bold text-xs uppercase tracking-tight text-white mt-1 truncate">
                  {slide.category}
                </span>
              </button>
            );
          })}
        </div>

        {/* Navigation Arrows, Play/Pause Toggle, & Slide Counter */}
        <div className="flex items-center gap-3 shrink-0 self-end md:self-auto">
          {/* Index Counter */}
          <div className="font-mono-tech text-xs text-gray-400 bg-[#070D1D]/80 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
            <span className="text-white font-bold">{HERO_SLIDES[currentSlideIndex].slideNum}</span>
            <span className="text-gray-600 mx-1.5">/</span>
            <span>0{HERO_SLIDES.length}</span>
          </div>

          {/* Autoplay Pause / Play Toggle */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? 'Resume slide rotation' : 'Pause slide rotation'}
            className="p-2.5 rounded-xl bg-[#070D1D]/80 hover:bg-white/10 border border-white/10 text-gray-300 hover:text-white transition-all backdrop-blur-md cursor-pointer"
            aria-label={isPaused ? 'Play slide rotation' : 'Pause slide rotation'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400 fill-emerald-400" /> : <Pause className="w-4 h-4" />}
          </button>

          {/* Previous Slide Button (Moves left <- right push) */}
          <button
            onClick={goToPrevSlide}
            disabled={isTransitioning}
            title="Previous Slide (Left Arrow)"
            className={`p-2.5 rounded-xl bg-[#070D1D]/80 border border-white/10 text-white transition-all backdrop-blur-md shadow-lg group ${
              isTransitioning 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#0066FF] hover:border-[#0066FF] active:scale-95 cursor-pointer'
            }`}
            aria-label="Previous Slide"
          >
            <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </button>

          {/* Next Slide Button (Pushes current out to left, enters from right) */}
          <button
            onClick={goToNextSlide}
            disabled={isTransitioning}
            title="Next Slide (Right Arrow)"
            className={`p-2.5 rounded-xl bg-[#070D1D]/80 border border-white/10 text-white transition-all backdrop-blur-md shadow-lg group ${
              isTransitioning 
                ? 'opacity-50 cursor-not-allowed' 
                : 'hover:bg-[#0066FF] hover:border-[#0066FF] active:scale-95 cursor-pointer'
            }`}
            aria-label="Next Slide"
          >
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
};
