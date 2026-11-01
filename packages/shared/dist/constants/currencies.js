export const CURRENCY = {
    ETB: 'ETB',
};
export const SANTIM_PER_ETB = 100;
export const toSantim = (etb) => Math.round(etb * SANTIM_PER_ETB);
export const toETB = (santim) => santim / SANTIM_PER_ETB;
export const formatETB = (santim) => new Intl.NumberFormat('en-ET', { style: 'currency', currency: 'ETB' }).format(toETB(santim));
