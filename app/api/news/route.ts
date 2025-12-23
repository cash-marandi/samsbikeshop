import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import NewsPost from '@/models/NewsPost';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const newsPosts = await NewsPost.find({}).sort({ date: -1 }); // Sort by date descending (latest first)
    return NextResponse.json(newsPosts, { status: 200 });
  } catch (error: any) {
    console.error('Fetch news posts API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
