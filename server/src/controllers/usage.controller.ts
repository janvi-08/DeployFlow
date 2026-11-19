import { Request, Response } from 'express';
import { getOrgUsageSummary, verifyAndConsumeQuota, recordUsage } from '../services/usage.service.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { UsageMetric } from '../models/UsageRecord.js';
import { Deployment } from '../models/Deployment.js';

export async function getUsage(req: Request, res: Response) {
  try {
    const org = req.org!;
    const { metric } = req.query;

    const summary = await getOrgUsageSummary(org._id);

    if (metric && typeof metric === 'string') {
      const metricData = summary.metrics[metric as UsageMetric];
      if (!metricData) {
        return apiError(res, `Unknown usage metric: ${metric}`, 400);
      }
      return apiSuccess(res, {
        plan: summary.plan,
        periodStart: summary.periodStart,
        metric: metricData,
      });
    }

    return apiSuccess(res, summary);
  } catch (error) {
    return apiError(res, 'Failed to fetch usage analytics', 500);
  }
}

export async function simulateDeployment(req: Request, res: Response) {
  try {
    const org = req.org!;

    // Quota check and consumption
    const check = await verifyAndConsumeQuota(org._id, 'deployments', 1);

    if (!check.allowed) {
      return res.status(429).json({
        success: false,
        message: `Plan limit exceeded: You have reached your monthly deployment limit (${check.limit} deployments). Please upgrade your subscription plan.`,
        quota: {
          metric: 'deployments',
          current: check.current,
          limit: check.limit,
        },
      });
    }

    // Also consume build minutes (+3) and webhook API calls (+5)
    await recordUsage(org._id, 'build_minutes', 3);
    await recordUsage(org._id, 'api_calls', 5);

    const deploymentId = `dep-${Date.now().toString(36)}`;
    await Deployment.create({
      organisation: org._id,
      deploymentId,
      commit: Math.random().toString(16).slice(2, 9),
      message: 'Interactive deployment simulation executed',
      branch: 'main',
      status: 'Completed',
      duration: '3.6s',
      environment: 'simulation',
      sender: req.user?.email || 'admin',
    });

    return apiSuccess(
      res,
      {
        deploymentId,
        status: 'queued',
        metric: 'deployments',
        currentUsage: check.current,
        quotaLimit: check.limit,
        timestamp: new Date(),
      },
      'Deployment queued successfully and quota consumed'
    );
  } catch (error) {
    return apiError(res, 'Failed to trigger simulated deployment', 500);
  }
}

export async function simulateApiCalls(req: Request, res: Response) {
  try {
    const org = req.org!;
    const count = Number(req.body.count) || 25;

    const check = await verifyAndConsumeQuota(org._id, 'api_calls', count);

    if (!check.allowed) {
      return res.status(429).json({
        success: false,
        message: `Plan limit exceeded: You have reached your monthly API limit (${check.limit} calls). Upgrade plan to continue.`,
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
        metric: 'api_calls',
        added: count,
        currentUsage: check.current,
        quotaLimit: check.limit,
      },
      `Successfully processed ${count} API calls`
    );
  } catch (error) {
    return apiError(res, 'Failed to process API calls', 500);
  }
}
