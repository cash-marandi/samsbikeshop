import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';
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
    const memberId = searchParams.get('id');

    if (!memberId) {
      return NextResponse.json({ message: 'Team Member ID is required' }, { status: 400 });
    }

    const { name, email, role, image } = await req.json();

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ message: 'Name is required and must be a non-empty string.' }, { status: 400 });
    }
    if (!email || typeof email !== 'string' || email.trim() === '') {
      return NextResponse.json({ message: 'Email is required and must be a non-empty string.' }, { status: 400 });
    }
    if (!role || !['TEAM_ADMIN', 'MANAGER', 'SALES', 'MECHANIC', 'MARKETING'].includes(role)) {
      return NextResponse.json({ message: 'Role must be one of: TEAM_ADMIN, MANAGER, SALES, MECHANIC, MARKETING.' }, { status: 400 });
    }

    // Update team member
    const updatedMember = await TeamMember.findByIdAndUpdate(
      memberId,
      { 
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role: role,
        image: image
      },
      { new: true, runValidators: true }
    ).select('-password'); // Don't return password if it exists

    if (!updatedMember) {
      return NextResponse.json({ message: 'Team member not found.' }, { status: 404 });
    }

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error: any) {
    console.error('Update team member API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}