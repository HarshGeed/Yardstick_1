import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { NextRequest } from 'next/server';
import User, { IUser } from '@/models/User';
import Tenant from '@/models/Tenant';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  tenantId: string;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: AuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export async function authenticateUser(email: string, password: string): Promise<{ user: IUser; tenant: any } | null> {
  try {
    const user = await User.findOne({ email }).populate('tenantId');
    if (!user) return null;

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) return null;

    return { user, tenant: user.tenantId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

export async function getAuthenticatedUser(request: NextRequest): Promise<{ user: IUser; tenant: any } | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  try {
    const user = await User.findById(payload.userId).populate('tenantId');
    if (!user) return null;

    return { user, tenant: user.tenantId };
  } catch (error) {
    console.error('User lookup error:', error);
    return null;
  }
}

export function requireAuth(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const auth = await getAuthenticatedUser(request);
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(request, context, auth);
  };
}

export function requireAdmin(handler: Function) {
  return async (request: NextRequest, context: any) => {
    const auth = await getAuthenticatedUser(request);
    if (!auth || auth.user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return handler(request, context, auth);
  };
}
