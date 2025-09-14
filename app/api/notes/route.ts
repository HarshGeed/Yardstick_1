import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Note from '@/models/Note';
import Tenant from '@/models/Tenant';

async function handler(request: NextRequest, context: any, auth: any) {
  try {
    await connectDB();

    if (request.method === 'GET') {
      // List all notes for the current tenant
      const notes = await Note.find({ tenantId: auth.user.tenantId })
        .populate('createdBy', 'email')
        .sort({ createdAt: -1 });

      return NextResponse.json({ notes });
    }

    if (request.method === 'POST') {
      // Create a new note
      const { title, content } = await request.json();

      if (!title || !content) {
        return NextResponse.json(
          { error: 'Title and content are required' },
          { status: 400 }
        );
      }

      // Check subscription limits for free plan
      if (auth.tenant.subscription === 'free') {
        const noteCount = await Note.countDocuments({ tenantId: auth.user.tenantId });
        if (noteCount >= 3) {
          return NextResponse.json(
            { 
              error: 'Note limit reached for free plan. Please upgrade to Pro.',
              limitReached: true 
            },
            { status: 403 }
          );
        }
      }

      const note = new Note({
        title,
        content,
        tenantId: auth.user.tenantId,
        createdBy: auth.user._id,
      });

      await note.save();
      await note.populate('createdBy', 'email');

      return NextResponse.json({ note }, { status: 201 });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Notes API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
export const POST = requireAuth(handler);
