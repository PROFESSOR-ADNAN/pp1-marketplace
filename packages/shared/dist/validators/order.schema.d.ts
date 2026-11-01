import { z } from 'zod';
export declare const checkoutSchema: z.ZodEffects<z.ZodObject<{
    addressId: z.ZodOptional<z.ZodString>;
    deliveryAddress: z.ZodOptional<z.ZodObject<{
        region: z.ZodString;
        city: z.ZodString;
        subCity: z.ZodString;
        woreda: z.ZodOptional<z.ZodString>;
        landmark: z.ZodString;
        phone: z.ZodString;
        isDefault: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        region: string;
        city: string;
        subCity: string;
        landmark: string;
        phone: string;
        isDefault: boolean;
        woreda?: string | undefined;
    }, {
        region: string;
        city: string;
        subCity: string;
        landmark: string;
        phone: string;
        woreda?: string | undefined;
        isDefault?: boolean | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    addressId?: string | undefined;
    deliveryAddress?: {
        region: string;
        city: string;
        subCity: string;
        landmark: string;
        phone: string;
        isDefault: boolean;
        woreda?: string | undefined;
    } | undefined;
}, {
    addressId?: string | undefined;
    deliveryAddress?: {
        region: string;
        city: string;
        subCity: string;
        landmark: string;
        phone: string;
        woreda?: string | undefined;
        isDefault?: boolean | undefined;
    } | undefined;
}>, {
    addressId?: string | undefined;
    deliveryAddress?: {
        region: string;
        city: string;
        subCity: string;
        landmark: string;
        phone: string;
        isDefault: boolean;
        woreda?: string | undefined;
    } | undefined;
}, {
    addressId?: string | undefined;
    deliveryAddress?: {
        region: string;
        city: string;
        subCity: string;
        landmark: string;
        phone: string;
        woreda?: string | undefined;
        isDefault?: boolean | undefined;
    } | undefined;
}>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
