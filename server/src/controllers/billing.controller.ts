import { Request, Response } from 'express';
import { PLANS } from '../config/plans.js';
import { Subscription } from '../models/Subscription.js';
import { Organisation } from '../models/Organisation.js';
import { AuditLog } from '../models/AuditLog.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';

export function getPlans(_req: Request, res: Response) {
  const planList = Object.values(PLANS);
  return apiSuccess(res, planList);
}

export async function getSubscription(req: Request, res: Response) {
  try {
    const org = req.org!;

    let subscription = await Subscription.findOne({ orgId: org._id });
    if (!subscription) {
      subscription = await Subscription.create({
        orgId: org._id,
        plan: org.plan || 'free',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      });
    }

    const planConfig = PLANS[subscription.plan] || PLANS.free;

    return apiSuccess(res, {
      subscription,
      planDetails: planConfig,
      billingMode: 'development_sandbox', // Transparent indicator
    });
  } catch (error) {
    return apiError(res, 'Failed to retrieve subscription information', 500);
  }
}

export async function changePlan(req: Request, res: Response) {
  try {
    const { orgId, plan } = req.body;

    if (!PLANS[plan as keyof typeof PLANS]) {
      return apiError(res, 'Invalid plan selection.', 400);
    }

    const org = await Organisation.findById(orgId);
    if (!org) {
      return apiError(res, 'Organisation not found', 404);
    }

    // Update org plan
    org.plan = plan;
    await org.save();

    // Update subscription record
    let subscription = await Subscription.findOne({ orgId: org._id });
    if (!subscription) {
      subscription = new Subscription({ orgId: org._id });
    }

    subscription.plan = plan;
    subscription.status = 'active';
    subscription.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await subscription.save();

    await AuditLog.create({
      orgId: org._id,
      actorId: req.user!.id,
      action: 'PLAN_CHANGED',
      meta: { newPlan: plan, mode: 'development_plan_switch' },
      at: new Date(),
    });

    return apiSuccess(
      res,
      {
        plan,
        subscription,
        message: `Plan upgraded to ${PLANS[plan as keyof typeof PLANS].name} in development mode.`,
      },
      'Subscription plan updated successfully'
    );
  } catch (error) {
    return apiError(res, 'Failed to change subscription plan', 500);
  }
}
