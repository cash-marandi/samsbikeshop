import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RentalReservation from '@/models/RentalReservation';
import RentalBike from '@/models/RentalBike';

export async function GET() {
  try {
    await dbConnect();
    const reservations = await RentalReservation.find()
      .populate('rentalBikeId')
      .populate('customerId')
      .sort({ createdAt: -1 });
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error('Error fetching rental reservations:', error);
    return NextResponse.json({ error: 'Failed to fetch reservations' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('Received rental reservation POST body:', body); // Log the incoming body
    
    const reservation = new RentalReservation({
      rentalBikeId: body.rentalBikeId,
      customerId: body.customerId,
      startDate: body.startDate,
      endDate: body.endDate,
      totalPrice: body.totalPrice,
      customerName: body.customerName,
      customerEmail: body.customerEmail,
      customerPhone: body.customerPhone,
      notes: body.notes,
    });

    await reservation.save();
    return NextResponse.json({ reservation }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating rental reservation:', error); // Log the full error object
    return NextResponse.json({ error: error.message || 'Failed to create reservation' }, { status: 500 });
  }
}