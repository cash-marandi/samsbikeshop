'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductType, Product } from '../types';
import { useCart } from '../context/CartContext';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

export default function ShopPage() {
  const [filter, setFilter] = useState<ProductType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem, showToast } = useCart();

  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const [priceRange, setPriceRange] = useState<{ min: number; max: number }>({ min: 0, max: 100000 });
  const [priceInput, setPriceInput] = useState<{ min: string; max: string }>({ min: '0', max: '100000' });
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        const allProducts = data.products || [];
        setProducts(allProducts);

        const uniqueBrands = [...new Set(allProducts.map((p: Product) => p.brand))].sort() as string[];
        setBrands(uniqueBrands);

        if (allProducts.length > 0) {
          const prices = allProducts.map((p: Product) => p.price);
          const minPrice = Math.floor(Math.min(...prices));
          const maxPrice = Math.ceil(Math.max(...prices));
          setPriceRange({ min: minPrice, max: maxPrice });
          setPriceInput({ min: String(minPrice), max: String(maxPrice) });
        }
      } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An error occurred';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filtered = products
    .filter(p => {
      const matchesType = filter === 'ALL' || p.type === filter;
      const matchesBrand = selectedBrand === 'ALL' || p.brand === selectedBrand;
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
                           p.brand.toLowerCase().includes(search.toLowerCase()) ||
                           p.description.toLowerCase().includes(search.toLowerCase());
      const discountedPrice = p.price * (1 - (p.discount || 0) / 100);
      const matchesPrice = discountedPrice >= priceRange.min && discountedPrice <= priceRange.max;
      return matchesType && matchesBrand && matchesSearch && matchesPrice;
    })
    .sort((a, b) => {
      const priceA = a.price * (1 - (a.discount || 0) / 100);
      const priceB = b.price * (1 - (b.discount || 0) / 100);
      
      switch (sortBy) {
        case 'price-asc':
          return priceA - priceB;
        case 'price-desc':
          return priceB - priceA;
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        case 'newest':
        default:
          return new Date(b._id || '').getTime() - new Date(a._id || '').getTime();
      }
    });

  const handlePriceChange = () => {
    const min = parseInt(priceInput.min) || 0;
    const max = parseInt(priceInput.max) || 100000;
    setPriceRange({ min, max: Math.max(min, max) });
  };

  const clearFilters = () => {
    setFilter('ALL');
    setSelectedBrand('ALL');
    setSearch('');
    setPriceRange({ min: 0, max: 100000 });
    setPriceInput({ min: '0', max: '100000' });
    setSortBy('newest');
  };

  const addItemToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation();
    e.preventDefault();
    addItem(product);
    showToast(`${product.name} added to cart!`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-gray-900 text-xl">Loading products...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Inventory</h1>
          <p className="text-gray-600 mt-2">Browse our high-performance fleet and components.</p>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="md:hidden w-full px-4 py-2 bg-white border-2 border-gray-300 rounded flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-64 flex-shrink-0`}>
          <div className="bg-white rounded-lg border border-gray-300 p-6 sticky top-4">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">Filters</h3>
              <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700">
                Clear All
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <input 
                type="text" 
                placeholder="Search products..." 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as ProductType | 'ALL')}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">All Categories</option>
                {Object.values(ProductType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Brand</label>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="ALL">All Brands</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
              <div className="flex gap-2 items-center">
                <input
                  type="number"
                  placeholder="Min"
                  value={priceInput.min}
                  onChange={(e) => setPriceInput(prev => ({ ...prev, min: e.target.value }))}
                  onBlur={handlePriceChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="number"
                  placeholder="Max"
                  value={priceInput.max}
                  onChange={(e) => setPriceInput(prev => ({ ...prev, max: e.target.value }))}
                  onBlur={handlePriceChange}
                  className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="w-full bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="newest">Newest First</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="name-asc">Name: A to Z</option>
                <option value="name-desc">Name: Z to A</option>
              </select>
            </div>

            <div className="flex flex-wrap gap-2">
              {(['ALL', ProductType.BIKE, ProductType.PART, ProductType.ACCESSORY] as const).map(type => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider transition-colors ${
                    filter === type 
                      ? 'bg-orange-500 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              Showing <span className="font-semibold">{filtered.length}</span> of <span className="font-semibold">{products.length}</span> products
            </p>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500 lg:hidden"
            >
              <option value="newest">Newest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="name-asc">Name: A to Z</option>
              <option value="name-desc">Name: Z to A</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {filtered.map(product => (
              <Link key={product._id} href={`/shop/${product._id}`} className="block">
                <div className={`group relative bg-white rounded-lg overflow-hidden border-2 border-gray-300 ${product.isSold ? 'opacity-75 grayscale' : 'hover:border-orange-500'} transition-colors`}>
                  {product.isSold && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-gray-900/40 pointer-events-none">
                      <span className="bg-red-500 text-white font-bold text-2xl uppercase tracking-widest py-2 px-8 -rotate-12 border-4 border-white">
                        SOLD OUT
                      </span>
                    </div>
                  )}
                  
                  <div className="h-56 relative overflow-hidden">
                    <Image fill src={product.image} className="object-cover" alt={product.name} />
                    {product.isSpecial && (
                      <div className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-0.5 rounded text-[10px] font-bold uppercase">
                        Special Offer
                      </div>
                    )}
                    {product.discount && product.discount > 0 && (
                      <div className="absolute top-4 right-4 bg-red-500 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                        -{product.discount}%
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="text-[10px] uppercase font-bold text-gray-600 mb-1">{product.brand} • {product.type}</div>
                    <h3 className="font-bold text-lg mb-2 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        {product.discount ? (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-500 line-through text-sm">R{product.price}</span>
                            <span className="text-orange-500 font-bold text-xl">R{(product.price * (1 - product.discount/100)).toFixed(0)}</span>
                          </div>
                        ) : (
                          <span className="text-orange-500 font-bold text-xl">R{product.price}</span>
                        )}
                      </div>
                      {!product.isSold && (
                        <button 
                          onClick={(e) => addItemToCart(e, product)}
                          className="p-3 rounded-lg bg-gray-200 hover:bg-orange-500 group transition-colors"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
          
          {filtered.length === 0 && (
            <div className="text-center py-24 text-gray-600">
              <p className="text-xl mb-4">No products found matching your criteria.</p>
              <button onClick={clearFilters} className="text-orange-600 hover:text-orange-700 font-semibold">
                Clear filters and try again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
