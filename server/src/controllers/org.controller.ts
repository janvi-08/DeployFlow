import { Request, Response } from 'express';
import { Organisation } from '../models/Organisation.js';
import { Membership } from '../models/Membership.js';
import { Subscription } from '../models/Subscription.js';
import { AuditLog } from '../models/AuditLog.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { recordUsage } from '../services/usage.service.js';

function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function listUserOrgs(req: Request, res: Response) {
  try {
    // Auto-claim any invitations sent to this user's email
    if (req.user?.email) {
      await Membership.updateMany(
        { invitedEmail: req.user.email.toLowerCase(), $or: [{ userId: { $exists: false } }, { userId: null }] },
        { $set: { userId: req.user.id, acceptedAt: new Date() } }
      );
    }

    const memberships = await Membership.find({ userId: req.user!.id }).populate('orgId');

    const orgs = memberships
      .filter((m) => m.orgId !== null)
      .map((m) => {
        const org = m.orgId as any;
        return {
          id: org._id,
          name: org.name,
          slug: org.slug,
          plan: org.plan,
          subscriptionStatus: org.subscriptionStatus,
          role: m.role,
          createdAt: org.createdAt,
        };
      });

    return apiSuccess(res, orgs);
  } catch (error) {
    return apiError(res, 'Failed to fetch organisations', 500);
  }
}

export async function createOrg(req: Request, res: Response) {
  try {
    const { name, slug: customSlug } = req.body;
    let slug = customSlug ? slugify(customSlug) : slugify(name);

    if (!slug) {
      slug = `org-${Date.now().toString(36)}`;
    }

    // Ensure slug is unique
    const existing = await Organisation.findOne({ slug });
    if (existing) {
      slug = `${slug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const org = await Organisation.create({
      name,
      slug,
      ownerId: req.user!.id,
      plan: 'free',
      subscriptionStatus: 'active',
    });

    // Create owner membership
    await Membership.create({
      orgId: org._id,
      userId: req.user!.id,
      role: 'owner',
      acceptedAt: new Date(),
    });

    // Initialize free subscription
    await Subscription.create({
      orgId: org._id,
      plan: 'free',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      cancelAtPeriodEnd: false,
    });

    // Record team size usage metric
    await recordUsage(org._id, 'team_members', 1);

    await AuditLog.create({
      orgId: org._id,
      actorId: req.user!.id,
      action: 'ORG_CREATED',
      meta: { name: org.name, slug: org.slug },
      at: new Date(),
    });

    return apiSuccess(
      res,
      {
        id: org._id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
        subscriptionStatus: org.subscriptionStatus,
        role: 'owner',
      },
      'Organisation created successfully',
      201
    );
  } catch (error) {
    return apiError(res, 'Failed to create organisation', 500);
  }
}

export async function getOrg(req: Request, res: Response) {
  try {
    const org = req.org!;
    const membership = req.membership;

    return apiSuccess(res, {
      id: org._id,
      name: org.name,
      slug: org.slug,
      plan: org.plan,
      subscriptionStatus: org.subscriptionStatus,
      ownerId: org.ownerId,
      createdAt: org.createdAt,
      currentUserRole: membership?.role || (req.user?.role === 'admin' ? 'admin' : 'member'),
    });
  } catch (error) {
    return apiError(res, 'Failed to get organisation details', 500);
  }
}

export async function updateOrg(req: Request, res: Response) {
  try {
    const { name } = req.body;
    const org = req.org!;

    if (name) {
      org.name = name;
      await org.save();

      await AuditLog.create({
        orgId: org._id,
        actorId: req.user!.id,
        action: 'ORG_UPDATED',
        meta: { name },
        at: new Date(),
      });
    }

    return apiSuccess(
      res,
      {
        id: org._id,
        name: org.name,
        slug: org.slug,
        plan: org.plan,
      },
      'Organisation updated successfully'
    );
  } catch (error) {
    return apiError(res, 'Failed to update organisation', 500);
  }
}
