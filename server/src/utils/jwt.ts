import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export interface JwtUserPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
}

export function signToken(payload: JwtUserPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtUserPayload {
  return jwt.verify(token, env.JWT_SECRET) as JwtUserPayload;
}
