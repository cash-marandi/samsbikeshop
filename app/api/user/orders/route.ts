import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
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

    const query: { userId: string; status?: string } = { userId: session.user.id };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query).sort({ createdAt: -1 });

    return NextResponse.json({ orders }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch user orders error:', error);
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
    const orderId = formData.get('orderId') as string;
    const proofFile = formData.get('paymentProof') as File;

    if (!orderId || !proofFile || proofFile.size === 0) {
      return NextResponse.json({ message: 'Order ID and payment proof are required' }, { status: 400 });
    }

    const order = await Order.findOne({ referenceNumber: orderId, userId: session.user.id });
    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    if (order.status !== 'PENDING_PAYMENT') {
      return NextResponse.json({ message: 'Payment proof already uploaded or order cancelled' }, { status: 400 });
    }

    const arrayBuffer = await proofFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploadResult = await new Promise<{ secure_url: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'samsbikeshop_payment_proofs' },
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

    order.paymentProofUrl = uploadResult.secure_url;
    order.paymentProofUploadedAt = new Date();
    order.status = 'PAID';
    await order.save();

    return NextResponse.json({ 
      message: 'Payment proof uploaded successfully',
      order: {
        referenceNumber: order.referenceNumber,
        status: order.status,
        paymentProofUrl: order.paymentProofUrl,
      }
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Upload payment proof error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
