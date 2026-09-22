import nodemailer from 'nodemailer';
import type { SendMailOptions } from 'nodemailer';
import { google } from 'googleapis';
import { EmailDispatchError, EmailDiagnosticStage, EmailProviderAdapter, ValidatedEmailRequest } from '../types';
import { maskEmail } from '../validation';

/**
 * Builds an RFC 2822 standard MIME message buffer using Nodemailer's standard streamTransport.
 * Generates properly structured MIME boundaries, headers, UTF-8 encoded words, and body parts.
 * 100% compatible with Node.js ESM and Vercel Serverless runtime without subpath directory imports.
 */
async function buildMimeMessage(mailOptions: SendMailOptions): Promise<Buffer> {
  const transporter = nodemailer.createTransport({
    streamTransport: true,
    buffer: true,
  });
  const info = await transporter.sendMail(mailOptions);
  return info.message as Buffer;
}

export class GmailOAuthProvider implements EmailProviderAdapter {
  name = 'gmail_oauth_api';

  getCredentials() {
    const clientId = (process.env.GOOGLE_CLIENT_ID || process.env.GMAIL_CLIENT_ID || '').trim();
    const clientSecret = (process.env.GOOGLE_CLIENT_SECRET || process.env.GMAIL_CLIENT_SECRET || '').trim();
    const refreshToken = (process.env.GOOGLE_REFRESH_TOKEN || process.env.GMAIL_REFRESH_TOKEN || '').trim();
    const redirectUri = (
      process.env.GOOGLE_REDIRECT_URI ||
      process.env.GMAIL_REDIRECT_URI ||
      'https://developers.google.com/oauthplayground'
    ).trim();

    // Sender email used to authenticate and set From: header (NEVER used as the recipient!)
    const senderEmail = (
      process.env.GOOGLE_SENDER_EMAIL ||
      process.env.GMAIL_SENDER_EMAIL ||
      process.env.GMAIL_USER ||
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      'gillesawo6@gmail.com'
    ).trim();

    return { clientId, clientSecret, refreshToken, redirectUri, senderEmail };
  }

  isConfigured(): boolean {
    const { clientId, clientSecret, refreshToken } = this.getCredentials();
    return Boolean(clientId && clientSecret && refreshToken);
  }

  async send(req: ValidatedEmailRequest): Promise<{ success: boolean; messageId: string }> {
    const { clientId, clientSecret, refreshToken, redirectUri, senderEmail } = this.getCredentials();

    if (!clientId || !clientSecret || !refreshToken) {
      throw new EmailDispatchError(
        'configuration',
        503,
        'Email service configuration is missing on the server. Google OAuth credentials are not configured.',
        'Missing GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, or GOOGLE_REFRESH_TOKEN.',
        this.name
      );
    }

    // 1. Stage: message_construction
    let base64UrlRaw: string;
    try {
      console.log(`[EMAIL API] [STAGE: message_construction] Compiling RFC 2822 MIME message for ${maskEmail(req.to)}...`);

      const mailOptions: SendMailOptions = {
        from: `"${req.fromName}" <${senderEmail}>`,
        to: req.toName ? `"${req.toName}" <${req.to}>` : req.to,
        replyTo: req.replyTo || senderEmail,
        subject: req.subject,
        text: req.text || undefined,
        html: req.html || (req.text ? `<p>${req.text}</p>` : undefined),
        headers: {
          'X-Priority': '3',
          'X-MSMail-Priority': 'Normal',
          'Importance': 'Normal',
          'X-Mailer': 'NEXORA Global Logistics Automated Mailer',
          'X-Auto-Response-Suppress': 'OOF, AutoReply',
        },
      };

      const rawMimeBuffer = await buildMimeMessage(mailOptions);
      base64UrlRaw = rawMimeBuffer.toString('base64url');
      console.log(`[EMAIL API] [STAGE: message_construction] MIME message generated successfully (${rawMimeBuffer.length} bytes, base64url ${base64UrlRaw.length} chars).`);
    } catch (err: any) {
      console.error('[EMAIL API] [STAGE: message_construction] MIME compilation failed:', err?.message || err);
      throw new EmailDispatchError(
        'message_construction',
        500,
        'Failed to construct email message format.',
        err?.message,
        this.name
      );
    }

    // 2. Stage: authentication & provider_send
    try {
      console.log(`[EMAIL API] [STAGE: authentication] Initializing Google OAuth2 client (client_id: ${clientId.substring(0, 8)}...)...`);
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
      oauth2Client.setCredentials({ refresh_token: refreshToken });

      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      console.log(`[EMAIL API] [STAGE: provider_send] Transmitting message via Gmail API (users.messages.send) to ${maskEmail(req.to)}...`);
      const gmailResponse = await gmail.users.messages.send({
        userId: 'me',
        requestBody: {
          raw: base64UrlRaw,
        },
      });

      if (gmailResponse.data && gmailResponse.data.id) {
        console.log(`[EMAIL API] [STAGE: completed] Email sent via Gmail API! Message ID: ${gmailResponse.data.id}`);
        return {
          success: true,
          messageId: gmailResponse.data.id,
        };
      }

      throw new Error('Gmail API accepted the request but returned no message ID.');
    } catch (err: any) {
      const errorMsg = err?.message || String(err);
      const isAuthError = /invalid_grant|invalid_client|unauthorized|unauthenticated|insufficient.*scope|token|401|403/i.test(errorMsg);
      const stage: EmailDiagnosticStage = isAuthError ? 'authentication' : 'provider_send';

      let clientMessage = 'Email provider rejected the message transmission.';
      if (/invalid_grant/i.test(errorMsg)) {
        clientMessage = 'Email provider authentication failed. OAuth refresh token is invalid, revoked, or expired.';
      } else if (/invalid_client|unauthorized_client/i.test(errorMsg)) {
        clientMessage = 'Email provider authentication failed. Google OAuth client ID or secret was rejected.';
      } else if (/insufficient.*scope|scope/i.test(errorMsg)) {
        clientMessage = 'Email provider authorization failed. Missing required Gmail API send scope.';
      } else if (isAuthError) {
        clientMessage = 'Email provider authentication failed.';
      }

      console.error(`[EMAIL API] [STAGE: ${stage}] Gmail OAuth Provider failure:`, errorMsg);

      throw new EmailDispatchError(
        stage,
        isAuthError ? 502 : 502,
        clientMessage,
        errorMsg,
        this.name
      );
    }
  }
}
