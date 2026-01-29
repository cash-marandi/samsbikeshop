'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react'; // 'update' removed from here
import { Auction, AuctionCategory } from '../types';
import AuctionCountdown from '../admin-dashboard/AuctionCountdown';
import AuctionFilters from './components/AuctionFilters';
import AuctionGrid from './components/AuctionGrid';
import { useCart } from '@/app/context/CartContext';
import { useSocket } from '@/app/context/SocketContext';

// Assume a Toast/Notification component exists or needs to be created
// For simplicity, we'll use a basic alert for now.
export default function AuctionsPage() {
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useCart();
  const { socket } = useSocket();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({});
  const [userWatchlist, setUserWatchlist] = useState<string[]>([]);
  const [maxBidStates, setMaxBidStates] = useState<{ [key: string]: { enabled: boolean; amount: string } }>(
    {}
  ); // New state for max bid

  // New states for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (session?.user?.watchlist) {
      // Ensure the watchlist items are strings (IDs) for comparison
      setUserWatchlist(session.user.watchlist.map((auc: any) => auc.id || auc.toString()));
    }
  }, [session?.user?.watchlist]);

  const getAuctionStatus = useCallback((startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'ENDED';
    return 'LIVE';
  }, []); // Empty dependency array as it doesn't depend on any props or state

  const fetchAuctions = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (selectedCategory && selectedCategory !== 'all') {
        queryParams.append('category', selectedCategory);
      }
      if (sortBy) {
        queryParams.append('sortBy', sortBy);
      }
      if (searchTerm) {
        queryParams.append('search', searchTerm);
      }

      const response = await fetch(`/api/auctions?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch auctions.');
      
      const responseData = await response.json();
      const data: any[] = responseData.auctions || [];
      const newAuctions = data.map(auc => {
        const startTime = new Date(auc.startTime).getTime();
        const endTime = new Date(auc.endTime).getTime();
        return {
          ...auc,
          id: auc._id?.toString() || auc.id, // Ensure _id is mapped to id, handle both cases
          status: getAuctionStatus(startTime, endTime),
          startTime: startTime,
          endTime: endTime,
        };
      });
      setAuctions(newAuctions);

      const initialBids = newAuctions.reduce((acc, auc) => {
        if (auc.status === 'LIVE') {
          acc[auc.id] = (auc.currentBid + auc.minIncrement).toString();
        }
        return acc;
      }, {} as { [key: string]: string });
      setBidAmounts(initialBids);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory, sortBy, searchTerm, getAuctionStatus]);

  useEffect(() => {
    fetchAuctions();
  }, [fetchAuctions]);

  useEffect(() => {
    if (!socket) return;

    // Join rooms for all currently fetched auctions
    auctions.forEach(auction => {
      socket.emit('joinAuctionRoom', auction.id);
    });

    // Listen for bid updates
    const handleBidUpdate = (updatedAuction: Auction) => {
      setAuctions(prevAuctions =>
        prevAuctions.map(auc =>
          auc.id === updatedAuction.id ? { ...updatedAuction, id: updatedAuction._id?.toString() || updatedAuction.id } : auc
        )
      );
      setBidAmounts(prev => ({
        ...prev,
        [updatedAuction.id]: (updatedAuction.currentBid + updatedAuction.minIncrement).toString()
      }));
    };

    socket.on('bidUpdated', handleBidUpdate);

    // Cleanup function: leave rooms and remove listener when component unmounts or auctions change
    return () => {
      auctions.forEach(auction => {
        socket.emit('leaveAuctionRoom', auction.id);
      });
      socket.off('bidUpdated', handleBidUpdate);
    };
  }, [socket, auctions, setAuctions, setBidAmounts]);



  const handleToggleWatchlist = useCallback(async (auctionId: string) => {
    if (!session?.user) {
      showToast('Please log in to manage your watchlist.');
      return;
    }

    const isOnWatchlist = userWatchlist.includes(auctionId);
    const type = isOnWatchlist ? 'remove' : 'add';

    try {
      const response = await fetch('/api/user/me/watchlist', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ auctionId, type }),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to update watchlist.');

      setUserWatchlist(prev => 
        isOnWatchlist ? prev.filter(id => id !== auctionId) : [...prev, auctionId]
      );

      await updateSession();
      
    } catch (err: any) {
showToast(err.message);
      setUserWatchlist(prev => 
        isOnWatchlist ? [...prev, auctionId] : prev.filter(id => id !== auctionId)
      );
    }
  }, [session?.user, userWatchlist, updateSession]);

  const handleAuctionEnd = (auctionId: string) => {
    setAuctions(prevAuctions =>
      prevAuctions.map(auc =>
        auc.id === auctionId ? { ...auc, status: 'ENDED' } : auc
      )
    );
  };

  const handleBidChange = (auctionId: string, value: string) => {
    setBidAmounts(prev => ({ ...prev, [auctionId]: value }));
  };

  const handleMaxBidChange = (auctionId: string, value: string) => {
    setMaxBidStates(prev => ({
      ...prev,
      [auctionId]: { ...prev[auctionId], amount: value }
    }));
  };

  const handleMaxBidToggle = (auctionId: string, enabled: boolean) => {
    setMaxBidStates(prev => ({
      ...prev,
      [auctionId]: { ...prev[auctionId], enabled: enabled }
    }));
  };

  const handleBidBlur = (auctionId: string) => {
    const auction = auctions.find(a => a.id === auctionId);
    const bidAmount = Number(bidAmounts[auctionId]);
    if (auction) {
        const minBid = auction.currentBid + auction.minIncrement;
        if (isNaN(bidAmount) || bidAmount < minBid) {
            setBidAmounts(prev => ({ ...prev, [auctionId]: minBid.toString() }));
        }
    }
  };

  const handlePlaceBid = async (auctionId: string, amount: number) => {
    if (!session?.user) {
      showToast('Please log in to bid.');
      return;
    }
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;
    
    const minBid = auction.currentBid + auction.minIncrement;
    if (!auctionId || !amount || amount < minBid) {
        showToast(`Your bid must be at least R${minBid}.`);
        setBidAmounts(prev => ({...prev, [auctionId]: minBid.toString()}));
        return;
    }

    try {
      const maxBidData = maxBidStates[auctionId];
      const payload: { auctionId: string; amount: number; maxBid?: number } = { auctionId, amount };
      if (maxBidData && maxBidData.enabled && Number(maxBidData.amount) > amount) {
        payload.maxBid = Number(maxBidData.amount);
      }

      const response = await fetch('/api/auctions/bid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();
      if (!response.ok) throw new Error(result.message || 'Failed to place bid.');

      const updatedAuction = {
        ...result,
        id: result._id?.toString() || result.id, // Ensure _id is mapped to id, handle both cases
        status: getAuctionStatus(new Date(result.startTime).getTime(), new Date(result.endTime).getTime())
      };
      
      setBidAmounts(prev => ({...prev, [auctionId]: (updatedAuction.currentBid + updatedAuction.minIncrement).toString()}));

    } catch (err: any) {
      showToast(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900 text-xl">Loading Auctions...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h1 className="text-4xl font-bold uppercase tracking-tighter">Live Auctions</h1>
        <p className="text-gray-600 mt-2">Bid on exclusive frames, rare components, and collector bikes.</p>
      </div>

      <AuctionFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        sortBy={sortBy}
        setSortBy={setSortBy}
      />

      <AuctionGrid
        auctions={auctions}
        bidAmounts={bidAmounts}
        userWatchlist={userWatchlist}
        maxBidStates={maxBidStates}
        handleToggleWatchlist={handleToggleWatchlist}
        handleAuctionEnd={handleAuctionEnd}
        handleBidChange={handleBidChange}
        handleBidBlur={handleBidBlur}
        handlePlaceBid={handlePlaceBid}
        handleMaxBidChange={handleMaxBidChange}
        handleMaxBidToggle={handleMaxBidToggle}
      />
    </div>
  );
};