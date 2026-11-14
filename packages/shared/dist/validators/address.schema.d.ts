import { z } from 'zod';
export declare const addressSchema: z.ZodObject<{
    region: z.ZodString;
    city: z.ZodString;
    subCity: z.ZodString;
    woreda: z.ZodOptional<z.ZodString>;
    landmark: z.ZodString;
    phone: z.ZodEffects<z.ZodString, string, string>;
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
}>;
export type AddressInput = z.infer<typeof addressSchema>;
