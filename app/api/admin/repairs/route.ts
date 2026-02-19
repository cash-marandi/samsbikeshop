import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RepairBooking from '@/models/RepairBooking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: Record<string, string> = {};
    if (status) {
      query.status = status;
    }

    const bookings = await RepairBooking.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch repair bookings error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { referenceNumber, status, notes } = body;

    if (!referenceNumber) {
      return NextResponse.json({ message: 'Reference number is required' }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (status) updateData.status = status;
    if (notes !== undefined) updateData.notes = notes;

    const booking = await RepairBooking.findOneAndUpdate(
      { referenceNumber },
      { $set: updateData },
      { new: true }
    );

    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    return NextResponse.json(booking, { status: 200 });
  } catch (error: unknown) {
    console.error('Update repair booking error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
