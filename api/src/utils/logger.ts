import pino from 'pino';
import { config } from '../config/env.js';

export const logger = pino({
  level: config.env === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['req.headers.authorization', 'req.headers.cookie', 'password', 'token', 'phone', 'email'],
    censor: '[REDACTED]',
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});
