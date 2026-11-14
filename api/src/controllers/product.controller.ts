import { Request, Response, NextFunction } from 'express';
import Product from '../models/Product.js';
import { AuthRequest } from '../middleware/auth.js';

export const getProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const cursor = req.query.cursor as string;

    const filter: any = { isActive: true };
    if (req.query.category) filter.category = req.query.category;
    if (req.query.search) {
      filter.$text = { $search: req.query.search as string };
    }
    if (req.query.minPrice || req.query.maxPrice) {
      filter.price = {};
      if (req.query.minPrice) filter.price.$gte = Number(req.query.minPrice);
      if (req.query.maxPrice) filter.price.$lte = Number(req.query.maxPrice);
    }

    if (cursor) {
      filter._id = { $lt: cursor };
    }

    const products = await Product.find(filter)
      .sort({ _id: -1 })
      .limit(limit + 1)
      .populate('seller', 'name');

    const hasNextPage = products.length > limit;
    if (hasNextPage) products.pop();

    const nextCursor = hasNextPage && products.length > 0 ? products[products.length - 1]._id : null;

    res.json({
      products,
      nextCursor,
      hasNextPage,
    });
  } catch (err) {
    next(err);
  }
};

export const getProductById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('seller', 'name email role createdAt');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // Also fetch up to 4 related products in the same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
      isActive: true,
    })
      .limit(4)
      .select('name price images category stock seller')
      .populate('seller', 'name');

    res.json({
      ...product.toObject(),
      relatedProducts,
    });
  } catch (err) {
    next(err);
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });

    // If demo seller has no products, assign existing products or seed for instant preview
    if (products.length === 0 && (req.user.email === 'demo.seller@souq.test' || req.user.role === 'seller')) {
      const anyProducts = await Product.find().limit(6);
      if (anyProducts.length > 0) {
        await Product.updateMany({ _id: { $in: anyProducts.map((p) => p._id) } }, { seller: req.user._id });
        products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
      }
    }

    res.json(products);
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.create({
      seller: req.user._id,
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      images: Array.isArray(req.body.images) && req.body.images.length > 0
        ? req.body.images
        : ['https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=800'],
      stock: req.body.stock !== undefined ? req.body.stock : 10,
      isActive: true,
    });
    res.status(201).json(product);
  } catch (err) {
    next(err);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to modify this product' });
      return;
    }

    const fields = ['name', 'description', 'price', 'category', 'images', 'stock', 'isActive'];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) (product as any)[f] = req.body[f];
    });

    await product.save();
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.seller.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403).json({ message: 'Not authorized to delete this product' });
      return;
    }

    if (req.query.permanent === 'true') {
      await Product.findByIdAndDelete(req.params.id);
      res.json({ message: 'Product permanently deleted', id: req.params.id });
    } else {
      product.isActive = false;
      await product.save();
      res.json({ message: 'Product deactivated', id: product._id, isActive: false });
    }
  } catch (err) {
    next(err);
  }
};
