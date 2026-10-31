import { Router } from 'express';
import {
  applySeller,
  getSellerProfile,
  getSellerOrders,
  getSellerLedger,
} from '../controllers/seller.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { ROLES } from '@souq/shared';

const router = Router();
router.use(protect);

router.post('/apply', applySeller);
router.get('/profile', getSellerProfile);
router.get('/orders', requireRole(ROLES.SELLER, ROLES.ADMIN), getSellerOrders);
router.get('/ledger', requireRole(ROLES.SELLER, ROLES.ADMIN), getSellerLedger);

export default router;
