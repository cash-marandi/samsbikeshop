
import React from 'react';
import { Auction } from '@/app/types';
import AuctionCard from './AuctionCard';

interface AuctionGridProps {
  auctions: Auction[];
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

export default function AuctionGrid({
  auctions,
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
}: AuctionGridProps) {
  return (
    <div className="space-y-12">
      {auctions.length > 0 ? auctions.map(auction => (
        <AuctionCard
          key={auction.id}
          auction={auction}
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
      )) : (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-600">No active auctions at the moment.</h2>
          <p className="text-gray-700 mt-2">Please check back later!</p>
        </div>
      )}
    </div>
  );
}
