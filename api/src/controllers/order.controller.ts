import crypto from 'crypto';
import mongoose from 'mongoose';
import { Response, NextFunction } from 'express';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Address from '../models/Address.js';
import PayoutLedger from '../models/PayoutLedger.js';
import { AuthRequest } from '../middleware/auth.js';
import { reserveStockForOrder } from '../services/inventory.service.js';
import { initializeChapaTransaction, verifyChapaTransaction, verifyChapaSignature } from '../services/chapa.service.js';
import { transitionOrder } from '../services/orderStateMachine.service.js';
import { config } from '../config/env.js';
import { ORDER_STATUS, PAYMENT_STATUS, ROLES } from '@souq/shared';

const generateTxRef = () => `souq-${crypto.randomBytes(8).toString('hex')}`;

export const checkoutOrder = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  const session = await mongoose.startSession();
  try {
    let orderResult: any;
    let checkoutUrlResult: string = '';

    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: req.user._id }).populate('items.product').session(session);
      if (!cart || cart.items.length === 0) {
        const err: any = new Error('Cart is empty');
        err.statusCode = 400;
        throw err;
      }

      let deliveryAddress = req.body.deliveryAddress;
      if (!deliveryAddress && req.body.addressId) {
        const addr = await Address.findById(req.body.addressId).session(session);
        if (addr) {
          deliveryAddress = {
            region: addr.region,
            city: addr.city,
            subCity: addr.subCity,
            woreda: addr.woreda,
            landmark: addr.landmark,
            phone: addr.phone,
          };
        }
      }

      if (!deliveryAddress) {
        const err: any = new Error('Valid delivery address is required');
        err.statusCode = 400;
        throw err;
      }

      const items = cart.items.map((i: any) => ({
        product: i.product._id,
        seller: i.product.seller,
        name: i.product.name,
        price: i.product.price, // Integer santim
        quantity: i.quantity,
      }));

      const totalAmount = items.reduce((sum: number, i: any) => sum + i.price * i.quantity, 0);
      const txRef = generateTxRef();

      const [order] = await Order.create(
        [
          {
            buyer: req.user._id,
            items,
            totalAmount,
            deliveryAddress,
            payment: { provider: 'chapa', txRef, status: PAYMENT_STATUS.PENDING },
            status: ORDER_STATUS.PENDING_PAYMENT,
          },
        ],
        { session }
      );

      // Execute atomic Two-Phase stock reservation
      await reserveStockForOrder(
        order._id as mongoose.Types.ObjectId,
        items.map((i: any) => ({ productId: i.product, quantity: i.quantity })),
        session
      );

      // Clear the buyer's cart
      cart.items = [];
      await cart.save({ session });

      orderResult = order;
    });

    const clientOrigin = req.body.returnUrl 
      || req.headers.origin 
      || (req.headers.referer ? new URL(req.headers.referer).origin : '') 
      || config.clientUrl;

    const host = req.get('host');
    const proto = req.get('x-forwarded-proto') || (req.secure ? 'https' : 'http');
    const currentApiBase = config.apiBaseUrl || `${proto}://${host}`;

    const [firstName, ...rest] = req.user.name.trim().split(' ');
    checkoutUrlResult = await initializeChapaTransaction({
      amount: orderResult.totalAmount,
      email: req.user.email,
      firstName,
      lastName: rest.join(' ') || firstName,
      txRef: orderResult.payment.txRef,
      returnUrl: `${clientOrigin.replace(/\/$/, '')}/orders/confirmation`,
      callbackUrl: `${currentApiBase.replace(/\/$/, '')}/api/v1/payments/chapa/webhook`,
    });

    res.status(201).json({ order: orderResult, checkoutUrl: checkoutUrlResult });
  } catch (err) {
    next(err);
  } finally {
    session.endSession();
  }
};

export const reconcilePayment = async (txRef: string): Promise<any> => {
  const order = await Order.findOne({ 'payment.txRef': txRef });
  if (!order || order.payment.status !== PAYMENT_STATUS.PENDING) return order;

  const verification = await verifyChapaTransaction(txRef);
  const status = verification?.data?.status;

  if (status === 'success') {
    await transitionOrder(order._id as mongoose.Types.ObjectId, ORDER_STATUS.PAID, {
      id: order.buyer.toString(),
      role: 'system',
    });

    order.payment.status = PAYMENT_STATUS.SUCCESS;
    order.payment.chapaRef = verification.data.ref_id || verification.data.reference;
    order.payment.verifiedAt = new Date();
    await order.save();

    // Generate payout ledger records for sellers (5% platform fee)
    for (const item of order.items) {
      const gross = item.price * item.quantity;
      const commission = Math.round(gross * 0.05);
      const net = gross - commission;

      await PayoutLedger.create({
        seller: item.seller,
        order: order._id,
        grossAmount: gross,
        commissionAmount: commission,
        netAmount: net,
        status: 'pending',
      });
    }
  } else if (status === 'failed') {
    await transitionOrder(order._id as mongoose.Types.ObjectId, ORDER_STATUS.CANCELLED, {
      id: order.buyer.toString(),
      role: 'system',
    });
    order.payment.status = PAYMENT_STATUS.FAILED;
    order.payment.verifiedAt = new Date();
    await order.save();
  }

  return order;
};

export const chapaWebhook = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const signature = (req.headers['x-chapa-signature'] || req.headers['chapa-signature']) as string;
    
    // Check HMAC signature if webhookSecret is configured and in production
    if (config.chapa.webhookSecret && config.chapa.webhookSecret !== 'dev_webhook_hmac_secret') {
      const isValid = verifyChapaSignature(req.rawBody || JSON.stringify(req.body), signature);
      if (!isValid) {
        console.warn('[Chapa Webhook] Invalid signature received');
        res.status(401).json({ message: 'Invalid signature' });
        return;
      }
    }

    const txRef = req.body?.tx_ref 
      || req.body?.data?.tx_ref 
      || req.body?.trx_ref 
      || req.body?.data?.trx_ref 
      || req.query?.tx_ref 
      || req.query?.trx_ref;

    if (!txRef) {
      console.warn('[Chapa Webhook] Received webhook without tx_ref:', req.body);
      res.status(400).json({ message: 'Missing tx_ref in webhook payload' });
      return;
    }

    console.log(`[Chapa Webhook] Reconciling payment for tx_ref: ${txRef}`);
    await reconcilePayment(txRef);
    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

export const getOrderConfirmationStatus = async (req: any, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { txRef } = req.params;
    if (!txRef) {
      res.status(400).json({ message: 'Missing transaction reference' });
      return;
    }

    const reconciled = await reconcilePayment(txRef);
    if (!reconciled) {
      res.status(404).json({ message: 'Order not found for transaction reference' });
      return;
    }

    res.json({
      orderId: reconciled._id,
      status: reconciled.status,
      paymentStatus: reconciled.payment?.status,
      txRef: reconciled.payment?.txRef,
      totalAmount: reconciled.totalAmount,
      itemsCount: reconciled.items?.length || 0,
      verifiedAt: reconciled.payment?.verifiedAt,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyPayment = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.buyer.toString() !== req.user._id.toString() && req.user.role !== ROLES.ADMIN) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    const reconciled = await reconcilePayment(order.payment.txRef);
    res.json(reconciled);
  } catch (err) {
    next(err);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find({ buyer: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isSeller = order.items.some((i: any) => i.seller.toString() === req.user._id.toString());
    const isAdmin = req.user.role === ROLES.ADMIN;

    if (!isBuyer && !isSeller && !isAdmin) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }

    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const updated = await transitionOrder(req.params.id, status, {
      id: req.user._id.toString(),
      role: req.user.role,
    });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
