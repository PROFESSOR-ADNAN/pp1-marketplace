import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/review.controller.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', protect, createReview);

export default router;
