import test from 'node:test';
import assert from 'node:assert';

const sanitizeObject = (obj) => {
  if (obj === null || typeof obj !== 'object') return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeObject);
  const clean = {};
  for (const key of Object.keys(obj)) {
    if (key.startsWith('$')) continue;
    clean[key] = sanitizeObject(obj[key]);
  }
  return clean;
};

test('Sanitize Unit: strips dangerous MongoDB injection operators ($gt, $ne, $where)', () => {
  const malicious = {
    username: 'admin',
    password: { $gt: '' },
    filter: { $ne: null, nested: { $regex: '.*' } },
  };

  const safe = sanitizeObject(malicious);
  assert.strictEqual(safe.username, 'admin');
  assert.deepStrictEqual(safe.password, {});
  assert.deepStrictEqual(safe.filter, { nested: {} });
});

test('Sanitize Unit: validates Ethiopian phone number format (+2519... or +2517...) prefix', () => {
  const ethPhoneRegex = /^\+251[79]\d{8}$/;

  assert.strictEqual(ethPhoneRegex.test('+251911223344'), true);
  assert.strictEqual(ethPhoneRegex.test('+251712345678'), true);
  assert.strictEqual(ethPhoneRegex.test('0911223344'), false);
  assert.strictEqual(ethPhoneRegex.test('+14155552671'), false);
});
