import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

const webhookSecret = 'test_webhook_hmac_secret_key_12345';

const verifySignature = (body, header) => {
  if (!header) return false;
  const expected = crypto.createHmac('sha256', webhookSecret).update(body).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(header));
};

test('Webhook Unit: valid HMAC-SHA256 signature is accepted', () => {
  const payload = JSON.stringify({ tx_ref: 'souq-tx-12345', status: 'success' });
  const validHeader = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

  assert.strictEqual(verifySignature(payload, validHeader), true);
});

test('Webhook Unit: forged or tampered signature is rejected', () => {
  const payload = JSON.stringify({ tx_ref: 'souq-tx-12345', status: 'success' });
  const forgedHeader = 'a'.repeat(64);

  assert.strictEqual(verifySignature(payload, forgedHeader), false);

  const tamperedPayload = JSON.stringify({ tx_ref: 'souq-tx-12345', status: 'failed' });
  const validHeader = crypto.createHmac('sha256', webhookSecret).update(payload).digest('hex');

  assert.strictEqual(verifySignature(tamperedPayload, validHeader), false);
});
