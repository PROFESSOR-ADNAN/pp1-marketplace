import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';

export const generateAccessToken = (payload: { id: string; role: string; email: string }): string => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as any,
  });
};

export const verifyAccessToken = (token: string): any => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const generateRefreshTokenString = (): string => {
  return crypto.randomBytes(40).toString('hex');
};

export const hashToken = (token: string): string => {
  return crypto.createHash('sha256').update(token).digest('hex');
};
