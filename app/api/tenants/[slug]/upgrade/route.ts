import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Tenant from '@/models/Tenant';
import { authenticateRequest, requireRole } from '@/lib/middleware';

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const authResult = await authenticateRequest(req);
  if ('error' in authResult) return authResult.error;

  if (!requireRole(authResult.user, 'admin')) {
    return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
  }

  try {
    await connectDB();
    const { slug } = await params;
    
    const tenant = await Tenant.findOne({ slug });
    
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Check if user belongs to this tenant
    if (tenant._id.toString() !== authResult.user.tenantId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Update subscription to pro
    tenant.subscription = 'pro';
    await tenant.save();
    
    return NextResponse.json({ 
      message: 'Tenant upgraded to Pro successfully',
      tenant: {
        id: tenant._id,
        slug: tenant.slug,
        name: tenant.name,
        subscription: tenant.subscription,
      }
    });
  } catch (error) {
    console.error('Upgrade tenant error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}