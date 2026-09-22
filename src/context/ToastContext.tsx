import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, title?: string, duration?: number) => void;
    error: (message: string, title?: string, duration?: number) => void;
    warning: (message: string, title?: string, duration?: number) => void;
    info: (message: string, title?: string, duration?: number) => void;
    show: (item: Omit<ToastItem, 'id'>) => void;
    dismiss: (id: string) => void;
  };
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((item: Omit<ToastItem, 'id'>) => {
    const id = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const duration = item.duration ?? 4500;

    const newToast: ToastItem = { ...item, id, duration };

    setToasts((prev) => [newToast, ...prev.slice(0, 4)]); // Keep max 5 visible toasts

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
  }, [dismiss]);

  const toast = {
    success: useCallback((message: string, title?: string, duration?: number) => {
      addToast({ type: 'success', message, title: title || 'Success', duration });
    }, [addToast]),
    error: useCallback((message: string, title?: string, duration?: number) => {
      addToast({ type: 'error', message, title: title || 'Error', duration });
    }, [addToast]),
    warning: useCallback((message: string, title?: string, duration?: number) => {
      addToast({ type: 'warning', message, title: title || 'Attention', duration });
    }, [addToast]),
    info: useCallback((message: string, title?: string, duration?: number) => {
      addToast({ type: 'info', message, title: title || 'Notification', duration });
    }, [addToast]),
    show: addToast,
    dismiss,
  };

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-5 h-5 text-[#0066FF] dark:text-[#38bdf8] shrink-0" />;
    }
  };

  const getToastBadgeStyle = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300';
      case 'error':
        return 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300';
      case 'warning':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300';
      case 'info':
      default:
        return 'bg-[#0066FF]/10 border-[#0066FF]/30 text-[#0066FF] dark:text-[#38bdf8]';
    }
  };

  const getToastProgressColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500';
      case 'error':
        return 'bg-rose-500';
      case 'warning':
        return 'bg-amber-500';
      case 'info':
      default:
        return 'bg-[#0066FF]';
    }
  };

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      {/* Floating Toast Notification Container */}
      <div
        id="toast-notification-stack"
        aria-live="polite"
        className="fixed top-4 right-4 sm:top-6 sm:right-6 z-[999999] flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      >
        <AnimatePresence mode="sync">
          {toasts.map((item) => (
            <motion.div
              key={item.id}
              layout
              initial={{ opacity: 0, y: -16, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92, transition: { duration: 0.2 } }}
              transition={{ type: 'spring', damping: 25, stiffness: 350 }}
              className="pointer-events-auto relative overflow-hidden rounded-2xl bg-white/95 dark:bg-[#070D1D]/95 backdrop-blur-xl border border-slate-200/90 dark:border-white/15 shadow-2xl p-4 sm:p-4.5 text-slate-900 dark:text-white"
            >
              <div className="flex items-start gap-3.5">
                <div className="mt-0.5">{getToastIcon(item.type)}</div>
                
                <div className="flex-1 min-w-0 pr-2">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-heading font-black text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                      {item.title}
                    </span>
                    <span
                      className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono-tech font-bold uppercase border ${getToastBadgeStyle(
                        item.type
                      )}`}
                    >
                      {item.type}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed font-medium break-words">
                    {item.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismiss(item.id)}
                  className="shrink-0 -mt-1 -mr-1 p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
                  aria-label="Dismiss notification"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Progress countdown indicator */}
              {item.duration && item.duration > 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ duration: item.duration / 1000, ease: 'linear' }}
                  className={`absolute bottom-0 left-0 h-[2.5px] ${getToastProgressColor(
                    item.type
                  )} opacity-75`}
                />
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context.toast;
}
