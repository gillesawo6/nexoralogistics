import React, { useEffect, useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Centralized ScrollToTop component
 * Automatically resets the scroll position to top (0, 0) on every route change
 * across all client and admin routes, with Lenis smooth-scroll synchronization
 * and browser scrollRestoration management.
 */
export const ScrollToTop: React.FC = () => {
  const { pathname, search, hash } = useLocation();

  useEffect(() => {
    // Prevent browser default scroll restoration from conflicting with client routing
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  useLayoutEffect(() => {
    // If navigating to a specific hash anchor (e.g. #contact or #quote-calculator)
    if (hash) {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        if (window.__lenis) {
          window.__lenis.scrollTo(element, { offset: -80 });
        } else {
          element.scrollIntoView({ behavior: 'smooth' });
        }
        return;
      }
    }

    const resetScroll = () => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
      if (window.__lenis) {
        window.__lenis.scrollTo(0, { immediate: true, force: true });
      }
    };

    // Phase 1: Immediate LayoutEffect reset
    resetScroll();

    // Phase 2: Animation frame reset after DOM paint
    const rId = requestAnimationFrame(() => {
      resetScroll();
    });

    // Phase 3: Short timer to catch asynchronous component mounts and image reflows
    const tId = setTimeout(() => {
      resetScroll();
    }, 50);

    return () => {
      cancelAnimationFrame(rId);
      clearTimeout(tId);
    };
  }, [pathname, search, hash]);

  return null;
};

export default ScrollToTop;
