import { z } from 'zod';
export declare const createProductSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodString;
    price: z.ZodNumber;
    category: z.ZodString;
    images: z.ZodArray<z.ZodString, "many">;
    stock: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
}, {
    name: string;
    description: string;
    price: number;
    category: string;
    images: string[];
    stock: number;
}>;
export declare const updateProductSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    price: z.ZodOptional<z.ZodNumber>;
    category: z.ZodOptional<z.ZodString>;
    images: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    stock: z.ZodOptional<z.ZodNumber>;
} & {
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    category?: string | undefined;
    images?: string[] | undefined;
    stock?: number | undefined;
    isActive?: boolean | undefined;
}, {
    name?: string | undefined;
    description?: string | undefined;
    price?: number | undefined;
    category?: string | undefined;
    images?: string[] | undefined;
    stock?: number | undefined;
    isActive?: boolean | undefined;
}>;
export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
