import { Router } from 'express';
import {
  listAllOrgs,
  listSubscriptions,
  getFeatureFlags,
  updateFeatureFlag,
  getSystemHealth,
} from '../controllers/admin.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireSystemAdmin } from '../middleware/rbac.js';

export const adminRouter = Router();

// Platform admin routes require valid admin role
adminRouter.use(requireAuth, requireSystemAdmin);

adminRouter.get('/orgs', listAllOrgs);
adminRouter.get('/subscriptions', listSubscriptions);
adminRouter.get('/feature-flags', getFeatureFlags);
adminRouter.patch('/feature-flags/:key', updateFeatureFlag);
adminRouter.get('/health', getSystemHealth);
