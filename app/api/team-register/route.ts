import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import TeamMember from '../../../models/TeamMember';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { UserRole } from '../../../app/types';

const teamRegisterSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email format' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  role: z.nativeEnum(UserRole).default(UserRole.TEAM_ADMIN), // Default to VIEWER, but can be specified
});

export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json();
    const validation = teamRegisterSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Validation failed', errors: validation.error.flatten().fieldErrors }, { status: 400 });
    }

    const { name, email, password, role } = validation.data;

    // Check if team member already exists
    const existingTeamMember = await TeamMember.findOne({ email });
    if (existingTeamMember) {
      return NextResponse.json({ message: 'Team member with this email already exists' }, { status: 400 });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new team member
    const teamMember = await TeamMember.create({
      name,
      email,
      password: hashedPassword,
      role,
      image: `https://i.pravatar.cc/150?u=${email}` // Default placeholder image
    });

    // Exclude password from response
    const teamMemberWithoutPassword = teamMember.toObject();
    delete teamMemberWithoutPassword.password;

    return NextResponse.json({ message: 'Team member registered successfully', teamMember: teamMemberWithoutPassword }, { status: 201 });
  } catch (error: any) {
    console.error('Team registration error:', error);
    // Always return a generic message for internal server errors to the client
    return NextResponse.json({ message: 'An internal server error occurred' }, { status: 500 });
  }
}
