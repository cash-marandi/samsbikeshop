import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RentalReservation from '@/models/RentalReservation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');

    const query: { customerId: string; status?: string } = { customerId: session.user.id };
    if (status) {
      query.status = status;
    }

    const reservations = await RentalReservation.find(query)
      .populate('rentalBikeId', 'name type image pricePerDay')
      .sort({ createdAt: -1 });

    return NextResponse.json({ reservations }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch rental reservations error:', error);
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

    const reservation = await RentalReservation.findOne({ referenceNumber, customerId: session.user.id });
    if (!reservation) {
      return NextResponse.json({ message: 'Reservation not found' }, { status: 404 });
    }

    if (reservation.paymentStatus !== 'PENDING_PAYMENT') {
      return NextResponse.json({ message: 'Payment already processed or reservation cancelled' }, { status: 400 });
    }

    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'samsbikeshop_rental_proofs' },
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

    reservation.paymentProofUrl = uploadResult.secure_url;
    reservation.paymentProofUploadedAt = new Date();
    reservation.paymentStatus = 'PAID';
    reservation.status = 'confirmed';
    await reservation.save();

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      reservation: {
        referenceNumber: reservation.referenceNumber,
        status: reservation.status,
        paymentStatus: reservation.paymentStatus,
        paymentProofUrl: reservation.paymentProofUrl,
      }
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload rental payment proof error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
