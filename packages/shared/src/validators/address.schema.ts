import { z } from 'zod';

export const addressSchema = z.object({
  region: z.string().min(2).max(100),
  city: z.string().min(2).max(100),
  subCity: z.string().min(2).max(100),
  woreda: z.string().max(50).optional(),
  landmark: z.string().min(3, 'Landmark is required for delivery guidance').max(200),
  phone: z.string().regex(/^\+251[79]\d{8}$/, 'Must be a valid Ethiopian phone number (+2519... or +2517...)'),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
