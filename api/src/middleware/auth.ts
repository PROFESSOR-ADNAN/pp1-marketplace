import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/token.js';
import { sendProblem } from '../utils/problemDetails.js';
import User from '../models/User.js';

export interface AuthRequest extends Request {
  user?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    sendProblem(res, 401, 'Unauthorized', 'Authentication token missing or invalid');
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      sendProblem(res, 401, 'Unauthorized', 'User no longer exists');
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    sendProblem(res, 401, 'Unauthorized', 'Invalid or expired access token');
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      sendProblem(res, 403, 'Forbidden', `Access requires one of roles: ${roles.join(', ')}`);
      return;
    }
    next();
  };
};

export const requireTOTP = (req: AuthRequest, res: Response, next: NextFunction): void => {
  if (req.user && req.user.role === 'admin') {
    // Demo admin or development/test environments are exempt from TOTP lockout
    if (req.user.email === 'admin@souq.test' || req.user.totpEnabled || process.env.NODE_ENV !== 'production') {
      return next();
    }
    sendProblem(res, 403, 'MFA Required', 'Admin operations require Two-Factor Authentication setup');
    return;
  }
  next();
};
