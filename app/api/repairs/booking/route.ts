import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RepairBooking from '@/models/RepairBooking';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

const generateReferenceNumber = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `REP-${timestamp}-${random}`;
};

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: { userId: string; status?: string } = { userId: session.user.id };
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

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Please login to book a repair' }, { status: 401 });
    }

    const body = await req.json();
    const { 
      customerName, 
      customerEmail, 
      customerPhone, 
      address,
      serviceType, 
      packageName, 
      price,
      bikeDescription,
      issueDescription, 
      preferredDate,
      isMobileService,
      notes
    } = body;

    if (!customerName || !customerEmail || !customerPhone || !packageName || price === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const referenceNumber = generateReferenceNumber();

    const booking = new RepairBooking({
      userId: session.user.id,
      customerName,
      customerEmail,
      customerPhone,
      address,
      serviceType,
      packageName,
      price,
      bikeDescription,
      issueDescription,
      preferredDate: preferredDate ? new Date(preferredDate) : undefined,
      isMobileService: isMobileService || false,
      referenceNumber,
      notes,
      status: 'PENDING_PAYMENT',
      paymentStatus: 'PENDING_PAYMENT',
    });

    await booking.save();

    return NextResponse.json({ 
      message: 'Repair booking created successfully',
      booking: {
        id: booking._id,
        referenceNumber,
        price: booking.price,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Error creating repair booking:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const referenceNumber = formData.get('referenceNumber') as string;
    const proofFile = formData.get('paymentProof') as File;

    if (!referenceNumber || !proofFile || proofFile.size === 0) {
      return NextResponse.json({ message: 'Reference number and payment proof are required' }, { status: 400 });
    }

    const booking = await RepairBooking.findOne({ referenceNumber, userId: session.user.id });
    if (!booking) {
      return NextResponse.json({ message: 'Booking not found' }, { status: 404 });
    }

    if (booking.paymentStatus !== 'PENDING_PAYMENT') {
      return NextResponse.json({ message: 'Payment already processed or booking cancelled' }, { status: 400 });
    }

    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'samsbikeshop_repair_proofs' },
        (error, result) => {
          if (error) {
            reject(new Error('Failed to upload payment proof'));
          } else {
            resolve(result as { secure_url: string });
          }
        }
      );
      uploadStream.end(buffer);
    });

    booking.paymentProofUrl = uploadResult.secure_url;
    booking.paymentProofUploadedAt = new Date();
    booking.paymentStatus = 'PAID';
    booking.status = 'CONFIRMED';
    await booking.save();

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      booking: {
        referenceNumber: booking.referenceNumber,
        status: booking.status,
        paymentStatus: booking.paymentStatus,
        paymentProofUrl: booking.paymentProofUrl,
      }
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload repair payment proof error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
