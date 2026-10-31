import { Worker } from 'bullmq';
import mongoose from 'mongoose';
import { redisConnection } from '../config/redis.js';

export const startReservationExpiryWorker = () => {
  const worker = new Worker(
    'inventory-reservation-expiry',
    async (job) => {
      const { orderId } = job.data;
      console.log(`[Worker] Checking reservation expiry for order: ${orderId}`);

      const InventoryReservation = mongoose.model('InventoryReservation');
      const Product = mongoose.model('Product');
      const Order = mongoose.model('Order');

      const reservation: any = await InventoryReservation.findOne({ orderId, status: 'active' });
      if (!reservation) return;

      if (new Date() >= new Date(reservation.expiresAt)) {
        console.log(`[Worker] Releasing expired reservation for order ${orderId}`);
        for (const item of reservation.items) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: +item.quantity, reserved: -item.quantity },
          });
        }
        reservation.status = 'released';
        await reservation.save();

        await Order.findByIdAndUpdate(orderId, { status: 'EXPIRED' });
      }
    },
    { connection: redisConnection as any, concurrency: 5 }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Reservation job ${job?.id} failed:`, err.message);
  });

  return worker;
};
