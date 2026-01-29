import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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
    const userId = searchParams.get('id');

    if (!userId) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    const { name, email, role, isApprovedForAuction } = await req.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Name is required and must be a non-empty string.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ message: 'Email is required and must be a non-empty string.' }, { status: 400 });
    }
    if (!role || !['USER', 'TEAM_ADMIN'].includes(role)) {
      return NextResponse.json({ message: 'Role must be either USER or TEAM_ADMIN.' }, { status: 400 });
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        isApprovedForAuction: isApprovedForAuction !== undefined ? isApprovedForAuction : undefined
      },
      { new: true, runValidators: true }
    ).select('-password'); // Don't return password

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (error: any) {
    console.error('Update user API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}