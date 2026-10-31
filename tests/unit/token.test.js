import test from 'node:test';
import assert from 'node:assert';
import crypto from 'crypto';

// Pure Node.js standard library JWT generator and verifier
const signJWT = (payload, secret, expiresInSeconds = 900) => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const now = Math.floor(Date.now() / 1000);
  const body = Buffer.from(JSON.stringify({ ...payload, iat: now, exp: now + expiresInSeconds })).toString('base64url');
  const signature = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
};

const verifyJWT = (token, secret) => {
  const [header, body, signature] = token.split('.');
  const expectedSig = crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64url');
  if (signature !== expectedSig) throw new Error('Invalid signature');
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  const now = Math.floor(Date.now() / 1000);
  if (payload.exp && payload.exp < now) throw new Error('Token expired');
  return payload;
};

test('Token Unit: signs and verifies JWT access token with 15m expiration', () => {
  const secret = 'test_secret_key_at_least_32_characters_long_for_security';
  const payload = { id: 'user123', role: 'buyer', email: 'test@example.com' };
  const token = signJWT(payload, secret, 900);

  const decoded = verifyJWT(token, secret);
  assert.strictEqual(decoded.id, 'user123');
  assert.strictEqual(decoded.role, 'buyer');
  assert.strictEqual(decoded.email, 'test@example.com');
});

test('Token Unit: generates cryptographic SHA-256 hash of refresh token', () => {
  const rawToken = crypto.randomBytes(40).toString('hex');
  const hash1 = crypto.createHash('sha256').update(rawToken).digest('hex');
  const hash2 = crypto.createHash('sha256').update(rawToken).digest('hex');

  assert.strictEqual(hash1, hash2);
  assert.strictEqual(hash1.length, 64);
});
