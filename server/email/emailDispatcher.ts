import { EmailDispatchError, EmailDispatchResult, ValidatedEmailRequest } from './types';
import { GmailOAuthProvider } from './providers/gmailOAuthProvider';
import { SmtpProvider } from './providers/smtpProvider';
import { maskEmail } from './validation';

const gmailOAuthProvider = new GmailOAuthProvider();
const smtpProvider = new SmtpProvider();

/**
 * Enterprise Email Dispatcher with Stage Tracking & Safe Provider Failover
 *
 * Routing Rules:
 * 1. The recipient is ALWAYS and ONLY `req.to`.
 * 2. Under NO circumstance is an email redirected to a hardcoded address or the sender.
 * 3. Returns a confirmed dispatch result or throws an explicit EmailDispatchError with safe client message.
 */
export async function dispatchEmail(req: ValidatedEmailRequest): Promise<EmailDispatchResult> {
  console.log('[EMAIL API] Starting email dispatch');
  smtpProvider.logDiagnostics();
  console.log(`[EMAIL API] [STAGE: request_validation] Recipient verified: ${maskEmail(req.to)} | Subject: "${req.subject}" | Type: "${req.type || 'general'}"`);

  const hasOAuthConfig = gmailOAuthProvider.isConfigured();
  const hasSmtpConfig = smtpProvider.isConfigured();

  // Stage: configuration
  if (!hasOAuthConfig && !hasSmtpConfig) {
    console.error(
      '[EMAIL API] [STAGE: configuration] Error: No email provider configured on server. ' +
      'Missing SMTP_USER / SMTP_PASS in Vercel environment variables (check Vercel Project Settings > Environment Variables > Production).'
    );
    throw new EmailDispatchError(
      'configuration',
      503,
      'Email service configuration is missing on the server. Required provider credentials (Google OAuth or SMTP) are not configured in environment settings.',
      'Neither Gmail OAuth nor SMTP credentials found in server environment.'
    );
  }

  let lastError: EmailDispatchError | Error | null = null;

  // 1. Primary Attempt: Gmail API via Google OAuth2
  if (hasOAuthConfig) {
    try {
      console.log('[EMAIL API] [STAGE: authentication] Attempting dispatch via primary provider (Gmail OAuth API)...');
      const result = await gmailOAuthProvider.send(req);
      console.log(`[EMAIL API] [STAGE: completed] Dispatch confirmed delivered via Gmail API! Message ID: ${result.messageId}`);
      return {
        success: true,
        delivered: true,
        provider: gmailOAuthProvider.name,
        messageId: result.messageId,
        recipient: req.to,
        subject: req.subject,
      };
    } catch (err: any) {
      console.warn(`[EMAIL API] Primary provider (Gmail OAuth) failed: ${err?.message || err}`);
      lastError = err;

      // If SMTP is not available, fail immediately with the specific error
      if (!hasSmtpConfig) {
        if (err instanceof EmailDispatchError) {
          throw err;
        }
        throw new EmailDispatchError(
          'provider_send',
          502,
          'Email provider failed to deliver the message.',
          err?.message || String(err),
          gmailOAuthProvider.name
        );
      }
      console.log('[EMAIL API] Attempting secondary failover to SMTP Provider...');
    }
  }

  // 2. Secondary Attempt: SMTP Transport
  if (hasSmtpConfig) {
    try {
      console.log('[EMAIL API] [STAGE: authentication] Attempting dispatch via SMTP Provider...');
      const result = await smtpProvider.send(req);
      console.log(`[EMAIL API] [STAGE: completed] Dispatch confirmed delivered via SMTP! Message ID: ${result.messageId}`);
      return {
        success: true,
        delivered: true,
        provider: smtpProvider.name,
        messageId: result.messageId,
        recipient: req.to,
        subject: req.subject,
      };
    } catch (err: any) {
      console.error(`[EMAIL API] Secondary provider (SMTP) failed: ${err?.message || err}`);
      lastError = err;

      if (err instanceof EmailDispatchError) {
        throw err;
      }
      throw new EmailDispatchError(
        'provider_send',
        502,
        'Email provider failed to deliver the message.',
        err?.message || String(err),
        smtpProvider.name
      );
    }
  }

  // If we reached here with an error
  if (lastError instanceof EmailDispatchError) {
    throw lastError;
  }

  throw new EmailDispatchError(
    'provider_send',
    502,
    'Email provider failed to deliver the message.',
    lastError ? (lastError as Error).message : 'Unknown provider failure'
  );
}
