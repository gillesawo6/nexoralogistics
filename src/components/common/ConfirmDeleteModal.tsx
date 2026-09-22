import React, { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, AlertTriangle, X, Loader2 } from 'lucide-react';

export interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  itemName?: string;
  itemBadge?: string;
  confirmText?: string;
  cancelText?: string;
  isDeleting?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  itemName,
  itemBadge,
  confirmText = 'Delete Permanently',
  cancelText = 'Cancel',
  isDeleting = false,
}) => {
  const cancelBtnRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      // Auto-focus cancel button for safety
      setTimeout(() => cancelBtnRef.current?.focus(), 50);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isOpen, isDeleting, onClose]);

  if (!isOpen && typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              if (!isDeleting) onClose();
            }}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
          />

          {/* Modal Dialog Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-delete-title"
            className="relative w-full max-w-md bg-white dark:bg-[#070D1D] border border-slate-200 dark:border-white/10 rounded-2xl p-6 sm:p-7 shadow-2xl z-10 space-y-5"
          >
            {/* Close X */}
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header with Icon */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1 pr-4">
                <h3
                  id="confirm-delete-title"
                  className="font-heading font-black text-lg sm:text-xl text-slate-950 dark:text-white uppercase tracking-tight"
                >
                  {title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-gray-400 font-sans leading-relaxed">
                  {description || 'Are you sure you want to permanently delete this record? This action cannot be undone.'}
                </p>
              </div>
            </div>

            {/* Highlighted item card if provided */}
            {itemName && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#0D1527] border border-slate-200 dark:border-white/5 font-mono-tech text-xs flex items-center justify-between gap-2">
                <div className="truncate">
                  {itemBadge && (
                    <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
                      {itemBadge}
                    </span>
                  )}
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {itemName}
                  </span>
                </div>
                <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded-md border border-rose-500/20 uppercase">
                  <AlertTriangle className="w-3 h-3" />
                  <span>Irreversible</span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-end gap-3 font-mono-tech text-xs">
              <button
                ref={cancelBtnRef}
                type="button"
                onClick={onClose}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-gray-300 font-bold uppercase transition-colors disabled:opacity-50 cursor-pointer"
              >
                {cancelText}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await onConfirm();
                }}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-bold uppercase transition-all shadow-lg shadow-rose-600/25 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{confirmText}</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default ConfirmDeleteModal;
