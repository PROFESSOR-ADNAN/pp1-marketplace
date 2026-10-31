import { Response, NextFunction } from 'express';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';

const getOrCreateCart = async (userId: string) => {
  let cart = await Cart.findOne({ user: userId });
  if (!cart) {
    try {
      cart = await Cart.create({ user: userId, items: [] });
    } catch (err: any) {
      if (err.code === 11000) {
        cart = await Cart.findOne({ user: userId });
      } else {
        throw err;
      }
    }
  }
  return cart!;
};

const buildCartResponse = async (cart: any) => {
  await cart.populate('items.product');

  const validItems = cart.items.filter((i: any) => i.product && i.product.isActive);
  if (validItems.length !== cart.items.length) {
    cart.items = validItems.map((i: any) => ({ product: i.product._id, quantity: i.quantity }));
    await cart.save();
  }

  const items = validItems.map((i: any) => ({
    product: i.product,
    quantity: i.quantity,
    subtotal: i.product.price * i.quantity, // integer santim
  }));

  const total = items.reduce((sum: number, i: any) => sum + i.subtotal, 0);
  return { items, total };
};

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    res.json(await buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

export const addItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    const cart = await getOrCreateCart(req.user._id);
    const existing = cart.items.find((i: any) => i.product.toString() === productId);
    const nextQty = (existing?.quantity || 0) + quantity;

    if (nextQty > product.stock) {
      res.status(400).json({ message: `Only ${product.stock} units in stock` });
      return;
    }

    if (existing) {
      existing.quantity = nextQty;
    } else {
      cart.items.push({ product: product._id as any, quantity: nextQty });
    }

    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

export const updateItemQuantity = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    const product = await Product.findOne({ _id: productId, isActive: true });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (quantity > product.stock) {
      res.status(400).json({ message: `Only ${product.stock} units in stock` });
      return;
    }

    const cart = await getOrCreateCart(req.user._id);
    const item = cart.items.find((i: any) => i.product.toString() === productId);
    if (!item) {
      res.status(404).json({ message: 'Item not in cart' });
      return;
    }

    item.quantity = quantity;
    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

export const removeItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId } = req.params;
    const cart = await getOrCreateCart(req.user._id);
    cart.items = cart.items.filter((i: any) => i.product.toString() !== productId);
    await cart.save();
    res.json(await buildCartResponse(cart));
  } catch (err) {
    next(err);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await getOrCreateCart(req.user._id);
    cart.items = [];
    await cart.save();
    res.json({ items: [], total: 0 });
  } catch (err) {
    next(err);
  }
};
