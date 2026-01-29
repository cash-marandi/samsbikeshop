import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsPost from '@/models/NewsPost';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    const [newsPosts, total] = await Promise.all([
      NewsPost.find({}).sort({ date: -1 }).skip(skip).limit(limit),
      NewsPost.countDocuments(),
    ]);

    return NextResponse.json({
      newsPosts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch news posts API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    const title = formData.get('title') as string;
    const content = formData.get('content') as string;
    const author = formData.get('author') as string;
    const imageFile = formData.get('image') as File;

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Upload to Cloudinary
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
      imageUrl = uploadResult.secure_url;
    } else {
      // Use a default image if no image provided
      imageUrl = `https://picsum.photos/seed/news${Date.now()}/800/400`;
    }

    const newsPost = new NewsPost({
      title,
      content,
      author,
      image: imageUrl || '',
      date: new Date().toISOString().split('T')[0], // Format as YYYY-MM-DD
    });

    await newsPost.save();
    return NextResponse.json(newsPost, { status: 201 });
  } catch (error: any) {
    console.error('Create news post API error:', error);
    return NextResponse.json({ message: error.message || 'Failed to create news post.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'News Post ID is required for deletion.' }, { status: 400 });
    }

    const deletedPost = await NewsPost.findByIdAndDelete(id);

    if (!deletedPost) {
      return NextResponse.json({ message: 'News Post not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'News Post deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete news post API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
