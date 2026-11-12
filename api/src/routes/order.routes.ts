import { Router } from 'express';
import {
  checkoutOrder,
  chapaWebhook,
  verifyPayment,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  getOrderConfirmationStatus,
} from '../controllers/order.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { idempotency } from '../middleware/idempotency.js';
import { checkoutLimiter } from '../middleware/rateLimiter.js';
import { checkoutSchema, ROLES } from '@souq/shared';

const router = Router();

// Chapa Webhook & Callbacks (Public, signature-verified)
router.post('/chapa/webhook', chapaWebhook);
router.post('/chapa/callback', chapaWebhook);
router.get('/chapa/callback', async (req, res, next) => {
  const clientUrl = process.env.CLIENT_URL || 'https://souq-web.vercel.app';
  const txRef = req.query.trx_ref || req.query.tx_ref;
  res.redirect(`${clientUrl}/orders/confirmation?tx_ref=${txRef}`);
});
router.get('/confirmation/:txRef', getOrderConfirmationStatus);

router.use(protect);
router.post('/', checkoutLimiter, idempotency('checkout:'), validate(checkoutSchema), checkoutOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.post('/:id/verify-payment', verifyPayment);
router.patch('/:id/status', requireRole(ROLES.SELLER, ROLES.ADMIN), updateOrderStatus);

export default router;
