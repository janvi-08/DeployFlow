import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import { Project } from '../models/Project.js';
import { Organisation } from '../models/Organisation.js';
import { Membership } from '../models/Membership.js';
import { apiError } from '../utils/apiResponse.js';

export async function resolveProjectAndOrg(req: Request, res: Response, next: NextFunction) {
  try {
    const orgIdCandidate =
      req.headers['x-org-id'] ||
      req.query.orgId ||
      req.body?.orgId ||
      req.params.orgId;

    if (orgIdCandidate && mongoose.Types.ObjectId.isValid(String(orgIdCandidate))) {
      const org = await Organisation.findById(orgIdCandidate);
      if (org) {
        req.org = org;
        return next();
      }
    }

    // If slug provided in query
    if (req.query.orgSlug) {
      const org = await Organisation.findOne({ slug: String(req.query.orgSlug).toLowerCase() });
      if (org) {
        req.org = org;
        return next();
      }
    }

    // Check if :id is a Project ID or slug
    if (req.params.id) {
      let project = null;
      if (mongoose.Types.ObjectId.isValid(req.params.id)) {
        project = await Project.findById(req.params.id);
      }
      if (!project) {
        project = await Project.findOne({ slug: req.params.id.toLowerCase() });
      }

      if (project) {
        const org = await Organisation.findById(project.organisation);
        if (org) {
          req.org = org;
          return next();
        }
      }
    }

    // Fallback: find first active membership for user
    if (req.user) {
      const membership = await Membership.findOne({ userId: req.user.id });
      if (membership) {
        const org = await Organisation.findById(membership.orgId);
        if (org) {
          req.org = org;
          return next();
        }
      }
    }

    return apiError(res, 'Organization context required for this operation', 400);
  } catch (err) {
    return apiError(res, 'Failed to resolve organization context', 500);
  }
}
