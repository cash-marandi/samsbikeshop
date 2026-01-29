
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BikeRequest, { RequestStatus } from '@/models/BikeRequest';
import mongoose from 'mongoose';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// PATCH to update bike request status (Admin only)
export async function PATCH(req: NextRequest, { params }: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();
  const requestId = params.id;

  if (!requestId || !mongoose.Types.ObjectId.isValid(requestId)) {
    return NextResponse.json({ message: 'Invalid request ID' }, { status: 400 });
  }

  try {
    const { status } = await req.json();

    if (!status || !Object.values(RequestStatus).includes(status)) {
      return NextResponse.json({ message: 'Invalid status provided' }, { status: 400 });
    }

    const updatedRequest = await BikeRequest.findByIdAndUpdate(
      requestId,
      { status, updatedAt: new Date() },
      { new: true, runValidators: true }
    );

    if (!updatedRequest) {
      return NextResponse.json({ message: 'Request not found' }, { status: 404 });
    }

    return NextResponse.json(updatedRequest, { status: 200 });
  } catch (error: any) {
    console.error(`Error updating bike request ${requestId}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
