import mongoose from 'mongoose';
import { config } from './env.js';

let isConnected = false;

export const connectDB = async (): Promise<void> => {
  if (isConnected || mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(config.mongoUri);
    isConnected = true;
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (err: any) {
    console.error(`[Database] MongoDB connection error: ${err.message}`);
    throw err;
  }
};
