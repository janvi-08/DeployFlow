import { Request, Response, NextFunction } from 'express';
import { apiError } from '../utils/apiResponse.js';
import { UsageMetric } from '../models/UsageRecord.js';
import { verifyAndConsumeQuota } from '../services/usage.service.js';

export function enforceQuota(metric: UsageMetric, amount = 1) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgId = req.org?._id || req.params.id || req.params.orgId || req.body.orgId || req.query.orgId;

      if (!orgId) {
        return apiError(res, 'Organisation context required for quota enforcement.', 400);
      }

      const check = await verifyAndConsumeQuota(orgId, metric, amount);

      if (!check.allowed) {
        return res.status(429).json({
          success: false,
          message: `Plan limit reached for ${metric}. Used ${check.current} of ${check.limit} allowed. Please upgrade your plan to continue.`,
          quota: {
            metric,
            current: check.current,
            limit: check.limit,
          },
        });
      }

      next();
    } catch (err) {
      return apiError(res, 'Error verifying usage quota limits.', 500);
    }
  };
}
