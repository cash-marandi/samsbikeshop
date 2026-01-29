import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsPost from '@/models/NewsPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('id');

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    const { title, content, author } = await req.json();

    // Validate required fields
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ message: 'Title is required and must be a non-empty string.' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ message: 'Content is required and must be a non-empty string.' }, { status: 400 });
    }
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return NextResponse.json({ message: 'Author is required and must be a non-empty string.' }, { status: 400 });
    }

    // Update news post
    const updatedPost = await NewsPost.findByIdAndUpdate(
      postId,
      { 
        title: title.trim(),
        content: content.trim(),
        author: author.trim()
      },
      { new: true, runValidators: true }
    );

    if (!updatedPost) {
      return NextResponse.json({ message: 'News post not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error: any) {
    console.error('Update news post API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}