import { CompanyInfo } from '../types';

/**
 * Centralized WhatsApp Communication & Messaging Configuration
 * Driven by dynamic Firestore Company Profile settings and reliable enterprise defaults.
 */

export interface WhatsAppConfig {
  enabled: boolean;
  rawNumber: string;
  sanitizedNumber: string;
  message: string;
  url: string;
}

/**
 * Strips all non-digit characters to ensure strict WhatsApp Universal URL compliance:
 * Format: https://wa.me/<digits_only> (e.g. wa.me/31689240001 or wa.me/237670000000)
 */
export function sanitizeWhatsAppNumber(raw?: string): string {
  if (!raw) return '';
  // Remove all non-numeric characters (+, spaces, -, (, ), etc.)
  const digits = raw.replace(/\D/g, '');
  return digits;
}

/**
 * Constructs the standardized, URL-encoded WhatsApp Universal URL
 */
export function buildWhatsAppUrl(rawNumber?: string, message?: string): string {
  const digits = sanitizeWhatsAppNumber(rawNumber);
  if (!digits) {
    return '';
  }

  const defaultMsg = 'Hello, I would like to make an enquiry about your logistics services.';
  const msgText = message && message.trim() ? message.trim() : defaultMsg;
  const encodedMsg = encodeURIComponent(msgText);

  return `https://wa.me/${digits}?text=${encodedMsg}`;
}

/**
 * Resolves current WhatsApp configuration from dynamic company profile with safe fallback
 */
export function getWhatsAppConfig(companyInfo?: Partial<CompanyInfo> | null): WhatsAppConfig {
  // Primary number from company info is prioritized as the designated WhatsApp contact
  const rawNumber = (companyInfo?.whatsappPhone && companyInfo.whatsappPhone.trim()) 
    || (companyInfo?.primaryPhone && companyInfo.primaryPhone.trim()) 
    || '+31 10 892 4000';

  const message = (companyInfo?.whatsappMessage && companyInfo.whatsappMessage.trim()) 
    || 'Hello, I would like to make an enquiry about your logistics services.';

  const sanitizedNumber = sanitizeWhatsAppNumber(rawNumber);
  const enabled = companyInfo?.enableWhatsApp !== false && Boolean(sanitizedNumber);
  const url = buildWhatsAppUrl(sanitizedNumber, message);

  return {
    enabled,
    rawNumber,
    sanitizedNumber,
    message,
    url,
  };
}
