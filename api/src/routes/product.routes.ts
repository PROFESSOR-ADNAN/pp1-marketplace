import { Router } from 'express';
import {
  getProducts,
  getProductById,
  getMyProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product.controller.js';
import { protect, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createProductSchema, updateProductSchema, ROLES } from '@souq/shared';

const router = Router();

router.get('/', getProducts);
router.get('/mine', protect, requireRole(ROLES.SELLER, ROLES.ADMIN), getMyProducts);
router.get('/:id', getProductById);

router.post('/', protect, requireRole(ROLES.SELLER, ROLES.ADMIN), validate(createProductSchema), createProduct);
router.put('/:id', protect, requireRole(ROLES.SELLER, ROLES.ADMIN), validate(updateProductSchema), updateProduct);
router.delete('/:id', protect, requireRole(ROLES.SELLER, ROLES.ADMIN), deleteProduct);

export default router;
