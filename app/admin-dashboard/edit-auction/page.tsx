'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
  updatedAt: string;
}

export default function EditAuctionPage() {
  const router = useRouter();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuction = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const auctionId = searchParams.get('id');
        
        if (!auctionId) {
          setError('Auction ID is required');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/auctions');
        if (response.ok) {
          const data = await response.json();
          const foundAuction = data.auctions?.find((a: Auction) => a._id === auctionId);
          
          if (foundAuction) {
            setAuction(foundAuction);
          } else {
            setError('Auction not found');
          }
        } else {
          setError('Failed to fetch auction');
        }
      } catch (error) {
        setError('Error fetching auction from database');
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('name', auction.name);
      formData.append('description', auction.description);
      formData.append('currentBid', auction.currentBid.toString());
      formData.append('minIncrement', auction.minIncrement.toString());
      formData.append('startTime', new Date(auction.startTime).getTime().toString());
      formData.append('endTime', new Date(auction.endTime).getTime().toString());

      const response = await fetch(`/api/auctions?id=${auction._id}`, {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Auction updated successfully!');
        setTimeout(() => {
          router.push('/admin-dashboard');
        }, 2000);
      } else {
        setError('Failed to update auction');
      }
    } catch (error) {
      setError('Error updating auction');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && auction) {
      // For now, just set a placeholder
      // In a real implementation, you'd upload this to Cloudinary
      setAuction({ ...auction, image: URL.createObjectURL(file) });
    }
  };

  const formatDateForInput = (dateString: string) => {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16); // Format for datetime-local input
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin-dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading auction...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Auction</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Auction Title
                </label>
                <input
                  type="text"
                  id="name"
                  value={auction.name}
                  onChange={(e) => setAuction({ ...auction, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  value={auction.description}
                  onChange={(e) => setAuction({ ...auction, description: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="currentBid" className="block text-sm font-medium text-gray-700 mb-2">
                  Starting Bid (R)
                </label>
                <input
                  type="number"
                  id="currentBid"
                  value={auction.currentBid}
                  onChange={(e) => setAuction({ ...auction, currentBid: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="minIncrement" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Increment (R)
                </label>
                <input
                  type="number"
                  id="minIncrement"
                  value={auction.minIncrement}
                  onChange={(e) => setAuction({ ...auction, minIncrement: parseFloat(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  min="0"
                  step="0.01"
                  required
                />
              </div>

              <div>
                <label htmlFor="startTime" className="block text-sm font-medium text-gray-700 mb-2">
                  Start Time
                </label>
                <input
                  type="datetime-local"
                  id="startTime"
                  value={formatDateForInput(auction.startTime)}
                  onChange={(e) => setAuction({ ...auction, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="endTime" className="block text-sm font-medium text-gray-700 mb-2">
                  End Time
                </label>
                <input
                  type="datetime-local"
                  id="endTime"
                  value={formatDateForInput(auction.endTime)}
                  onChange={(e) => setAuction({ ...auction, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                Auction Image
              </label>
              <div className="space-y-2">
                {auction.image && (
                  <div className="mb-4">
                    <img 
                      src={auction.image} 
                      alt={auction.name} 
                      className="h-32 w-32 object-cover rounded-lg"
                    />
                  </div>
                )}
                <input
                  type="file"
                  id="image"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin-dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}