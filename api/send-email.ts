import 'dotenv/config';
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { validateEmailRequest } from '../server/email/validation';
import { dispatchEmail } from '../server/email/emailDispatcher';
import { EmailDispatchError } from '../server/email/types';

function isEmailDispatchError(err: any): err is EmailDispatchError {
  return (
    err instanceof EmailDispatchError ||
    (Boolean(err) && typeof err === 'object' && err.isEmailDispatchError === true) ||
    (Boolean(err) && typeof err === 'object' && typeof err.stage === 'string' && typeof err.statusCode === 'number')
  );
}

/**
 * Universal Production Email API Handler
 *
 * Compatible with:
 * - Vercel Serverless Functions (/api/send-email)
 * - Express.js backend (server.ts / Hostinger Node.js Web Apps / Cloud Run)
 * - Local development Vite/Node server
 *
 * CRITICAL ROUTING & SECURITY POLICY:
 * - Recipient is strictly derived from the request body ('to' or 'recipientEmail').
 * - Missing, empty, or invalid recipients are rejected with HTTP 400.
 * - Under NO circumstance is any email redirected to gillesaw06@gmail.com, the sender account,
 *   or any developer/fallback address.
 * - Secrets (OAuth tokens, client secrets, passwords) are NEVER leaked in API responses.
 * - Structured JSON errors with specific diagnostic stages are returned for observability.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/json');

  // 1. Enforce POST method
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({
      success: false,
      stage: 'request_validation',
      error: `Method ${req.method} Not Allowed. Only POST is accepted.`,
    });
  }

  // 2. Safely parse request body
  let payload: any;
  try {
    if (typeof req.body === 'string') {
      payload = JSON.parse(req.body);
    } else if (req.body && typeof req.body === 'object') {
      payload = req.body;
    } else if (req.body === undefined || req.body === null) {
      // In case Vercel Serverless Function receives a stream rather than pre-parsed body
      const chunks: Buffer[] = [];
      for await (const chunk of req as any) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
      }
      if (chunks.length > 0) {
        const raw = Buffer.concat(chunks).toString('utf-8');
        payload = JSON.parse(raw);
      } else {
        return res.status(400).json({
          success: false,
          stage: 'request_parsing',
          error: 'Missing request body. Expected a JSON object.',
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        stage: 'request_parsing',
        error: 'Missing request body. Expected a JSON object.',
      });
    }
  } catch {
    return res.status(400).json({
      success: false,
      stage: 'request_parsing',
      error: 'Malformed JSON payload in request body.',
    });
  }

  // 3. Strict Server-Side Validation (Recipient, subject, content, header injection guards)
  const validation = validateEmailRequest(payload);
  if (!validation.valid || !validation.data) {
    return res.status(400).json({
      success: false,
      stage: 'request_validation',
      error: validation.error || 'Recipient email is required.',
    });
  }

  // 4. Safe Diagnostic Dispatch Flow
  try {
    const result = await dispatchEmail(validation.data);

    return res.status(200).json({
      success: true,
      delivered: true,
      provider: result.provider,
      messageId: result.messageId,
      recipient: result.recipient,
      subject: result.subject,
    });
  } catch (err: any) {
    if (isEmailDispatchError(err)) {
      console.error(`[API /api/send-email ERROR] [STAGE: ${err.stage}] ${err.message}`);
      return res.status(err.statusCode).json({
        success: false,
        stage: err.stage,
        error: err.clientMessage,
        provider: err.provider,
      });
    }

    console.error('[API /api/send-email UNHANDLED ERROR]:', err?.stack || err?.message || err);
    return res.status(500).json({
      success: false,
      stage: 'internal_server_error',
      error: 'Email service temporarily unavailable',
    });
  }
}
