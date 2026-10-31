import crypto from 'crypto';
import { config } from '../config/env.js';

const CHAPA_BASE_URL = 'https://api.chapa.co/v1';

export const initializeChapaTransaction = async (params: {
  amount: number; // in santim, convert to ETB string
  email: string;
  firstName: string;
  lastName: string;
  txRef: string;
}): Promise<string> => {
  // If in mock/offline mode without a valid test key, return simulated checkout
  if (config.chapa.secretKey.includes('mock') || !config.chapa.secretKey.startsWith('CHASECK')) {
    return `${config.clientUrl}/orders/confirmation?tx_ref=${params.txRef}&mock=true`;
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
      callback_url: `${config.apiBaseUrl}/api/v1/payments/chapa/callback`,
      return_url: `${config.clientUrl}/orders/confirmation?tx_ref=${params.txRef}`,
    }),
  });

  const data: any = await res.json();
  if (data.status !== 'success' || !data.data?.checkout_url) {
    const err: any = new Error(data.message || 'Chapa initialization failed');
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
  if (!signatureHeader) return false;
  const expected = crypto
    .createHmac('sha256', config.chapa.webhookSecret)
    .update(typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8'))
    .digest('hex');

  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signatureHeader));
};
