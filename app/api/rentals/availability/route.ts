import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RentalReservation from '@/models/RentalReservation';
import RentalBike from '@/models/RentalBike';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const generateReferenceNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `RNT-${timestamp}-${random}`;
};

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const { searchParams } = new URL(req.url);
    const bikeId = searchParams.get('bikeId');
    const month = searchParams.get('month');
    const year = searchParams.get('year');

    if (!bikeId) {
      return NextResponse.json({ message: 'Bike ID is required' }, { status: 400 });
    }

    const startDate = new Date(parseInt(year || String(new Date().getFullYear())), parseInt(month || String(new Date().getMonth())) - 1, 1);
    const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 2, 0);

    const reservations = await RentalReservation.find({
      rentalBikeId: bikeId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } }
      ]
    });

    const bookedDates: { start: string; end: string }[] = reservations.map(r => ({
      start: new Date(r.startDate).toISOString().split('T')[0],
      end: new Date(r.endDate).toISOString().split('T')[0],
    }));

    return NextResponse.json({ bookedDates }, { status: 200 });
  } catch (error: unknown) {
    console.error('Error checking availability:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Please login to make a booking' }, { status: 401 });
    }

    const body = await req.json();
    const { bikeId, startDate, endDate, customerName, customerEmail, customerPhone, notes } = body;

    if (!bikeId || !startDate || !endDate) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const bike = await RentalBike.findById(bikeId);
    if (!bike) {
      return NextResponse.json({ message: 'Bike not found' }, { status: 404 });
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return NextResponse.json({ message: 'Start date cannot be in the past' }, { status: 400 });
    }

    if (end <= start) {
      return NextResponse.json({ message: 'End date must be after start date' }, { status: 400 });
    }

    const existingBooking = await RentalReservation.findOne({
      rentalBikeId: bikeId,
      status: { $in: ['pending', 'confirmed'] },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } }
      ]
    });

    if (existingBooking) {
      return NextResponse.json({ message: 'Bike is not available for the selected dates' }, { status: 400 });
    }

    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    const totalPrice = days * bike.pricePerDay;
    const referenceNumber = generateReferenceNumber();

    const reservation = new RentalReservation({
      rentalBikeId: bikeId,
      customerId: session.user.id,
      startDate: start,
      endDate: end,
      totalPrice,
      status: 'pending',
      paymentStatus: 'PENDING_PAYMENT',
      referenceNumber,
      customerName,
      customerEmail,
      customerPhone,
      notes,
    });

    await reservation.save();

    return NextResponse.json({ 
      message: 'Booking created successfully',
      reservation: {
        id: reservation._id,
        referenceNumber,
        totalPrice,
        startDate: reservation.startDate,
        endDate: reservation.endDate,
        paymentStatus: reservation.paymentStatus,
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating reservation:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
