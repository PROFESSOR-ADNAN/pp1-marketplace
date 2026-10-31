import { Redis } from 'ioredis';
import { config } from './env.js';

export const redis = new Redis(config.redisUri, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
  lazyConnect: true,
});

redis.on('connect', () => console.log('[Cache] Redis connected'));
redis.on('error', (err) => console.error('[Cache] Redis connection error:', err.message));
