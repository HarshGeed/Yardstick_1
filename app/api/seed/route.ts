import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import Tenant from '@/models/Tenant';
import Note from '@/models/Note';
import { hashPassword } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    console.log('🔌 Connecting to database...');
    await connectDB();
    console.log('✅ Connected to database successfully!');
    
    console.log('🗑️  Clearing existing data...');
    
    // Clear all existing data
    const deletedNotes = await Note.deleteMany({});
    const deletedUsers = await User.deleteMany({});
    const deletedTenants = await Tenant.deleteMany({});
    
    console.log(`✅ Database cleared successfully!`);
    console.log(`   - Deleted ${deletedNotes.deletedCount} notes`);
    console.log(`   - Deleted ${deletedUsers.deletedCount} users`);
    console.log(`   - Deleted ${deletedTenants.deletedCount} tenants`);
    
    console.log('🌱 Seeding new data...');
    
    // Create tenants
    console.log('Creating Acme tenant...');
    const acmeTenant = await Tenant.create({
      slug: 'acme',
      name: 'Acme',
      subscription: 'free'
    });
    console.log(`✅ Created Acme tenant with ID: ${acmeTenant._id}`);

    console.log('Creating Globex tenant...');
    const globexTenant = await Tenant.create({
      slug: 'globex',
      name: 'Globex',
      subscription: 'free'
    });
    console.log(`✅ Created Globex tenant with ID: ${globexTenant._id}`);

    // Create users
    const users = [
      {
        email: 'admin@acme.test',
        password: await hashPassword('password'),
        role: 'admin' as const,
        tenantId: acmeTenant._id,
      },
      {
        email: 'user@acme.test',
        password: await hashPassword('password'),
        role: 'member' as const,
        tenantId: acmeTenant._id,
      },
      {
        email: 'admin@globex.test',
        password: await hashPassword('password'),
        role: 'admin' as const,
        tenantId: globexTenant._id,
      },
      {
        email: 'user@globex.test',
        password: await hashPassword('password'),
        role: 'member' as const,
        tenantId: globexTenant._id,
      },
    ];

    console.log('Creating users...');
    const createdUsers = [];
    for (const userData of users) {
      const user = await User.create(userData);
      console.log(`✅ Created user: ${user.email} (${user.role})`);
      createdUsers.push({
        email: user.email,
        role: user.role,
        tenant: userData.tenantId === acmeTenant._id ? 'Acme' : 'Globex'
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      data: {
        tenants: [
          { id: acmeTenant._id, slug: 'acme', name: 'Acme', subscription: 'free' },
          { id: globexTenant._id, slug: 'globex', name: 'Globex', subscription: 'free' }
        ],
        users: createdUsers,
        deletedCounts: {
          notes: deletedNotes.deletedCount,
          users: deletedUsers.deletedCount,
          tenants: deletedTenants.deletedCount
        }
      }
    });

  } catch (error) {
    console.error('Seeding error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
