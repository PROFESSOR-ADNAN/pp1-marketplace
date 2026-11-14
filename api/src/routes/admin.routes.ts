import { Router } from 'express';
import {
  getPendingSellers,
  approveSeller,
  rejectSeller,
  getAllProductsAdmin,
  toggleProductStatusAdmin,
  getPlatformStats,
} from '../controllers/admin.controller.js';
import { protect, requireRole, requireTOTP } from '../middleware/auth.js';
import { ROLES } from '@souq/shared';

const router = Router();
router.use(protect, requireRole(ROLES.ADMIN), requireTOTP);

router.get('/sellers/pending', getPendingSellers);
router.post('/sellers/:id/approve', approveSeller);
router.post('/sellers/:id/reject', rejectSeller);
router.get('/products', getAllProductsAdmin);
router.patch('/products/:id/status', toggleProductStatusAdmin);
router.get('/stats', getPlatformStats);

export default router;
