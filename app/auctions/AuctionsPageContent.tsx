'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Auction, AuctionCategory } from '../types';
import AuctionFilters from './components/AuctionFilters';
import AuctionGrid from './components/AuctionGrid';
import { useCart } from '@/app/context/CartContext';
import { useSocket } from '@/app/context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';

export default function AuctionsPageContent({ auctions: initialAuctions }: { auctions: any[] }) {
  const { data: session, update: updateSession } = useSession();
  const { showToast } = useCart();
  const { socket } = useSocket();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bidAmounts, setBidAmounts] = useState<{ [key: string]: string }>({});
  const [userWatchlist, setUserWatchlist] = useState<string[]>([]);
  const [maxBidStates, setMaxBidStates] = useState<{ [key: string]: { enabled: boolean; amount: string } }>({});

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const getAuctionStatus = useCallback((startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'ENDED';
    return 'LIVE';
  }, []);

  useEffect(() => {
    if (session?.user?.watchlist) {
      setUserWatchlist(session.user.watchlist.map((auc: any) => auc.id || auc.toString()));
    }
  }, [session?.user?.watchlist]);

  useEffect(() => {
    if (!initialAuctions || initialAuctions.length === 0) {
      setAuctions([]);
      return;
    }

    const processed = initialAuctions.map((auc: any) => {
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
    setAuctions(processed);

    const initialBids = processed.reduce((acc: Record<string, string>, auc: any) => {
      if (auc.status === 'LIVE') {
        acc[auc.id] = (auc.currentBid + auc.minIncrement).toString();
      }
      return acc;
    }, {} as { [key: string]: string });
    setBidAmounts(initialBids);
  }, [initialAuctions, getAuctionStatus]);

  const fetchAuctions = useCallback(async () => {
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

    try {
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

      const initialBids = newAuctions.reduce((acc: Record<string, string>, auc: any) => {
        if (auc.status === 'LIVE') {
          acc[auc.id] = (auc.currentBid + auc.minIncrement).toString();
        }
        return acc;
      }, {} as { [key: string]: string });
      setBidAmounts(initialBids);

    } catch (err: any) {
      console.error('Failed to fetch auctions:', err);
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
