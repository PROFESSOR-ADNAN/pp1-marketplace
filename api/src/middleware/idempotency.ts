import { Request, Response, NextFunction } from 'express';
import { redis } from '../config/redis.js';
import { sendProblem } from '../utils/problemDetails.js';

export const idempotency = (prefix: string = 'idemp:') => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = req.headers['idempotency-key'] as string;
    if (!key) return next();

    const cacheKey = `${prefix}${key}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        res.status(parsed.status).json(parsed.body);
        return;
      }

      const originalJson = res.json.bind(res);
      res.json = (body: any) => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(cacheKey, JSON.stringify({ status: res.statusCode, body }), 'EX', 86400).catch(() => {});
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      next();
    }
  };
};
