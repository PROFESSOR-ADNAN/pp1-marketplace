import test from 'node:test';
import assert from 'node:assert';

const ORDER_STATUS = {
  PENDING_PAYMENT: 'PENDING_PAYMENT',
  PAID: 'PAID',
  CONFIRMED_BY_SELLER: 'CONFIRMED_BY_SELLER',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  REFUNDED: 'REFUNDED',
};

const ALLOWED_TRANSITIONS = {
  PENDING_PAYMENT: ['PAID', 'EXPIRED', 'CANCELLED'],
  PAID: ['CONFIRMED_BY_SELLER', 'CANCELLED'],
  CONFIRMED_BY_SELLER: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: ['REFUNDED'],
  EXPIRED: [],
  REFUNDED: [],
};

const isValidTransition = (from, to) => {
  return (ALLOWED_TRANSITIONS[from] || []).includes(to);
};

test('FSM Unit: legal state transitions pass validation', () => {
  assert.strictEqual(isValidTransition(ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.PAID), true);
  assert.strictEqual(isValidTransition(ORDER_STATUS.PAID, ORDER_STATUS.CONFIRMED_BY_SELLER), true);
  assert.strictEqual(isValidTransition(ORDER_STATUS.CONFIRMED_BY_SELLER, ORDER_STATUS.SHIPPED), true);
  assert.strictEqual(isValidTransition(ORDER_STATUS.SHIPPED, ORDER_STATUS.DELIVERED), true);
  assert.strictEqual(isValidTransition(ORDER_STATUS.CANCELLED, ORDER_STATUS.REFUNDED), true);
});

test('FSM Unit: illegal transitions are strictly rejected', () => {
  assert.strictEqual(isValidTransition(ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.SHIPPED), false);
  assert.strictEqual(isValidTransition(ORDER_STATUS.PENDING_PAYMENT, ORDER_STATUS.DELIVERED), false);
  assert.strictEqual(isValidTransition(ORDER_STATUS.DELIVERED, ORDER_STATUS.PAID), false);
  assert.strictEqual(isValidTransition(ORDER_STATUS.EXPIRED, ORDER_STATUS.PAID), false);
});
