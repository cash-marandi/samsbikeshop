'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Auction, AuctionCategory } from '../types';
import AuctionCountdown from '../admin-dashboard/AuctionCountdown';
import AuctionFilters from './components/AuctionFilters';
import AuctionGrid from './components/AuctionGrid';
import { useCart } from '@/app/context/CartContext';
import { useSocket } from '@/app/context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';

// Icons
const ClockIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

export default function AuctionsPage() {
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useCart();
  const { socket } = useSocket();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({});
  const [userWatchlist, setUserWatchlist] = useState<string[]>([]);
  const [maxBidStates, setMaxBidStates] = useState<{ [key: string]: { enabled: boolean; amount: string } }>({});

  // New states for filtering and sorting
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    if (session?.user?.watchlist) {
      setUserWatchlist(session.user.watchlist.map((auc: any) => auc.id || auc.toString()));
    }
  }, [session?.user?.watchlist]);

  const getAuctionStatus = useCallback((startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'ENDED';
    return 'LIVE';
  }, []);

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
          id: auc._id?.toString() || auc.id,
          status: getAuctionStatus(startTime, endTime),
          startTime,
          endTime,
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

    auctions.forEach(auction => {
      socket.emit('joinAuctionRoom', auction.id);
    });

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
  }, [session?.user, userWatchlist, updateSession, showToast]);

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
      [auctionId]: { ...prev[auctionId], enabled }
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
        id: result._id?.toString() || result.id,
        status: getAuctionStatus(new Date(result.startTime).getTime(), new Date(result.endTime).getTime())
      };
      
      setBidAmounts(prev => ({...prev, [auctionId]: (updatedAuction.currentBid + updatedAuction.minIncrement).toString()}));

    } catch (err: any) {
      showToast(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-ink-200 rounded-lg w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-ink-200/50 animate-pulse">
                <div className="h-64 bg-ink-200" />
                <div className="p-6 space-y-3">
                  <div className="h-4 bg-ink-200 rounded w-3/4" />
                  <div className="h-3 bg-ink-200 rounded w-full" />
                  <div className="h-8 bg-ink-200 rounded w-1/3" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-ink-900 mb-2">Something went wrong</h2>
          <p className="text-ink-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection>
          <div className="mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-green-600">Live Bidding</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 tracking-tight">Live Auctions</h1>
            <p className="text-ink-500 mt-2">Bid on exclusive frames, rare components, and collector bikes.</p>
          </div>
        </AnimatedSection>

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
    </div>
  );
}
