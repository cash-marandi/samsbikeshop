import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import dbConnect from '@/lib/mongodb';
import Auction from '@/models/Auction';
import User from '@/models/User';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  await dbConnect();

  try {
    const { auctionId, amount, maxBid } = await req.json(); // Destructure maxBid

    if (!auctionId) {
      return NextResponse.json({ message: 'Auction ID is required' }, { status: 400 });
    }
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ message: 'Bid amount is required and must be a positive number' }, { status: 400 });
    }
    if (maxBid !== undefined && (typeof maxBid !== 'number' || maxBid <= 0)) {
        return NextResponse.json({ message: 'Max bid must be a positive number if provided' }, { status: 400 });
    }

    const [auction, user] = await Promise.all([
      Auction.findById(auctionId),
      User.findById(session.user.id),
    ]);

    if (!auction) {
      return NextResponse.json({ message: 'Auction not found' }, { status: 404 });
    }

    if (!user) {
        return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    
    // Add logic here to check if user is approved for auctions
    if (!session.user.isApprovedForAuction) {
      return NextResponse.json({ message: 'You are not approved to bid. Please contact support.' }, { status: 403 });
    }

    const now = Date.now();
    if (now < auction.startTime || now > auction.endTime) {
      return NextResponse.json({ message: 'Auction is not live' }, { status: 400 });
    }

    const minAllowedBid = auction.currentBid + auction.minIncrement;
    let finalBidAmount = amount;

    // Basic auto-bidding logic: if maxBid is provided and current bid is too low,
    // automatically bid up to minAllowedBid or maxBid if it's higher.
    if (maxBid && maxBid >= minAllowedBid && amount < minAllowedBid) {
        // If direct bid 'amount' is too low, use maxBid to place a bid
        // The actual bid placed will be either minAllowedBid or slightly higher if needed to outbid previous (not fully implemented here)
        finalBidAmount = Math.min(maxBid, minAllowedBid); // For now, just meet minAllowedBid
        // A more complex proxy bidding would go here to increment just enough to outbid
    } else if (amount < minAllowedBid) {
        return NextResponse.json({ message: `Bid is too low. Minimum bid is R${minAllowedBid}.` }, { status: 400 });
    } else if (maxBid && amount > maxBid) {
        return NextResponse.json({ message: `Bid amount cannot exceed your max bid of R${maxBid}.` }, { status: 400 });
    } else if (maxBid && amount < maxBid && amount >= minAllowedBid) {
        finalBidAmount = amount; // User is bidding below their max, but it's a valid bid
    }
    // If no maxBid, finalBidAmount remains 'amount'
    // If maxBid is lower than current bid, it's ignored for this bid.

    const newBid = {
      user: session.user.id,
      amount: finalBidAmount,
      time: new Date(),
      maxBid: maxBid || null, // Store maxBid with the bid history for context
    };

    // Before pushing new bid, check if there's an existing maxBid from another user
    // This is where proper proxy bidding logic would come in:
    // 1. Check if there's a stored maxBid higher than finalBidAmount.
    // 2. If so, place a proxy bid from that user.
    // This requires a persistent storage for proxy bids, which we don't have yet.
    // For now, this is a direct bid and we store the submitted maxBid.

    auction.bidHistory.push(newBid);
    auction.currentBid = finalBidAmount; // Update currentBid with finalBidAmount

    await auction.save();

    const populatedAuction = await auction.populate({
        path: 'bidHistory.user',
        model: 'User',
        select: 'name'
    });

    // --- Socket.IO Emission via HTTP Endpoint ---
    // Emit 'bidUpdated' to all clients subscribed to this auction.
    const host = req.headers.get('host');
    const socketEmitUrl = host
      ? `http://${host.split(':')[0]}:3001/socket-emit`
      : 'http://localhost:3001/socket-emit'; // Fallback to localhost if host header is missing
    
    await fetch(socketEmitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'bidUpdated',
        room: auctionId,
        data: populatedAuction, // Send the updated auction object
      }),
    });

    // Identify previous highest bidder and emit 'outbidNotification'
    // This requires additional logic to track previous bidders and their socket IDs or user IDs.
    // For now, we'll just log that it would happen.
    console.log(`Would emit 'outbidNotification' if previous bidder could be identified.`);
    // Example for a specific user (requires mapping user ID to socket ID or a user-specific room):
    // if (previousHighestBidderId && previousHighestBidderId !== session.user.id) {
    //   await fetch(`http://${req.headers.host}/socket-emit`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({
    //       event: 'outbidNotification',
    //       recipientUserId: previousHighestBidderId, // Server.js /socket-emit would need to handle this
    //       data: { auctionId, newBidAmount: amount, auctionName: auction.name },
    //     }),
    //   });
    // }
    // ------------------------------------------

    return NextResponse.json(populatedAuction);
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}