import { Router, Request, Response } from 'express';
import { isDBConnected } from '../config/db.js';

export const healthRouter = Router();

// Liveness check: confirms process is alive and responsive
healthRouter.get('/healthz', (_req: Request, res: Response) => {
  return res.status(200).json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Readiness check: verifies critical dependencies like database
healthRouter.get('/readyz', (_req: Request, res: Response) => {
  const dbOk = isDBConnected();

  if (!dbOk) {
    return res.status(503).json({
      status: 'degraded',
      database: 'disconnected',
      timestamp: new Date().toISOString(),
    });
  }

  return res.status(200).json({
    status: 'ready',
    database: 'connected',
    timestamp: new Date().toISOString(),
  });
});
