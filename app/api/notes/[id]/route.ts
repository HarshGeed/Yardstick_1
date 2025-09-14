import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { requireAuth } from '@/lib/auth';
import Note from '@/models/Note';
import mongoose from 'mongoose';

async function handler(request: NextRequest, context: any, auth: any) {
  try {
    await connectDB();

    const { id } = context.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid note ID' },
        { status: 400 }
      );
    }

    if (request.method === 'GET') {
      // Get a specific note
      const note = await Note.findOne({ 
        _id: id, 
        tenantId: auth.user.tenantId 
      }).populate('createdBy', 'email');

      if (!note) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ note });
    }

    if (request.method === 'PUT') {
      // Update a note
      const { title, content } = await request.json();

      if (!title || !content) {
        return NextResponse.json(
          { error: 'Title and content are required' },
          { status: 400 }
        );
      }

      const note = await Note.findOneAndUpdate(
        { 
          _id: id, 
          tenantId: auth.user.tenantId 
        },
        { title, content },
        { new: true }
      ).populate('createdBy', 'email');

      if (!note) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ note });
    }

    if (request.method === 'DELETE') {
      // Delete a note
      const note = await Note.findOneAndDelete({ 
        _id: id, 
        tenantId: auth.user.tenantId 
      });

      if (!note) {
        return NextResponse.json(
          { error: 'Note not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ message: 'Note deleted successfully' });
    }

    return NextResponse.json(
      { error: 'Method not allowed' },
      { status: 405 }
    );
  } catch (error) {
    console.error('Note API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const GET = requireAuth(handler);
export const PUT = requireAuth(handler);
export const DELETE = requireAuth(handler);
