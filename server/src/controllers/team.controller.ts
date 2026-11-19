import { Request, Response } from 'express';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { Membership } from '../models/Membership.js';
import { User } from '../models/User.js';
import { AuditLog } from '../models/AuditLog.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { recordUsage, verifyAndConsumeQuota } from '../services/usage.service.js';

export async function listMembers(req: Request, res: Response) {
  try {
    const org = req.org!;

    const memberships = await Membership.find({ orgId: org._id })
      .populate('userId', 'name email createdAt')
      .sort({ createdAt: -1 });

    const formatted = memberships.map((m) => ({
      id: m._id,
      role: m.role,
      invitedAt: m.invitedAt,
      acceptedAt: m.acceptedAt,
      status: m.userId ? 'active' : 'pending',
      user: m.userId
        ? {
            id: (m.userId as any)._id,
            name: (m.userId as any).name,
            email: (m.userId as any).email,
          }
        : {
            email: m.invitedEmail,
          },
    }));

    return apiSuccess(res, formatted);
  } catch (error) {
    return apiError(res, 'Failed to list team members', 500);
  }
}

export async function inviteMember(req: Request, res: Response) {
  try {
    const org = req.org!;
    const { email, role } = req.body;

    // Check team seat quota against subscription plan
    const quotaCheck = await verifyAndConsumeQuota(org._id, 'team_members', 1);
    if (!quotaCheck.allowed) {
      return res.status(429).json({
        success: false,
        message: `Plan limit reached for team members (${quotaCheck.limit} max). Please upgrade your subscription to invite additional members.`,
        quota: quotaCheck,
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      const existingMembership = await Membership.findOne({
        orgId: org._id,
        userId: existingUser._id,
      });

      if (existingMembership) {
        return apiError(res, 'This user is already a member of this organisation.', 409);
      }
    }

    // Check if invitation is already pending
    const existingInvite = await Membership.findOne({
      orgId: org._id,
      invitedEmail: email.toLowerCase(),
      acceptedAt: { $exists: false },
    });

    if (existingInvite) {
      return apiError(res, 'An invitation has already been sent to this email address.', 409);
    }

    const token = crypto.randomBytes(24).toString('hex');

    const membership = await Membership.create({
      orgId: org._id,
      userId: existingUser ? existingUser._id : undefined,
      invitedEmail: email.toLowerCase(),
      role: role || 'member',
      inviteToken: token,
      invitedAt: new Date(),
      acceptedAt: existingUser ? new Date() : undefined, // Auto-accept if user already exists in dev
    });

    await AuditLog.create({
      orgId: org._id,
      actorId: req.user!.id,
      action: 'MEMBER_INVITED',
      meta: { email, role: membership.role },
      at: new Date(),
    });

    return apiSuccess(
      res,
      {
        id: membership._id,
        email,
        role: membership.role,
        status: existingUser ? 'active' : 'pending',
        inviteLink: `/invite/accept?token=${token}`,
      },
      'Invitation generated successfully',
      201
    );
  } catch (error) {
    return apiError(res, 'Failed to invite team member', 500);
  }
}

export async function updateMemberRole(req: Request, res: Response) {
  try {
    const org = req.org!;
    const { userId } = req.params;
    const { role } = req.body;

    // Only organisation owner or platform admin can change member roles
    if (req.membership?.role !== 'owner' && req.user?.role !== 'admin') {
      return apiError(res, 'Only the organisation Owner can modify team roles.', 403);
    }

    const targetMembership = await Membership.findOne({
      orgId: org._id,
      $or: [
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
      ].filter(Boolean),
    });

    if (!targetMembership) {
      return apiError(res, 'Member not found in this organisation.', 404);
    }

    if (targetMembership.role === 'owner') {
      return apiError(res, 'Cannot change the primary Owner role.', 400);
    }

    targetMembership.role = role;
    await targetMembership.save();

    await AuditLog.create({
      orgId: org._id,
      actorId: req.user!.id,
      action: 'MEMBER_ROLE_UPDATED',
      meta: { targetUserId: userId, newRole: role },
      at: new Date(),
    });

    return apiSuccess(res, targetMembership, 'Role updated successfully');
  } catch (error) {
    return apiError(res, 'Failed to update member role', 500);
  }
}

export async function removeMember(req: Request, res: Response) {
  try {
    const org = req.org!;
    const { userId } = req.params;

    // A user can remove themselves (leave), or an Owner can remove anyone except self
    const isSelf = req.user!.id === userId;
    const isOwner = req.membership?.role === 'owner';
    const isSuperAdmin = req.user?.role === 'admin';

    if (!isSelf && !isOwner && !isSuperAdmin) {
      return apiError(res, 'Permission denied. Only an Owner can remove members.', 403);
    }

    const targetMembership = await Membership.findOne({
      orgId: org._id,
      $or: [
        { userId: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
        { _id: mongoose.Types.ObjectId.isValid(userId) ? userId : undefined },
      ].filter(Boolean),
    });

    if (!targetMembership) {
      return apiError(res, 'Member not found in this organisation.', 404);
    }

    if (targetMembership.role === 'owner') {
      return apiError(res, 'The organisation Owner cannot be removed.', 400);
    }

    await targetMembership.deleteOne();

    // Decrement team_members usage counter
    await recordUsage(org._id, 'team_members', -1);

    await AuditLog.create({
      orgId: org._id,
      actorId: req.user!.id,
      action: isSelf ? 'MEMBER_LEFT' : 'MEMBER_REMOVED',
      meta: { targetUserId: userId },
      at: new Date(),
    });

    return apiSuccess(res, null, isSelf ? 'You have left the organisation.' : 'Member removed successfully');
  } catch (error) {
    return apiError(res, 'Failed to remove member', 500);
  }
}
