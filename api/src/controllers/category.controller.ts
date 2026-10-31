import { Request, Response, NextFunction } from 'express';
import Category from '../models/Category.js';

export const getCategories = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json(categories);
  } catch (err) {
    next(err);
  }
};

export const createCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { name, description, icon } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const category = await Category.create({ name, slug, description, icon });
    res.status(201).json(category);
  } catch (err) {
    next(err);
  }
};
