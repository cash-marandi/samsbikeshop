
import React from 'react';
import { useSession } from 'next-auth/react';
import { Auction } from '@/app/types';
import AuctionCountdown from '@/app/admin-dashboard/AuctionCountdown';

interface AuctionCardProps {
  auction: Auction;
  bidAmounts: { [key: string]: string };
  userWatchlist: string[];
  maxBidStates: { [key: string]: { enabled: boolean; amount: string } };
  handleToggleWatchlist: (auctionId: string) => void;
  handleAuctionEnd: (auctionId: string) => void;
  handleBidChange: (auctionId: string, value: string) => void;
  handleBidBlur: (auctionId: string) => void;
  handlePlaceBid: (auctionId: string, amount: number) => void;
  handleMaxBidChange: (auctionId: string, value: string) => void;
  handleMaxBidToggle: (auctionId: string, enabled: boolean) => void;
}

export default function AuctionCard({
  auction,
  bidAmounts,
  userWatchlist,
  maxBidStates,
  handleToggleWatchlist,
  handleAuctionEnd,
  handleBidChange,
  handleBidBlur,
  handlePlaceBid,
  handleMaxBidChange,
  handleMaxBidToggle,
}: AuctionCardProps) {
  const { data: session } = useSession();

  return (
    <div key={auction.id} className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-white border border-gray-300 rounded-lg overflow-hidden">
      <div className="lg:col-span-5 h-80 lg:h-auto relative">
        {auction.image ? <img src={auction.image} className="w-full h-full object-cover" alt={auction.name} /> : <div className="w-full h-full bg-ink-100 flex items-center justify-center text-ink-400">No Image</div>}
        <div className={`absolute top-6 left-6 px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 ${auction.status === 'LIVE' ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
          {auction.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>}
          {auction.status === 'LIVE' ? 'ACTIVE' : auction.status}
        </div>
      </div>
      
      <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-3xl font-bold">{auction.name}</h2>
            {session?.user && (
              <button
                onClick={() => handleToggleWatchlist(auction.id)}
                 className="text-gray-600 hover:text-orange-500 transition-colors p-2 -mr-2 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500"
                title={userWatchlist.includes(auction.id) ? 'Remove from Watchlist' : 'Add to Watchlist'}
              >
                                       <svg className={`w-6 h-6 ${userWatchlist.includes(auction.id) ? 'fill-current text-orange-500' : 'stroke-current'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="ml-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-green-500 text-white align-middle">LIVE</span>
          )}
          <p className="text-gray-700 mb-8 leading-relaxed">{auction.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
              <span className="block text-[10px] text-gray-600 uppercase font-bold mb-1">Current High Bid</span>
              <span className="text-2xl font-bold text-orange-500">R{auction.currentBid}</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
              <span className="block text-[10px] text-gray-600 uppercase font-bold mb-1">Min. Increment</span>
              <span className="text-2xl font-bold text-gray-900">R{auction.minIncrement}</span>
            </div>
            <div className="p-4 rounded-lg bg-gray-100 border border-gray-300">
              <span className="block text-[10px] text-gray-600 uppercase font-bold mb-1">Bidders</span>
              <span className="text-2xl font-bold text-gray-900">{auction.bidHistory?.length || 0}</span>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <span className="block text-[10px] text-orange-500 uppercase font-bold mb-1">Ends In</span>
              {auction.status === 'LIVE' ? (
                  <AuctionCountdown endTime={auction.endTime} onEnd={() => handleAuctionEnd(auction.id)} />
                ) : (
                  <span className="text-2xl font-bold text-gray-600 italic">{auction.status}</span>
              )}
            </div>
          </div>
        </div>

        {auction.status === 'LIVE' ? (
          <div>
            <div className="flex justify-center gap-2 mb-4">
              {[5, 10, 25, 50].map(increment => (
                <button
                  key={increment}
                  onClick={() => handleBidChange(auction.id, (Number(bidAmounts[auction.id]) + increment).toString())}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 text-sm rounded-full transition-colors"
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
                className="flex-grow bg-white border border-gray-300 rounded-xl px-6 py-4 focus:outline-none focus:border-orange-500 font-bold disabled:cursor-not-allowed disabled:bg-gray-100"
                disabled={!session?.user || !session.user.isApprovedForAuction}
              />
              <button 
                onClick={() => handlePlaceBid(auction.id, Number(bidAmounts[auction.id]))}
                className="px-10 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl transition-colors uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!session?.user || !session.user.isApprovedForAuction}
              >
                Place Bid
              </button>
            </div>

            {session?.user && session.user.isApprovedForAuction && (
              <div className="mt-4 p-4 bg-gray-100 border border-gray-300 rounded-xl">
                <label className="inline-flex items-center">
                  <input
                    type="checkbox"
                    className="form-checkbox h-5 w-5 text-orange-500 bg-white border-gray-300 rounded"
                    checked={maxBidStates[auction.id]?.enabled || false}
                    onChange={(e) => handleMaxBidToggle(auction.id, e.target.checked)}
                  />
                  <span className="ml-2 text-gray-700">Set Max Bid (Auto-bid)</span>
                </label>
                {maxBidStates[auction.id]?.enabled && (
                  <input
                    type="number"
                    placeholder="Your max bid amount"
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 mt-2 focus:outline-none focus:border-orange-500"
                    value={maxBidStates[auction.id]?.amount || ''}
                    onChange={(e) => handleMaxBidChange(auction.id, e.target.value)}
                    min={Number(bidAmounts[auction.id]) || auction.currentBid + auction.minIncrement}
                  />
                )}
                <p className="text-xs text-gray-600 mt-2">
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
           <div className="p-6 rounded-lg bg-gray-200 text-center text-gray-700 font-bold uppercase tracking-widest text-sm">
            {auction.status === 'UPCOMING' ? 'Auction Has Not Started' : 'Auction Has Ended'}
          </div>
        )}
        
        {(!session?.user) && auction.status === 'LIVE' && (
          <p className="text-xs text-yellow-500 mt-4 font-medium flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
            Note: You need to be logged in to place bids on live auctions.
          </p>
        )}
      </div>
    </div>
  );
}
