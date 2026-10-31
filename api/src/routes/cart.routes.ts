import { Router } from 'express';
import {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { addToCartSchema, updateCartItemSchema } from '@souq/shared';

const router = Router();
router.use(protect);

router.get('/', getCart);
router.post('/items', validate(addToCartSchema), addItem);
router.put('/items/:productId', validate(updateCartItemSchema), updateItemQuantity);
router.delete('/items/:productId', removeItem);
router.delete('/', clearCart);

export default router;
