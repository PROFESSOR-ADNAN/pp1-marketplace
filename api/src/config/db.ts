import mongoose from 'mongoose';
import { config } from './env.js';

export const connectDB = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.mongoUri);
    console.log(`[Database] MongoDB connected: ${conn.connection.host}`);
  } catch (err: any) {
    console.error(`[Database] MongoDB connection error: ${err.message}`);
    process.exit(1);
  }
};
