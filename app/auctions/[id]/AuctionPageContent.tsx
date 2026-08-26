'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useCart } from '@/app/context/CartContext';
import { useSocket } from '@/app/context/SocketContext';
import AuctionCountdown from '@/app/admin-dashboard/AuctionCountdown';

interface AuctionPageContentProps {
  auction: any;
}

export default function AuctionPageContent({ auction: initialAuction }: AuctionPageContentProps) {
  const { data: session } = useSession();
  const { showToast } = useCart();
  const { socket } = useSocket();

  const [auction, setAuction] = useState(initialAuction);
  const [bidAmount, setBidAmount] = useState((initialAuction.currentBid + initialAuction.minIncrement).toString());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getAuctionStatus = useCallback((startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'ENDED';
    return 'LIVE';
  }, []);

  useEffect(() => {
    if (!socket || !auction?.id) return;

    socket.emit('joinAuctionRoom', auction.id);

    const handleBidUpdate = (updatedAuction: any) => {
      if (updatedAuction.id === auction.id) {
        setAuction((prev: any) => ({
            ...prev!,
            ...updatedAuction,
            id: updatedAuction._id?.toString() || updatedAuction.id,
        }));
        setBidAmount((updatedAuction.currentBid + updatedAuction.minIncrement).toString());
      }
    };

    socket.on('bidUpdated', handleBidUpdate);

    return () => {
      socket.emit('leaveAuctionRoom', auction.id);
      socket.off('bidUpdated', handleBidUpdate);
    };
  }, [socket, auction]);

  const handlePlaceBid = async () => {
    if (!session?.user) {
      showToast('Please log in to place a bid.');
      return;
    }
    if (!auction) return;

    const amount = Number(bidAmount);
    const minBid = auction.currentBid + auction.minIncrement;
    if (isNaN(amount) || amount < minBid) {
      showToast(`Your bid must be at least R${minBid}.`);
      setBidAmount(minBid.toString());
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auctions/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId: auction.id, amount }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to place bid.');
      }
      showToast('Bid placed successfully!');
    } catch (err: any) {
      showToast(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAuctionEnd = () => {
    if (auction) {
      setAuction({ ...auction, status: 'ENDED' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div>
          <img src={auction.image} alt={auction.name} className="w-full h-auto rounded-lg shadow-lg" />
        </div>
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter mb-4">{auction.name}</h1>
          <p className="text-gray-600 mb-6">{auction.description}</p>

          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Current Bid</p>
              <p className="text-3xl font-bold text-orange-500">R{auction.currentBid}</p>
            </div>
            <div className="p-4 bg-gray-100 rounded-lg">
              <p className="text-sm text-gray-600">Time Left</p>
              <div className="text-3xl font-bold">
                {auction.status === 'LIVE' ? (
                  <AuctionCountdown endTime={auction.endTime} onEnd={handleAuctionEnd} />
                ) : (
                  <span className="text-gray-600">{auction.status}</span>
                )}
              </div>
            </div>
          </div>

          {auction.status === 'LIVE' && (
            <div className="space-y-4">
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                disabled={!session?.user || isSubmitting}
              />
              <button
                onClick={handlePlaceBid}
                className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 disabled:opacity-50"
                disabled={!session?.user || isSubmitting}
              >
                {isSubmitting ? 'Placing Bid...' : 'Place Bid'}
              </button>
               {!session?.user && <p className="text-sm text-center text-gray-500">You must be logged in to bid.</p>}
            </div>
          )}

          {auction.status !== 'LIVE' && (
            <div className="text-center p-4 bg-gray-200 rounded-lg">
              <p className="font-bold text-gray-700">{auction.status === 'UPCOMING' ? 'Auction has not started.' : 'Auction has ended.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
