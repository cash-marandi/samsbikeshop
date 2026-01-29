
import React from 'react';
import { AuctionCategory } from '@/app/types';

interface AuctionFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  selectedCategory: string;
  setSelectedCategory: (value: string) => void;
  sortBy: string;
  setSortBy: (value: string) => void;
}

export default function AuctionFilters({
  searchTerm,
  setSearchTerm,
  selectedCategory,
  setSelectedCategory,
  sortBy,
  setSortBy,
}: AuctionFiltersProps) {
  return (
    <div className="flex flex-col md:flex-row gap-4 mb-8">
      <div className="flex-grow">
          <input
            type="text"
            placeholder="Search auctions..."
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
      </div>
      <div className="flex-shrink-0">
        <select
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
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
          className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
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
  );
}
