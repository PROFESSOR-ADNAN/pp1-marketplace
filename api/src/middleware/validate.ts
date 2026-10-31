import { Request, Response, NextFunction } from 'express';
import { AnyZodObject } from 'zod';
import { sanitizeObject } from '../utils/sanitize.js';

export const validate = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = sanitizeObject(req.body);
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (err) {
      next(err);
    }
  };
};
