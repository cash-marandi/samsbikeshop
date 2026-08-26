'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { ProductType, Product } from '../types';
import { useCart } from '../context/CartContext';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';

type SortOption = 'newest' | 'price-asc' | 'price-desc' | 'name-asc' | 'name-desc';

// Icons
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

const PlusIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>
);

const ArrowUpDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/>
  </svg>
);

const BikeIcon = ({ className = "w-12 h-12" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
  </svg>
);

// Skeleton
const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden border border-ink-200/50">
    <div className="h-56 bg-ink-200 animate-pulse" />
    <div className="p-6 space-y-3">
      <div className="h-4 bg-ink-200 rounded w-3/4 animate-pulse" />
      <div className="h-3 bg-ink-200 rounded w-full animate-pulse" />
      <div className="h-3 bg-ink-200 rounded w-2/3 animate-pulse" />
      <div className="flex justify-between items-center pt-2">
        <div className="h-6 bg-ink-200 rounded w-20 animate-pulse" />
        <div className="h-10 w-10 bg-ink-200 rounded-xl animate-pulse" />
      </div>
    </div>
  </div>
);

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

  const activeFiltersCount = [
    filter !== 'ALL',
    selectedBrand !== 'ALL',
    search !== '',
    sortBy !== 'newest'
  ].filter(Boolean).length;

  if (loading) {
    return (
      <div className="min-h-screen bg-ink-50 pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-8 bg-ink-200 rounded-lg w-64 mb-8 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1,2,3,4,5,6].map(i => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center pt-32">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XIcon />
          </div>
          <h2 className="text-xl font-bold text-ink-900 mb-2">Something went wrong</h2>
          <p className="text-ink-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <AnimatedSection>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-flame-600">Shop</span>
              </div>
              <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 tracking-tight">Inventory</h1>
              <p className="text-ink-500 mt-2">Browse our high-performance fleet and components.</p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-white border border-ink-200 rounded-xl hover:border-flame-300 transition-colors shadow-soft"
              >
                <FilterIcon />
                <span className="text-sm font-medium">Filters</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-flame-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                    {activeFiltersCount}
                  </span>
                )}
              </button>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="appearance-none pl-4 pr-10 py-2.5 bg-white border border-ink-200 rounded-xl text-sm font-medium text-ink-700 hover:border-flame-300 focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all shadow-soft cursor-pointer"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                  <option value="name-asc">Name: A to Z</option>
                  <option value="name-desc">Name: Z to A</option>
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-ink-400">
                  <ArrowUpDownIcon />
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <AnimatePresence>
            {(showFilters || !showFilters) && (
              <motion.aside 
                className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="bg-white rounded-2xl border border-ink-200/50 shadow-soft p-6 lg:sticky lg:top-28">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-display font-bold text-lg text-ink-900">Filters</h3>
                    {activeFiltersCount > 0 && (
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-flame-600 hover:text-flame-700 font-medium flex items-center gap-1"
                      >
                        <XIcon />
                        Clear All
                      </button>
                    )}
                  </div>

                  {/* Search */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-ink-700 mb-2">Search</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        placeholder="Search products..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-ink-50 border border-ink-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400">
                        <SearchIcon />
                      </div>
                    </div>
                  </div>

                  {/* Categories */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-ink-700 mb-2">Category</label>
                    <select
                      value={filter}
                      onChange={(e) => setFilter(e.target.value as ProductType | 'ALL')}
                      className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                    >
                      <option value="ALL">All Categories</option>
                      {Object.values(ProductType).map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  {/* Brand */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-ink-700 mb-2">Brand</label>
                    <select
                      value={selectedBrand}
                      onChange={(e) => setSelectedBrand(e.target.value)}
                      className="w-full bg-ink-50 border border-ink-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                    >
                      <option value="ALL">All Brands</option>
                      {brands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Price Range */}
                  <div className="mb-6">
                    <label className="block text-sm font-semibold text-ink-700 mb-2">Price Range (R)</label>
                    <div className="flex gap-2 items-center">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceInput.min}
                        onChange={(e) => setPriceInput(prev => ({ ...prev, min: e.target.value }))}
                        onBlur={handlePriceChange}
                        className="w-full bg-ink-50 border border-ink-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                      />
                      <span className="text-ink-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceInput.max}
                        onChange={(e) => setPriceInput(prev => ({ ...prev, max: e.target.value }))}
                        onBlur={handlePriceChange}
                        className="w-full bg-ink-50 border border-ink-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                      />
                    </div>
                  </div>

                  {/* Quick Type Filter Pills */}
                  <div>
                    <label className="block text-sm font-semibold text-ink-700 mb-2">Quick Filter</label>
                    <div className="flex flex-wrap gap-2">
                      {(['ALL', ProductType.BIKE, ProductType.PART, ProductType.ACCESSORY] as const).map(type => (
                        <button
                          key={type}
                          onClick={() => setFilter(type)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                            filter === type 
                              ? 'bg-flame-500 text-white shadow-glow' 
                              : 'bg-ink-50 text-ink-600 hover:bg-ink-100 border border-ink-200'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.aside>
            )}
          </AnimatePresence>

          {/* Product Grid */}
          <div className="flex-1">
            <AnimatedSection>
              <div className="flex justify-between items-center mb-6">
                <p className="text-ink-500 text-sm">
                  Showing <span className="font-semibold text-ink-900">{filtered.length}</span> of <span className="font-semibold text-ink-900">{products.length}</span> products
                </p>
              </div>
            </AnimatedSection>

            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6" staggerDelay={0.08}>
              <AnimatePresence>
                {filtered.map(product => (
                  <StaggerItem key={product._id}>
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/shop/${product._id}`} className="group block">
                        <div className={`relative bg-white rounded-2xl overflow-hidden border border-ink-200/50 shadow-soft hover:shadow-large transition-all duration-300 ${product.isSold ? 'opacity-60 grayscale' : 'hover:-translate-y-1'}`}>
                          {product.isSold && (
                            <div className="absolute inset-0 z-20 flex items-center justify-center bg-ink-900/50 pointer-events-none">
                              <span className="bg-red-500 text-white font-display font-bold text-2xl uppercase tracking-widest py-2 px-8 -rotate-6 rounded-lg shadow-lg">
                                SOLD OUT
                              </span>
                            </div>
                          )}
                          
                          <div className="relative h-56 overflow-hidden bg-ink-100">
                            <Image 
                              fill 
                              src={product.image} 
                              className="object-cover group-hover:scale-105 transition-transform duration-700" 
                              alt={product.name} 
                            />
                            {product.isSpecial && (
                              <span className="absolute top-4 left-4 bg-flame-500 text-white px-3 py-1 text-xs font-bold uppercase rounded-lg shadow-glow">
                                Special Offer
                              </span>
                            )}
                            {product.discount && product.discount > 0 && (
                              <span className="absolute top-4 right-4 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-soft">
                                -{product.discount}%
                              </span>
                            )}
                          </div>

                          <div className="p-5">
                            <div className="text-[11px] uppercase font-bold tracking-wider text-ink-400 mb-1.5">
                              {product.brand} &middot; {product.type}
                            </div>
                            <h3 className="font-display font-bold text-lg text-ink-900 mb-2 line-clamp-1 group-hover:text-flame-600 transition-colors">
                              {product.name}
                            </h3>
                            <p className="text-sm text-ink-500 mb-4 line-clamp-2">{product.description}</p>
                            <div className="flex items-center justify-between">
                              <div>
                                {product.discount ? (
                                  <div className="flex items-center gap-2">
                                    <span className="text-ink-400 line-through text-sm">R{product.price}</span>
                                    <span className="text-flame-500 font-display font-bold text-xl">
                                      R{(product.price * (1 - product.discount/100)).toFixed(0)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-flame-500 font-display font-bold text-xl">R{product.price}</span>
                                )}
                              </div>
                              {!product.isSold && (
                                <motion.button 
                                  onClick={(e) => addItemToCart(e, product)}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-3 rounded-xl bg-ink-100 hover:bg-flame-500 text-ink-600 hover:text-white transition-colors shadow-soft"
                                  aria-label="Add to cart"
                                >
                                  <PlusIcon />
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </Link>
                    </motion.div>
                  </StaggerItem>
                ))}
              </AnimatePresence>
            </StaggerContainer>
            
            {filtered.length === 0 && (
              <AnimatedSection>
                <div className="text-center py-24 bg-white rounded-2xl border border-ink-200/50">
                  <BikeIcon className="w-16 h-16 text-ink-300 mx-auto mb-4" />
                  <p className="text-xl font-display font-bold text-ink-900 mb-2">No products found</p>
                  <p className="text-ink-500 mb-6">Try adjusting your filters or search terms.</p>
                  <button 
                    onClick={clearFilters} 
                    className="inline-flex items-center gap-2 px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    <XIcon />
                    Clear filters
                  </button>
                </div>
              </AnimatedSection>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
