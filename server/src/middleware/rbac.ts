import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { apiError } from '../utils/apiResponse.js';
import { Membership, IMembership, MemberRole } from '../models/Membership.js';
import { Organisation, IOrganisation } from '../models/Organisation.js';
import { recordUsage } from '../services/usage.service.js';

declare global {
  namespace Express {
    interface Request {
      org?: IOrganisation;
      membership?: IMembership;
    }
  }
}

export function requireSystemAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user || req.user.role !== 'admin') {
    return apiError(res, 'Access denied. Administrator privileges required.', 403);
  }
  next();
}

export function requireOrgRole(allowedRoles: MemberRole[] = ['owner', 'admin', 'member']) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const orgIdParam = req.params.id || req.params.orgId || req.body.orgId || req.query.orgId;

      if (!orgIdParam || !mongoose.Types.ObjectId.isValid(String(orgIdParam))) {
        return apiError(res, 'Valid Organisation ID is required.', 400);
      }

      const org = await Organisation.findById(orgIdParam);
      if (!org) {
        return apiError(res, 'Organisation not found.', 404);
      }

      // Check membership by userId or pending invited email
      let membership = await Membership.findOne({
        orgId: org._id,
        $or: [
          { userId: req.user!.id },
          { invitedEmail: req.user!.email.toLowerCase() },
        ],
      });

      // If user was invited by email, automatically claim and link the membership
      if (membership && !membership.userId && req.user) {
        membership.userId = new mongoose.Types.ObjectId(req.user.id);
        membership.acceptedAt = new Date();
        await membership.save();
      }

      if (!membership) {
        // Superadmin bypass for platform administration
        if (req.user?.role === 'admin') {
          req.org = org;
          return next();
        }
        return apiError(res, 'You are not a member of this organisation.', 403);
      }

      if (!allowedRoles.includes(membership.role)) {
        return apiError(
          res,
          `Permission denied. Requires one of: [${allowedRoles.join(', ')}] role.`,
          403
        );
      }

      req.org = org;
      req.membership = membership;
      // Record API consumption against organization quota
      recordUsage(org._id, 'api_calls', 1).catch(() => {});
      next();
    } catch (error) {
      return apiError(res, 'Error checking organisation permissions.', 500);
    }
  };
}
