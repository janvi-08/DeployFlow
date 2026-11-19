import { Request, Response } from 'express';
import crypto from 'crypto';
import { User } from '../models/User.js';
import { Membership } from '../models/Membership.js';
import { Organisation } from '../models/Organisation.js';
import { Subscription } from '../models/Subscription.js';
import { UsageRecord } from '../models/UsageRecord.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';
import { apiSuccess, apiError } from '../utils/apiResponse.js';
import { env } from '../config/env.js';
import { AuditLog } from '../models/AuditLog.js';

function setAuthCookie(res: Response, token: string) {
  res.cookie('token', token, {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: '/',
  });
}

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiError(res, 'An account with this email already exists.', 409);
    }

    const passwordHash = await hashPassword(password);
    const user = await User.create({
      name,
      email,
      passwordHash,
      role: 'user',
      emailVerified: true, // Auto-verified for local dev milestone
    });

    // Auto-claim any invitations sent to this email address
    await Membership.updateMany(
      { invitedEmail: user.email.toLowerCase(), $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId: user._id, acceptedAt: new Date() } }
    );

    // If user has no workspace yet, auto-provision their starter workspace
    let memberships = await Membership.find({ userId: user._id }).populate('orgId');
    if (memberships.length === 0) {
      const cleanSlug = user.name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now().toString(36).slice(-4);
      const newOrg = await Organisation.create({
        name: `${user.name}'s Workspace`,
        slug: cleanSlug,
        ownerId: user._id,
        plan: 'pro',
        subscriptionStatus: 'active',
      });

      await Membership.create({
        orgId: newOrg._id,
        userId: user._id,
        role: 'owner',
        invitedAt: new Date(),
        acceptedAt: new Date(),
      });

      await Subscription.create({
        orgId: newOrg._id,
        plan: 'pro',
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        cancelAtPeriodEnd: false,
      });

      const periodStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      await UsageRecord.insertMany([
        { orgId: newOrg._id, metric: 'deployments', quantity: 6, periodStart },
        { orgId: newOrg._id, metric: 'api_calls', quantity: 2150, periodStart },
        { orgId: newOrg._id, metric: 'build_minutes', quantity: 45, periodStart },
        { orgId: newOrg._id, metric: 'team_members', quantity: 1, periodStart },
      ]);

      memberships = await Membership.find({ userId: user._id }).populate('orgId');
    }

    const orgs = memberships
      .filter((m) => m.orgId !== null && (m.orgId as any)._id)
      .map((m) => ({
        id: (m.orgId as any)._id,
        name: (m.orgId as any).name,
        slug: (m.orgId as any).slug,
        plan: (m.orgId as any).plan,
        role: m.role,
      }));

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    await AuditLog.create({
      actorId: user._id,
      action: 'USER_REGISTERED',
      meta: { email: user.email },
      at: new Date(),
    });

    return apiSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        organisations: orgs,
        token, // Provided for API testing tools like Postman/curl if cookie isn't stored
      },
      'Registration successful',
      201
    );
  } catch (error) {
    return apiError(res, 'Registration failed', 500);
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return apiError(res, 'Invalid email or password.', 401);
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return apiError(res, 'Invalid email or password.', 401);
    }

    // Auto-claim any invitations sent to this email address
    await Membership.updateMany(
      { invitedEmail: user.email.toLowerCase(), $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId: user._id, acceptedAt: new Date() } }
    );

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    setAuthCookie(res, token);

    await AuditLog.create({
      actorId: user._id,
      action: 'USER_LOGIN',
      meta: { email: user.email },
      at: new Date(),
    });

    // Auto-claim any invitations sent to this email address
    await Membership.updateMany(
      { invitedEmail: user.email.toLowerCase(), $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId: user._id, acceptedAt: new Date() } }
    );

    // Fetch user's accessible organisations via memberships
    const memberships = await Membership.find({ userId: user._id }).populate('orgId');
    const orgs = memberships
      .filter((m) => m.orgId !== null && (m.orgId as any)._id)
      .map((m) => ({
        id: (m.orgId as any)._id,
        name: (m.orgId as any).name,
        slug: (m.orgId as any).slug,
        plan: (m.orgId as any).plan,
        role: m.role,
      }));

    return apiSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
        },
        organisations: orgs,
        token,
      },
      'Login successful'
    );
  } catch (error) {
    return apiError(res, 'Login failed', 500);
  }
}

export async function logout(_req: Request, res: Response) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: env.NODE_ENV === 'production',
    sameSite: env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });
  return apiSuccess(res, null, 'Logged out successfully');
}

export async function me(req: Request, res: Response) {
  try {
    const user = await User.findById(req.user!.id);
    if (!user) {
      return apiError(res, 'User not found.', 404);
    }

    // Auto-claim any invitations sent to this email address
    await Membership.updateMany(
      { invitedEmail: user.email.toLowerCase(), $or: [{ userId: { $exists: false } }, { userId: null }] },
      { $set: { userId: user._id, acceptedAt: new Date() } }
    );

    // Fetch user's organisations via memberships
    const memberships = await Membership.find({ userId: user._id }).populate('orgId');

    const orgs = memberships
      .filter((m) => m.orgId !== null)
      .map((m) => ({
        id: (m.orgId as any)._id,
        name: (m.orgId as any).name,
        slug: (m.orgId as any).slug,
        plan: (m.orgId as any).plan,
        role: m.role,
      }));

    return apiSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
      },
      organisations: orgs,
    });
  } catch (error) {
    return apiError(res, 'Failed to fetch current user profile.', 500);
  }
}

export async function forgotPassword(req: Request, res: Response) {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Don't disclose user existence for security
      return apiSuccess(
        res,
        null,
        'If that email exists in our records, a password reset token has been generated.'
      );
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    return apiSuccess(
      res,
      {
        developmentToken: resetToken,
        instructions: 'In production this is delivered via secure email.',
      },
      'Password reset instructions generated'
    );
  } catch (error) {
    return apiError(res, 'Failed to process forgot password request', 500);
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, password } = req.body;
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return apiError(res, 'Password reset token is invalid or has expired.', 400);
    }

    user.passwordHash = await hashPassword(password);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return apiSuccess(res, null, 'Password has been reset successfully. Please sign in with your new password.');
  } catch (error) {
    return apiError(res, 'Failed to reset password', 500);
  }
}
