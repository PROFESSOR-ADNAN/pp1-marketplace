import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { startReservationExpiryWorker } from './queues/reservationExpiry.worker.js';
import { startEmailWorker } from './queues/email.worker.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/souq_marketplace?replicaSet=rs0';

const run = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('[Worker] Connected to MongoDB');

    startReservationExpiryWorker();
    startEmailWorker();

    console.log('[Worker] All BullMQ workers running and listening for jobs.');
  } catch (err: any) {
    console.error('[Worker] Startup error:', err.message);
    process.exit(1);
  }
};

run();
