import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { healthRouter } from './routes/health.routes.js';
import { authRouter } from './routes/auth.routes.js';
import { orgRouter } from './routes/org.routes.js';
import { billingRouter } from './routes/billing.routes.js';
import { usageRouter } from './routes/usage.routes.js';
import { adminRouter } from './routes/admin.routes.js';
import { telemetryRouter } from './routes/telemetry.routes.js';
import { webhookRouter } from './routes/webhook.routes.js';
import { projectRouter } from './routes/project.routes.js';
import { serveProjectSite, serveDeploymentSite } from './services/siteServer.js';
import { errorHandler } from './middleware/errorHandler.js';
import { apiError } from './utils/apiResponse.js';

export const app = express();

// Security and middleware
app.use(
  cors({
    origin: [env.CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);

app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Top-level liveness and readiness probes
app.use(healthRouter);

// Real Live Site Serving Engine (Serves deployed apps like Vercel / Netlify)
app.get(['/sites/:projectSlug', '/sites/:projectSlug/*'], serveProjectSite);
app.get(['/live/:deploymentId', '/live/:deploymentId/*'], serveDeploymentSite);

// API routes
app.use('/api/auth', authRouter);
app.use('/api/orgs', orgRouter);
app.use('/api/projects', projectRouter);
app.use('/api/billing', billingRouter);
app.use('/api/usage', usageRouter);
app.use('/api/admin', adminRouter);
app.use('/api/telemetry', telemetryRouter);
app.use('/api/webhooks', webhookRouter);

// 404 Handler for undefined API routes
app.use((_req, res) => {
  return apiError(res, 'Resource not found', 404);
});

// Centralized error handling
app.use(errorHandler);
