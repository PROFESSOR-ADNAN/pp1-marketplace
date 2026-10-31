import { Response, NextFunction } from 'express';
import SellerProfile from '../models/SellerProfile.js';
import Order from '../models/Order.js';
import PayoutLedger from '../models/PayoutLedger.js';
import { AuthRequest } from '../middleware/auth.js';

export const applySeller = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { businessName, businessRegNumber, storeDescription, phone } = req.body;
    const profile = await SellerProfile.create({
      user: req.user._id,
      businessName,
      businessRegNumber,
      storeDescription,
      phone,
      status: 'pending',
    });
    res.status(201).json(profile);
  } catch (err) {
    next(err);
  }
};

export const getSellerProfile = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await SellerProfile.findOne({ user: req.user._id });
    if (!profile) {
      res.status(404).json({ message: 'Seller profile not found' });
      return;
    }
    res.json(profile);
  } catch (err) {
    next(err);
  }
};

export const getSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find({ 'items.seller': req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getSellerLedger = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ledger = await PayoutLedger.find({ seller: req.user._id }).sort({ createdAt: -1 });
    const totalEarnings = ledger.reduce((sum, item) => sum + item.netAmount, 0);
    res.json({ ledger, totalEarnings });
  } catch (err) {
    next(err);
  }
};
