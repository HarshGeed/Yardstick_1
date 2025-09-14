import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, JWTPayload } from './auth';

export interface AuthenticatedRequest extends NextRequest {
  user?: JWTPayload;
}

export async function authenticateRequest(req: NextRequest): Promise<{ user: JWTPayload } | { error: NextResponse }> {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { error: NextResponse.json({ error: 'No token provided' }, { status: 401 }) };
    }

    const decoded = verifyToken(token);
    return { user: decoded };
  } catch {
    return { error: NextResponse.json({ error: 'Invalid token' }, { status: 401 }) };
  }
}

export function requireRole(user: JWTPayload, requiredRole: 'admin' | 'member'): boolean {
  return user.role === requiredRole || user.role === 'admin';
}
