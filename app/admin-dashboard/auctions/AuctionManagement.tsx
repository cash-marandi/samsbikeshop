'use client';

import React, { useState, useEffect } from 'react';

interface Auction {
  _id: string;
  name: string;
  description: string;
  currentBid: number;
  minIncrement: number;
  startTime: string;
  endTime: string;
  image: string;
  status: string;
  bidHistory: Array<{
    user: { id: string; name: string };
    amount: number;
    time: string;
  }>;
  createdAt: string;
}

export function AuctionManagement() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/auctions?limit=100');
        if (response.ok) {
          const data = await response.json();
          setAuctions(data.auctions || []);
        } else {
          setError('Failed to fetch auctions');
        }
      } catch (error) {
        setError('Error fetching auctions from database');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const getAuctionStatus = (startTime: string, endTime: string): 'active' | 'upcoming' | 'ended' => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'ended';
    return 'active';
  };

  const getTimeLeft = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return 'Ended';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const filteredAuctions = selectedStatus === 'all' 
    ? auctions 
    : auctions.filter(auction => getAuctionStatus(auction.startTime, auction.endTime) === selectedStatus);

  const handleEdit = (auctionId: string) => {
    // Navigate to edit form with auction ID
    window.location.href = `/admin-dashboard/edit-auction?id=${auctionId}`;
  };

  const handleDelete = async (auctionId: string) => {
    if (!confirm('Are you sure you want to delete this auction?')) return;
    
    try {
      const response = await fetch(`/api/auctions?id=${auctionId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        setAuctions(auctions.filter(a => a._id !== auctionId));
      } else {
        setError('Failed to delete auction');
      }
    } catch (error) {
      setError('Error deleting auction');
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Auction Management</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
          Create New Auction
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex gap-4">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Auctions</option>
            <option value="active">Active</option>
            <option value="upcoming">Upcoming</option>
            <option value="ended">Ended</option>
          </select>
          <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
            Export Data
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAuctions.map((auction) => {
          const status = getAuctionStatus(auction.startTime, auction.endTime);
          const timeLeft = getTimeLeft(auction.endTime);
          const bidCount = auction.bidHistory?.length || 0;
          
          return (
            <div key={auction._id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="h-48 bg-gray-200 relative">
                {auction.image ? (
                  <img 
                    src={auction.image} 
                    alt={auction.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-6xl">🚲</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{auction.name}</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Current Bid:</span>
                    <span className="font-semibold text-green-600">R{auction.currentBid.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Left:</span>
                    <span className="font-medium">{timeLeft}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Bids:</span>
                    <span className="font-medium">{bidCount}</span>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm">
                    View Details
                  </button>
                  <button 
                    onClick={() => handleEdit(auction._id)}
                    className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(auction._id)}
                    className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {filteredAuctions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No auctions found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}