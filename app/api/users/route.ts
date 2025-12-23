import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const users = await User.find({}).select('-password'); // Exclude passwords from the response
    return NextResponse.json(users, { status: 200 });
  } catch (error: any) {
    console.error('Fetch users API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
