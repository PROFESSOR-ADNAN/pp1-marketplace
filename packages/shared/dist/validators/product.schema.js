import { z } from 'zod';
export const createProductSchema = z.object({
    name: z.string().min(3).max(200),
    description: z.string().min(10).max(5000),
    price: z.number().int().positive('Price in santim must be positive integer'),
    category: z.string().min(2).max(50),
    images: z.array(z.string().url()).min(1, 'At least one image is required'),
    stock: z.number().int().nonnegative('Stock cannot be negative'),
});
export const updateProductSchema = createProductSchema.partial().extend({
    isActive: z.boolean().optional(),
});
