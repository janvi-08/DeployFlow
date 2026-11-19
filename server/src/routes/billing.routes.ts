import { Router } from 'express';
import {
  getPlans,
  getSubscription,
  changePlan,
} from '../controllers/billing.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrgRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import { changePlanSchema } from '../validators/org.validator.js';

export const billingRouter = Router();

// Plans can be viewed publicly or by authenticated users
billingRouter.get('/plans', getPlans);

// Protected subscription endpoints
billingRouter.get(
  '/subscription',
  requireAuth,
  requireOrgRole(['owner', 'admin', 'member']),
  getSubscription
);

billingRouter.post(
  '/change-plan',
  requireAuth,
  validateBody(changePlanSchema),
  requireOrgRole(['owner', 'admin']),
  changePlan
);
