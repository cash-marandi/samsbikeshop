
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ProductType, Product } from '../types'; // Assuming Product type is also available
import { useCart } from '../context/CartContext';

export default function ShopPage() {
  const [filter, setFilter] = useState<ProductType | 'ALL'>('ALL');
  const [search, setSearch] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/products');
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        setProducts(data.products || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []); // Empty dependency array means this runs once on mount

  const filtered = products.filter(p => {
    const matchesFilter = filter === 'ALL' || p.type === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const addItemToCart = (e: React.MouseEvent, product: Product) => {
    e.stopPropagation(); // Prevent the link from navigating
    addItem(product);
  }

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
        <div>
          <h1 className="text-4xl font-bold uppercase tracking-tighter">Inventory</h1>
          <p className="text-gray-600 mt-2">Browse our high-performance fleet and components.</p>
        </div>
        
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <input 
            type="text" 
            placeholder="Search items..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-grow md:w-64 bg-white border-2 border-gray-300 rounded px-4 py-2 focus:outline-none focus:border-orange-500"
          />
          <div className="flex bg-white p-1 rounded border-2 border-gray-300">
            {(['ALL', ProductType.BIKE, ProductType.PART, ProductType.ACCESSORY] as const).map(type => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                className={`px-4 py-1 rounded text-xs font-bold uppercase tracking-wider ${filter === type ? 'bg-orange-500 text-white' : 'text-gray-600 hover:text-gray-900'}`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {filtered.map(product => (
          <Link key={product._id} href={`/shop/${product._id}`} className="block">
            <div className={`group relative bg-white rounded-lg overflow-hidden border-2 border-gray-300 ${product.isSold ? 'opacity-75 grayscale' : 'hover:border-orange-500'}`}>
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
              </div>

              <div className="p-6">
                <div className="text-[10px] uppercase font-bold text-gray-600 mb-1">{product.brand} • {product.type}</div>
                <h3 className="font-bold text-lg mb-4 line-clamp-1">{product.name}</h3>
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
                      className="p-3 rounded-lg bg-gray-200 hover:bg-orange-500 group"
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
          <p className="text-xl">No products found matching your criteria.</p>
        </div>
      )}
    </div>
  );
};
