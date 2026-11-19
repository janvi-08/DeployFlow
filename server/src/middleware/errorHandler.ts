import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { apiError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  logger.error(
    {
      err: {
        message: err.message,
        stack: env.NODE_ENV === 'development' ? err.stack : undefined,
      },
      method: req.method,
      url: req.originalUrl,
    },
    'Unhandled request error'
  );

  if (res.headersSent) {
    return;
  }

  return apiError(
    res,
    env.NODE_ENV === 'production' ? 'An unexpected internal error occurred' : err.message,
    500
  );
}
