import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { authenticateUser, generateToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const auth = await authenticateUser(email, password);
    if (!auth) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const token = generateToken({
      userId: auth.user._id.toString(),
      email: auth.user.email,
      role: auth.user.role,
      tenantId: auth.user.tenantId.toString(),
    });

    return NextResponse.json({
      token,
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
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
