import { Router } from 'express';
import {
  listUserOrgs,
  createOrg,
  getOrg,
  updateOrg,
} from '../controllers/org.controller.js';
import {
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
} from '../controllers/team.controller.js';
import { requireAuth } from '../middleware/auth.js';
import { requireOrgRole } from '../middleware/rbac.js';
import { validateBody } from '../middleware/validate.js';
import {
  createOrgSchema,
  updateOrgSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
} from '../validators/org.validator.js';

export const orgRouter = Router();

// All organization routes require authentication
orgRouter.use(requireAuth);

// Org management
orgRouter.get('/', listUserOrgs);
orgRouter.post('/', validateBody(createOrgSchema), createOrg);
orgRouter.get('/:id', requireOrgRole(['owner', 'admin', 'member']), getOrg);
orgRouter.patch(
  '/:id',
  requireOrgRole(['owner', 'admin']),
  validateBody(updateOrgSchema),
  updateOrg
);

// Team membership & RBAC subroutes
orgRouter.get('/:id/members', requireOrgRole(['owner', 'admin', 'member']), listMembers);
orgRouter.post(
  '/:id/invites',
  requireOrgRole(['owner', 'admin']),
  validateBody(inviteMemberSchema),
  inviteMember
);
orgRouter.patch(
  '/:id/members/:userId/role',
  requireOrgRole(['owner']),
  validateBody(updateMemberRoleSchema),
  updateMemberRole
);
orgRouter.delete('/:id/members/:userId', requireOrgRole(['owner', 'admin', 'member']), removeMember);
