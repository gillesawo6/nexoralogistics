/**
 * Tawk.to Live Customer Support Service
 * 
 * Safely loads and controls the Tawk.to widget API.
 * - Injects script only once.
 * - Gracefully handles asynchronous loading and race conditions.
 * - Hides the default Tawk launcher bubble so the website's unified "Chat with us"
 *   button acts as the single primary launcher.
 * - Prevents duplicate scripts, iframes, or unhandled exceptions.
 */

import { getTawkConfig } from '../config/communicationConfig';
import { CompanyInfo } from '../types';

type TawkStatus = 'offline' | 'online' | 'away' | 'loading' | 'uninitialized' | 'error';
type TawkListener = (status: TawkStatus) => void;

class TawkService {
  private isScriptInjected = false;
  private isLoaded = false;
  private isInitializing = false;
  private loadPromise: Promise<boolean> | null = null;
  private currentStatus: TawkStatus = 'uninitialized';
  private listeners = new Set<TawkListener>();
  private pendingActions: Array<() => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.Tawk_API = window.Tawk_API || {};
    }
  }

  /**
   * Initializes Tawk.to with given credentials
   */
  public init(companyInfo?: Partial<CompanyInfo> | null): Promise<boolean> {
    if (typeof window === 'undefined') return Promise.resolve(false);

    const config = getTawkConfig(companyInfo);

    if (!config.enabled) {
      this.setStatus('offline');
      return Promise.resolve(false);
    }

    if (!config.propertyId) {
      // Not yet configured with custom property ID
      this.setStatus('uninitialized');
      return Promise.resolve(false);
    }

    if (this.isLoaded) {
      return Promise.resolve(true);
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.isInitializing = true;
    this.setStatus('loading');

    this.loadPromise = new Promise<boolean>((resolve) => {
      try {
        window.Tawk_API = window.Tawk_API || {};
        window.Tawk_LoadStart = new Date();

        // Configure callbacks
        window.Tawk_API.onLoad = () => {
          this.isLoaded = true;
          this.isInitializing = false;
          
          // Hide default floating circular launcher bubble so our custom "Live Support" button is the exclusive trigger
          try {
            if (typeof window.Tawk_API?.hideWidget === 'function') {
              window.Tawk_API.hideWidget();
            }
          } catch {
            // Ignore minor widget state warning
          }

          const status = (window.Tawk_API?.getStatus?.() as TawkStatus) || 'online';
          this.setStatus(status);

          // Flush queued actions
          while (this.pendingActions.length > 0) {
            const action = this.pendingActions.shift();
            try {
              action?.();
            } catch (err) {
              console.warn('Tawk queued action execution error:', err);
            }
          }

          resolve(true);
        };

        window.Tawk_API.onChatMinimized = () => {
          try {
            if (typeof window.Tawk_API?.hideWidget === 'function') {
              window.Tawk_API.hideWidget();
            }
          } catch {
            // ignore
          }
        };

        window.Tawk_API.onStatusChange = (status: string) => {
          this.setStatus((status as TawkStatus) || 'online');
        };

        // Check if script tag already exists in DOM
        const existingScript = document.getElementById('tawk-script');
        if (existingScript) {
          this.isScriptInjected = true;
          return;
        }

        const script = document.createElement('script');
        script.id = 'tawk-script';
        script.async = true;
        script.src = `https://embed.tawk.to/${config.propertyId}/${config.widgetId}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');

        script.onerror = () => {
          this.isInitializing = false;
          this.setStatus('error');
          console.warn('Tawk.to script failed to load (possible ad-blocker or invalid property ID).');
          resolve(false);
        };

        document.head.appendChild(script);
        this.isScriptInjected = true;
      } catch (err) {
        console.warn('Tawk.to initialization error:', err);
        this.isInitializing = false;
        this.setStatus('error');
        resolve(false);
      }
    });

    return this.loadPromise;
  }

  /**
   * Opens / Maximizes the customer support live chat window
   */
  public async openChat(companyInfo?: Partial<CompanyInfo> | null): Promise<void> {
    if (typeof window === 'undefined') return;

    // Check if window.Tawk_API is already ready
    if (this.isLoaded && window.Tawk_API && typeof window.Tawk_API.maximize === 'function') {
      try {
        if (typeof window.Tawk_API.showWidget === 'function') {
          window.Tawk_API.showWidget();
        }
        window.Tawk_API.maximize();
        return;
      } catch (err) {
        console.warn('Tawk.to maximize call error:', err);
      }
    }

    // If not loaded yet, queue the action and initialize
    const action = () => {
      try {
        if (typeof window.Tawk_API?.showWidget === 'function') {
          window.Tawk_API.showWidget();
        }
        window.Tawk_API?.maximize?.();
      } catch (e) {
        console.warn('Deferred Tawk maximize failed:', e);
      }
    };

    this.pendingActions.push(action);

    const ready = await this.init(companyInfo);
    if (!ready && !this.isLoaded) {
      // If Tawk is not configured or blocked, we can redirect or inform gracefully
      console.info('Tawk customer support chat opened in fallback mode.');
    }
  }

  /**
   * Minimizes / Hides the chat widget
   */
  public minimize(): void {
    if (typeof window === 'undefined') return;
    try {
      if (window.Tawk_API && typeof window.Tawk_API.minimize === 'function') {
        window.Tawk_API.minimize();
      }
    } catch (err) {
      console.warn('Tawk minimize error:', err);
    }
  }

  /**
   * Subscribe to Tawk status changes
   */
  public subscribe(listener: TawkListener): () => void {
    this.listeners.add(listener);
    listener(this.currentStatus);

    return () => {
      this.listeners.delete(listener);
    };
  }

  public getStatus(): TawkStatus {
    return this.currentStatus;
  }

  public isReady(): boolean {
    return this.isLoaded;
  }

  private setStatus(status: TawkStatus) {
    this.currentStatus = status;
    this.listeners.forEach((listener) => {
      try {
        listener(status);
      } catch (err) {
        console.warn('Tawk listener error:', err);
      }
    });
  }
}

export const tawkService = new TawkService();
