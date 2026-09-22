import React from 'react';
import { motion, Variants } from 'motion/react';

interface MaskedHeadlineProps {
  lines: string[];
  reducedMotion?: boolean;
}

export const MaskedHeadline: React.FC<MaskedHeadlineProps> = ({ lines, reducedMotion = false }) => {
  // Container variant coordinating the lines
  const containerVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.28, // Starts 280ms into the image push
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.04,
        staggerDirection: -1,
      },
    },
  };

  // Line container variant
  const lineVariants: Variants = {
    initial: {},
    animate: {
      transition: {
        staggerChildren: 0.028, // Fast character cascade reveal
      },
    },
    exit: {
      transition: {
        staggerChildren: 0.015,
      },
    },
  };

  // Character variant: sliding up from behind the overflow-hidden mask
  const charVariants: Variants = {
    initial: {
      y: reducedMotion ? 0 : '110%',
      opacity: 0,
      rotateX: reducedMotion ? 0 : -20,
    },
    animate: {
      y: '0%',
      opacity: 1,
      rotateX: 0,
      transition: {
        duration: 0.58,
        ease: [0.215, 0.61, 0.355, 1], // Cubic bezier for responsive snap
      },
    },
    exit: {
      y: reducedMotion ? 0 : '-100%',
      opacity: 0,
      transition: {
        duration: 0.22,
        ease: [0.55, 0.055, 0.675, 0.19],
      },
    },
  };

  return (
    <motion.h1
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="font-heading font-black uppercase text-white tracking-tight leading-[0.96] sm:leading-[0.92] text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl drop-shadow-[0_8px_32px_rgba(0,0,0,0.95)]"
    >
      {lines.map((line, lineIndex) => (
        <div key={`line-${lineIndex}`} className="overflow-hidden block py-1">
          <motion.span
            variants={lineVariants}
            className={`inline-flex flex-wrap ${
              lineIndex === 1
                ? 'text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#38bdf8]'
                : 'text-white'
            }`}
          >
            {/* Split line into words, then characters, preserving spacing */}
            {line.split(' ').map((word, wordIndex, allWords) => (
              <span key={`w-${lineIndex}-${wordIndex}`} className="inline-flex whitespace-nowrap mr-[0.25em]">
                {word.split('').map((char, charIndex) => (
                  <motion.span
                    key={`c-${lineIndex}-${wordIndex}-${charIndex}`}
                    variants={charVariants}
                    className="inline-block transform-gpu will-change-transform"
                    style={{ transformOrigin: 'bottom center' }}
                  >
                    {char}
                  </motion.span>
                ))}
              </span>
            ))}
          </motion.span>
        </div>
      ))}
    </motion.h1>
  );
};
