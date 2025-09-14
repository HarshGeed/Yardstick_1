import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Note from '@/models/Note';
import User from '@/models/User';
import { authenticateRequest } from '@/lib/middleware';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateRequest(req);
  if ('error' in authResult) return authResult.error;

  try {
    await connectDB();
    const { id } = await params;
    
    const note = await Note.findOne({ 
      _id: id, 
      tenantId: authResult.user.tenantId 
    }).populate('authorId', 'email');
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Get note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateRequest(req);
  if ('error' in authResult) return authResult.error;

  try {
    await connectDB();
    const { id } = await params;
    
    const { title, content } = await req.json();
    
    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const note = await Note.findOneAndUpdate(
      { _id: id, tenantId: authResult.user.tenantId },
      { title, content },
      { new: true }
    ).populate('authorId', 'email');
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json(note);
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const authResult = await authenticateRequest(req);
  if ('error' in authResult) return authResult.error;

  try {
    await connectDB();
    const { id } = await params;
    
    const note = await Note.findOneAndDelete({ 
      _id: id, 
      tenantId: authResult.user.tenantId 
    });
    
    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }
    
    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}