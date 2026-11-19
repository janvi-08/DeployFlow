import { Request, Response } from 'express';
import os from 'os';
import { Organisation } from '../models/Organisation.js';
import { Subscription } from '../models/Subscription.js';
import { FeatureFlag } from '../models/FeatureFlag.js';
import { User } from '../models/User.js';
import { UsageRecord } from '../models/UsageRecord.js';
import { isDBConnected } from '../config/db.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export async function listAllOrgs(_req: Request, res: Response) {
  try {
    const orgs = await Organisation.find()
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    const formatted = orgs.map((o) => ({
      id: o._id,
      name: o.name,
      slug: o.slug,
      plan: o.plan,
      subscriptionStatus: o.subscriptionStatus,
      owner: o.ownerId
        ? {
            id: (o.ownerId as any)._id,
            name: (o.ownerId as any).name,
            email: (o.ownerId as any).email,
          }
        : null,
      createdAt: o.createdAt,
    }));

    return apiSuccess(res, formatted);
  } catch (error) {
    return apiError(res, 'Failed to fetch platform organisations', 500);
  }
}

export async function listSubscriptions(_req: Request, res: Response) {
  try {
    const subs = await Subscription.find().populate('orgId', 'name slug').sort({ createdAt: -1 });

    const formatted = subs.map((s) => ({
      id: s._id,
      org: s.orgId ? { id: (s.orgId as any)._id, name: (s.orgId as any).name } : null,
      plan: s.plan,
      status: s.status,
      currentPeriodEnd: s.currentPeriodEnd,
      cancelAtPeriodEnd: s.cancelAtPeriodEnd,
    }));

    return apiSuccess(res, formatted);
  } catch (error) {
    return apiError(res, 'Failed to fetch platform subscriptions', 500);
  }
}

export async function getFeatureFlags(_req: Request, res: Response) {
  try {
    // Seed default feature flags if none exist
    const count = await FeatureFlag.countDocuments();
    if (count === 0) {
      await FeatureFlag.create([
        {
          key: 'canary_deployments',
          description: 'Enable canary deployment rollout strategies for CI/CD pipelines',
          enabledForPlans: ['pro', 'enterprise'],
          rolloutPct: 100,
          enabled: true,
        },
        {
          key: 'ai_build_analyzer',
          description: 'Automatic AI root-cause analysis for failed deployment logs',
          enabledForPlans: ['enterprise'],
          rolloutPct: 50,
          enabled: false,
        },
        {
          key: 'multi_region_clusters',
          description: 'Deploy workloads simultaneously to multi-region Kubernetes clusters',
          enabledForPlans: ['enterprise'],
          rolloutPct: 100,
          enabled: true,
        },
      ]);
    }

    const flags = await FeatureFlag.find().sort({ key: 1 });
    return apiSuccess(res, flags);
  } catch (error) {
    return apiError(res, 'Failed to retrieve feature flags', 500);
  }
}

export async function updateFeatureFlag(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const { enabled, enabledForPlans, rolloutPct, description } = req.body;

    const flag = await FeatureFlag.findOneAndUpdate(
      { key },
      {
        ...(enabled !== undefined ? { enabled } : {}),
        ...(enabledForPlans !== undefined ? { enabledForPlans } : {}),
        ...(rolloutPct !== undefined ? { rolloutPct } : {}),
        ...(description !== undefined ? { description } : {}),
      },
      { new: true, upsert: true }
    );

    return apiSuccess(res, flag, `Feature flag '${key}' updated`);
  } catch (error) {
    return apiError(res, 'Failed to update feature flag', 500);
  }
}

export async function getSystemHealth(_req: Request, res: Response) {
  try {
    const [userCount, orgCount, totalDeployments] = await Promise.all([
      User.countDocuments(),
      Organisation.countDocuments(),
      UsageRecord.aggregate([
        { $match: { metric: 'deployments' } },
        { $group: { _id: null, total: { $sum: '$quantity' } } },
      ]),
    ]);

    const mem = process.memoryUsage();

    return apiSuccess(res, {
      status: 'healthy',
      database: isDBConnected() ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      nodeVersion: process.version,
      platform: os.platform(),
      cpus: os.cpus().length,
      memory: {
        rssMb: Math.round(mem.rss / 1024 / 1024),
        heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        heapTotalMb: Math.round(mem.heapTotal / 1024 / 1024),
      },
      metrics: {
        totalUsers: userCount,
        totalOrganisations: orgCount,
        totalDeploymentsRecorded: totalDeployments[0]?.total || 0,
      },
    });
  } catch (error) {
    return apiError(res, 'Failed to retrieve system health metrics', 500);
  }
}
