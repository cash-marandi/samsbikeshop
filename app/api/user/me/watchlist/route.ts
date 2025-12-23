import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth'; // Assuming authOptions is exported from here

export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.email) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { auctionId, type } = await req.json();

    if (!auctionId || (type !== 'add' && type !== 'remove')) {
      return NextResponse.json({ message: 'Invalid request parameters.' }, { status: 400 });
    }

    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json({ message: 'User not found.' }, { status: 404 });
    }

    if (type === 'add') {
      if (!user.watchlist.includes(auctionId)) {
        user.watchlist.push(auctionId);
      }
    } else if (type === 'remove') {
      user.watchlist = user.watchlist.filter(
        (id: any) => id.toString() !== auctionId
      );
    }

    await user.save();

    return NextResponse.json({ message: 'Watchlist updated successfully.', watchlist: user.watchlist }, { status: 200 });
  } catch (error: any) {
    console.error('Update watchlist API error:', error);
    return NextResponse.json({ message: error.message || 'An internal server error occurred.' }, { status: 500 });
  }
}
