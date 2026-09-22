/**
 * NEXORA Logistics Production Email System - Type Definitions
 * Clearly separates sender configuration from recipient request data.
 */

export interface EmailPayload {
  to?: string;
  recipientEmail?: string;
  toName?: string;
  recipientName?: string;
  subject?: string;
  html?: string;
  text?: string;
  replyTo?: string;
  fromName?: string;
  from?: string;
  fromEmail?: string;
  companyEmail?: string;
  type?: string;
  quoteRef?: string;
  trackingNumber?: string;
}

export interface ValidatedEmailRequest {
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  fromName: string;
  type?: string;
  quoteRef?: string;
  trackingNumber?: string;
}

export interface EmailDispatchResult {
  success: boolean;
  delivered: boolean;
  provider: 'gmail_oauth_api' | 'gmail_smtp' | 'gmail_smtp_starttls' | string;
  messageId: string;
  recipient: string;
  subject: string;
}

export interface EmailValidationResult {
  valid: boolean;
  error?: string;
  data?: ValidatedEmailRequest;
}

export interface EmailProviderAdapter {
  name: string;
  isConfigured(): boolean;
  send(req: ValidatedEmailRequest): Promise<{ success: boolean; messageId: string }>;
}

export type EmailDiagnosticStage =
  | 'request_parsing'
  | 'request_validation'
  | 'configuration'
  | 'authentication'
  | 'message_construction'
  | 'provider_send'
  | 'completed';

export class EmailDispatchError extends Error {
  readonly isEmailDispatchError = true;
  stage: EmailDiagnosticStage;
  statusCode: number;
  clientMessage: string;
  provider?: string;

  constructor(
    stage: EmailDiagnosticStage,
    statusCode: number,
    clientMessage: string,
    internalDetails?: string,
    provider?: string
  ) {
    super(internalDetails || clientMessage);
    this.name = 'EmailDispatchError';
    this.stage = stage;
    this.statusCode = statusCode;
    this.clientMessage = clientMessage;
    this.provider = provider;
  }
}

