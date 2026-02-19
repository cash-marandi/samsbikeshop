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

    const currentHighestBidder = auction.bidHistory.length > 0
      ? auction.bidHistory[auction.bidHistory.length - 1].user.toString()
      : null;

    if (currentHighestBidder === session.user.id) {
      return NextResponse.json({ message: 'You are already the highest bidder. No need to bid again!' }, { status: 400 });
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

    // Find previous highest bidder BEFORE pushing new bid
    const previousHighestBidder = auction.bidHistory.length > 0
      ? auction.bidHistory[auction.bidHistory.length - 1].user
      : null;

    auction.bidHistory.push(newBid);
    auction.currentBid = finalBidAmount; // Update currentBid with finalBidAmount

    await auction.save();

    const populatedAuction = await auction.populate({
        path: 'bidHistory.user',
        model: 'User',
        select: 'name'
    });

    // --- Socket.IO Emission via HTTP Endpoint ---
    const host = req.headers.get('host');
    const socketEmitUrl = host
      ? `http://${host.split(':')[0]}:3001/socket-emit`
      : 'http://localhost:3001/socket-emit'; // Fallback to localhost if host header is missing
    
    // 1. Emit 'bidUpdated' to all clients subscribed to this auction.
    await fetch(socketEmitUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'bidUpdated',
        room: auctionId,
        data: populatedAuction, // Send the updated auction object
      }),
    });

    // 2. Identify previous highest bidder and emit 'outbidNotification'
    if (previousHighestBidder && previousHighestBidder.toString() !== session.user.id) {
        await fetch(socketEmitUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event: 'outbidNotification',
                recipientUserId: previousHighestBidder.toString(), // Send to the outbid user
                data: { auctionId, newBidAmount: finalBidAmount, auctionName: auction.name },
            }),
        });
    }

    return NextResponse.json(populatedAuction);
  } catch (error) {
    console.error('Error placing bid:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}