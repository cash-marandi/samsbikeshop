
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Auction from '@/models/Auction';
import mongoose from 'mongoose';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  await dbConnect();
  const { id } = await params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ message: 'Invalid auction ID' }, { status: 400 });
  }

  try {
    const auction = await Auction.findById(id).lean(); // Use lean for a plain object
    if (!auction) {
      return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
    }
    return NextResponse.json({ ...auction, id: auction._id.toString() });
  } catch (error: any) {
    console.error(`Error fetching auction ${id}:`, error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
