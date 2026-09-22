import nodemailer from 'nodemailer';
import { EmailDiagnosticStage, EmailDispatchError, EmailProviderAdapter, ValidatedEmailRequest } from '../types';
import { maskEmail } from '../validation';

export class SmtpProvider implements EmailProviderAdapter {
  name = 'gmail_smtp';

  getCredentials() {
    const smtpHost = (process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
    const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 465;
    const smtpUser = (
      process.env.SMTP_USER ||
      process.env.EMAIL_USER ||
      process.env.GMAIL_USER ||
      process.env.GOOGLE_SENDER_EMAIL ||
      ''
    ).trim();

    const rawSmtpPass = (
      process.env.SMTP_PASS ||
      process.env.SMTP_PASSWORD ||
      process.env.GMAIL_APP_PASSWORD ||
      process.env.GMAIL_PASS ||
      process.env.EMAIL_PASS ||
      process.env.EMAIL_PASSWORD ||
      ''
    ).trim();

    // Remove whitespace/newlines (crucial for Google App Passwords formatted like 'abcd efgh ijkl mnop')
    const smtpPass = rawSmtpPass.replace(/\s+/g, '');

    const smtpFrom = (
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      process.env.GMAIL_SENDER_EMAIL ||
      smtpUser ||
      'gillesawo6@gmail.com'
    ).trim();

    return { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom };
  }

  isConfigured(): boolean {
    const { smtpUser, smtpPass } = this.getCredentials();
    return Boolean(smtpUser && smtpPass);
  }

  async send(req: ValidatedEmailRequest): Promise<{ success: boolean; messageId: string }> {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = this.getCredentials();

    if (!smtpUser || !smtpPass) {
      throw new EmailDispatchError(
        'configuration',
        503,
        'Email service configuration is missing on the server. SMTP credentials are not configured.',
        'Missing SMTP_USER or SMTP_PASS (or GMAIL_APP_PASSWORD).',
        this.name
      );
    }

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${req.fromName}" <${smtpFrom}>`,
      to: req.toName ? `"${req.toName}" <${req.to}>` : req.to,
      replyTo: req.replyTo || smtpFrom,
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

    console.log(`[EMAIL API] [STAGE: authentication] Initializing SMTP connection (${smtpHost}:${smtpPort}) for sender ${smtpUser}...`);

    // 1. Primary SSL Transport (Port 465 or designated port)
    try {
      const isGmail = smtpHost.includes('gmail');
      const transporter = nodemailer.createTransport({
        service: isGmail ? 'gmail' : undefined,
        host: isGmail ? undefined : smtpHost,
        port: smtpPort,
        secure: smtpPort === 465,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 10000,
        greetingTimeout: 10000,
      });

      console.log(`[EMAIL API] [STAGE: provider_send] Transmitting via SMTP to ${maskEmail(req.to)}...`);
      const info = await transporter.sendMail(mailOptions);
      console.log(`[EMAIL API] [STAGE: completed] Email sent via SMTP! Message ID: ${info.messageId}`);
      return {
        success: true,
        messageId: info.messageId || `smtp-${Date.now()}`,
      };
    } catch (primaryErr: any) {
      const primaryMsg = primaryErr?.message || String(primaryErr);
      console.warn(`[EMAIL API] [STAGE: provider_send] Primary SMTP transport failed (${primaryMsg}). Attempting STARTTLS port 587 fallback...`);

      // 2. STARTTLS Port 587 Fallback
      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: smtpHost.includes('gmail') ? 'smtp.gmail.com' : smtpHost,
          port: 587,
          secure: false,
          requireTLS: true,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 10000,
          greetingTimeout: 10000,
        });

        const retryInfo = await fallbackTransporter.sendMail(mailOptions);
        console.log(`[EMAIL API] [STAGE: completed] Email sent via SMTP (STARTTLS 587)! Message ID: ${retryInfo.messageId}`);
        return {
          success: true,
          messageId: retryInfo.messageId || `smtp-587-${Date.now()}`,
        };
      } catch (fallbackErr: any) {
        const errorMsg = fallbackErr?.message || String(fallbackErr);
        const isAuthError = /invalid.*login|username and password not accepted|eauth|535|badcredentials/i.test(errorMsg) ||
                            /invalid.*login|username and password not accepted|eauth|535|badcredentials/i.test(primaryMsg);
        const stage: EmailDiagnosticStage = isAuthError ? 'authentication' : 'provider_send';
        let clientMsg = isAuthError
          ? 'Email provider authentication failed. SMTP credentials or application password were rejected.'
          : 'Email provider rejected the message transmission.';

        if (isAuthError && smtpHost.includes('gmail') && smtpPass.length !== 16) {
          clientMsg = `Gmail App Password rejected: Google App Passwords must be exactly 16 letters (4 groups of 4 letters, e.g. "abcd efgh ijkl mnop"). The provided password has ${smtpPass.length} characters, so the 4th 4-letter group appears to be missing.`;
        }

        console.error(`[EMAIL API] [STAGE: ${stage}] SMTP Provider failure:`, errorMsg);

        throw new EmailDispatchError(
          stage,
          isAuthError ? 502 : 502,
          clientMsg,
          errorMsg,
          this.name
        );
      }
    }
  }
}
