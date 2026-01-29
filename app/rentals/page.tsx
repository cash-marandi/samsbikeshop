
'use client';
import React, { useState, useEffect } from 'react';
import { RentalBike } from '../types';

export default function RentalsPage() {
  const [rentalBikes, setRentalBikes] = useState<RentalBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRentalBikes = async () => {
      try {
        const response = await fetch('/api/rentals');
        if (!response.ok) {
          throw new Error('Failed to fetch rental bikes');
        }
        const data = await response.json();
        setRentalBikes(data.rentalBikes || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRentalBikes();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900 text-xl">Loading rental bikes...</div>
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
        <h1 className="text-4xl font-bold uppercase tracking-tighter">Premium Rentals</h1>
        <p className="text-gray-600 mt-2">Professional-grade bicycles for every journey.</p>
      </div>

      {rentalBikes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {rentalBikes.map(bike => (
            <div key={bike._id || bike.id} className="bg-white rounded-lg overflow-hidden border border-gray-300 flex flex-col md:flex-row">
              <div className="md:w-1/2 h-64 md:h-auto">
                <img src={bike.image} className="w-full h-full object-cover grayscale" alt={bike.name} />
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-orange-500 text-xs font-bold uppercase tracking-widest">{bike.type}</span>
                      <h3 className="text-2xl font-bold mt-1">{bike.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-gray-600 text-[10px] uppercase font-bold">Daily Rate</span>
                      <span className="text-2xl font-bold text-gray-900">R{bike.pricePerDay}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700 mb-8">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Inspected & Cleaned
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Helmet Included
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Emergency Road Kit
                    </li>
                  </ul>
                </div>
                <button className={`w-full py-4 font-bold rounded-lg uppercase tracking-widest text-sm ${
                  bike.isAvailable 
                    ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`} disabled={!bike.isAvailable}>
                  {bike.isAvailable ? 'Check Availability' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-lg border border-gray-300">
          <h2 className="text-2xl font-bold text-gray-600">No rental bikes available at the moment.</h2>
          <p className="text-gray-700 mt-2">Please check back later!</p>
        </div>
      )}

      <div className="mt-24 p-12 rounded-lg bg-gray-100 border border-gray-300 text-center">
        <h2 className="text-3xl font-bold mb-6">Group & Long-term Rentals</h2>
        <p className="text-gray-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          Planning a charity ride or corporate event? We offer specialized packages for groups of 5 or more with delivery options directly to your trail-head.
        </p>
        <button className="px-10 py-4 border border-orange-500 hover:bg-orange-500 hover:text-white text-orange-500 font-bold rounded-lg">
          Get a Custom Quote
        </button>
      </div>
    </div>
  );
}
