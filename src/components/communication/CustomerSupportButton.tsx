import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Headphones, MessageSquareText, Sparkles, Loader2 } from 'lucide-react';
import { tawkService } from '../../services/tawkService';
import { TawkConfig } from '../../config/communicationConfig';
import { CompanyInfo } from '../../types';

interface CustomerSupportButtonProps {
  config: TawkConfig;
  companyInfo?: CompanyInfo | null;
  variant?: 'desktop' | 'mobile' | 'compact';
  onFallbackRequest?: () => void;
}

export const CustomerSupportButton: React.FC<CustomerSupportButtonProps> = ({
  config,
  companyInfo,
  variant = 'desktop',
  onFallbackRequest,
}) => {
  const [isOpening, setIsOpening] = useState(false);

  if (!config.enabled) {
    return null;
  }

  const isMobile = variant === 'mobile';

  const handleClick = async () => {
    setIsOpening(true);

    try {
      // If Tawk.to is configured, trigger the live widget
      if (config.isConfigured || window.Tawk_API) {
        await tawkService.openChat(companyInfo);
      } else {
        // If Tawk credentials haven't been provided yet, open prompt/fallback desk modal
        if (onFallbackRequest) {
          onFallbackRequest();
        } else {
          await tawkService.openChat(companyInfo);
        }
      }
    } catch (err) {
      console.warn('Customer support launch notice:', err);
      if (onFallbackRequest) onFallbackRequest();
    } finally {
      setTimeout(() => {
        setIsOpening(false);
      }, 1000);
    }
  };

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      aria-label="Open customer support live chat"
      data-cursor="SUPPORT"
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`
        group relative flex items-center justify-center font-heading font-extrabold text-white 
        bg-[#0066FF] hover:bg-[#0052cc] active:bg-[#0041a8]
        border border-white/20 dark:border-white/15
        shadow-lg shadow-[#0066FF]/25 hover:shadow-xl hover:shadow-[#0066FF]/40
        transition-all duration-300 select-none outline-none focus-visible:ring-4 focus-visible:ring-[#0066FF]/40 cursor-pointer
        ${isMobile 
          ? 'h-11 sm:h-12 px-3.5 sm:px-4 rounded-full gap-2 text-xs sm:text-sm' 
          : 'h-12 px-4.5 rounded-2xl gap-2.5 text-xs sm:text-sm tracking-wide uppercase'
        }
      `}
    >
      {/* 24/7 Operations Live Pulse */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
      </span>

      {/* Support Icon */}
      {isOpening ? (
        <Loader2 className="w-5 h-5 animate-spin shrink-0 text-white" />
      ) : (
        <Headphones className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 text-white" />
      )}

      {/* Button Label */}
      <span className="font-heading font-black tracking-wider uppercase whitespace-nowrap">
        {isMobile ? 'Live Support' : 'Live Support'}
      </span>

      {/* Live Desk Badge */}
      {!isMobile && (
        <span className="hidden xl:inline-block text-[10px] font-mono-tech font-bold uppercase bg-white/20 px-2 py-0.5 rounded-md tracking-widest">
          24/7 Desk
        </span>
      )}
    </motion.button>
  );
};
