
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BikeRequest, { RequestType, RequestStatus } from '@/models/BikeRequest';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// GET all bike requests (Admin only)
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  // Assuming 'TEAM_ADMIN' is the role for admin users
  if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { searchParams } = new URL(req.url);
    const statusFilter = searchParams.get('status') as RequestStatus;

    const query: any = {};
    if (statusFilter && Object.values(RequestStatus).includes(statusFilter)) {
      query.status = statusFilter;
    }

    const requests = await BikeRequest.find(query).sort({ createdAt: -1 });
    return NextResponse.json(requests, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching bike requests:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}

// POST a new bike request
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Authentication required' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { requestType, details, budget } = await req.json();

    if (!requestType || !Object.values(RequestType).includes(requestType)) {
      return NextResponse.json({ message: 'Valid request type is required' }, { status: 400 });
    }
    if (!details || typeof details !== 'string' || details.trim().length < 10) {
      return NextResponse.json({ message: 'Details must be at least 10 characters long' }, { status: 400 });
    }
    if (budget !== undefined && (typeof budget !== 'number' || budget < 0)) {
      return NextResponse.json({ message: 'Budget must be a non-negative number' }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const newRequest = new BikeRequest({
      userId: user._id,
      userName: user.name,
      userEmail: user.email,
      requestType,
      details,
      budget,
      status: RequestStatus.PENDING,
    });

    await newRequest.save();

    return NextResponse.json(newRequest, { status: 201 });
  } catch (error: any) {
    console.error('Error submitting bike request:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
