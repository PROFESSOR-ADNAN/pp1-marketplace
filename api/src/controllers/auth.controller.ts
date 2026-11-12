import { Request, Response, NextFunction } from 'express';
import {
  registerUser,
  loginUser,
  rotateRefreshToken,
  revokeRefreshToken,
  setupTOTP,
  verifyAndEnableTOTP,
  exportUserData,
  deleteUserAccount,
} from '../services/auth.service.js';
import { AuthRequest } from '../middleware/auth.js';
import { sendWelcomeEmail } from '../services/email.service.js';

const setRefreshCookie = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/api/v1/auth',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, tokens } = await registerUser(req.body);
    setRefreshCookie(res, tokens.refreshToken);

    // Asynchronously send welcome email
    sendWelcomeEmail({
      to: user.email,
      name: user.name,
      role: user.role,
    }).catch((e) => console.error('[Welcome Email Error]:', e.message));

    res.status(201).json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, totpEnabled: user.totpEnabled },
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { user, tokens } = await loginUser(req.body);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, role: user.role, totpEnabled: user.totpEnabled },
      accessToken: tokens.accessToken,
    });
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (!token) {
      res.status(401).json({ message: 'Refresh token cookie missing' });
      return;
    }

    const tokens = await rotateRefreshToken(token);
    setRefreshCookie(res, tokens.refreshToken);
    res.json({ accessToken: tokens.accessToken });
  } catch (err) {
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refreshToken;
    if (token) {
      await revokeRefreshToken(token);
    }
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  res.json({
    id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    totpEnabled: req.user.totpEnabled,
  });
};

export const setupMFA = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const result = await setupTOTP(req.user);
    res.json(result);
  } catch (err) {
    next(err);
  }
};

export const verifyMFA = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await verifyAndEnableTOTP(req.user, req.body.token);
    res.json({ message: 'Two-Factor Authentication enabled successfully' });
  } catch (err) {
    next(err);
  }
};

export const exportData = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = await exportUserData(req.user._id.toString());
    res.json(data);
  } catch (err) {
    next(err);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    await deleteUserAccount(req.user._id.toString());
    res.clearCookie('refreshToken', { path: '/api/v1/auth' });
    res.json({ message: 'Account deleted and personal data anonymized successfully' });
  } catch (err) {
    next(err);
  }
};
