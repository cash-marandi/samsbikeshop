import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Newsletter from '@/models/Newsletter';

export async function GET() {
  try {
    await dbConnect();
    const subscribers = await Newsletter.find({ isActive: true }).sort({ subscribedAt: -1 });
    return NextResponse.json({ subscribers });
  } catch (error) {
    console.error('Error fetching newsletter subscribers:', error);
    return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { email, source = 'homepage' } = body;
    
    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      if (existing.isActive) {
        return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
      } else {
        // Reactivate
        existing.isActive = true;
        existing.subscribedAt = new Date();
        await existing.save();
        return NextResponse.json({ message: 'Subscription reactivated' }, { status: 200 });
      }
    }

    const subscriber = new Newsletter({
      email,
      source,
    });

    await subscriber.save();
    return NextResponse.json({ message: 'Successfully subscribed' }, { status: 201 });
  } catch (error: any) {
    console.error('Error subscribing to newsletter:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Email already subscribed' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 });
  }
}