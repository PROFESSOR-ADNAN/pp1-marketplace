import { Router } from 'express';
import { getCategories, createCategory } from '../controllers/category.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { ROLES } from '@souq/shared';

const router = Router();
router.get('/', getCategories);
router.post('/', protect, requireRole(ROLES.ADMIN), createCategory);

export default router;
