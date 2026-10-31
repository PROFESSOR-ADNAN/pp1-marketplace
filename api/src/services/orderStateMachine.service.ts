import mongoose from 'mongoose';
import Order, { IOrder } from '../models/Order.js';
import AuditLog from '../models/AuditLog.js';
import { ORDER_STATUS, OrderStatus, ROLES } from '@souq/shared';
import { releaseReservation, commitReservation } from './inventory.service.js';

export class InvalidStateTransitionError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateTransitionError';
    this.statusCode = 400;
  }
}

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.PENDING_PAYMENT]: [ORDER_STATUS.PAID, ORDER_STATUS.EXPIRED, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.PAID]: [ORDER_STATUS.CONFIRMED_BY_SELLER, ORDER_STATUS.CANCELLED],
  [ORDER_STATUS.CONFIRMED_BY_SELLER]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: [],
  [ORDER_STATUS.CANCELLED]: [ORDER_STATUS.REFUNDED],
  [ORDER_STATUS.EXPIRED]: [],
  [ORDER_STATUS.REFUNDED]: [],
};

export const transitionOrder = async (
  orderId: string | mongoose.Types.ObjectId,
  toStatus: OrderStatus,
  actor: { id: string; role: string }
): Promise<IOrder> => {
  const session = await mongoose.startSession();
  let updatedOrder: IOrder | null = null;

  await session.withTransaction(async () => {
    const order = await Order.findById(orderId).session(session);
    if (!order) {
      const err: any = new Error('Order not found');
      err.statusCode = 404;
      throw err;
    }

    const currentStatus = order.status;
    const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowed.includes(toStatus)) {
      throw new InvalidStateTransitionError(
        `Illegal order state transition from ${currentStatus} to ${toStatus}`
      );
    }

    // Role permission check
    if (toStatus === ORDER_STATUS.CONFIRMED_BY_SELLER || toStatus === ORDER_STATUS.SHIPPED) {
      if (actor.role !== ROLES.SELLER && actor.role !== ROLES.ADMIN) {
        const err: any = new Error('Only seller or admin can confirm and ship orders');
        err.statusCode = 403;
        throw err;
      }
    }

    if (toStatus === ORDER_STATUS.DELIVERED) {
      if (actor.id !== order.buyer.toString() && actor.role !== ROLES.ADMIN) {
        const err: any = new Error('Only buyer or admin can confirm delivery');
        err.statusCode = 403;
        throw err;
      }
    }

    // Side effects on stock and reservations
    if (toStatus === ORDER_STATUS.PAID) {
      await commitReservation(order._id as mongoose.Types.ObjectId, session);
    } else if (toStatus === ORDER_STATUS.CANCELLED || toStatus === ORDER_STATUS.EXPIRED) {
      await releaseReservation(order._id as mongoose.Types.ObjectId, session);
    }

    order.status = toStatus;
    await order.save({ session });

    await AuditLog.create(
      [
        {
          action: `ORDER_TRANSITION_${toStatus}`,
          userId: actor.id,
          resourceType: 'Order',
          resourceId: order._id.toString(),
          details: { from: currentStatus, to: toStatus },
        },
      ],
      { session }
    );

    updatedOrder = order;
  });

  session.endSession();
  return updatedOrder!;
};
