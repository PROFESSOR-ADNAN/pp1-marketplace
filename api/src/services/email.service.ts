import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env.js';

let transporter: Transporter | null = null;

const getTransporter = (): Transporter | null => {
  if (transporter) return transporter;

  if (!config.email.user || !config.email.pass) {
    return null;
  }

  transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,
      pass: config.email.pass, // 16-character Google App Password
    },
  });

  return transporter;
};

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface SendEmailResult {
  success: boolean;
  messageId?: string;
  mock?: boolean;
  error?: string;
}

/**
 * Sends an email via Resend HTTPS (Port 443) or Gmail SMTP
 */
export const sendEmail = async (options: SendEmailOptions): Promise<SendEmailResult> => {
  // 1. If Resend HTTPS API key is available, use it (works 100% on Render Free Tier over Port 443)
  if (config.email.resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${config.email.resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SOUQ Marketplace <onboarding@resend.dev>',
          to: [options.to],
          subject: options.subject,
          html: options.html,
          text: options.text || options.subject,
        }),
      });
      const data: any = await res.json();
      if (res.ok && data.id) {
        console.log(`[Resend HTTPS] Email sent to ${options.to} (Id: ${data.id})`);
        return { success: true, messageId: data.id };
      } else {
        console.warn('[Resend Warning]', data);
      }
    } catch (e: any) {
      console.error('[Resend Error]', e.message);
    }
  }

  // 2. Otherwise use Gmail SMTP
  const mailer = getTransporter();

  // Mock / dev fallback when Gmail credentials are not configured
  if (!mailer) {
    console.log(`[Gmail MOCK] To: ${options.to} | Subject: "${options.subject}"`);
    return { success: true, mock: true, messageId: `mock-email-${Date.now()}` };
  }

  try {
    const info = await mailer.sendMail({
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      text: options.text || options.subject,
      html: options.html,
    });

    console.log(`[Gmail] Email sent to ${options.to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (err: any) {
    const isTimeout = err.code === 'ETIMEDOUT' || err.message?.includes('timeout');
    const errorMsg = isTimeout
      ? 'Render free tier blocks outbound SMTP ports 465/587. To send emails on Render, set RESEND_API_KEY over HTTPS port 443 or upgrade to a paid Render plan.'
      : err.message;
    console.error(`[Gmail Error] Failed to send email to ${options.to}:`, errorMsg);
    return { success: false, error: errorMsg };
  }
};

/**
 * Sends a clean, branded order confirmation receipt to the buyer
 */
export const sendOrderReceiptEmail = async (params: {
  to: string;
  buyerName: string;
  txRef: string;
  totalAmountSantim: number;
  items: Array<{ name: string; quantity: number; price: number }>;
  deliveryAddress: { city: string; subCity: string; woreda?: string; landmark: string };
}): Promise<SendEmailResult> => {
  const totalETB = (params.totalAmountSantim / 100).toFixed(2);
  const itemsHtml = params.items
    .map(
      (item) => `
        <tr style="border-bottom: 1px solid #e2e8f0;">
          <td style="padding: 10px 0; color: #1e293b; font-size: 14px;">${item.name}</td>
          <td style="padding: 10px 0; text-align: center; color: #64748b; font-size: 14px;">x${item.quantity}</td>
          <td style="padding: 10px 0; text-align: right; color: #0f172a; font-weight: 600; font-size: 14px;">
            ETB ${((item.price * item.quantity) / 100).toFixed(2)}
          </td>
        </tr>
      `
    )
    .join('');

  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden;">
        <div style="background-color: #059669; padding: 24px; text-align: center; color: #ffffff;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">SOUQ MARKETPLACE</h1>
          <p style="margin: 6px 0 0; font-size: 14px; opacity: 0.9;">Order Payment Receipt</p>
        </div>
        
        <div style="padding: 32px 24px;">
          <h2 style="margin: 0 0 8px; font-size: 20px; color: #0f172a;">Thank you, ${params.buyerName}!</h2>
          <p style="margin: 0 0 24px; font-size: 14px; color: #475569; line-height: 1.5;">
            Your payment has been verified by <strong>Chapa</strong> and your order is currently being prepared for delivery.
          </p>

          <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin-bottom: 24px; font-size: 13px; color: #334155;">
            <p style="margin: 0 0 6px;"><strong>Transaction Ref:</strong> <span style="font-family: monospace;">${params.txRef}</span></p>
            <p style="margin: 0 0 6px;"><strong>Delivery Location:</strong> ${params.deliveryAddress.city}, ${params.deliveryAddress.subCity} (${params.deliveryAddress.landmark})</p>
            <p style="margin: 0;"><strong>Payment Status:</strong> <span style="color: #059669; font-weight: 700;">PAID (ETB ${totalETB})</span></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
            <thead>
              <tr style="border-bottom: 2px solid #cbd5e1; text-align: left; font-size: 12px; color: #64748b; text-transform: uppercase;">
                <th style="padding-bottom: 8px;">Item</th>
                <th style="padding-bottom: 8px; text-align: center;">Qty</th>
                <th style="padding-bottom: 8px; text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding-top: 14px; font-weight: 700; color: #0f172a; font-size: 16px;">Total Paid</td>
                <td style="padding-top: 14px; text-align: right; font-weight: 800; color: #059669; font-size: 18px;">
                  ETB ${totalETB}
                </td>
              </tr>
            </tfoot>
          </table>

          <div style="text-align: center; margin-top: 32px;">
            <a href="${config.clientUrl}/orders" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              Track Your Order
            </a>
          </div>
        </div>

        <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 12px; color: #94a3b8;">
          <p style="margin: 0;">SOUQ Multi-Vendor Ethiopian Marketplace • Addis Ababa, Ethiopia</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `Order Confirmed: #${params.txRef} - SOUQ Marketplace`,
    html,
  });
};

/**
 * Sends an email notification when the order is dispatched
 */
export const sendOrderShippedEmail = async (params: {
  to: string;
  buyerName: string;
  txRef: string;
  carrierOrSeller?: string;
}): Promise<SendEmailResult> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px 24px; text-align: center;">
        <h1 style="color: #059669; font-size: 24px; margin: 0 0 12px;">Your Order is On Its Way! 🚚</h1>
        <p style="color: #475569; font-size: 15px; line-height: 1.6; margin: 0 0 24px;">
          Hi ${params.buyerName}, order <strong>#${params.txRef}</strong> has been packaged and handed over for delivery${params.carrierOrSeller ? ` by ${params.carrierOrSeller}` : ''}.
        </p>
        <p style="color: #64748b; font-size: 13px; margin-bottom: 24px;">
          Our courier driver will call you directly on your phone upon reaching your delivery landmark.
        </p>
        <a href="${config.clientUrl}/orders" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px;">
          View Order Status
        </a>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `Order Shipped: #${params.txRef} - SOUQ Marketplace`,
    html,
  });
};

/**
 * Sends a welcome email upon registration
 */
export const sendWelcomeEmail = async (params: {
  to: string;
  name: string;
  role?: string;
}): Promise<SendEmailResult> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8" /></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px;">
      <div style="max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 32px 24px;">
        <h1 style="color: #059669; font-size: 22px; margin: 0 0 12px;">Welcome to SOUQ, ${params.name}!</h1>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 16px;">
          We are thrilled to have you join Ethiopia's multi-vendor marketplace.
        </p>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
          You can now browse authentic local and imported goods, pay securely in Ethiopian Birr via Chapa, and enjoy fast landmark-based delivery across Addis Ababa and beyond.
        </p>
        <div style="text-align: center;">
          <a href="${config.clientUrl}/products" style="display: inline-block; background-color: #059669; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; padding: 12px 28px; border-radius: 10px;">
            Start Exploring Products
          </a>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: params.to,
    subject: `Welcome to SOUQ Marketplace, ${params.name}!`,
    html,
  });
};
