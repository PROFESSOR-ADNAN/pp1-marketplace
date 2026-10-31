import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  getMe,
  setupMFA,
  verifyMFA,
  exportData,
  deleteAccount,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { registerSchema, loginSchema, totpVerifySchema } from '@souq/shared';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.get('/me', protect, getMe);
router.post('/totp/setup', protect, setupMFA);
router.post('/totp/verify', protect, validate(totpVerifySchema), verifyMFA);
router.get('/data-export', protect, exportData);
router.delete('/account', protect, deleteAccount);

export default router;
