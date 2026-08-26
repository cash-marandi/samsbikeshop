import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsPost from '@/models/NewsPost';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { id: postId } = await params;

    if (!postId) {
      return NextResponse.json({ message: 'Post ID is required' }, { status: 400 });
    }

    const contentType = req.headers.get('content-type') || '';
    let title: string, content: string, author: string;
    let imageFile: File | null = null;

    if (contentType.includes('multipart/form-data')) {
      const formData = await req.formData();
      title = formData.get('title') as string;
      content = formData.get('content') as string;
      author = formData.get('author') as string;
      imageFile = formData.get('image') as File;
    } else {
      const body = await req.json();
      title = body.title;
      content = body.content;
      author = body.author;
    }

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json({ message: 'Title is required.' }, { status: 400 });
    }
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json({ message: 'Content is required.' }, { status: 400 });
    }
    if (!author || typeof author !== 'string' || author.trim() === '') {
      return NextResponse.json({ message: 'Author is required.' }, { status: 400 });
    }

    const updateData: Record<string, string> = {
      title: title.trim(),
      content: content.trim(),
      author: author.trim(),
    };

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve: any, reject: any) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_news' },
          (error: any, result: any) => {
            if (error) {
              reject(new Error('Failed to upload news image to Cloudinary.'));
            } else {
              resolve(result);
            }
          }
        );
        uploadStream.end(buffer);
      });
      updateData.image = uploadResult.secure_url;
    }

    const updatedPost = await NewsPost.findByIdAndUpdate(
      postId,
      updateData,
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
