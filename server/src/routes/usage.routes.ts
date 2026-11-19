import { Router } from 'express';
import { getUsage, simulateDeployment, simulateApiCalls } from '../controllers/usage.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrgRole } from '../middleware/rbac.js';

export const usageRouter = Router();

usageRouter.use(requireAuth);

usageRouter.get(
  '/',
  requireOrgRole(['owner', 'admin', 'member']),
  getUsage
);

usageRouter.post(
  '/simulate-deployment',
  requireOrgRole(['owner', 'admin', 'member']),
  simulateDeployment
);

usageRouter.post(
  '/simulate-api',
  requireOrgRole(['owner', 'admin', 'member']),
  simulateApiCalls
);
