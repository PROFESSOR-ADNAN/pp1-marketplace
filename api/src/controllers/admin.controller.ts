import { Request, Response, NextFunction } from 'express';
import SellerProfile from '../models/SellerProfile.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import PayoutLedger from '../models/PayoutLedger.js';
import { ROLES } from '@souq/shared';

export const getPendingSellers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    let profiles = await SellerProfile.find({ status: 'pending' }).populate('user', 'name email');

    // If no pending seller profiles exist, seed 2 sample pending applicants for demonstration
    if (profiles.length === 0) {
      const sampleApplicants = [
        {
          name: 'Almaz Woldemariam (Entoto Weavers)',
          email: 'almaz.weavers@ethio-crafts.et',
          businessName: 'Entoto Women Weaving Cooperative',
          businessRegNumber: 'ETH-TIN-99482103',
          storeDescription: 'Handmade pure cotton Tibeb dresses, Netela scarves, and traditional Gabi throws from Mount Entoto weavers.',
          phone: '+251911448822',
        },
        {
          name: 'Dawit Bekele (Harar Spice Guild)',
          email: 'dawit.bekele@harar-spices.et',
          businessName: 'Harar Ancient Spice & Coffee Traders',
          businessRegNumber: 'ETH-TIN-88391204',
          storeDescription: 'Direct-trade sun-dried Harar longberry coffee beans, stone-ground Mitmita, and heirloom Berbere blends.',
          phone: '+251922339911',
        },
      ];

      for (const app of sampleApplicants) {
        let appUser = await User.findOne({ email: app.email });
        if (!appUser) {
          appUser = await User.create({
            name: app.name,
            email: app.email,
            password: 'DemoPassword123!',
            role: ROLES.BUYER,
          });
        }
        const existingProf = await SellerProfile.findOne({ user: appUser._id });
        if (!existingProf) {
          await SellerProfile.create({
            user: appUser._id,
            businessName: app.businessName,
            businessRegNumber: app.businessRegNumber,
            storeDescription: app.storeDescription,
            phone: app.phone,
            status: 'pending',
          });
        }
      }

      profiles = await SellerProfile.find({ status: 'pending' }).populate('user', 'name email');
    }

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

export const rejectSeller = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const profile = await SellerProfile.findById(req.params.id);
    if (!profile) {
      res.status(404).json({ message: 'Profile not found' });
      return;
    }

    profile.status = 'rejected';
    profile.rejectionReason = req.body.reason || 'Verification requirements not satisfied';
    await profile.save();

    res.json({ message: 'Seller application rejected', profile });
  } catch (err) {
    next(err);
  }
};

export const getAllProductsAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).populate('seller', 'name email');
    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const toggleProductStatusAdmin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    product.isActive = req.body.isActive !== undefined ? req.body.isActive : !product.isActive;
    await product.save();

    res.json({
      message: `Product ${product.isActive ? 'activated' : 'deactivated'} successfully`,
      product,
    });
  } catch (err) {
    next(err);
  }
};

export const getPlatformStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const [userCount, sellerCount, orderCount, productCount, pendingSellersCount, recentOrders, ledgerItems] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: ROLES.SELLER }),
      Order.countDocuments(),
      Product.countDocuments(),
      SellerProfile.countDocuments({ status: 'pending' }),
      Order.find().sort({ createdAt: -1 }).limit(8).populate('buyer', 'name email'),
      PayoutLedger.find(),
    ]);

    let totalVolume = ledgerItems.reduce((acc, i) => acc + (i.grossAmount || 0), 0);
    let totalCommission = ledgerItems.reduce((acc, i) => acc + (i.commissionAmount || 0), 0);

    // If no ledger records yet, calculate from paid/shipped/delivered orders
    if (totalVolume === 0) {
      const paidOrders = await Order.find({ status: { $in: ['PAID', 'SHIPPED', 'DELIVERED'] } });
      totalVolume = paidOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
      totalCommission = Math.round(totalVolume * 0.05); // 5% platform fee
    }

    res.json({
      totalUsers: userCount,
      totalSellers: sellerCount,
      totalOrders: orderCount,
      totalProducts: productCount,
      pendingSellersCount,
      totalGrossVolume: totalVolume,
      platformRevenue: totalCommission,
      recentOrders,
    });
  } catch (err) {
    next(err);
  }
};
