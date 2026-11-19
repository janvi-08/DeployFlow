import mongoose from 'mongoose';
import { UsageRecord, UsageMetric } from '../models/UsageRecord.js';
import { Organisation } from '../models/Organisation.js';
import { PLANS } from '../config/plans.js';

export function getPeriodStart(date = new Date()): Date {
  // Current calendar month starting point
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export async function recordUsage(
  orgId: string | mongoose.Types.ObjectId,
  metric: UsageMetric,
  quantity = 1
): Promise<number> {
  const periodStart = getPeriodStart();

  const record = await UsageRecord.findOneAndUpdate(
    { orgId, metric, periodStart },
    { $inc: { quantity } },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  return record.quantity;
}

export async function getCurrentPeriodUsage(
  orgId: string | mongoose.Types.ObjectId,
  metric: UsageMetric
): Promise<number> {
  const periodStart = getPeriodStart();
  const record = await UsageRecord.findOne({ orgId, metric, periodStart });
  return record?.quantity ?? 0;
}

export interface UsageMetricSummary {
  metric: UsageMetric;
  current: number;
  limit: number;
  percentage: number;
  exceeded: boolean;
}

export async function getOrgUsageSummary(
  orgId: string | mongoose.Types.ObjectId
): Promise<{
  plan: string;
  periodStart: Date;
  metrics: Record<UsageMetric, UsageMetricSummary>;
}> {
  const org = await Organisation.findById(orgId);
  const planKey = org?.plan || 'free';
  const planConfig = PLANS[planKey] || PLANS.free;
  const periodStart = getPeriodStart();

  const records = await UsageRecord.find({ orgId, periodStart });
  const recordMap = new Map<string, number>();
  records.forEach((r) => recordMap.set(r.metric, r.quantity));

  const allMetrics: UsageMetric[] = ['deployments', 'api_calls', 'build_minutes', 'team_members'];
  const metricsResult = {} as Record<UsageMetric, UsageMetricSummary>;

  for (const m of allMetrics) {
    const current = recordMap.get(m) ?? 0;
    const limit = planConfig.quotas[m] ?? 100;
    const percentage = limit > 0 ? Math.min(100, Math.round((current / limit) * 100)) : 0;
    metricsResult[m] = {
      metric: m,
      current,
      limit,
      percentage,
      exceeded: current >= limit,
    };
  }

  return {
    plan: planKey,
    periodStart,
    metrics: metricsResult,
  };
}

export async function verifyAndConsumeQuota(
  orgId: string | mongoose.Types.ObjectId,
  metric: UsageMetric,
  quantity = 1
): Promise<{ allowed: boolean; current: number; limit: number }> {
  const org = await Organisation.findById(orgId);
  const planKey = org?.plan || 'free';
  const planConfig = PLANS[planKey] || PLANS.free;
  const limit = planConfig.quotas[metric];

  const current = await getCurrentPeriodUsage(orgId, metric);

  if (current + quantity > limit) {
    return { allowed: false, current, limit };
  }

  const updated = await recordUsage(orgId, metric, quantity);
  return { allowed: true, current: updated, limit };
}
