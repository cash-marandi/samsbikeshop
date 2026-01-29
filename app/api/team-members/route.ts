import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember';

export async function GET() {
  try {
    await dbConnect();
    const teamMembers = await TeamMember.find().sort({ name: 1 });
    return NextResponse.json({ teamMembers });
  } catch (error) {
    console.error('Error fetching team members:', error);
    return NextResponse.json({ error: 'Failed to fetch team members' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const teamMember = new TeamMember({
      name: body.name,
      email: body.email,
      password: body.password,
      role: body.role,
      image: body.image,
    });

    await teamMember.save();
    return NextResponse.json({ teamMember }, { status: 201 });
  } catch (error) {
    console.error('Error creating team member:', error);
    return NextResponse.json({ error: 'Failed to create team member' }, { status: 500 });
  }
}