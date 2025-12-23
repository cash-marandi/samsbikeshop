import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import TeamMember from '@/models/TeamMember'; // Assuming you have a TeamMember model
import bcrypt from 'bcryptjs';
import { UserRole } from '@/app/types';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const formData = await req.formData();

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const role = formData.get('role') as UserRole;
    const password = formData.get('password') as string;
    const imageFile = formData.get('image') as File;

    // Basic validation
    if (!name || name.trim() === '' || !email || email.trim() === '' || !role || !password || password.trim() === '') {
      return NextResponse.json({ message: 'Name, email, role, and password are required.' }, { status: 400 });
    }

    // Validate email format (simple regex)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
    }

    // Validate role against UserRole enum
    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json({ message: 'Invalid role provided.' }, { status: 400 });
    }

    // Check if team member with this email already exists
    const existingTeamMember = await TeamMember.findOne({ email });
    if (existingTeamMember) {
      return NextResponse.json({ message: 'Team member with this email already exists.' }, { status: 409 });
    }

    let imageUrl: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_team_members' }, // Folder for team member images
          (error, result) => {
            if (error) {
              console.error('Cloudinary team member image upload error:', error);
              return reject(new Error('Failed to upload image to Cloudinary.'));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
    } else {
      return NextResponse.json({ message: 'Team member image is required.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newTeamMember = new TeamMember({
      name,
      email,
      role,
      password: hashedPassword,
      image: imageUrl, // Save image URL
      isApprovedForAuction: false, // Default for new team members
      orderHistory: [], // Default for new team members
    });

    await newTeamMember.save();

    // Return the new team member without the password
    const teamMemberResponse = newTeamMember.toObject();
    delete teamMemberResponse.password;

    return NextResponse.json(teamMemberResponse, { status: 201 });
  } catch (error: any) {
    console.error('Create team member API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const teamMembers = await TeamMember.find({}).select('-password'); // Exclude passwords
    return NextResponse.json(teamMembers, { status: 200 });
  } catch (error: any) {
    console.error('Fetch team members API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Team Member ID is required for deletion.' }, { status: 400 });
    }

    const deletedTeamMember = await TeamMember.findByIdAndDelete(id);

    if (!deletedTeamMember) {
      return NextResponse.json({ message: 'Team Member not found.' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Team Member deleted successfully.' }, { status: 200 });
  } catch (error: any) {
    console.error('Delete team member API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Team Member ID is required for update.' }, { status: 400 });
    }

    const formData = await req.formData();
    const updates: { [key: string]: any } = {};
    let imageUrl: string | undefined;

    // Process image file if provided
    const imageFile = formData.get('image') as File;
    if (imageFile && imageFile.size > 0) {
      const arrayBuffer = await imageFile.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const uploadResult: any = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: 'samsbikeshop_team_members' },
          (error, result) => {
            if (error) {
              console.error('Cloudinary team member image update error:', error);
              return reject(new Error('Failed to upload new image to Cloudinary.'));
            }
            resolve(result);
          }
        );
        uploadStream.end(buffer);
      });
      imageUrl = uploadResult.secure_url;
      updates.image = imageUrl; // Add new image URL to updates
    } else if (formData.has('image') && formData.get('image') === '') {
      // If 'image' field is explicitly empty, user intends to remove existing image
      updates.image = '';
    }

    // Process password if provided
    const password = formData.get('password') as string;
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      updates.password = hashedPassword;
    }

    // Process other fields
    const fieldsToProcess = ['name', 'email', 'role', 'isApprovedForAuction'];
    for (const field of fieldsToProcess) {
      const value = formData.get(field);
      if (value !== null) {
        if (field === 'isApprovedForAuction') {
          updates[field] = value === 'true'; // Convert string 'true'/'false' to boolean
        } else if (field === 'role') {
          // Validate role against UserRole enum
          if (!Object.values(UserRole).includes(value as UserRole)) {
            return NextResponse.json({ message: 'Invalid role provided for update.' }, { status: 400 });
          }
          updates[field] = value;
        } else {
          updates[field] = value;
        }
      }
    }

    // Basic validation for name and email if provided
    if (updates.name && updates.name.trim() === '') {
      return NextResponse.json({ message: 'Name must be a non-empty string.' }, { status: 400 });
    }
    if (updates.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(updates.email)) {
        return NextResponse.json({ message: 'Invalid email format.' }, { status: 400 });
      }
      // Check for duplicate email if email is being updated and it's not the current team member's email
      const existingTeamMember = await TeamMember.findOne({ email: updates.email });
      if (existingTeamMember && existingTeamMember._id.toString() !== id) {
        return NextResponse.json({ message: 'Team member with this email already exists.' }, { status: 409 });
      }
    }


    const updatedTeamMember = await TeamMember.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    );

    if (!updatedTeamMember) {
      return NextResponse.json({ message: 'Team Member not found.' }, { status: 404 });
    }

    // Return the updated team member without the password
    const teamMemberResponse = updatedTeamMember.toObject();
    delete teamMemberResponse.password;

    return NextResponse.json(teamMemberResponse, { status: 200 });
  } catch (error: any) {
    console.error('Update team member API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}



