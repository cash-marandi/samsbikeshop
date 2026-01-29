'use client';

import React, { useState, useEffect } from 'react';

interface StatsData {
  totalProducts: number;
  activeAuctions: number;
  totalUsers: number;
  activeRentals: number;
  loading: boolean;
  error: string | null;
}

export function StatsOverview() {
  const [stats, setStats] = useState<StatsData>({
    totalProducts: 0,
    activeAuctions: 0,
    totalUsers: 0,
    activeRentals: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch products count
        const productsResponse = await fetch('/api/products?limit=1');
        if (productsResponse.ok) {
          const productsData = await productsResponse.json();
          setStats(prev => ({ ...prev, totalProducts: productsData.pagination?.total || 0 }));
        }

        // Fetch auctions count
        const auctionsResponse = await fetch('/api/auctions?limit=1');
        if (auctionsResponse.ok) {
          const auctionsData = await auctionsResponse.json();
          const now = new Date();
          const activeAuctions = auctionsData.auctions?.filter((auction: any) => {
            const startTime = new Date(auction.startTime);
            const endTime = new Date(auction.endTime);
            return now >= startTime && now <= endTime;
          }).length || 0;
          setStats(prev => ({ ...prev, activeAuctions }));
        }

        // Fetch users count
        const usersResponse = await fetch('/api/users');
        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setStats(prev => ({ ...prev, totalUsers: Array.isArray(usersData) ? usersData.length : 0 }));
        }

        // Fetch rentals count
        const rentalsResponse = await fetch('/api/rental-reservations');
        if (rentalsResponse.ok) {
          const rentalsData = await rentalsResponse.json();
          const now = new Date();
          const activeRentals = rentalsData.reservations?.filter((rental: any) => {
            const startDate = new Date(rental.startDate);
            const endDate = new Date(rental.endDate);
            return now >= startDate && now <= endDate;
          }).length || 0;
          setStats(prev => ({ ...prev, activeRentals }));
        }

        setStats(prev => ({ ...prev, loading: false }));
      } catch (error) {
        setStats(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to fetch dashboard statistics' 
        }));
      }
    };

    fetchStats();
  }, []);

  if (stats.loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (stats.error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{stats.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-orange-100 rounded-full">
              <span className="text-2xl">🚲</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-full">
              <span className="text-2xl">⏱️</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Auctions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeAuctions.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-full">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-full">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Active Rentals</p>
              <p className="text-2xl font-bold text-gray-900">{stats.activeRentals.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">System Overview</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-900">Products in Database</p>
                <p className="text-sm text-gray-600">All available products</p>
              </div>
              <span className="text-green-600 font-semibold">{stats.totalProducts}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium text-gray-900">Active Auctions</p>
                <p className="text-sm text-gray-600">Currently running</p>
              </div>
              <span className="text-blue-600 font-semibold">{stats.activeAuctions}</span>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">Active Rentals</p>
                <p className="text-sm text-gray-600">Currently rented</p>
              </div>
              <span className="text-orange-600 font-semibold">{stats.activeRentals}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <button className="p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-center transition-colors">
              <span className="text-2xl mb-2 block">➕</span>
              <span className="text-sm font-medium text-gray-900">Add Product</span>
            </button>
            <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-center transition-colors">
              <span className="text-2xl mb-2 block">🔨</span>
              <span className="text-sm font-medium text-gray-900">New Auction</span>
            </button>
            <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-center transition-colors">
              <span className="text-2xl mb-2 block">📝</span>
              <span className="text-sm font-medium text-gray-900">Blog Post</span>
            </button>
            <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-center transition-colors">
              <span className="text-2xl mb-2 block">📊</span>
              <span className="text-sm font-medium text-gray-900">View Reports</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}