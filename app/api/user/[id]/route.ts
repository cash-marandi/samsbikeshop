import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Auction from '@/models/Auction'; // Import the Auction model
import { UserRole } from '@/app/types';

// Interface for route parameters, explicitly defining params as a Promise for safety
interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/user/[id]
export async function GET(req: NextRequest, routeContext: RouteContext) {
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log('GET /api/user/[id] - Unauthorized: No session or user');
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params; // CRITICAL FIX: Await params

    console.log('GET /api/user/[id] - Session User ID:', session.user.id);
    console.log('GET /api/user/[id] - Requested ID (params.id):', id);
    console.log('GET /api/user/[id] - Session User Role:', session.user.role);

    // Authorization:
    // 1. A TEAM_ADMIN can fetch any user's profile.
    // 2. A regular USER can only fetch their own profile.
    if (session.user.role === UserRole.TEAM_ADMIN || session.user.id === id) {
      const user = await User.findById(id).populate('watchlist').select('-password');

      if (!user) {
        console.log('GET /api/user/[id] - User not found in DB for ID:', id);
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
      }
      console.log('GET /api/user/[id] - User found:', user.name);

      // Fetch auctions where this user has placed bids
      const userBids = await Auction.find({ 'bidHistory.user': user._id }).populate('bidHistory.user', 'name');
      console.log('GET /api/user/[id] - User Bids found:', userBids.length);

      // Return combined data
      return NextResponse.json({
        user: user,
        bids: userBids,
        watchlist: user.watchlist,
      });
    } else {
      console.log('GET /api/user/[id] - Forbidden: User role or ID mismatch');
      return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE /api/user/[id]
export async function DELETE(req: NextRequest, routeContext: RouteContext) { // Changed 'params' to 'routeContext' for clarity with async destructuring
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== UserRole.TEAM_ADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params; // CRITICAL FIX: Await params
    const deletedUser = await User.findByIdAndDelete(id);

    if (!deletedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// PATCH /api/user/[id] - Update user details (e.g., isApprovedForAuction)
export async function PATCH(req: NextRequest, routeContext: RouteContext) { // Changed 'params' to 'routeContext' for clarity with async destructuring
  await dbConnect();
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || session.user.role !== UserRole.TEAM_ADMIN) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await routeContext.params; // CRITICAL FIX: Await params
    const body = await req.json();
    const { isApprovedForAuction } = body;

    console.log('PATCH /api/user/[id] - Received ID:', id);
    console.log('PATCH /api/user/[id] - isApprovedForAuction:', isApprovedForAuction);

    // Validate the incoming data
    if (typeof isApprovedForAuction !== 'boolean') {
      return NextResponse.json({ message: 'Invalid value for isApprovedForAuction' }, { status: 400 });
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { isApprovedForAuction: isApprovedForAuction },
      { new: true, runValidators: true } // Return the updated document and run schema validators
    ).select('-password');

    console.log('PATCH /api/user/[id] - Updated User Result:', updatedUser);

    if (!updatedUser) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
