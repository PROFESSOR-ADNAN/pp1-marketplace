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
    const product = await Product.findOne({ _id: req.params.id, isActive: true }).populate('seller', 'name');
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    res.json(product);
  } catch (err) {
    next(err);
  }
};

export const getMyProducts = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({ createdAt: -1 });
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
      images: req.body.images,
      stock: req.body.stock,
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

    product.isActive = false;
    await product.save();
    res.json({ message: 'Product deactivated' });
  } catch (err) {
    next(err);
  }
};
