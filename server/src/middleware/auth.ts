import { Request, Response, NextFunction } from 'express';
import { verifyToken, JwtUserPayload } from '../utils/jwt.js';
import { apiError } from '../utils/apiResponse.js';
import { User } from '../models/User.js';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: 'user' | 'admin';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    let token = req.cookies?.token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return apiError(res, 'Authentication required. Please sign in.', 401);
    }

    const decoded: JwtUserPayload = verifyToken(token);
    const user = await User.findById(decoded.userId).select('_id email role');

    if (!user) {
      return apiError(res, 'User session has expired or no longer exists.', 401);
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return apiError(res, 'Invalid or expired session token.', 401);
  }
}
