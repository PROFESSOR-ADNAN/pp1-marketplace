import { config } from '../config/env.js';

const AFROMESSAGE_API_URL = 'https://api.afromessage.com/api/send';

/**
 * Normalizes Ethiopian phone numbers into international E.164 format (+251XXXXXXXXX)
 */
export const normalizeEthiopianPhone = (phone: string): string => {
  if (!phone) return '';
  // Strip all non-digit and non-plus characters
  let cleaned = phone.trim().replace(/[^\d+]/g, '');

  if (cleaned.startsWith('+251')) {
    return cleaned;
  }
  if (cleaned.startsWith('251')) {
    return `+${cleaned}`;
  }
  if (cleaned.startsWith('09') || cleaned.startsWith('07')) {
    return `+251${cleaned.substring(1)}`;
  }
  if ((cleaned.startsWith('9') || cleaned.startsWith('7')) && cleaned.length === 9) {
    return `+251${cleaned}`;
  }

  // Default fallback
  return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
};

export interface SendSmsResult {
  success: boolean;
  messageId?: string;
  mock?: boolean;
  error?: string;
}

/**
 * Sends an SMS message via AfroMessage Ethiopian gateway
 */
export const sendSms = async (to: string, message: string): Promise<SendSmsResult> => {
  const normalizedTo = normalizeEthiopianPhone(to);
  if (!normalizedTo) {
    console.warn('[AfroMessage] Cannot send SMS: empty recipient phone');
    return { success: false, error: 'Empty recipient phone' };
  }

  // Mock / dev fallback when no token is configured
  if (!config.afromessage.token || config.afromessage.token.includes('mock')) {
    console.log(`[AfroMessage MOCK] To: ${normalizedTo} | Text: "${message}"`);
    return { success: true, mock: true, messageId: `mock-sms-${Date.now()}` };
  }

  try {
    const payload: Record<string, string> = {
      to: normalizedTo,
      message,
    };

    // Only attach sender if explicitly approved and not default unapproved 'SOUQ'
    if (config.afromessage.sender && config.afromessage.sender.toUpperCase() !== 'SOUQ') {
      payload.sender = config.afromessage.sender;
    }

    const res = await fetch(AFROMESSAGE_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${config.afromessage.token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const rawText = await res.text();
    let data: any = {};
    try {
      data = JSON.parse(rawText);
    } catch {
      data = { raw: rawText };
    }

    if (res.ok && (data.status === 'success' || data.acknowledge === 'success')) {
      console.log(`[AfroMessage] SMS sent successfully to ${normalizedTo}`);
      return {
        success: true,
        messageId: data?.response?.id || data?.id || `msg-${Date.now()}`,
      };
    } else {
      const errorDetail = data?.response?.errors?.[0] || data?.message || data?.error || data?.raw || 'AfroMessage rejected SMS';
      console.warn(`[AfroMessage Info] Could not deliver SMS to ${normalizedTo}: ${errorDetail}`);
      return {
        success: false,
        error: errorDetail,
      };
    }
  } catch (err: any) {
    console.error(`[AfroMessage Exception] Failed to send SMS to ${normalizedTo}:`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Helper to send order confirmation SMS to buyer
 */
export const sendOrderPaymentSms = async (
  phone: string,
  txRef: string,
  totalAmountSantim: number,
  city?: string
): Promise<SendSmsResult> => {
  const amountETB = (totalAmountSantim / 100).toFixed(2);
  const locationText = city ? ` for delivery to ${city}` : '';
  const message = `SOUQ: Your payment of ETB ${amountETB} for order #${txRef} is confirmed! The merchant is preparing your package${locationText}. Track: ${config.clientUrl}/orders`;
  return sendSms(phone, message);
};

/**
 * Helper to send order shipped SMS to buyer
 */
export const sendOrderShippedSms = async (
  phone: string,
  txRef: string,
  sellerName?: string
): Promise<SendSmsResult> => {
  const fromText = sellerName ? ` by ${sellerName}` : '';
  const message = `SOUQ: Great news! Your order #${txRef} has been dispatched${fromText}. Our delivery driver will contact you at this number upon arrival.`;
  return sendSms(phone, message);
};

/**
 * Helper to alert seller of a new order
 */
export const sendSellerNewOrderSms = async (
  phone: string,
  txRef: string,
  totalAmountSantim: number
): Promise<SendSmsResult> => {
  const amountETB = (totalAmountSantim / 100).toFixed(2);
  const message = `SOUQ Seller: You have a new PAID order #${txRef} worth ETB ${amountETB}! Please prepare the package for fulfillment. Details: ${config.clientUrl}/orders`;
  return sendSms(phone, message);
};
