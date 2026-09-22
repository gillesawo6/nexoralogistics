import { EmailPayload, EmailValidationResult, ValidatedEmailRequest } from './types';

// RFC 5322 compliant simplified email regex for robust validation
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

// Pattern to catch CRLF and header injection attempts
const HEADER_INJECTION_REGEX = /[\r\n]|%0d|%0a/i;

/**
 * Validates incoming email request payloads with strict security guards.
 *
 * CRITICAL RULE:
 * This validator NEVER substitutes a default, admin, or fallback recipient.
 * If the recipient is missing, empty, or invalid, the validation FAILS with an explicit error.
 */
export function validateEmailRequest(payload: any): EmailValidationResult {
  if (!payload || typeof payload !== 'object') {
    return {
      valid: false,
      error: 'Missing or invalid request body. Expected a JSON object.',
    };
  }

  const rawPayload = payload as EmailPayload;

  // 1. Extract canonical recipient (accept 'to' or 'recipientEmail')
  const rawRecipient = rawPayload.to || rawPayload.recipientEmail;

  if (!rawRecipient || typeof rawRecipient !== 'string' || rawRecipient.trim().length === 0) {
    return {
      valid: false,
      error: 'Recipient email is required.',
    };
  }

  const cleanRecipient = rawRecipient.trim();

  // 2. Header Injection Check on Recipient
  if (HEADER_INJECTION_REGEX.test(cleanRecipient)) {
    return {
      valid: false,
      error: 'Invalid recipient email: Newline or carriage return characters are strictly prohibited.',
    };
  }

  // 3. Format Validation
  if (!EMAIL_REGEX.test(cleanRecipient)) {
    return {
      valid: false,
      error: `Invalid recipient email format: "${cleanRecipient}".`,
    };
  }

  // 4. Validate Subject
  if (!rawPayload.subject || typeof rawPayload.subject !== 'string' || rawPayload.subject.trim().length === 0) {
    return {
      valid: false,
      error: 'Missing required email "subject".',
    };
  }

  const cleanSubject = rawPayload.subject.trim();
  if (HEADER_INJECTION_REGEX.test(cleanSubject)) {
    return {
      valid: false,
      error: 'Invalid email subject: Newline or carriage return characters are strictly prohibited in headers.',
    };
  }

  // 5. Validate Body (at least html or text must exist)
  const hasHtml = typeof rawPayload.html === 'string' && rawPayload.html.trim().length > 0;
  const hasText = typeof rawPayload.text === 'string' && rawPayload.text.trim().length > 0;

  if (!hasHtml && !hasText) {
    return {
      valid: false,
      error: 'Missing email content. Either "html" or "text" body must be provided.',
    };
  }

  // 6. Validate and Sanitize Optional Headers (replyTo, fromName, toName)
  let cleanReplyTo: string | undefined = undefined;
  const rawReplyTo = rawPayload.replyTo || rawPayload.from || rawPayload.fromEmail;
  if (rawReplyTo && typeof rawReplyTo === 'string') {
    const trimmedReplyTo = rawReplyTo.trim();
    if (HEADER_INJECTION_REGEX.test(trimmedReplyTo)) {
      return {
        valid: false,
        error: 'Invalid reply-to email: Header injection characters detected.',
      };
    }
    if (EMAIL_REGEX.test(trimmedReplyTo)) {
      cleanReplyTo = trimmedReplyTo;
    }
  }

  let cleanFromName = 'NEXORA Global Logistics';
  if (rawPayload.fromName && typeof rawPayload.fromName === 'string') {
    const trimmedFromName = rawPayload.fromName.trim();
    if (HEADER_INJECTION_REGEX.test(trimmedFromName)) {
      return {
        valid: false,
        error: 'Invalid sender name: Header injection characters detected.',
      };
    }
    // Remove decorative glyphs/emojis that could disrupt SMTP parser
    const sanitized = trimmedFromName.replace(/[™®©🚨⚡📦🎉❌✔📌⏳]/g, '').trim();
    if (sanitized.length > 0) {
      cleanFromName = sanitized;
    }
  }

  let cleanToName: string | undefined = undefined;
  const rawToName = rawPayload.toName || rawPayload.recipientName;
  if (rawToName && typeof rawToName === 'string') {
    const trimmedToName = rawToName.trim();
    if (!HEADER_INJECTION_REGEX.test(trimmedToName)) {
      cleanToName = trimmedToName.replace(/["\r\n]/g, '').trim() || undefined;
    }
  }

  const validated: ValidatedEmailRequest = {
    to: cleanRecipient,
    toName: cleanToName,
    subject: cleanSubject.replace(/[🚨⚡📦🎉❌✔📌⏳]/g, '').trim(),
    html: hasHtml ? rawPayload.html : undefined,
    text: hasText ? rawPayload.text : undefined,
    replyTo: cleanReplyTo,
    fromName: cleanFromName,
    type: rawPayload.type,
    quoteRef: rawPayload.quoteRef,
    trackingNumber: rawPayload.trackingNumber,
  };

  return {
    valid: true,
    data: validated,
  };
}

/**
 * Masks an email address for safe, privacy-preserving server logs.
 * e.g. "customer@example.com" -> "c***r@example.com"
 */
export function maskEmail(email?: string): string {
  if (!email || !email.includes('@')) return '***';
  const [local, domain] = email.split('@');
  const maskedLocal = local.length <= 2 ? `${local[0]}*` : `${local[0]}***${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

