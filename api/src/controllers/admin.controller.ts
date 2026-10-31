import { Request, Response, NextFunction } from 'express';
import SellerProfile from '../models/SellerProfile.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import PayoutLedger from '../models/PayoutLedger.js';
import { ROLES } from '@souq/shared';

export const getPendingSellers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profiles = await SellerProfile.find({ status: 'pending' }).populate('user', 'name email');
    res.json(profiles);
  } catch (err) {
    next(err);
  }
};

export const approveSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await SellerProfile.findById(req.params.id);
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    profile.status = 'approved';
    await profile.save();

    await User.findByIdAndUpdate(profile.user, { role: ROLES.SELLER });
    res.json({ message: 'Seller approved successfully', profile });
  } catch (err) {
    next(err);
  }
};

export const getPlatformStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [userCount, orderCount, ledgerItems] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      PayoutLedger.find(),
    ]);

    const totalVolume = ledgerItems.reduce((acc, i) => acc + i.grossAmount, 0);
    const totalCommission = ledgerItems.reduce((acc, i) => acc + i.commissionAmount, 0);

    res.json({
      totalUsers: userCount,
      totalOrders: orderCount,
      totalGrossVolume: totalVolume,
      platformRevenue: totalCommission,
    });
  } catch (err) {
    next(err);
  }
};
