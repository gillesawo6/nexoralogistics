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

    // Strip surrounding quotes if the user wrapped the variable in quotes in the Vercel dashboard
    const unquotedPass = rawSmtpPass.replace(/^["']|["']$/g, '').trim();

    // Remove whitespace/newlines (crucial for Google App Passwords formatted like 'abcd efgh ijkl mnop')
    const smtpPass = unquotedPass.replace(/\s+/g, '');

    const smtpFrom = (
      process.env.SMTP_FROM ||
      process.env.EMAIL_FROM ||
      process.env.GMAIL_SENDER_EMAIL ||
      smtpUser ||
      'gillesawo6@gmail.com'
    ).trim();

    return { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom };
  }

  logDiagnostics() {
    const { smtpHost, smtpPort, smtpUser, smtpPass } = this.getCredentials();
    console.log('[EMAIL API] Starting email dispatch diagnostics');
    console.log(`[EMAIL API] SMTP_HOST: ${smtpHost ? 'present (' + smtpHost + ')' : 'missing'}`);
    console.log(`[EMAIL API] SMTP_PORT: ${smtpPort ? 'present (' + smtpPort + ')' : 'missing'}`);
    console.log(`[EMAIL API] SMTP_USER: ${smtpUser ? 'present (' + maskEmail(smtpUser) + ')' : 'missing'}`);
    console.log(`[EMAIL API] SMTP_PASS: ${smtpPass ? 'present' : 'missing'}`);
    if (smtpPass) {
      console.log(`[EMAIL API] SMTP_PASS_LENGTH: ${smtpPass.length}`);
    } else {
      console.warn('[EMAIL API] Missing SMTP_PASS environment variable. Ensure SMTP_PASS is configured in Vercel Project Settings > Environment Variables under the "Production" environment.');
    }
  }

  isConfigured(): boolean {
    const { smtpUser, smtpPass } = this.getCredentials();
    return Boolean(smtpUser && smtpPass);
  }

  async send(req: ValidatedEmailRequest): Promise<{ success: boolean; messageId: string }> {
    const { smtpHost, smtpPort, smtpUser, smtpPass, smtpFrom } = this.getCredentials();

    if (!smtpUser || !smtpPass) {
      console.error('[EMAIL API] Missing SMTP credentials. Checked SMTP_USER and SMTP_PASS.');
      throw new EmailDispatchError(
        'configuration',
        503,
        'Email service temporarily unavailable. Server email credentials are not configured.',
        'Missing SMTP_USER or SMTP_PASS (or GMAIL_APP_PASSWORD) in server environment variables.',
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

    const isGmailHost = smtpHost.includes('gmail');
    const effectiveHost = isGmailHost ? 'smtp.gmail.com' : smtpHost;
    const primarySecure = smtpPort === 465;

    console.log('[EMAIL API] Creating SMTP transporter');
    console.log(`[EMAIL API] [STAGE: authentication] Initializing SMTP connection (${effectiveHost}:${smtpPort}, secure=${primarySecure}) for sender ${maskEmail(smtpUser)}...`);

    // 1. Primary Transport (Port 465 SSL or configured port)
    try {
      console.log('[EMAIL API] Sending email (primary transport)...');
      const transporter = nodemailer.createTransport({
        host: effectiveHost,
        port: smtpPort,
        secure: primarySecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 5000,
        greetingTimeout: 5000,
        socketTimeout: 8000,
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
      console.warn(`[EMAIL API] Primary SMTP transport failed (${primaryMsg}).`);

      // 2. Dual Fallback Transport (Port 587 STARTTLS if 465 failed, or 465 SSL if 587 failed)
      const fallbackPort = smtpPort === 465 ? 587 : 465;
      const fallbackSecure = fallbackPort === 465;

      console.log(`[EMAIL API] Attempting fallback to SMTP port ${fallbackPort} (secure=${fallbackSecure})...`);

      try {
        const fallbackTransporter = nodemailer.createTransport({
          host: effectiveHost,
          port: fallbackPort,
          secure: fallbackSecure,
          requireTLS: !fallbackSecure,
          auth: {
            user: smtpUser,
            pass: smtpPass,
          },
          tls: {
            rejectUnauthorized: false,
          },
          connectionTimeout: 5000,
          greetingTimeout: 5000,
          socketTimeout: 8000,
        });

        console.log(`[EMAIL API] Sending email via fallback port ${fallbackPort}...`);
        const retryInfo = await fallbackTransporter.sendMail(mailOptions);
        console.log(`[EMAIL API] [STAGE: completed] Email sent via fallback SMTP (${fallbackPort})! Message ID: ${retryInfo.messageId}`);
        return {
          success: true,
          messageId: retryInfo.messageId || `smtp-${fallbackPort}-${Date.now()}`,
        };
      } catch (fallbackErr: any) {
        const errorMsg = fallbackErr?.message || String(fallbackErr);
        const isAuthError =
          /invalid.*login|username and password not accepted|eauth|535|badcredentials/i.test(errorMsg) ||
          /invalid.*login|username and password not accepted|eauth|535|badcredentials/i.test(primaryMsg);
        const isTimeout =
          /timeout|etimedout|esocket/i.test(errorMsg) ||
          /timeout|etimedout|esocket/i.test(primaryMsg);

        if (isAuthError) {
          console.error('[EMAIL API] SMTP authentication failed');
        } else if (isTimeout) {
          console.error('[EMAIL API] Connection timeout');
        } else {
          console.error(`[EMAIL API] SMTP Provider failure: ${errorMsg}`);
        }

        const stage: EmailDiagnosticStage = isAuthError ? 'authentication' : 'provider_send';
        let clientMsg = isAuthError
          ? 'Email service temporarily unavailable. Mail server credentials were rejected.'
          : 'Email service temporarily unavailable. Message transmission failed.';

        if (isAuthError && isGmailHost && smtpPass.length !== 16) {
          clientMsg = `Gmail App Password rejected: Google App Passwords must be exactly 16 letters (e.g. "abcd efgh ijkl mnop"). Current length is ${smtpPass.length} characters.`;
        }

        console.error(`[EMAIL API] [STAGE: ${stage}] SMTP Final failure: ${errorMsg}`);

        throw new EmailDispatchError(
          stage,
          502,
          clientMsg,
          `Primary (${smtpPort}): ${primaryMsg} | Fallback (${fallbackPort}): ${errorMsg}`,
          this.name
        );
      }
    }
  }
}
