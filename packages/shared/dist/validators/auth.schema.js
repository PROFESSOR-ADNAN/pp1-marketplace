import { z } from 'zod';
import { ROLES } from '../constants/roles.js';
export const registerSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(8, 'Password must be at least 8 characters').max(128),
    role: z.enum([ROLES.BUYER, ROLES.SELLER]).default(ROLES.BUYER),
});
export const loginSchema = z.object({
    email: z.string().email('Invalid email address').toLowerCase(),
    password: z.string().min(1, 'Password is required'),
});
export const totpVerifySchema = z.object({
    token: z.string().length(6, 'TOTP code must be 6 digits'),
});
