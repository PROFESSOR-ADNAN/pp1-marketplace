import { Router, Request, Response } from 'express';
import { sendSms, normalizeEthiopianPhone } from '../services/sms.service.js';
import { sendEmail } from '../services/email.service.js';
import { config } from '../config/env.js';

const router = Router();

/**
 * Check notification services status (redacted)
 */
router.get('/status', (_req: Request, res: Response) => {
  res.json({
    afromessage: {
      configured: Boolean(config.afromessage.token && !config.afromessage.token.includes('mock')),
      sender: config.afromessage.sender || 'Not set (will default to AfroMessage)',
      hasIdentifier: Boolean(config.afromessage.identifierId),
    },
    gmail: {
      configured: Boolean(config.email.user && config.email.pass),
      senderUser: config.email.user ? `${config.email.user.slice(0, 3)}***@gmail.com` : 'Not set',
      from: config.email.from,
    },
  });
});

/**
 * Send test SMS via AfroMessage
 */
router.post('/test-sms', async (req: Request, res: Response) => {
  const { to, message } = req.body;
  if (!to) {
    res.status(400).json({ message: 'Recipient phone number is required (field: to)' });
    return;
  }

  const normalized = normalizeEthiopianPhone(to);
  const text = message || `Test SMS from SOUQ Marketplace via AfroMessage at ${new Date().toLocaleTimeString()}`;

  const result = await sendSms(normalized, text);
  res.json({
    recipient: normalized,
    result,
  });
});

/**
 * Send test email via Gmail
 */
router.post('/test-email', async (req: Request, res: Response) => {
  const { to, subject, text } = req.body;
  if (!to) {
    res.status(400).json({ message: 'Recipient email address is required (field: to)' });
    return;
  }

  const sub = subject || 'Test Email from SOUQ Marketplace (Gmail)';
  const bodyText = text || `This is a test email sent from SOUQ Marketplace backend via Gmail at ${new Date().toISOString()}`;
  const html = `
    <div style="font-family: sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; max-width: 500px;">
      <h2 style="color: #059669;">SOUQ Marketplace</h2>
      <p style="color: #334155;">Hello! This is a test email confirming your Gmail SMTP integration is working perfectly.</p>
      <p style="font-size: 12px; color: #64748b; font-family: monospace;">Timestamp: ${new Date().toISOString()}</p>
    </div>
  `;

  const result = await sendEmail({
    to,
    subject: sub,
    text: bodyText,
    html,
  });

  res.json({
    recipient: to,
    result,
  });
});

export default router;
