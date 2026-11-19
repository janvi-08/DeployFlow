import { z } from 'zod';

export const createOrgSchema = z.object({
  name: z.string().min(2, 'Organisation name must be at least 2 characters').max(50),
  slug: z
    .string()
    .min(2, 'Slug must be at least 2 characters')
    .max(50)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
});

export const updateOrgSchema = z.object({
  name: z.string().min(2, 'Organisation name must be at least 2 characters').max(50).optional(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  role: z.enum(['admin', 'member']).default('member'),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum(['admin', 'member']),
});

export const changePlanSchema = z.object({
  orgId: z.string().min(1, 'Organisation ID is required'),
  plan: z.enum(['free', 'pro', 'enterprise']),
});
