import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'motion/react';

export const CustomCursor: React.FC = () => {
  const [cursorText, setCursorText] = useState<string>('');
  const [cursorVariant, setCursorVariant] = useState<'default' | 'hover' | 'action' | 'drag'>('default');
  const [isVisible, setIsVisible] = useState(false);

  const cursorTextRef = React.useRef('');
  const cursorVariantRef = React.useRef<'default' | 'hover' | 'action' | 'drag'>('default');

  const mouseX = useMotionValue(-100);
  const mouseY = useMotionValue(-100);

  const springConfig = { damping: 28, stiffness: 350, mass: 0.5 };
  const cursorX = useSpring(mouseX, springConfig);
  const cursorY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Check if touch device or reduced motion
    const isTouch = window.matchMedia('(pointer: coarse)').matches;
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isTouch || prefersReducedMotion) return;

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target || !target.closest) return;
      const clickable = target.closest('button, a, input, select, textarea, [data-cursor]');
      
      if (clickable) {
        const customCursorAttr = clickable.getAttribute('data-cursor');
        if (customCursorAttr) {
          if (cursorTextRef.current !== customCursorAttr) {
            cursorTextRef.current = customCursorAttr;
            setCursorText(customCursorAttr);
          }
          if (cursorVariantRef.current !== 'action') {
            cursorVariantRef.current = 'action';
            setCursorVariant('action');
          }
        } else if (clickable.tagName === 'BUTTON' || clickable.tagName === 'A') {
          if (cursorTextRef.current !== '') {
            cursorTextRef.current = '';
            setCursorText('');
          }
          if (cursorVariantRef.current !== 'hover') {
            cursorVariantRef.current = 'hover';
            setCursorVariant('hover');
          }
        }
      } else {
        if (cursorTextRef.current !== '') {
          cursorTextRef.current = '';
          setCursorText('');
        }
        if (cursorVariantRef.current !== 'default') {
          cursorVariantRef.current = 'default';
          setCursorVariant('default');
        }
      }
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseover', handleMouseOver, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave);
    document.addEventListener('mouseenter', handleMouseEnter);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver);
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, [mouseX, mouseY]);

  if (!isVisible) return null;

  return (
    <>
      {/* Primary Follower Dot */}
      <motion.div
        className="fixed top-0 left-0 pointer-events-none z-[9999] flex items-center justify-center font-mono-tech text-[10px] uppercase font-bold tracking-widest text-white backdrop-blur-[2px] transition-colors duration-200"
        style={{
          x: cursorX,
          y: cursorY,
          translateX: '-50%',
          translateY: '-50%',
        }}
        animate={{
          width: cursorVariant === 'action' ? 72 : cursorVariant === 'hover' ? 44 : 12,
          height: cursorVariant === 'action' ? 72 : cursorVariant === 'hover' ? 44 : 12,
          backgroundColor: cursorVariant === 'action' ? 'rgba(0, 102, 255, 0.85)' : cursorVariant === 'hover' ? 'rgba(255, 255, 255, 0.15)' : '#0066FF',
          borderColor: cursorVariant === 'hover' ? 'rgba(0, 102, 255, 0.6)' : 'transparent',
          borderWidth: cursorVariant === 'hover' ? 1.5 : 0,
          borderRadius: '50%',
        }}
      >
        {cursorText && (
          <motion.span
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.5 }}
            className="text-white drop-shadow-md select-none text-center"
          >
            {cursorText}
          </motion.span>
        )}
      </motion.div>
    </>
  );
};
