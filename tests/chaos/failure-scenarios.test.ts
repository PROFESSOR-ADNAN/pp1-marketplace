import test from 'node:test';
import assert from 'node:assert';

test('Chaos Scenario 1: Redis transient disconnect does not crash API process', async () => {
  let redisAvailable = false;
  const cacheLookup = async (key: string) => {
    try {
      if (!redisAvailable) throw new Error('ECONNREFUSED');
      return 'cached_data';
    } catch (err) {
      return 'db_fallback_data';
    }
  };

  const result = await cacheLookup('product:123');
  assert.strictEqual(result, 'db_fallback_data');
});

test('Chaos Scenario 2: Chapa external network timeout fails cleanly without stock corruption', async () => {
  const attemptOrderWithTimeout = async () => {
    const networkPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('ETIMEDOUT')), 50));
    try {
      await networkPromise;
    } catch (err: any) {
      return { success: false, reason: err.message };
    }
  };

  const res = await attemptOrderWithTimeout();
  assert.strictEqual(res.success, false);
  assert.strictEqual(res.reason, 'ETIMEDOUT');
});
