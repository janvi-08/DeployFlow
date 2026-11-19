import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';
import { Organisation } from '../models/Organisation.js';
import { recordUsage, verifyAndConsumeQuota } from '../services/usage.service.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export const telemetryRouter = Router();

/**
 * Public/SDK Telemetry endpoint:
 * Simulates external microservice reporting an API call to DeployFlow
 */
telemetryRouter.post('/api-call', async (req: Request, res: Response) => {
  try {
    const { orgId, count = 1, apiKey } = req.body;

    if (!orgId) {
      return apiError(res, 'orgId or organization slug is required for telemetry reporting.', 400);
    }

    // Lookup org by ObjectId or slug
    let org = null;
    if (mongoose.Types.ObjectId.isValid(String(orgId))) {
      org = await Organisation.findById(orgId);
    }
    if (!org) {
      org = await Organisation.findOne({ slug: String(orgId).toLowerCase() });
    }

    if (!org) {
      return apiError(res, `Organisation '${orgId}' not found. Verify your API credentials.`, 404);
    }

    const incrementCount = Math.max(1, Number(count) || 1);
    const check = await verifyAndConsumeQuota(org._id, 'api_calls', incrementCount);

    if (!check.allowed) {
      return res.status(429).json({
        success: false,
        message: `DeployFlow Rate-Limit Exceeded: Monthly quota of ${check.limit} API calls reached for '${org.name}'. Upgrade subscription to continue.`,
        quota: {
          metric: 'api_calls',
          current: check.current,
          limit: check.limit,
        },
      });
    }

    return apiSuccess(
      res,
      {
        telemetry: 'processed',
        organisation: org.name,
        slug: org.slug,
        metric: 'api_calls',
        added: incrementCount,
        currentUsage: check.current,
        quotaLimit: check.limit,
        timestamp: new Date(),
      },
      `Successfully ingested ${incrementCount} API call event(s)`
    );
  } catch (error) {
    return apiError(res, 'Telemetry ingestion failed', 500);
  }
});
