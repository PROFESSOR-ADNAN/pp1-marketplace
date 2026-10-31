import rateLimit from 'express-rate-limit';

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: { title: 'Too Many Requests', detail: 'Rate limit exceeded, try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { title: 'Too Many Attempts', detail: 'Too many authentication attempts, please wait 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

export const checkoutLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 20,
  message: { title: 'Checkout Throttled', detail: 'Too many checkout requests in a short interval' },
});
