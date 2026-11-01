export declare const CURRENCY: {
    readonly ETB: "ETB";
};
export type Currency = (typeof CURRENCY)[keyof typeof CURRENCY];
export declare const SANTIM_PER_ETB = 100;
export declare const toSantim: (etb: number) => number;
export declare const toETB: (santim: number) => number;
export declare const formatETB: (santim: number) => string;
