import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import User from '@/models/User';
import Tenant from '@/models/Tenant';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if ('error' in authResult) return authResult.error;

  try {
    await connectDB();
    
    const notes = await Note.find({ tenantId: authResult.user.tenantId })
      .populate('authorId', 'email')
      .sort({ createdAt: -1 });
    
    return NextResponse.json(notes);
  } catch (error) {
    console.error('Get notes error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authResult = await authenticateRequest(req);
  if ('error' in authResult) return authResult.error;

  try {
    await connectDB();
    
    const { title, content } = await req.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    // Check subscription limits
    const tenant = await Tenant.findById(authResult.user.tenantId);
    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    if (tenant.subscription === 'free') {
      const noteCount = await Note.countDocuments({ tenantId: authResult.user.tenantId });
      if (noteCount >= 3) {
        return NextResponse.json({ 
          error: 'Note limit reached. Upgrade to Pro for unlimited notes.' 
        }, { status: 403 });
      }
    }

    const note = new Note({
      title,
      content,
      tenantId: authResult.user.tenantId,
      authorId: authResult.user.userId,
    });

    await note.save();
    await note.populate('authorId', 'email');
    
    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
