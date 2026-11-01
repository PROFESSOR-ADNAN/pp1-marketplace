export declare const ORDER_STATUS: {
    readonly PENDING_PAYMENT: "PENDING_PAYMENT";
    readonly PAID: "PAID";
    readonly CONFIRMED_BY_SELLER: "CONFIRMED_BY_SELLER";
    readonly SHIPPED: "SHIPPED";
    readonly DELIVERED: "DELIVERED";
    readonly CANCELLED: "CANCELLED";
    readonly EXPIRED: "EXPIRED";
    readonly REFUNDED: "REFUNDED";
};
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export declare const PAYMENT_STATUS: {
    readonly PENDING: "pending";
    readonly SUCCESS: "success";
    readonly FAILED: "failed";
};
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
