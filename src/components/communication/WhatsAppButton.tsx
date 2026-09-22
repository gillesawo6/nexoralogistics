import React from 'react';
import { motion } from 'motion/react';
import { WhatsAppConfig } from '../../config/communicationConfig';

interface WhatsAppButtonProps {
  config: WhatsAppConfig;
  variant?: 'desktop' | 'mobile' | 'compact';
}

/**
 * Official WhatsApp SVG Vector Icon
 */
export const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg
    viewBox="0 0 24 24"
    width="24"
    height="24"
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    className={className}
    aria-hidden="true"
  >
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.5C9.33 7.5 9 7.57 8.73 7.84C8.45 8.11 7.68 8.84 7.68 10.32C7.68 11.8 8.76 13.22 8.91 13.42C9.07 13.62 11.03 16.64 14.03 17.93C14.74 18.24 15.3 18.42 15.73 18.56C16.45 18.79 17.1 18.75 17.62 18.68C18.2 18.59 19.41 17.95 19.66 17.24C19.92 16.54 19.92 15.93 19.84 15.81C19.77 15.68 19.57 15.6 19.27 15.45C18.97 15.3 17.5 14.58 17.22 14.48C16.95 14.38 16.75 14.33 16.55 14.63C16.35 14.93 15.78 15.6 15.6 15.81C15.43 16.01 15.25 16.03 14.95 15.88C14.65 15.74 13.69 15.42 12.55 14.41C11.67 13.62 11.07 12.65 10.9 12.35C10.73 12.05 10.88 11.89 11.03 11.74C11.17 11.6 11.34 11.38 11.49 11.21C11.64 11.03 11.69 10.91 11.79 10.71C11.89 10.51 11.84 10.34 11.77 10.19C11.69 10.04 11.09 8.57 10.84 7.97C10.59 7.39 10.34 7.47 10.15 7.46C9.97 7.45 9.77 7.5 9.53 7.5Z" />
  </svg>
);

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({ config, variant = 'desktop' }) => {
  if (!config.enabled || !config.url) {
    return null;
  }

  const isMobile = variant === 'mobile';

  return (
    <motion.a
      href={config.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      data-cursor="WHATSAPP"
      initial={{ opacity: 0, y: 15, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className={`
        group relative flex items-center justify-center font-heading font-extrabold text-white 
        bg-[#25D366] hover:bg-[#20ba59] active:bg-[#1da850]
        shadow-lg shadow-[#25D366]/25 hover:shadow-xl hover:shadow-[#25D366]/40
        transition-all duration-300 select-none outline-none focus-visible:ring-4 focus-visible:ring-[#25D366]/40
        ${isMobile 
          ? 'h-11 sm:h-12 px-3.5 sm:px-4 rounded-full gap-2 text-xs sm:text-sm' 
          : 'h-12 px-4.5 rounded-2xl gap-2.5 text-xs sm:text-sm tracking-wide uppercase'
        }
      `}
    >
      {/* Pulse live dot indicator */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
      </span>

      {/* WhatsApp Icon */}
      <WhatsAppIcon className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:rotate-6" />

      {/* Button Label */}
      <span className="font-heading font-black tracking-wider uppercase whitespace-nowrap">
        {isMobile ? 'WhatsApp' : 'WhatsApp'}
      </span>

      {/* Direct Messaging Badge */}
      {!isMobile && (
        <span className="hidden xl:inline-block text-[10px] font-mono-tech font-bold uppercase bg-white/20 px-2 py-0.5 rounded-md tracking-widest">
          Direct
        </span>
      )}
    </motion.a>
  );
};
