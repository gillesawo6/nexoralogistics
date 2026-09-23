import React, { lazy } from 'react';

/**
 * Resilient lazy loader that retries dynamically imported modules if a transient
 * network error, Vite HMR rebuild, or stale bundle hash occurs.
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  factory: () => Promise<any>,
  componentName?: string
): React.LazyExoticComponent<T> {
  return lazy(async () => {
    const pageKey = `nexora_chunk_retry_${componentName || 'chunk'}`;
    try {
      const module = await factory();
      // Clear any prior reload flag on successful load
      try {
        sessionStorage.removeItem(pageKey);
      } catch {
        // ignore storage errors
      }

      if (module && typeof module === 'object') {
        if ('default' in module && module.default) {
          return { default: module.default };
        }
        if (componentName && module[componentName]) {
          return { default: module[componentName] };
        }
        // Fallback to first exported React component function
        const fallback = Object.values(module).find((val) => typeof val === 'function');
        if (fallback) {
          return { default: fallback as T };
        }
      }
      return module;
    } catch (err: any) {
      console.warn(`[DynamicImport] Failed to load module ${componentName || ''}, retrying...`, err);

      // Brief pause before first retry
      await new Promise((resolve) => setTimeout(resolve, 350));

      try {
        const retryModule = await factory();
        if (retryModule && typeof retryModule === 'object') {
          if ('default' in retryModule && retryModule.default) {
            return { default: retryModule.default };
          }
          if (componentName && retryModule[componentName]) {
            return { default: retryModule[componentName] };
          }
        }
        return retryModule;
      } catch (retryError) {
        // If it's a dynamic module import failure and we haven't already reloaded the session:
        const alreadyReloaded = sessionStorage.getItem(pageKey);
        if (!alreadyReloaded) {
          sessionStorage.setItem(pageKey, 'true');
          console.info(`[DynamicImport] Reloading application to refresh assets for ${componentName || 'module'}...`);
          window.location.reload();
        }
        throw retryError;
      }
    }
  });
}
