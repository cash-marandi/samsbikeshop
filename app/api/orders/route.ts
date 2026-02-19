import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  
  try {
    const body = await req.json();
    const { referenceNumber, customer, items, total, paymentMethod } = body;

    if (!referenceNumber || !customer || !items || total === undefined) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const order = new Order({
      referenceNumber,
      customer,
      items,
      total,
      paymentMethod: paymentMethod || 'EFT',
      status: 'PENDING_PAYMENT',
    });

    await order.save();

    return NextResponse.json({ 
      message: 'Order created successfully',
      order: {
        referenceNumber: order.referenceNumber,
        total: order.total,
        status: order.status,
      }
    }, { status: 201 });
  } catch (error: unknown) {
    console.error('Create order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  await dbConnect();
  
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'TEAM_ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const query: Record<string, string> = {};
    if (status) {
      query.status = status;
    }

    const [orders, total] = await Promise.all([
      Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Order.countDocuments(query),
    ]);

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    }, { status: 200 });
  } catch (error: unknown) {
    console.error('Fetch orders error:', error);
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
    const { referenceNumber, status } = body;

    if (!referenceNumber || !status) {
      return NextResponse.json({ message: 'Reference number and status are required' }, { status: 400 });
    }

    const order = await Order.findOneAndUpdate(
      { referenceNumber },
      { status },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ message: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json(order, { status: 200 });
  } catch (error: unknown) {
    console.error('Update order error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An error occurred';
    return NextResponse.json({ message: errorMessage }, { status: 500 });
  }
}
