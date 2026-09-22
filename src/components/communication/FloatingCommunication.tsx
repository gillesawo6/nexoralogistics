import React, { useState, useEffect } from 'react';
import { storageService } from '../../services/storageService';
import { CompanyInfo } from '../../types';
import { getWhatsAppConfig, WhatsAppConfig } from '../../config/communicationConfig';
import { WhatsAppButton } from './WhatsAppButton';

export const FloatingCommunication: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(() => storageService.getCompanyInfo());
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Subscribe to live company settings changes
    const unsubscribe = storageService.subscribeToCompanyInfo((updated) => {
      setCompanyInfo(updated);
    });

    return () => unsubscribe();
  }, []);

  if (!isMounted) return null;

  const whatsappConfig: WhatsAppConfig = getWhatsAppConfig(companyInfo);

  // If WhatsApp is disabled in settings, render nothing
  if (!whatsappConfig.enabled) {
    return null;
  }

  return (
    <aside 
      aria-label="Direct WhatsApp Contact" 
      className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-[60] flex flex-col items-end gap-2.5 sm:gap-3 pointer-events-none pb-[env(safe-area-inset-bottom,0px)]"
    >
      <div className="flex flex-col sm:flex-col items-end gap-2.5 sm:gap-3 pointer-events-auto">
        <WhatsAppButton 
          config={whatsappConfig} 
          variant="desktop" 
        />
      </div>
    </aside>
  );
};
