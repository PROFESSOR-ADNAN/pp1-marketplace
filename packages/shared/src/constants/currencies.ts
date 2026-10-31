export const CURRENCY = {
  ETB: 'ETB',
} as const;

export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];

export const SANTIM_PER_ETB = 100;

export const toSantim = (etb: number): number => Math.round(etb * SANTIM_PER_ETB);
export const toETB = (santim: number): number => santim / SANTIM_PER_ETB;
export const formatETB = (santim: number): string =>
  new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(toETB(santim));
