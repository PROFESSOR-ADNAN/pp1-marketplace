import { z } from 'zod';
export const addToCartSchema = z.object({
    productId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid Product ID'),
    quantity: z.number().int().positive('Quantity must be >= 1'),
});
export const updateCartItemSchema = z.object({
    quantity: z.number().int().positive('Quantity must be >= 1'),
});
