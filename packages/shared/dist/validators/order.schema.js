import { z } from 'zod';
import { addressSchema } from './address.schema.js';
export const checkoutSchema = z.object({
    addressId: z.string().regex(/^[0-9a-fA-F]{24}$/).optional(),
    deliveryAddress: addressSchema.optional(),
    returnUrl: z.string().url().optional(),
}).refine((data) => data.addressId || data.deliveryAddress, {
    message: 'Either addressId or deliveryAddress is required',
});
