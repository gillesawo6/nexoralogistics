import { QuoteRequest, ContactMessage, Shipment, TrackingEvent } from '../types';
import { storageService } from './storageService';

export interface EmailMessageRecord {
  id: string;
  sentAt: string;
  recipientEmail: string;
  recipientName: string;
  fromEmail?: string;
  fromName?: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  type: 
    | 'contact_message_to_company'
    | 'contact_confirmation_to_customer'
    | 'quote_request_to_company'
    | 'quote_request_receipt'
    | 'quote_sent'
    | 'quote_accepted'
    | 'quote_accepted_receipt'
    | 'quote_declined'
    | 'quote_declined_receipt'
    | 'shipment_created_to_customer'
    | 'shipment_created_to_company'
    | 'shipment_status_update'
    | 'newsletter_welcome'
    | 'newsletter_alert_to_company'
    | 'general';
  quoteRef?: string;
  trackingNumber?: string;
  department?: string;
  gmailComposeUrl?: string;
  dispatchStatus?: 'dispatched' | 'pending' | 'queued';
}

const EMAIL_LOGS_KEY = 'nexora_sent_emails_v1';

export const emailService = {
  getEmailLogs(): EmailMessageRecord[] {
    try {
      const data = localStorage.getItem(EMAIL_LOGS_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  /**
   * Generates a direct 1-click web launcher URL for Gmail compose with pre-filled To, Subject, and Body
   */
  generateGmailComposeUrl(recipientEmail: string, subject: string, bodyText: string): string {
    return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(recipientEmail)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
  },

  /**
   * Updates an existing email record's dispatch status in localStorage
   */
  updateEmailDispatchStatus(id: string, status: 'dispatched' | 'pending' | 'queued'): void {
    try {
      const logs = this.getEmailLogs();
      const target = logs.find((l) => l.id === id);
      if (target) {
        target.dispatchStatus = status;
        localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
      }
    } catch (e) {
      console.warn('Failed to update email dispatch status in localStorage', e);
    }
  },

  /**
   * Direct asynchronous email dispatch to /api/send-email endpoint
   */
  async sendEmail(payload: {
    to: string;
    toName?: string;
    subject: string;
    html?: string;
    text?: string;
    replyTo?: string;
    fromName?: string;
    type?: string;
    quoteRef?: string;
    trackingNumber?: string;
  }): Promise<{ success: boolean; delivered?: boolean; messageId?: string; error?: string }> {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        const errorMsg =
          data?.error ||
          (res.statusText ? `HTTP ${res.status}: ${res.statusText}` : `HTTP error ${res.status}`);
        return {
          success: false,
          error: errorMsg,
        };
      }
      return data;
    } catch (err: any) {
      return {
        success: false,
        error: err?.message || 'Network error while contacting email API',
      };
    }
  },

  logEmail(email: Omit<EmailMessageRecord, 'id' | 'sentAt'>): EmailMessageRecord {
    const logs = this.getEmailLogs();
    const gmailComposeUrl = this.generateGmailComposeUrl(
      email.recipientEmail,
      email.subject,
      email.bodyText
    );

    const newRecord: EmailMessageRecord = {
      ...email,
      id: `email-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      sentAt: new Date().toISOString(),
      gmailComposeUrl,
      dispatchStatus: 'pending',
    };
    logs.unshift(newRecord);
    try {
      localStorage.setItem(EMAIL_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    } catch (e) {
      console.warn('Failed to save email log', e);
    }

    // Asynchronously dispatch to /api/send-email (Vercel Serverless Function & local server)
    if (typeof window !== 'undefined') {
      const company = storageService.getCompanyInfo();
      const primaryCompanyEmail = company.primaryEmail || 'gillesawo6@gmail.com';

      fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.recipientEmail,
          toName: email.recipientName,
          from: email.fromEmail || primaryCompanyEmail,
          fromName: email.fromName || company.tradeName || 'NEXORA Global Logistics',
          companyEmail: primaryCompanyEmail,
          replyTo: email.fromEmail || primaryCompanyEmail,
          subject: email.subject,
          html: email.bodyHtml,
          text: email.bodyText,
          type: email.type,
          quoteRef: email.quoteRef,
          trackingNumber: email.trackingNumber,
        }),
      })
        .then(async (res) => {
          if (!res.ok) {
            const errorData = await res.json().catch(() => null);
            const errorMsg =
              errorData?.error ||
              (res.statusText ? `HTTP ${res.status}: ${res.statusText}` : `HTTP ${res.status}`);
            console.warn('[EMAIL DISPATCH]', `Server returned HTTP ${res.status}:`, errorMsg);
            this.updateEmailDispatchStatus(newRecord.id, 'pending');
            return;
          }
          const result = await res.json().catch(() => null);
          if (result && result.success && result.delivered) {
            console.log(`[EMAIL DISPATCH] Email confirmed delivered via ${result.provider || 'backend'} (MessageID: ${result.messageId || 'ok'})`);
            this.updateEmailDispatchStatus(newRecord.id, 'dispatched');
          } else {
            console.warn('[EMAIL DISPATCH] Email transmission was not confirmed:', result?.error || 'Pending delivery');
            this.updateEmailDispatchStatus(newRecord.id, 'pending');
          }
        })
        .catch((err) => {
          console.warn('[EMAIL DISPATCH] Network or server error on /api/send-email:', err?.message || err);
          this.updateEmailDispatchStatus(newRecord.id, 'pending');
        });
    }

    return newRecord;
  },

  /**
   * Generates direct URL for viewing a quote
   */
  getQuoteCustomerUrl(quote: QuoteRequest): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nexoralogistics.com';
    const ref = quote.referenceNumber || quote.id;
    return `${origin}/quote/${encodeURIComponent(ref)}`;
  },

  /**
   * Generates direct URL for tracking a consignment
   */
  getTrackingCustomerUrl(trackingNumber: string): string {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://nexoralogistics.com';
    return `${origin}/tracking?number=${encodeURIComponent(trackingNumber)}`;
  },

  // =========================================================================
  // 1. CONTACT PAGE EMAIL DISPATCH
  // =========================================================================

  /**
   * Sends the contact transmission directly to the company's designated operational email address.
   */
  sendContactMessageToCompany(msg: ContactMessage): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    
    // Select specific department destination email or fallback to primary email
    let targetEmail = company.primaryEmail;
    if (msg.department === 'Sales & Rates' && company.quotesEmail) {
      targetEmail = company.quotesEmail;
    } else if (msg.department === 'Customer Support' && company.supportEmail) {
      targetEmail = company.supportEmail;
    } else if (msg.department === 'Customs Brokerage' && (company.customsEmail || company.supportEmail)) {
      targetEmail = company.customsEmail || company.supportEmail;
    } else if (msg.department === 'Press & Media' && (company.mediaEmail || company.primaryEmail)) {
      targetEmail = company.mediaEmail || company.primaryEmail;
    }

    const subject = `Inquiry (${msg.department}): ${msg.subject} - from ${msg.name}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Client Services Desk
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            New Customer Inquiry
          </h1>
          <div style="margin-top: 4px; font-size: 12px; color: #94a3b8; font-family: monospace;">
            Ticket Reference: #${msg.id.toUpperCase()} • Department: ${msg.department}
          </div>
        </div>

        <!-- Body Content -->
        <div style="padding: 28px;">
          <!-- Sender Dossier -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
            <div style="color: #64748b; font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 8px; letter-spacing: 0.5px;">
              Contact Information
            </div>
            <div style="display: grid; grid-template-columns: 1fr; gap: 6px; color: #0f172a;">
              <div><strong>Name:</strong> ${msg.name}</div>
              <div><strong>Email:</strong> <a href="mailto:${msg.email}" style="color: #0066FF; text-decoration: none;">${msg.email}</a></div>
              ${msg.phone ? `<div><strong>Phone:</strong> <a href="tel:${msg.phone}" style="color: #0066FF; text-decoration: none;">${msg.phone}</a></div>` : ''}
              ${msg.company ? `<div><strong>Organization:</strong> ${msg.company}</div>` : ''}
              <div><strong>Department:</strong> ${msg.department}</div>
              <div><strong>Received:</strong> ${msg.createdAt}</div>
            </div>
          </div>

          <!-- Subject & Message -->
          <div style="margin-bottom: 24px;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
              Subject
            </div>
            <div style="font-size: 16px; font-weight: 700; color: #0f172a; margin-bottom: 14px;">
              ${msg.subject}
            </div>

            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 6px;">
              Message Content
            </div>
            <div style="background: #f1f5f9; border-left: 3px solid #0066FF; border-radius: 0 6px 6px 0; padding: 16px; font-size: 14px; line-height: 1.6; color: #1e293b; white-space: pre-wrap;">
${msg.message}
            </div>
          </div>

          <!-- Action Buttons -->
          <div style="background: #0B1528; border-radius: 8px; padding: 18px; text-align: center; margin-top: 24px;">
            <a href="mailto:${msg.email}?subject=${encodeURIComponent(`Re: [Ticket #${msg.id}] ${msg.subject} - ${company.tradeName}`)}" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 10px 22px; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none; margin-right: 8px;">
              Reply to ${msg.name}
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          ${company.companyName} • Operations Support • ${company.hqAddress}
        </div>
      </div>
    `;

    const bodyText = `
New Customer Inquiry (Ticket #${msg.id})
Department: ${msg.department}
Sender: ${msg.name}
Email: ${msg.email}
Phone: ${msg.phone || 'N/A'}
Company: ${msg.company || 'N/A'}
Subject: ${msg.subject}
Received: ${msg.createdAt}

Message:
${msg.message}

Reply to: ${msg.email}
${company.companyName}
    `.trim();

    return this.logEmail({
      recipientEmail: targetEmail,
      recipientName: `${company.tradeName} Support`,
      fromEmail: msg.email,
      fromName: msg.name,
      subject,
      bodyHtml,
      bodyText,
      type: 'contact_message_to_company',
      department: msg.department,
    });
  },

  /**
   * Sends an automated acknowledgment & ticket receipt confirmation to the customer.
   */
  sendContactConfirmationToCustomer(msg: ContactMessage): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const subject = `Inquiry Confirmation (Ticket #${msg.id}) - ${company.tradeName}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Client Services
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            We Have Received Your Inquiry
          </h1>
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px;">
            Reference Ticket: #${msg.id.toUpperCase()}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Dear <strong>${msg.name}</strong>,
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Thank you for contacting <strong>${company.companyName}</strong>. Your inquiry regarding <strong>"${msg.subject}"</strong> has been received by our <strong>${msg.department}</strong> team.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin: 18px 0; font-size: 13px; color: #1e293b;">
            <div style="color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 6px;">Inquiry Summary</div>
            <div><strong>Department:</strong> ${msg.department}</div>
            <div style="margin-top: 4px;"><strong>Subject:</strong> ${msg.subject}</div>
            <div style="margin-top: 4px;"><strong>Reference:</strong> #${msg.id}</div>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            A customer support representative will review your message and respond as soon as possible.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          <div>${company.companyName} • ${company.hqAddress}</div>
          <div style="margin-top: 4px;">Phone: ${company.primaryPhone} | Email: ${company.primaryEmail}</div>
        </div>
      </div>
    `;

    const bodyText = `
Inquiry Confirmation (Ticket #${msg.id}) - ${company.companyName}
Hello ${msg.name},

We have received your inquiry regarding "${msg.subject}". Our ${msg.department} team will review and reply shortly.

Reference: #${msg.id}
Support Phone: ${company.primaryPhone}

Thank you,
${company.companyName}
    `.trim();

    return this.logEmail({
      recipientEmail: msg.email,
      recipientName: msg.name,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Support`,
      subject,
      bodyHtml,
      bodyText,
      type: 'contact_confirmation_to_customer',
      department: msg.department,
    });
  },

  // =========================================================================
  // 2. FREIGHT QUOTE NOTIFICATIONS & PROPOSALS
  // =========================================================================

  /**
   * Dispatches High-Priority Rate Inquiry alert to the Company's pricing desk.
   */
  sendQuoteRequestToCompany(quote: QuoteRequest): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const targetEmail = company.quotesEmail || company.primaryEmail;

    const subject = `New Quote Request (Ref: ${ref}) - ${quote.originCity} to ${quote.destCity}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Freight Pricing Desk
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            New Rate Quotation Requested
          </h1>
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px;">
            Reference: #${ref} • Mode: ${quote.service}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 28px;">
          <!-- Corridor Card -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin-bottom: 18px; font-size: 13px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase; font-weight: 700;">Origin:</span>
                <strong style="color: #0f172a; font-size: 14px;">${quote.originCity}, ${quote.originCountry}</strong>
                ${quote.originAddress ? `<div style="font-size: 11px; color: #64748b;">${quote.originAddress}</div>` : ''}
              </div>
              <div>
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase; font-weight: 700;">Destination:</span>
                <strong style="color: #0f172a; font-size: 14px;">${quote.destCity}, ${quote.destCountry}</strong>
                ${quote.destAddress ? `<div style="font-size: 11px; color: #64748b;">${quote.destAddress}</div>` : ''}
              </div>
            </div>
          </div>

          <!-- Cargo Specifications -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 18px; font-size: 13px;">
            <div style="color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">Cargo Specifications</div>
            <div><strong>Commodity:</strong> ${quote.cargoType || 'General Freight'}</div>
            <div style="margin-top: 4px;"><strong>Gross Weight:</strong> ${quote.weightKg.toLocaleString()} KG</div>
            <div style="margin-top: 4px;"><strong>Pieces &amp; Packaging:</strong> ${quote.pieces || 1}x ${quote.packageType || 'Standard'}</div>
            ${quote.volumeCbm ? `<div style="margin-top: 4px;"><strong>Volume:</strong> ${quote.volumeCbm} CBM</div>` : ''}
            ${quote.declaredValue ? `<div style="margin-top: 4px;"><strong>Declared Value:</strong> $${quote.declaredValue.toLocaleString()} USD</div>` : ''}
            ${quote.specialRequirements && quote.specialRequirements.length > 0 ? `<div style="margin-top: 4px; color: #0066FF;"><strong>Special Requirements:</strong> ${quote.specialRequirements.join(', ')}</div>` : ''}
            ${quote.notes ? `<div style="margin-top: 8px; padding-top: 8px; border-top: 1px dashed #cbd5e1; color: #334155;"><strong>Client Notes:</strong> ${quote.notes}</div>` : ''}
          </div>

          <!-- Customer Dossier -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px; font-size: 13px;">
            <div style="color: #64748b; font-weight: 700; font-size: 11px; text-transform: uppercase; margin-bottom: 8px;">Requestor Details</div>
            <div><strong>Name:</strong> ${quote.fullName}</div>
            <div style="margin-top: 4px;"><strong>Company:</strong> ${quote.companyName || 'Private Enterprise'}</div>
            <div style="margin-top: 4px;"><strong>Email:</strong> <a href="mailto:${quote.email}" style="color: #0066FF;">${quote.email}</a></div>
            <div style="margin-top: 4px;"><strong>Phone:</strong> ${quote.phone}</div>
          </div>

          <!-- CTA to Admin -->
          <div style="text-align: center; margin: 20px 0;">
            <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/admin/quotes" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none;">
              Review in Admin Portal
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 14px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          ${company.companyName} • Pricing &amp; Tariffs
        </div>
      </div>
    `;

    const bodyText = `
New Quote Request (Ref: ${ref})
------------------------------------------------------------
Service Mode: ${quote.service}
Route: ${quote.originCity}, ${quote.originCountry} to ${quote.destCity}, ${quote.destCountry}
Gross Weight: ${quote.weightKg} KG
Commodity: ${quote.cargoType || 'General Cargo'}

Customer: ${quote.fullName} (${quote.companyName || 'Private'})
Email: ${quote.email} | Phone: ${quote.phone}

Review and issue pricing proposal in the admin desk.
${company.companyName}
    `.trim();

    return this.logEmail({
      recipientEmail: targetEmail,
      recipientName: 'NEXORA Pricing Desk',
      fromEmail: quote.email,
      fromName: quote.fullName,
      subject,
      bodyHtml,
      bodyText,
      type: 'quote_request_to_company',
      quoteRef: ref,
    });
  },

  /**
   * Dispatches initial receipt confirmation to the customer
   */
  sendQuoteConfirmationToCustomer(quote: QuoteRequest): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const quoteUrl = this.getQuoteCustomerUrl(quote);
    const subject = `Quote Request Confirmation (Ref: ${ref}) - ${company.tradeName}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Freight Services
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Quote Request Received
          </h1>
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px;">
            Reference ID: #${ref}
          </div>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Hello <strong>${quote.fullName}</strong>,
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Thank you for requesting a freight rate proposal. Our team is calculating the optimal routing and tariff for your <strong>${quote.service}</strong> shipment from <strong>${quote.originCity}</strong> to <strong>${quote.destCity}</strong>.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin: 18px 0; font-size: 13px; color: #1e293b;">
            <div><strong>Origin:</strong> ${quote.originCity}, ${quote.originCountry}</div>
            <div style="margin-top: 4px;"><strong>Destination:</strong> ${quote.destCity}, ${quote.destCountry}</div>
            <div style="margin-top: 4px;"><strong>Cargo:</strong> ${quote.cargoType || 'General Freight'} (${quote.weightKg} kg)</div>
            ${quote.estimatedCostUsd ? `<div style="margin-top: 4px; color: #0066FF;"><strong>Estimated Range:</strong> $${quote.estimatedCostUsd.toLocaleString()} USD</div>` : ''}
          </div>

          <div style="text-align: center; margin: 24px 0;">
            <a href="${quoteUrl}" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 13px; text-decoration: none;">
              Check Quote Status Online
            </a>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5; margin-bottom: 0;">
            You will receive a formal itemized pricing proposal once reviewed by our operations desk.
          </p>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          <div>${company.companyName} • ${company.hqAddress}</div>
          <div style="margin-top: 4px;">Phone: ${company.primaryPhone} | Email: ${company.quotesEmail || company.primaryEmail}</div>
        </div>
      </div>
    `;

    const bodyText = `
Quote Request Confirmation (Ref: #${ref})
Hello ${quote.fullName},

Thank you for your freight quote request for ${quote.service} from ${quote.originCity} to ${quote.destCity}.
Weight: ${quote.weightKg} kg

You can check the real-time status of your quote online:
${quoteUrl}

If you have questions, contact us at ${company.primaryPhone} or ${company.quotesEmail || company.primaryEmail}.

Thank you,
${company.companyName}
    `.trim();

    return this.logEmail({
      recipientEmail: quote.email,
      recipientName: quote.fullName,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Pricing`,
      subject,
      bodyHtml,
      bodyText,
      type: 'quote_request_receipt',
      quoteRef: ref,
    });
  },

  /**
   * Dispatches official quote pricing proposal email to the customer
   */
  sendOfficialQuoteToCustomer(quote: QuoteRequest, customNote?: string): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const quoteUrl = this.getQuoteCustomerUrl(quote);
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const currency = quote.pricing?.currency || 'USD';
    const totalFormatted = (quote.pricing?.totalAmount || quote.estimatedCostUsd || 0).toLocaleString();
    const validUntil = quote.validUntil || quote.pricing?.validUntil || '14 days from issuance';
    const transitDays = quote.pricing?.transitTimeDays || quote.estimatedTransitDays || 3;

    const lineItemsHtml = (quote.pricing?.lineItems || [])
      .map(
        (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 12px; font-size: 13px; color: #1e293b;">
            <strong>${item.description}</strong>
            <span style="display: block; font-size: 11px; color: #64748b;">${item.category}</span>
          </td>
          <td style="padding: 10px 12px; font-size: 13px; text-align: right; font-weight: 600; color: ${
            item.amount < 0 ? '#10b981' : '#0f172a'
          };">
            ${item.amount < 0 ? '-' : ''}${currency} ${Math.abs(item.amount).toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
          </td>
        </tr>
      `
      )
      .join('');

    const subject = `Freight Quotation (Ref: ${ref}) - ${quote.originCity} to ${quote.destCity}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #0B1528; padding: 26px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4px;">
            ${company.tradeName} Pricing Desk
          </div>
          <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Freight Rate Proposal #${ref}
          </h1>
          <div style="margin-top: 6px; font-size: 12px; color: #94a3b8;">
            Prepared for: ${quote.fullName} ${quote.companyName ? `(${quote.companyName})` : ''}
          </div>
        </div>

        <!-- Body -->
        <div style="padding: 28px;">
          <p style="font-size: 14px; line-height: 1.6; color: #334155; margin-top: 0;">
            Dear <strong>${quote.fullName}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            Our logistics team has completed the pricing calculation for your <strong>${quote.service}</strong> consignment from <strong>${quote.originCity}, ${quote.originCountry}</strong> to <strong>${quote.destCity}, ${quote.destCountry}</strong>.
          </p>

          ${customNote ? `<div style="background: #f8fafc; border-left: 3px solid #0066FF; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #475569; border-radius: 0 6px 6px 0;"><strong>Operational Note:</strong> ${customNote}</div>` : ''}

          <!-- Corridors & Cargo Quick Specs -->
          <div style="background: #f1f5f9; border-radius: 8px; padding: 16px; margin: 18px 0; font-size: 13px;">
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
              <div>
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase; font-weight: 700;">Route:</span>
                <strong style="color: #0f172a;">${quote.originCity} to ${quote.destCity}</strong>
              </div>
              <div>
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase; font-weight: 700;">Service &amp; Cargo:</span>
                <strong style="color: #0066FF;">${quote.service}</strong> • ${quote.cargoType || 'General Cargo'}
              </div>
              <div>
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase; font-weight: 700;">Weight:</span>
                <strong style="color: #0f172a;">${quote.weightKg.toLocaleString()} KG</strong>
              </div>
              <div>
                <span style="color: #64748b; font-size: 10px; display: block; text-transform: uppercase; font-weight: 700;">Est. Transit Time:</span>
                <strong style="color: #10b981;">${transitDays} Business Days</strong>
              </div>
            </div>
          </div>

          <!-- Pricing Table -->
          <div style="margin: 20px 0;">
            <div style="font-size: 12px; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 8px;">
              Charge Breakdown:
            </div>
            <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 6px; overflow: hidden;">
              <thead>
                <tr style="background: #f8fafc; border-bottom: 2px solid #cbd5e1;">
                  <th style="padding: 10px 12px; text-align: left; font-size: 11px; color: #475569; text-transform: uppercase;">Description</th>
                  <th style="padding: 10px 12px; text-align: right; font-size: 11px; color: #475569; text-transform: uppercase;">Amount (${currency})</th>
                </tr>
              </thead>
              <tbody>
                ${lineItemsHtml || `<tr><td colspan="2" style="padding: 12px; text-align: center; color: #64748b; font-size: 12px;">Standard Freight Rate</td></tr>`}
              </tbody>
              <tfoot>
                <tr style="background: #0B1528; color: #ffffff;">
                  <td style="padding: 12px 14px; font-size: 13px; font-weight: 700; text-transform: uppercase; color: #ffffff;">
                    Total Proposal Amount:
                  </td>
                  <td style="padding: 12px 14px; font-size: 16px; font-weight: 800; text-align: right; color: #38bdf8; font-family: monospace;">
                    ${currency} ${totalFormatted}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          <!-- Validity & CTA Button -->
          <div style="background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 18px; text-align: center; margin: 24px 0;">
            <div style="font-size: 12px; color: #1e40af; margin-bottom: 10px; font-weight: 600;">
              Valid until: <strong>${validUntil}</strong>
            </div>
            <a href="${quoteUrl}" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 12px 28px; border-radius: 8px; font-weight: 700; font-size: 13px; text-decoration: none;">
              View &amp; Accept Proposal Online
            </a>
          </div>

          <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin-bottom: 0;">
            If you have questions or special requirements, reply directly to this email or contact us at <strong>${company.quotesEmail || company.primaryEmail}</strong>.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          <div>${company.companyName} • ${company.hqAddress}</div>
          <div style="margin-top: 4px;">Phone: ${company.primaryPhone} | Email: ${company.quotesEmail || company.primaryEmail}</div>
        </div>
      </div>
    `;

    const bodyText = `
Freight Rate Proposal (Ref: #${ref}) - ${company.companyName}
------------------------------------------------------------
Issued to: ${quote.fullName} (${quote.companyName || 'Client'})
Route: ${quote.originCity}, ${quote.originCountry} to ${quote.destCity}, ${quote.destCountry}
Service: ${quote.service} | Weight: ${quote.weightKg} KG
Total Amount: ${currency} ${totalFormatted}
Validity: Valid until ${validUntil}

Review and accept your quote online:
${quoteUrl}

For assistance, contact our desk at ${company.primaryPhone} or ${company.quotesEmail || company.primaryEmail}.
------------------------------------------------------------
${company.companyName}
    `.trim();

    return this.logEmail({
      recipientEmail: quote.email,
      recipientName: quote.fullName,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Pricing`,
      subject,
      bodyHtml,
      bodyText,
      type: 'quote_sent',
      quoteRef: ref,
    });
  },

  /**
   * Notifies administrator operations when a customer accepts a quote
   */
  sendQuoteAcceptedNotificationToAdmin(quote: QuoteRequest): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const adminEmail = company.primaryEmail || 'gillesawo6@gmail.com';
    const currency = quote.pricing?.currency || 'USD';
    const totalFormatted = (quote.pricing?.totalAmount || quote.estimatedCostUsd || 0).toLocaleString();

    const subject = `Quote Accepted (Ref: #${ref}) by ${quote.fullName} (${currency} ${totalFormatted})`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; background: #0B1528; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #10b981; margin-top: 0; font-size: 18px;">Customer Accepted Quote #${ref}</h2>
        <p><strong>Customer:</strong> ${quote.fullName} (${quote.companyName || 'N/A'})</p>
        <p><strong>Email:</strong> ${quote.email} | <strong>Phone:</strong> ${quote.phone}</p>
        <p><strong>Route:</strong> ${quote.originCity} to ${quote.destCity}</p>
        <p><strong>Contract Value:</strong> ${currency} ${totalFormatted}</p>
        <p><strong>Accepted At:</strong> ${quote.acceptedAt || new Date().toISOString()}</p>
        ${quote.acceptedByName ? `<p><strong>Authorized Signer:</strong> ${quote.acceptedByName}</p>` : ''}
        ${quote.acceptanceNotes ? `<p><strong>Customer Notes:</strong> ${quote.acceptanceNotes}</p>` : ''}
        <div style="margin-top: 20px;">
          <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/admin/quotes" style="background: #0066FF; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Open Admin Portal to Create Shipment
          </a>
        </div>
      </div>
    `;

    return this.logEmail({
      recipientEmail: adminEmail,
      recipientName: 'NEXORA Operations',
      fromEmail: quote.email,
      fromName: quote.fullName,
      subject,
      bodyHtml,
      bodyText: `Customer accepted quote #${ref}. Total: ${currency} ${totalFormatted}. Log in to Admin to create live shipment.`,
      type: 'quote_accepted',
      quoteRef: ref,
    });
  },

  /**
   * Dispatches formal Booking Confirmation & Acceptance receipt to the customer
   */
  sendQuoteAcceptedConfirmationToCustomer(quote: QuoteRequest): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const currency = quote.pricing?.currency || 'USD';
    const totalFormatted = (quote.pricing?.totalAmount || quote.estimatedCostUsd || 0).toLocaleString();
    const subject = `Booking Confirmed: Quote (Ref: #${ref}) Accepted - ${company.tradeName}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #10b981;">
          <div style="font-size: 11px; font-family: monospace; color: #10b981; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Booking Confirmation
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Rate Agreement Confirmed
          </h1>
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px;">
            Reference ID: #${ref}
          </div>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Dear <strong>${quote.fullName}</strong>,
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            Thank you for confirming your rate proposal for the <strong>${quote.service}</strong> consignment from <strong>${quote.originCity}</strong> to <strong>${quote.destCity}</strong>. Your freight booking is confirmed.
          </p>

          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin: 18px 0; font-size: 13px; color: #065f46;">
            <div><strong>Agreed Total:</strong> ${currency} ${totalFormatted}</div>
            <div style="margin-top: 4px;"><strong>Signatory:</strong> ${quote.acceptedByName || quote.fullName}</div>
            <div style="margin-top: 4px;"><strong>Date:</strong> ${quote.acceptedAt || new Date().toISOString()}</div>
          </div>

          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            Our logistics team will coordinate cargo pickup and issue the official Waybill and live tracking details shortly.
          </p>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          <div>${company.companyName} • Operations Desk: ${company.primaryPhone}</div>
        </div>
      </div>
    `;

    const bodyText = `
Booking Confirmed - Quote #${ref} Accepted
------------------------------------------------------------
Thank you ${quote.fullName}. Your rate agreement of ${currency} ${totalFormatted} is confirmed.
Our operations desk is preparing cargo dispatch and will issue tracking details shortly.
------------------------------------------------------------
${company.companyName}
    `.trim();

    return this.logEmail({
      recipientEmail: quote.email,
      recipientName: quote.fullName,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Operations`,
      subject,
      bodyHtml,
      bodyText,
      type: 'quote_accepted_receipt',
      quoteRef: ref,
    });
  },

  /**
   * Notifies administrator operations when a customer declines a quote
   */
  sendQuoteDeclinedNotificationToAdmin(quote: QuoteRequest, reason?: string): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const adminEmail = company.primaryEmail || 'gillesawo6@gmail.com';

    const subject = `Quote Declined (Ref: #${ref}) by ${quote.fullName}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; background: #0B1528; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #f43f5e; margin-top: 0; font-size: 18px;">Quote Declined #${ref}</h2>
        <p><strong>Customer:</strong> ${quote.fullName} (${quote.companyName || 'N/A'})</p>
        <p><strong>Route:</strong> ${quote.originCity} to ${quote.destCity}</p>
        <p><strong>Reason provided:</strong> ${reason || quote.declinedReason || 'No specific reason given'}</p>
      </div>
    `;

    return this.logEmail({
      recipientEmail: adminEmail,
      recipientName: 'NEXORA Operations',
      fromEmail: quote.email,
      fromName: quote.fullName,
      subject,
      bodyHtml,
      bodyText: `Quote #${ref} was declined by ${quote.fullName}. Reason: ${reason || 'N/A'}.`,
      type: 'quote_declined',
      quoteRef: ref,
    });
  },

  /**
   * Courteous feedback acknowledgment to customer when they decline a proposal
   */
  sendQuoteDeclinedConfirmationToCustomer(quote: QuoteRequest): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const ref = quote.referenceNumber || quote.id.toUpperCase();
    const subject = `Update Regarding Quote (Ref: #${ref}) - ${company.tradeName}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #64748b;">
          <div style="font-size: 11px; font-family: monospace; color: #94a3b8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Client Services
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Feedback Recorded
          </h1>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Dear <strong>${quote.fullName}</strong>,
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            We have recorded your decision regarding proposal <strong>#${ref}</strong>. We appreciate your feedback and hope to assist you with future freight requirements.
          </p>
          <p style="font-size: 13px; color: #64748b; line-height: 1.5;">
            If your cargo schedule or budget parameters change, feel free to reply directly to this email or request an updated quote anytime.
          </p>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          <div>${company.companyName} • ${company.primaryEmail}</div>
        </div>
      </div>
    `;

    const bodyText = `
Update Regarding Quote #${ref} - ${company.companyName}
Thank you for your feedback. We look forward to working with you on future shipments.
    `.trim();

    return this.logEmail({
      recipientEmail: quote.email,
      recipientName: quote.fullName,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Support`,
      subject,
      bodyHtml,
      bodyText,
      type: 'quote_declined_receipt',
      quoteRef: ref,
    });
  },

  // =========================================================================
  // 3. LIVE SHIPMENT BOOKING & TRACKING NOTIFICATIONS
  // =========================================================================

  /**
   * Dispatches Official Consignment Waybill & Delivery Notice to the Receiver (Consignee)
   */
  sendShipmentCreatedToReceiver(shipment: Shipment, customRemarks?: string): EmailMessageRecord | null {
    const recipientEmail = shipment.receiver?.email || shipment.customerEmail;
    if (!recipientEmail) return null;

    const company = storageService.getCompanyInfo();
    const receiverName = shipment.receiver?.name || shipment.customerName || 'Valued Consignee';
    const shipperName = shipment.shipper?.name || shipment.customerCompany || 'Authorized Consignor';
    const trackingUrl = this.getTrackingCustomerUrl(shipment.trackingNumber);
    const subject = `Inbound Consignment Notice (Waybill: ${shipment.trackingNumber}) - ${company.tradeName}`;

    const totalWeight = shipment.totals?.actualWeight || shipment.weightKg || 'N/A';
    const totalPieces = shipment.quantity || shipment.packages?.length || shipment.pieces || 1;
    const commodityDesc = shipment.product || shipment.cargoDescription || 'Commercial Freight Cargo';
    const carrierName = shipment.carrier || 'NEXORA Carrier';
    const vesselOrFlight = shipment.vesselOrFlightNumber ? ` (${shipment.vesselOrFlightNumber})` : '';
    const etaDate = shipment.dates?.expectedDeliveryDate || shipment.estimatedDelivery || 'In Transit Schedule';
    const etaTime = shipment.dates?.pickupTime || '';

    const receiverFullAddress = [
      shipment.receiver?.address,
      shipment.receiver?.city || shipment.destination.city,
      shipment.receiver?.postalCode,
      shipment.receiver?.country || shipment.destination.country
    ].filter(Boolean).join(', ');

    const shipperLocation = [
      shipment.shipper?.address || shipment.origin.facility,
      shipment.shipper?.city || shipment.origin.city,
      shipment.shipper?.country || shipment.origin.country
    ].filter(Boolean).join(', ');

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <!-- Header -->
        <div style="background: #0B1528; padding: 28px 30px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase; font-weight: 700;">
            ${company.tradeName} Inbound Consignment Notice
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 22px; font-weight: 700; color: #ffffff;">
            Shipment In Transit
          </h1>
          <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">
            Delivery notification and manifest for <strong>${receiverName}</strong>
          </p>
        </div>

        <!-- Shipment ID Badge Box -->
        <div style="background: #f1f5f9; padding: 18px 28px; border-bottom: 1px solid #e2e8f0; text-align: center;">
          <div style="font-size: 11px; font-family: monospace; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px;">
            Waybill / Tracking Number
          </div>
          <div style="font-family: monospace; font-size: 24px; font-weight: 800; color: #0066FF;">
            ${shipment.trackingNumber}
          </div>
        </div>

        <!-- Main Body -->
        <div style="padding: 28px;">
          <p style="font-size: 14px; line-height: 1.6; color: #1e293b; margin-top: 0;">
            Hello <strong>${receiverName}</strong>,
          </p>
          <p style="font-size: 14px; line-height: 1.6; color: #334155;">
            This email is to notify you that <strong>${shipperName}</strong> has initiated a consignment scheduled for delivery to your designated address. Real-time status updates are now active.
          </p>

          <!-- Corridor Transit Details -->
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 20px 0;">
            <div style="font-size: 11px; font-family: monospace; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 12px;">
              Route Details:
            </div>
            
            <div style="display: grid; grid-template-columns: 1fr; gap: 12px; font-size: 13px;">
              <div style="border-left: 3px solid #0066FF; padding-left: 10px;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Origin:</div>
                <div style="font-weight: 700; color: #0f172a;">${shipment.origin.city}, ${shipment.origin.country}</div>
                <div style="font-size: 12px; color: #475569;">${shipperLocation}</div>
              </div>

              <div style="border-left: 3px solid #10b981; padding-left: 10px;">
                <div style="font-size: 11px; color: #64748b; text-transform: uppercase; font-weight: 600;">Destination:</div>
                <div style="font-weight: 700; color: #0f172a;">${shipment.destination.city}, ${shipment.destination.country}</div>
                <div style="font-size: 12px; color: #475569;">${receiverFullAddress || shipment.destination.address}</div>
              </div>
            </div>
          </div>

          <!-- Shipment Specification Table -->
          <div style="margin: 20px 0;">
            <table style="width: 100%; border-collapse: collapse; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 13px;">
              <tbody>
                <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
                  <td style="padding: 9px 12px; color: #64748b; font-weight: 600; width: 40%;">Cargo:</td>
                  <td style="padding: 9px 12px; color: #0f172a; font-weight: 600;">${commodityDesc}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 12px; color: #64748b; font-weight: 600;">Packages:</td>
                  <td style="padding: 9px 12px; color: #0f172a;">${totalPieces} Package(s) (${shipment.packageType || 'Standard'})</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9; background: #f8fafc;">
                  <td style="padding: 9px 12px; color: #64748b; font-weight: 600;">Weight:</td>
                  <td style="padding: 9px 12px; color: #0f172a; font-weight: 600;">${totalWeight} ${shipment.weightUnit || 'kg'}</td>
                </tr>
                <tr style="border-bottom: 1px solid #f1f5f9;">
                  <td style="padding: 9px 12px; color: #64748b; font-weight: 600;">Carrier:</td>
                  <td style="padding: 9px 12px; color: #0f172a;">${carrierName}${vesselOrFlight} (${shipment.serviceLevel || shipment.transportMode})</td>
                </tr>
                <tr style="background: #ecfdf5;">
                  <td style="padding: 10px 12px; color: #065f46; font-weight: 700;">Estimated Delivery:</td>
                  <td style="padding: 10px 12px; color: #059669; font-weight: 700;">${etaDate} ${etaTime}</td>
                </tr>
              </tbody>
            </table>
          </div>

          ${customRemarks || shipment.comments ? `
          <div style="background: #fffbeb; border-left: 3px solid #f59e0b; padding: 14px; margin: 18px 0; font-size: 13px; color: #92400e;">
            <strong>Operational Notes:</strong><br />
            ${customRemarks || shipment.comments}
          </div>
          ` : ''}

          <!-- Live Tracking Call To Action -->
          <div style="background: #f0f7ff; border: 1px solid #c7dfff; border-radius: 10px; padding: 20px; text-align: center; margin: 24px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 12px 30px; border-radius: 6px; font-weight: 700; font-size: 14px; text-decoration: none;">
              Track Shipment Online
            </a>
            <div style="margin-top: 10px; font-size: 12px; color: #64748b;">
              Tracking Link: <a href="${trackingUrl}" style="color: #0066FF;">${trackingUrl}</a>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 18px 28px; font-size: 11px; color: #94a3b8; text-align: center; line-height: 1.5;">
          <div>${company.companyName} • Operations Support: ${company.primaryPhone} | ${company.supportEmail || company.primaryEmail}</div>
        </div>
      </div>
    `;

    const bodyText = `
${company.companyName} - Inbound Consignment Notice
------------------------------------------------------------
Dear ${receiverName},

A shipment has been dispatched to your delivery address.

Waybill Number: ${shipment.trackingNumber}
Origin: ${shipperName} (${shipment.origin.city}, ${shipment.origin.country})
Destination: ${receiverName} (${receiverFullAddress || shipment.destination.city})
Cargo: ${commodityDesc}
Weight: ${totalWeight} ${shipment.weightUnit || 'kg'}
Estimated Delivery: ${etaDate} ${etaTime}

Track online: ${trackingUrl}

${company.companyName} Operations
    `.trim();

    return this.logEmail({
      recipientEmail,
      recipientName: receiverName,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Operations`,
      subject,
      bodyHtml,
      bodyText,
      type: 'shipment_created_to_customer',
      trackingNumber: shipment.trackingNumber,
    });
  },

  /**
   * Dispatches Official Consignment Waybill & Live Tracking link to the Customer
   */
  sendShipmentCreatedToCustomer(shipment: Shipment): EmailMessageRecord | null {
    return this.sendShipmentCreatedToReceiver(shipment);
  },

  /**
   * Alerts the Company Operations Desk when a new shipment is booked
   */
  sendShipmentCreatedToCompany(shipment: Shipment): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const adminEmail = company.primaryEmail || 'gillesawo6@gmail.com';
    const subject = `New Shipment Created (Ref: #${shipment.trackingNumber}) - ${shipment.origin.city} to ${shipment.destination.city}`;

    const shipperName = shipment.shipper?.name || shipment.customerName || 'Shipper';
    const receiverName = shipment.receiver?.name || 'Receiver';

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 24px; background: #0B1528; color: #ffffff; border-radius: 10px;">
        <h2 style="color: #38bdf8; margin-top: 0; font-size: 18px;">New Shipment Registered #${shipment.trackingNumber}</h2>
        <p><strong>Shipper:</strong> ${shipperName} (${shipment.origin.city}, ${shipment.origin.country})</p>
        <p><strong>Consignee:</strong> ${receiverName} (${shipment.destination.city}, ${shipment.destination.country})</p>
        <p><strong>Service:</strong> ${shipment.transportMode || shipment.serviceLevel || 'Standard'} | <strong>Status:</strong> ${shipment.status}</p>
        <p><strong>Carrier:</strong> ${shipment.carrier || 'NEXORA Network'}</p>
        <div style="margin-top: 16px;">
          <a href="${typeof window !== 'undefined' ? window.location.origin : ''}/admin/shipments" style="background: #0066FF; color: #ffffff; padding: 8px 16px; text-decoration: none; border-radius: 6px; display: inline-block;">
            Open Shipment Desk
          </a>
        </div>
      </div>
    `;

    return this.logEmail({
      recipientEmail: adminEmail,
      recipientName: 'NEXORA Operations',
      fromEmail: shipment.shipper?.email || company.primaryEmail || 'gillesawo6@gmail.com',
      fromName: shipperName,
      subject,
      bodyHtml,
      bodyText: `New Shipment #${shipment.trackingNumber} created from ${shipment.origin.city} to ${shipment.destination.city}.`,
      type: 'shipment_created_to_company',
      trackingNumber: shipment.trackingNumber,
    });
  },

  /**
   * Dispatches Milestone Status Update email to Customer
   */
  sendShipmentStatusUpdateToCustomer(shipment: Shipment, event: TrackingEvent): EmailMessageRecord | null {
    const recipientEmail = shipment.shipper?.email || shipment.receiver?.email || shipment.customerEmail;
    if (!recipientEmail) return null;

    const company = storageService.getCompanyInfo();
    const recipientName = shipment.shipper?.name || shipment.receiver?.name || shipment.customerName || 'Valued Client';
    const trackingUrl = this.getTrackingCustomerUrl(shipment.trackingNumber);
    const subject = `Shipment Update (${shipment.status}): #${shipment.trackingNumber} at ${event.location}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Tracking Update
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Status: ${shipment.status}
          </h1>
          <div style="font-size: 12px; color: #94a3b8; font-family: monospace; margin-top: 4px;">
            Tracking ID: #${shipment.trackingNumber}
          </div>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Hello <strong>${recipientName}</strong>,
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            A new tracking update has been recorded for your shipment.
          </p>

          <div style="background: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px; margin: 18px 0; font-size: 13px; color: #1e293b;">
            <div><strong>Location:</strong> ${event.location}</div>
            <div style="margin-top: 4px;"><strong>Time:</strong> ${event.date} ${event.time}</div>
            <div style="margin-top: 4px;"><strong>Update:</strong> ${event.description || event.remarks || 'Check-in scan'}</div>
            <div style="margin-top: 4px;"><strong>Progress:</strong> ${shipment.progressPercent || 0}%</div>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <a href="${trackingUrl}" style="display: inline-block; background: #0066FF; color: #ffffff; padding: 10px 24px; border-radius: 6px; font-weight: 700; font-size: 13px; text-decoration: none;">
              View Live Tracking
            </a>
          </div>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          ${company.companyName} • Support Hotline: ${company.primaryPhone}
        </div>
      </div>
    `;

    const bodyText = `
Status Update on Waybill #${shipment.trackingNumber}: ${shipment.status}
Location: ${event.location} (${event.date} ${event.time})
Details: ${event.description || 'Milestone check-in'}

Track live: ${trackingUrl}
    `.trim();

    return this.logEmail({
      recipientEmail,
      recipientName,
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Operations`,
      subject,
      bodyHtml,
      bodyText,
      type: 'shipment_status_update',
      trackingNumber: shipment.trackingNumber,
    });
  },

  // =========================================================================
  // 4. NEWSLETTER & TRADE INTELLIGENCE
  // =========================================================================

  /**
   * Dispatches Welcome email to new newsletter subscriber
   */
  sendNewsletterWelcomeToCustomer(subscriberEmail: string): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const subject = `Welcome to ${company.tradeName} Trade Intelligence`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #0B1528; padding: 24px 28px; color: #ffffff; border-bottom: 3px solid #0066FF;">
          <div style="font-size: 11px; font-family: monospace; color: #38bdf8; letter-spacing: 1.5px; text-transform: uppercase;">
            ${company.tradeName} Market Intelligence
          </div>
          <h1 style="margin: 6px 0 0 0; font-size: 20px; font-weight: 700; color: #ffffff;">
            Subscription Confirmed
          </h1>
        </div>

        <div style="padding: 28px;">
          <p style="font-size: 14px; color: #334155; line-height: 1.6; margin-top: 0;">
            Thank you for subscribing with <strong>${subscriberEmail}</strong>.
          </p>
          <p style="font-size: 14px; color: #334155; line-height: 1.6;">
            You will receive our regular market updates covering global freight trends, capacity reports, and customs regulatory news.
          </p>
        </div>

        <div style="background: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 28px; font-size: 11px; color: #94a3b8; text-align: center;">
          ${company.companyName} • ${company.website}
        </div>
      </div>
    `;

    const bodyText = `
Welcome to ${company.tradeName} Trade Intelligence.
Your subscription for ${subscriberEmail} is confirmed.
    `.trim();

    return this.logEmail({
      recipientEmail: subscriberEmail,
      recipientName: 'Subscriber',
      fromEmail: company.primaryEmail,
      fromName: `${company.tradeName || company.companyName} Insights`,
      subject,
      bodyHtml,
      bodyText,
      type: 'newsletter_welcome',
    });
  },

  /**
   * Alerts the Company Marketing Desk of a new subscriber
   */
  sendNewsletterAlertToCompany(subscriberEmail: string): EmailMessageRecord {
    const company = storageService.getCompanyInfo();
    const subject = `New Newsletter Subscriber: ${subscriberEmail}`;

    const bodyHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; padding: 20px; background: #0B1528; color: #ffffff; border-radius: 8px;">
        <h3 style="color: #38bdf8; margin-top: 0; font-size: 16px;">New Newsletter Subscriber</h3>
        <p><strong>Email:</strong> ${subscriberEmail}</p>
        <p><strong>Date:</strong> ${new Date().toISOString()}</p>
      </div>
    `;

    return this.logEmail({
      recipientEmail: company.primaryEmail,
      recipientName: `${company.companyName} Desk`,
      fromEmail: subscriberEmail,
      fromName: 'New Subscriber',
      subject,
      bodyHtml,
      bodyText: `New subscriber: ${subscriberEmail}`,
      type: 'newsletter_alert_to_company',
    });
  },
};
