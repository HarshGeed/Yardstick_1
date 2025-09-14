import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAdmin } from '@/lib/auth';
import Tenant from '@/models/Tenant';

async function handler(request: NextRequest, context: any, auth: any) {
  try {
    await connectDB();

    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    const { slug } = context.params;

    // Find the tenant by slug
    const tenant = await Tenant.findOne({ slug });
    if (!tenant) {
      return NextResponse.json(
        { error: 'Tenant not found' },
        { status: 404 }
      );
    }

    // Verify the user belongs to this tenant
    // auth.user.tenantId is populated, so we need to get the _id from it
    const userTenantId = auth.user.tenantId._id ? auth.user.tenantId._id : auth.user.tenantId;
    if (userTenantId.toString() !== tenant._id.toString()) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Upgrade to Pro
    tenant.subscription = 'pro';
    await tenant.save();

    return NextResponse.json({ 
      message: 'Tenant upgraded to Pro successfully',
      tenant: {
        id: tenant._id,
        name: tenant.name,
        slug: tenant.slug,
        subscription: tenant.subscription,
      }
    });
  } catch (error) {
    console.error('Tenant upgrade error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const POST = requireAdmin(handler);
