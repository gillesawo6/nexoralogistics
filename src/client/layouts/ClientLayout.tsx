import React, { useEffect } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import Lenis from 'lenis';
import { Navbar } from '../../components/layout/Navbar';
import { Footer } from '../../components/layout/Footer';
import { CustomCursor } from '../../components/ui/CustomCursor';
import { FloatingCommunication } from '../../components/communication/FloatingCommunication';

interface ClientLayoutProps {
  children?: React.ReactNode;
}

export const ClientLayout: React.FC<ClientLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();

  // Initialize Lenis Smooth Scrolling for client website
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

    window.__lenis = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    const rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      window.__lenis = null;
    };
  }, []);

  // Scroll to top on every client route navigation
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    if (window.__lenis) {
      window.__lenis.scrollTo(0, { immediate: true });
    }
  }, [pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] dark:bg-[#030712] text-slate-900 dark:text-white selection:bg-[#0066FF] selection:text-white font-sans antialiased transition-colors duration-200">
      <CustomCursor />
      <Navbar />
      <main className="flex-1 w-full">
        {children || <Outlet />}
      </main>
      <Footer />
      <FloatingCommunication />
    </div>
  );
};

export default ClientLayout;
