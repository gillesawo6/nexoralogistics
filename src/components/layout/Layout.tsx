import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import { CustomCursor } from '../ui/CustomCursor';
import { FloatingCommunication } from '../communication/FloatingCommunication';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  // Scroll to top on every route navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0,
      touchMultiplier: 1.2,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white selection:bg-[#0066FF] selection:text-white font-sans antialiased transition-colors duration-200">
      <CustomCursor />
      <Navbar />
      <main className="flex-1 w-full">{children}</main>
      <Footer />
      <FloatingCommunication />
    </div>
  );
};
