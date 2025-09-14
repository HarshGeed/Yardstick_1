import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';

async function handler(request: NextRequest, context: any, auth: any) {
  try {
    await connectDB();

    return NextResponse.json({
      user: {
        id: auth.user._id,
        email: auth.user.email,
        role: auth.user.role,
        tenantId: auth.user.tenantId,
        tenant: {
          id: auth.tenant._id,
          name: auth.tenant.name,
          slug: auth.tenant.slug,
          subscription: auth.tenant.subscription,
        },
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
