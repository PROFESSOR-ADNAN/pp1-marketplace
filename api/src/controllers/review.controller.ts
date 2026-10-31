import { Response, NextFunction } from 'express';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import { AuthRequest } from '../middleware/auth.js';
import { ORDER_STATUS } from '@souq/shared';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, rating, comment } = req.body;

    // Verify buyer has a DELIVERED order containing this product
    const deliveredOrder = await Order.findOne({
      buyer: req.user._id,
      status: ORDER_STATUS.DELIVERED,
      'items.product': productId,
    });

    if (!deliveredOrder) {
      res.status(403).json({ message: 'Reviews are only allowed after verified product delivery' });
      return;
    }

    const review = await Review.create({
      product: productId,
      order: deliveredOrder._id,
      buyer: req.user._id,
      rating,
      comment,
    });

    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
};

export const getProductReviews = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
};
