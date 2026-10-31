import { Request, Response, NextFunction } from 'express';
import { sendProblem } from '../utils/problemDetails.js';
import { logger } from '../utils/logger.js';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  logger.error({ err, path: req.originalUrl, method: req.method }, 'Request error encountered');

  if (err.name === 'ZodError') {
    sendProblem(res, 400, 'Validation Error', 'Invalid input data supplied', err.errors);
    return;
  }

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map((e: any) => e.message);
    sendProblem(res, 400, 'Database Validation Error', errors.join(', '));
    return;
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    sendProblem(res, 409, 'Conflict', `${field} already exists`);
    return;
  }

  if (err.name === 'CastError') {
    sendProblem(res, 400, 'Invalid Parameter', `Invalid format for ${err.path}`);
    return;
  }

  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 && process.env.NODE_ENV === 'production'
    ? 'Internal Server Error'
    : err.message || 'An unexpected error occurred';

  sendProblem(res, statusCode, err.title || 'Error', message, undefined, err.code);
};

export const notFound = (req: Request, res: Response): void => {
  sendProblem(res, 404, 'Not Found', `Route not found: ${req.method} ${req.originalUrl}`);
};
