import mongoose from 'mongoose';
import Product from '../models/Product.js';
import InventoryReservation from '../models/InventoryReservation.js';

export class OversoldError extends Error {
  statusCode: number;
  constructor(message: string) {
    super(message);
    this.name = 'OversoldError';
    this.statusCode = 409;
  }
}

export interface ReservationLine {
  productId: string | mongoose.Types.ObjectId;
  quantity: number;
}

export const reserveStockForOrder = async (
  orderId: mongoose.Types.ObjectId,
  items: ReservationLine[],
  session: mongoose.ClientSession
): Promise<void> => {
  const reservedLines: ReservationLine[] = [];

  try {
    for (const item of items) {
      const updated = await Product.findOneAndUpdate(
        { _id: item.productId, isActive: true, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity, reserved: +item.quantity } },
        { session, new: true }
      );

      if (!updated) {
        throw new OversoldError(`Product ${item.productId} has insufficient stock`);
      }
      reservedLines.push(item);
    }

    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes TTL
    await InventoryReservation.create(
      [
        {
          orderId,
          items: reservedLines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
          status: 'active',
          expiresAt,
        },
      ],
      { session }
    );
  } catch (err) {
    throw err;
  }
};

export const commitReservation = async (
  orderId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession
): Promise<void> => {
  const reservation = await InventoryReservation.findOne({ orderId });
  if (!reservation || reservation.status !== 'active') return;

  for (const item of reservation.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { reserved: -item.quantity } },
      session ? { session } : {}
    );
  }

  reservation.status = 'committed';
  await reservation.save(session ? { session } : {});
};

export const releaseReservation = async (
  orderId: mongoose.Types.ObjectId,
  session?: mongoose.ClientSession
): Promise<void> => {
  const reservation = await InventoryReservation.findOne({ orderId });
  if (!reservation || reservation.status !== 'active') return;

  for (const item of reservation.items) {
    await Product.findByIdAndUpdate(
      item.productId,
      { $inc: { stock: +item.quantity, reserved: -item.quantity } },
      session ? { session } : {}
    );
  }

  reservation.status = 'released';
  await reservation.save(session ? { session } : {});
};
