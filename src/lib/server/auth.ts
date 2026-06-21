import jwt from 'jsonwebtoken';
import { NextRequest } from 'next/server';
import { AppError } from './errors';

export interface AuthPayload {
  userId: string;
  role: string;
}

export function getTokenFromRequest(req: NextRequest): string | null {
  const auth = req.headers.get('authorization');
  if (!auth) return null;
  return auth.replace('Bearer ', '');
}

export function authenticate(req: NextRequest): AuthPayload {
  const token = getTokenFromRequest(req);
  if (!token) throw new AppError('Authentication required', 401);
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthPayload;
  } catch {
    throw new AppError('Invalid or expired token', 401);
  }
}

export function optionalAuth(req: NextRequest): AuthPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET || 'secret') as AuthPayload;
  } catch {
    return null;
  }
}

export function requireAdmin(auth: AuthPayload | null): asserts auth is AuthPayload {
  if (!auth || auth.role !== 'ADMIN') {
    throw new AppError('Admin access required', 403);
  }
}
