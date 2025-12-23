'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react'; // 'update' removed from here
import { Auction, AuctionCategory } from '../types';
import AuctionCountdown from '../admin-dashboard/AuctionCountdown';
import io from 'socket.io-client'; // Import socket.io-client

// Assume a Toast/Notification component exists or needs to be created
// For simplicity, we'll use a basic alert for now.
const showNotification = (message: string) => {
  // In a real app, this would be a more sophisticated toast or notification system
  alert(message);
};

export default function AuctionsPage() {
  const { data: session, update: updateSession } = useSession();
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
      
      const data: any[] = await response.json();
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

  // Socket.IO Client Integration
  useEffect(() => {
    // Connect to the Socket.IO server. Adjust URL if your server is elsewhere.
    // For Next.js API routes, you might need a separate Socket.IO server or adapter.
    // Assuming a simple setup where client connects to the same origin.
    const socket = io('http://localhost:3001'); // Connects to the Socket.IO server on port 3001

    socket.on('connect', () => {
      console.log('Connected to Socket.IO server');
      // After connecting, join rooms for currently displayed auctions
      auctions.forEach(auction => {
        socket.emit('joinAuctionRoom', auction.id);
      });
    });

    socket.on('bidUpdated', (updatedAuction: Auction) => {
      console.log('Bid updated:', updatedAuction);
      setAuctions(prevAuctions =>
        prevAuctions.map(auc =>
          auc.id === updatedAuction.id ? { ...updatedAuction, id: updatedAuction._id?.toString() || updatedAuction.id } : auc
        )
      );
      setBidAmounts(prev => ({
        ...prev,
        [updatedAuction.id]: (updatedAuction.currentBid + updatedAuction.minIncrement).toString()
      }));
    });

    socket.on('outbidNotification', (data: { auctionId: string; newBidAmount: number; auctionName: string }) => {
      if (session?.user?.id) { // Only show if logged in
        // Check if the current user was the one outbid. This logic might need refinement
        // depending on how outbid event is structured by server.
        // For now, assume if this event is received, user might be outbid.
        showNotification(`You have been outbid on ${data.auctionName}! New bid: R${data.newBidAmount}`);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from Socket.IO server');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket.IO connection error:', err);
    });

    // Cleanup function
    return () => {
      auctions.forEach(auction => {
        socket.emit('leaveAuctionRoom', auction.id);
      });
      socket.disconnect();
    };
  }, [auctions, session?.user?.id]); // Re-run effect if auctions or user changes to join/leave rooms

  const handleToggleWatchlist = useCallback(async (auctionId: string) => {
    if (!session?.user) {
      alert('Please log in to manage your watchlist.');
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
      alert(err.message);
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
      alert('Please log in to bid.');
      return;
    }
    const auction = auctions.find(a => a.id === auctionId);
    if (!auction) return;
    
    const minBid = auction.currentBid + auction.minIncrement;
    if (!auctionId || !amount || amount < minBid) {
        alert(`Your bid must be at least R${minBid}.`);
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
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl">Loading Auctions...</div>
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
        <h1 className="text-4xl font-black uppercase tracking-tighter">Live Auctions</h1>
        <p className="text-zinc-500 mt-2">Bid on exclusive frames, rare components, and collector bikes.</p>
      </div>

      {/* Filter and Sort Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="flex-grow">
          <input
            type="text"
            placeholder="Search auctions..."
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-900"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex-shrink-0">
          <select
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-900 appearance-none"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {Object.values(AuctionCategory).map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>
        <div className="flex-shrink-0">
          <select
            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-900 appearance-none"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="newest">Newest</option>
            <option value="endingSoon">Ending Soon</option>
            <option value="priceAsc">Price: Low to High</option>
            <option value="priceDesc">Price: High to Low</option>
          </select>
        </div>
      </div>

      <div className="space-y-12">
        {auctions.length > 0 ? auctions.map(auction => (
          <div key={auction.id} className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="lg:col-span-5 h-80 lg:h-auto relative">
              <img src={auction.image} className="w-full h-full object-cover" alt={auction.name} />
              <div className={`absolute top-6 left-6 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${auction.status === 'LIVE' ? 'bg-blue-900 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                {auction.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse"></span>}
                {auction.status === 'LIVE' ? 'ACTIVE' : auction.status}
              </div>
            </div>
            
            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-3xl font-black">{auction.name}</h2>
                  {session?.user && (
                    <button
                      onClick={() => handleToggleWatchlist(auction.id)}
                      className="text-zinc-500 hover:text-blue-900 transition-colors p-2 -mr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-900"
                      title={userWatchlist.includes(auction.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <svg className={`w-6 h-6 ${userWatchlist.includes(auction.id) ? 'fill-current text-blue-900' : 'stroke-current'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {userWatchlist.includes(auction.id) ? (
                          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        ) : (
                          <path d="M12 21.23l-7.78-7.78 1.06-1.06a5.5 5.5 0 0 1 7.78-7.78l1.06 1.06 1.06-1.06a5.5 5.5 0 0 1 7.78 7.78l-1.06 1.06z"></path>
                        )}
                      </svg>
                    </button>
                  )}
                </div>
                {auction.status === 'LIVE' && (
                  <span className="ml-3 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-zinc-950 align-middle">LIVE</span>
                )}
                <p className="text-zinc-400 mb-8 leading-relaxed">{auction.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Current High Bid</span>
                    <span className="text-2xl font-black text-blue-900">R{auction.currentBid}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Min. Increment</span>
                    <span className="text-2xl font-black text-zinc-200">R{auction.minIncrement}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Bidders</span>
                    <span className="text-2xl font-black text-zinc-200">{auction.bidHistory?.length || 0}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-blue-900/10 border border-blue-900/20">
                    <span className="block text-[10px] text-blue-900 uppercase font-bold mb-1">Ends In</span>
                    {auction.status === 'LIVE' ? (
                        <AuctionCountdown endTime={auction.endTime} onEnd={() => handleAuctionEnd(auction.id)} />
                      ) : (
                        <span className="text-2xl font-black text-zinc-500 italic">{auction.status}</span>
                    )}
                  </div>
                </div>
              </div>

              {auction.status === 'LIVE' ? (
                <div>
                  <div className="flex justify-center gap-2 mb-4"> {/* Suggested Bid Increments */}
                    {[5, 10, 25, 50].map(increment => (
                      <button
                        key={increment}
                        onClick={() => handleBidChange(auction.id, (Number(bidAmounts[auction.id]) + increment).toString())}
                        className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded-full transition-colors"
                        disabled={!session?.user || !session.user.isApprovedForAuction}
                      >
                        +{increment}
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-col md:flex-row gap-4">
                    <input 
                      type="number" 
                      value={bidAmounts[auction.id] || ''}
                      onChange={(e) => handleBidChange(auction.id, e.target.value)}
                      onBlur={() => handleBidBlur(auction.id)}
                      className="flex-grow bg-zinc-950 border border-zinc-700 rounded-xl px-6 py-4 focus:outline-none focus:border-blue-900 font-bold disabled:cursor-not-allowed disabled:bg-zinc-800"
                      disabled={!session?.user || !session.user.isApprovedForAuction}
                    />
                    <button 
                      onClick={() => handlePlaceBid(auction.id, Number(bidAmounts[auction.id]))}
                      className="px-10 py-4 bg-blue-900 hover:bg-blue-950 text-zinc-950 font-black rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={!session?.user || !session.user.isApprovedForAuction}
                    >
                      Place Bid
                    </button>
                  </div>

                  {session?.user && session.user.isApprovedForAuction && ( // Only show if user is logged in and approved
                    <div className="mt-4 p-4 bg-zinc-950 border border-zinc-800 rounded-xl">
                      <label className="inline-flex items-center">
                        <input
                          type="checkbox"
                          className="form-checkbox h-5 w-5 text-blue-900 bg-zinc-800 border-zinc-700 rounded"
                          checked={maxBidStates[auction.id]?.enabled || false}
                          onChange={(e) => handleMaxBidToggle(auction.id, e.target.checked)}
                        />
                        <span className="ml-2 text-zinc-300">Set Max Bid (Auto-bid)</span>
                      </label>
                      {maxBidStates[auction.id]?.enabled && (
                        <input
                          type="number"
                          placeholder="Your max bid amount"
                          className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-blue-900"
                          value={maxBidStates[auction.id]?.amount || ''}
                          onChange={(e) => handleMaxBidChange(auction.id, e.target.value)}
                          min={Number(bidAmounts[auction.id]) || auction.currentBid + auction.minIncrement}
                        />
                      )}
                      <p className="text-xs text-zinc-500 mt-2">
                        We will automatically bid for you up to your max bid, using the minimum increment.
                      </p>
                    </div>
                  )}

                  {session?.user && !session.user.isApprovedForAuction && (
                    <p className="text-xs text-yellow-500 mt-4 font-medium flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                      Your account is not yet approved for bidding. Please contact support.
                    </p>
                  )}
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-800 text-center text-zinc-400 font-bold uppercase tracking-widest text-sm">
                  {auction.status === 'UPCOMING' ? 'Auction Has Not Started' : 'Auction Has Ended'}
                </div>
              )}
              
              {(!session?.user) && auction.status === 'LIVE' && (
                <p className="text-xs text-yellow-500 mt-4 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Note: You need to be logged in to place bids on live auctions.
                </p>
              )}
              
              {/* ... user warning ... */}
            </div>
          </div>
        )) : (
          <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-500">No active auctions at the moment.</h2>
            <p className="text-zinc-600 mt-2">Please check back later!</p>
          </div>
        )}
      </div>
    </div>
  );
};