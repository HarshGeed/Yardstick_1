import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { hashPassword } from '@/lib/auth';
import Tenant from '@/models/Tenant';
import User from '@/models/User';
import Note from '@/models/Note';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Clear existing data
    await Note.deleteMany({});
    await User.deleteMany({});
    await Tenant.deleteMany({});

    // Create tenants
    const acmeTenant = new Tenant({
      name: 'Acme Corporation',
      slug: 'acme',
      subscription: 'free',
    });

    const globexTenant = new Tenant({
      name: 'Globex Corporation',
      slug: 'globex',
      subscription: 'free',
    });

    await acmeTenant.save();
    await globexTenant.save();

    // Create users
    const hashedPassword = await hashPassword('password');

    const acmeAdmin = new User({
      email: 'admin@acme.test',
      password: hashedPassword,
      role: 'admin',
      tenantId: acmeTenant._id,
    });

    const acmeUser = new User({
      email: 'user@acme.test',
      password: hashedPassword,
      role: 'member',
      tenantId: acmeTenant._id,
    });

    const globexAdmin = new User({
      email: 'admin@globex.test',
      password: hashedPassword,
      role: 'admin',
      tenantId: globexTenant._id,
    });

    const globexUser = new User({
      email: 'user@globex.test',
      password: hashedPassword,
      role: 'member',
      tenantId: globexTenant._id,
    });

    await acmeAdmin.save();
    await acmeUser.save();
    await globexAdmin.save();
    await globexUser.save();

    // Create sample notes for Acme
    const acmeNotes = [
      new Note({
        title: 'Welcome to Acme Notes',
        content: 'This is your first note in the Acme tenant. You can create, edit, and delete notes here.',
        tenantId: acmeTenant._id,
        createdBy: acmeAdmin._id,
      }),
      new Note({
        title: 'Project Planning',
        content: 'We need to plan our Q1 objectives and allocate resources accordingly.',
        tenantId: acmeTenant._id,
        createdBy: acmeUser._id,
      }),
    ];

    // Create sample notes for Globex
    const globexNotes = [
      new Note({
        title: 'Globex Strategic Goals',
        content: 'Our primary focus this quarter is market expansion and customer acquisition.',
        tenantId: globexTenant._id,
        createdBy: globexAdmin._id,
      }),
      new Note({
        title: 'Team Meeting Notes',
        content: 'Discussed the new product launch timeline and marketing strategy.',
        tenantId: globexTenant._id,
        createdBy: globexUser._id,
      }),
    ];

    await Note.insertMany([...acmeNotes, ...globexNotes]);

    return NextResponse.json({
      message: 'Database seeded successfully',
      data: {
        tenants: [
          { name: 'Acme Corporation', slug: 'acme', subscription: 'free' },
          { name: 'Globex Corporation', slug: 'globex', subscription: 'free' },
        ],
        users: [
          { email: 'admin@acme.test', role: 'admin', tenant: 'acme' },
          { email: 'user@acme.test', role: 'member', tenant: 'acme' },
          { email: 'admin@globex.test', role: 'admin', tenant: 'globex' },
          { email: 'user@globex.test', role: 'member', tenant: 'globex' },
        ],
        notes: {
          acme: 2,
          globex: 2,
        },
      },
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
