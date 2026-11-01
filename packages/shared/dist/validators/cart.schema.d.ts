import { z } from 'zod';
export declare const addToCartSchema: z.ZodObject<{
    productId: z.ZodString;
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    productId: string;
    quantity: number;
}, {
    productId: string;
    quantity: number;
}>;
export declare const updateCartItemSchema: z.ZodObject<{
    quantity: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    quantity: number;
}, {
    quantity: number;
}>;
export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
