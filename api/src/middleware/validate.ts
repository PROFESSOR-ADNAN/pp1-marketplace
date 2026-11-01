import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';
import { sanitizeObject } from '../utils/sanitize.js';

export const validate = (schema: ZodTypeAny) => {
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
