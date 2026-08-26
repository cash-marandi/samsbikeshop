
'use client';
import React from 'react';
import { useCart } from '../context/CartContext';
import Image from 'next/image';
import Link from 'next/link';

export default function CartPage() {
  const { items, updateItemQuantity, removeItem, clearCart, total, itemCount, loading } = useCart();

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-xl">Loading cart...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Your Shopping Cart</h1>

      {itemCount === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-ink-200">
          <p className="text-xl text-ink-700 mb-4">Your cart is empty.</p>
          <Link href="/shop" className="px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {items.map(item => (
              <div key={item.product._id} className="flex items-center bg-white rounded-xl p-4 border border-ink-200">
                <div className="flex-shrink-0 w-24 h-24 relative mr-4 rounded-md overflow-hidden">
                  <Image src={item.product.image} alt={item.product.name} layout="fill" objectFit="cover" />
                </div>
                <div className="flex-grow">
                  <h2 className="text-lg font-bold">{item.product.name}</h2>
                  <p className="text-ink-600 text-sm">{item.product.brand}</p>
                  <p className="text-flame-500 font-semibold mt-1">R{(item.product.price * (1 - (item.product.discount || 0) / 100)).toFixed(2)}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => updateItemQuantity(item.product._id!, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="px-3 py-1 bg-ink-200 hover:bg-ink-300 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    -
                  </button>
                  <span className="text-lg font-medium">{item.quantity}</span>
                  <button
                    onClick={() => updateItemQuantity(item.product._id!, item.quantity + 1)}
                    className="px-3 py-1 bg-ink-800 hover:bg-ink-700 rounded-md transition-colors"
                  >
                    +
                  </button>
                  <button
                    onClick={() => removeItem(item.product._id!)}
                    className="ml-4 p-2 text-red-500 hover:text-red-600 transition-colors"
                    title="Remove item"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1 bg-white rounded-xl p-6 border border-ink-200 h-fit">
            <h2 className="text-2xl font-black mb-4">Order Summary</h2>
            <div className="flex justify-between items-center text-lg mb-2">
              <span>Items ({itemCount})</span>
              <span>R{total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold border-t border-ink-200 pt-4 mt-4">
              <span>Total</span>
              <span>R{total.toFixed(2)}</span>
            </div>
            <Link href="/checkout" className="w-full mt-6 px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors block text-center">
              Proceed to Checkout
            </Link>
            <button 
              onClick={clearCart}
              className="w-full mt-4 px-6 py-3 bg-ink-200 hover:bg-ink-300 text-ink-900 font-bold rounded-xl transition-colors"
            >
              Clear Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
