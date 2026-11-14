import crypto from 'crypto';
import { config } from '../config/env.js';

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

export const initializeChapaTransaction = async (params: {
  amount: number; // in santim, convert to ETB string
  email: string;
  firstName: string;
  lastName: string;
  txRef: string;
  returnUrl?: string;
  callbackUrl?: string;
}): Promise<string> => {
  const returnBase = (params.returnUrl || `${config.clientUrl}/orders/confirmation`).replace(/\/+$/, '');
  let fullReturnUrl = returnBase;
  if (!fullReturnUrl.includes('tx_ref=') && !fullReturnUrl.includes('trx_ref=')) {
    const sep = returnBase.includes('?') ? '&' : '?';
    fullReturnUrl = `${returnBase}${sep}tx_ref=${params.txRef}`;
  }
  const fullCallbackUrl = params.callbackUrl || `${config.apiBaseUrl}/api/v1/payments/chapa/webhook`;

  // If in mock/offline mode without a valid test key, return simulated checkout
  if (config.chapa.secretKey.includes('mock') || !config.chapa.secretKey.startsWith('CHASECK')) {
    return `${fullReturnUrl}&mock=true`;
  }

  const amountETB = (params.amount / 100).toFixed(2);
  const res = await fetch(`${CHAPA_BASE_URL}/transaction/initialize`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.chapa.secretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: amountETB,
      currency: 'ETB',
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      tx_ref: params.txRef,
      callback_url: fullCallbackUrl,
      return_url: fullReturnUrl,
    }),
  });

  const data: any = await res.json().catch(() => ({}));
  if (data.status !== 'success' || !data.data?.checkout_url) {
    let errMsg = 'Chapa payment initialization failed';
    if (typeof data.message === 'string') {
      errMsg = data.message;
    } else if (data.message && typeof data.message === 'object') {
      errMsg = Object.entries(data.message)
        .map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(', ') : v}`)
        .join('; ');
    } else if (data.error) {
      errMsg = typeof data.error === 'string' ? data.error : JSON.stringify(data.error);
    }
    const err: any = new Error(errMsg);
    err.statusCode = 502;
    throw err;
  }

  return data.data.checkout_url;
};

export const verifyChapaTransaction = async (txRef: string): Promise<any> => {
  if (config.chapa.secretKey.includes('mock') || !config.chapa.secretKey.startsWith('CHASECK')) {
    return { status: 'success', data: { status: 'success', ref_id: `mock-ref-${Date.now()}` } };
  }

  const res = await fetch(`${CHAPA_BASE_URL}/transaction/verify/${txRef}`, {
    headers: {
      Authorization: `Bearer ${config.chapa.secretKey}`,
    },
  });
  return res.json();
};

export const verifyChapaSignature = (rawBody: string | Buffer, signatureHeader?: string): boolean => {
  if (!signatureHeader || !config.chapa.webhookSecret) return false;

  try {
    const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
    const expected = crypto
      .createHmac('sha256', config.chapa.webhookSecret)
      .update(bodyStr)
      .digest('hex');

    const expectedBuf = Buffer.from(expected, 'utf8');
    const signatureBuf = Buffer.from(signatureHeader, 'utf8');

    if (expectedBuf.length !== signatureBuf.length) {
      return false;
    }

    return crypto.timingSafeEqual(expectedBuf, signatureBuf);
  } catch (err) {
    console.error('[Chapa] Webhook signature verification error:', err);
    return false;
  }
};
