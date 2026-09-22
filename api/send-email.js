import 'dotenv/config';
import nodemailer from 'nodemailer';

/**
 * RFC 5322 compliant email regex
 */
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

/**
 * CRLF and Header Injection Guard
 */
const HEADER_INJECTION_REGEX = /[\r\n]|%0d|%0a/i;

/**
 * Safely mask an email address for logging without leaking full PII
 */
function maskEmail(email) {
  if (!email || typeof email !== 'string') return 'unknown';
  const parts = email.split('@');
  if (parts.length !== 2) return '***';
  const [user, domain] = parts;
  const maskedUser = user.length <= 2 ? user[0] + '***' : user[0] + '***' + user[user.length - 1];
  return `${maskedUser}@${domain}`;
}

/**
 * Extracts and sanitizes SMTP configuration from process.env
 */
function getSmtpConfig() {
  const host = (process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com').trim();
  const port = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '465', 10);
  const user = (
    process.env.SMTP_USER ||
    process.env.EMAIL_USER ||
    process.env.GMAIL_USER ||
    process.env.GOOGLE_SENDER_EMAIL ||
    ''
  ).trim();

  const rawPass = (
    process.env.SMTP_PASS ||
    process.env.SMTP_PASSWORD ||
    process.env.GMAIL_APP_PASSWORD ||
    process.env.GMAIL_PASS ||
    process.env.EMAIL_PASS ||
    process.env.EMAIL_PASSWORD ||
    ''
  ).trim();

  // Strip leading and trailing quotes if entered with quotes in Vercel dashboard
  const unquotedPass = rawPass.replace(/^["']|["']$/g, '').trim();
  // Strip internal whitespace (Google App Password 4x4 blocks e.g. "ussx vruu bxzo vrvu" -> "ussxvruubxzovrvu")
  const pass = unquotedPass.replace(/\s+/g, '');

  const from = (
    process.env.SMTP_FROM ||
    process.env.EMAIL_FROM ||
    process.env.GMAIL_SENDER_EMAIL ||
    user ||
    'gillesawo6@gmail.com'
  ).trim();

  return { host, port, user, pass, from, rawPassLength: rawPass.length };
}

/**
 * Logs presence status of required environment variables without ever logging secrets
 */
function logEnvironmentPresence(smtp) {
  console.log(`[EMAIL API] SMTP_HOST: ${smtp.host ? `present (${smtp.host})` : 'missing'}`);
  console.log(`[EMAIL API] SMTP_PORT: ${smtp.port ? `present (${smtp.port})` : 'missing'}`);
  console.log(`[EMAIL API] SMTP_USER: ${smtp.user ? `present (${maskEmail(smtp.user)})` : 'missing'}`);
  console.log(`[EMAIL API] SMTP_PASS: ${smtp.pass ? 'present' : 'missing'}`);
  if (smtp.pass) {
    console.log(`[EMAIL API] SMTP_PASS_LENGTH: ${smtp.pass.length}`);
  } else {
    console.warn('[EMAIL API] Missing SMTP_PASS! Configure SMTP_PASS in Vercel Project Settings > Environment Variables under the "Production" environment.');
  }
  console.log(`[EMAIL API] SMTP_FROM: ${smtp.from ? `present (${maskEmail(smtp.from)})` : 'missing'}`);
}

/**
 * Universal JSON response sender compatible with Vercel Serverless, Express, and raw Node.js
 */
function sendJsonResponse(res, statusCode, data) {
  try {
    res.statusCode = statusCode;
    if (typeof res.setHeader === 'function') {
      res.setHeader('Content-Type', 'application/json');
    }
    if (typeof res.status === 'function' && typeof res.json === 'function') {
      return res.status(statusCode).json(data);
    }
    if (typeof res.json === 'function') {
      return res.json(data);
    }
    return res.end(JSON.stringify(data));
  } catch (sendErr) {
    console.error('[EMAIL API] Failed to send JSON response:', sendErr);
    if (!res.writableEnded) {
      res.end(JSON.stringify(data));
    }
  }
}

/**
 * Universal Production Email API Handler (Vercel Serverless & Express / Node.js)
 */
export default async function handler(req, res) {
  console.log('[EMAIL API] Request received');
  console.log(`[EMAIL API] Method: ${req.method} | URL: ${req.url}`);

  // 1. Enforce POST method
  if (req.method !== 'POST') {
    if (typeof res.setHeader === 'function') {
      res.setHeader('Allow', ['POST']);
    }
    return sendJsonResponse(res, 405, {
      success: false,
      stage: 'request_validation',
      error: `Method ${req.method} Not Allowed. Only POST is accepted.`,
    });
  }

  // 2. Parse request payload
  let payload;
  try {
    if (typeof req.body === 'string') {
      payload = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object') {
      payload = req.body;
    } else if (req.body === undefined || req.body === null) {
      // In case Vercel Serverless Function receives a stream rather than pre-parsed body
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) {
        const raw = Buffer.concat(chunks).toString('utf-8');
        payload = JSON.parse(raw);
      } else {
        console.warn('[EMAIL API] Missing request body in POST request');
        return sendJsonResponse(res, 400, {
          success: false,
          stage: 'request_parsing',
          error: 'Missing request body. Expected a JSON object.',
        });
      }
    } else {
      return sendJsonResponse(res, 400, {
        success: false,
        stage: 'request_parsing',
        error: 'Missing request body. Expected a JSON object.',
      });
    }
  } catch (parseErr) {
    console.warn('[EMAIL API] Malformed JSON payload received:', parseErr?.message);
    return sendJsonResponse(res, 400, {
      success: false,
      stage: 'request_parsing',
      error: 'Malformed JSON payload in request body.',
    });
  }

  // 3. Validate request fields
  const rawRecipient = payload.to || payload.recipientEmail;
  if (!rawRecipient || typeof rawRecipient !== 'string' || rawRecipient.trim().length === 0) {
    return sendJsonResponse(res, 400, {
      success: false,
      stage: 'request_validation',
      error: 'Recipient email is required.',
    });
  }

  const cleanRecipient = rawRecipient.trim();
  if (HEADER_INJECTION_REGEX.test(cleanRecipient)) {
    return sendJsonResponse(res, 400, {
      success: false,
      stage: 'request_validation',
      error: 'Invalid recipient email: Newline or carriage return characters are strictly prohibited.',
    });
  }

  if (!EMAIL_REGEX.test(cleanRecipient)) {
    return sendJsonResponse(res, 400, {
      success: false,
      stage: 'request_validation',
      error: `Invalid recipient email format: "${cleanRecipient}".`,
    });
  }

  const subject = typeof payload.subject === 'string' ? payload.subject.trim() : '';
  if (!subject) {
    return sendJsonResponse(res, 400, {
      success: false,
      stage: 'request_validation',
      error: 'Missing required email "subject".',
    });
  }

  if (HEADER_INJECTION_REGEX.test(subject)) {
    return sendJsonResponse(res, 400, {
      success: false,
      stage: 'request_validation',
      error: 'Invalid subject line: Newline characters are not permitted.',
    });
  }

  console.log(`[EMAIL API] Recipient verified: ${maskEmail(cleanRecipient)} | Subject: "${subject}"`);

  // 4. Nodemailer Execution with Comprehensive Step Logging and Error Catching
  try {
    const smtp = getSmtpConfig();
    logEnvironmentPresence(smtp);

    if (!smtp.user || !smtp.pass) {
      console.error('[EMAIL API] Configuration error: Missing required SMTP credentials on server.');
      return sendJsonResponse(res, 503, {
        success: false,
        stage: 'configuration',
        error: 'Email service configuration is missing on the server. Required SMTP credentials (SMTP_USER / SMTP_PASS) are not configured in Vercel environment settings.',
      });
    }

    const fromName = payload.fromName || 'NEXORA Global Logistics';
    const mailOptions = {
      from: `"${fromName}" <${smtp.from}>`,
      to: payload.toName ? `"${payload.toName}" <${cleanRecipient}>` : cleanRecipient,
      replyTo: payload.replyTo || smtp.from,
      subject,
      text: payload.text || undefined,
      html: payload.html || (payload.text ? `<p>${payload.text}</p>` : undefined),
      headers: {
        'X-Priority': '3',
        'X-MSMail-Priority': 'Normal',
        'Importance': 'Normal',
        'X-Mailer': 'NEXORA Global Logistics Mailer',
        'X-Auto-Response-Suppress': 'OOF, AutoReply',
      },
    };

    const isGmailHost = smtp.host.includes('gmail');
    const effectiveHost = isGmailHost ? 'smtp.gmail.com' : smtp.host;
    const primarySecure = smtp.port === 465;

    console.log('[EMAIL API] Creating transporter');
    console.log(`[EMAIL API] Configuration: host=${effectiveHost}, port=${smtp.port}, secure=${primarySecure}, user=${maskEmail(smtp.user)}`);

    let messageId = null;
    let transportUsed = `smtp_port_${smtp.port}`;

    try {
      console.log('[EMAIL API] Attempting SMTP connection');
      const primaryTransporter = nodemailer.createTransport({
        host: effectiveHost,
        port: smtp.port,
        secure: primarySecure,
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 6000,
      });

      console.log('[EMAIL API] Sending email');
      const info = await primaryTransporter.sendMail(mailOptions);
      messageId = info.messageId || `smtp-${Date.now()}`;
      console.log(`[EMAIL API] Email sent successfully (Message ID: ${messageId})`);
    } catch (primaryErr) {
      const primaryMsg = primaryErr?.message || String(primaryErr);
      console.warn(`[EMAIL API] Primary SMTP transport failed on port ${smtp.port}: ${primaryMsg}`);

      // Dual fallback transport (Port 587 STARTTLS if 465 failed, or 465 SSL if 587 failed)
      const fallbackPort = smtp.port === 465 ? 587 : 465;
      const fallbackSecure = fallbackPort === 465;

      console.log(`[EMAIL API] Attempting fallback to SMTP port ${fallbackPort} (secure=${fallbackSecure})...`);

      const fallbackTransporter = nodemailer.createTransport({
        host: effectiveHost,
        port: fallbackPort,
        secure: fallbackSecure,
        requireTLS: !fallbackSecure,
        auth: {
          user: smtp.user,
          pass: smtp.pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
        connectionTimeout: 4000,
        greetingTimeout: 4000,
        socketTimeout: 6000,
      });

      console.log('[EMAIL API] Sending email via fallback transport...');
      const retryInfo = await fallbackTransporter.sendMail(mailOptions);
      messageId = retryInfo.messageId || `smtp-${fallbackPort}-${Date.now()}`;
      transportUsed = `smtp_fallback_port_${fallbackPort}`;
      console.log(`[EMAIL API] Email sent successfully via fallback transport (Message ID: ${messageId})`);
    }

    return sendJsonResponse(res, 200, {
      success: true,
      delivered: true,
      provider: transportUsed,
      messageId,
      recipient: cleanRecipient,
      subject,
    });
  } catch (err) {
    // Log detailed technical error stack to Vercel logs:
    console.error('[EMAIL API] Fatal error during Nodemailer execution:');
    console.error('[EMAIL API] Error Name:', err?.name);
    console.error('[EMAIL API] Error Code:', err?.code);
    console.error('[EMAIL API] Error Command:', err?.command);
    console.error('[EMAIL API] Error Response:', err?.response);
    console.error('[EMAIL API] Error ResponseCode:', err?.responseCode);
    console.error('[EMAIL API] Detailed technical error stack:', err?.stack || err?.message || err);

    const errorMsg = err?.message || String(err);
    const isAuthError = /invalid.*login|username and password not accepted|eauth|535|badcredentials/i.test(errorMsg);
    const isTimeout = /timeout|etimedout|esocket/i.test(errorMsg);

    if (isAuthError) {
      console.error('[EMAIL API] Diagnosis: SMTP authentication failed. Check SMTP_USER and SMTP_PASS (Google App Password) in Vercel Production Environment Variables.');
    } else if (isTimeout) {
      console.error('[EMAIL API] Diagnosis: Connection timeout. Network or port issue reaching mail server.');
    }

    let clientMessage = 'Email service temporarily unavailable. Please try again later.';
    let statusCode = 502;

    if (isAuthError) {
      clientMessage = 'Email service temporarily unavailable. Mail server credentials were rejected.';
    }

    // Return structured JSON error response to the client
    return sendJsonResponse(res, statusCode, {
      success: false,
      stage: isAuthError ? 'authentication' : 'provider_send',
      error: clientMessage,
      code: err?.code || 'EMAIL_DISPATCH_FAILED',
    });
  }
}
