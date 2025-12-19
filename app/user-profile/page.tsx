
'use client';
import React from 'react';
// import { useAuth } from '../context/AuthContext';

export default function UserProfilePage() {
  // const { user } = useAuth();
  const user = {
    id: 'u2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'USER',
    isApprovedForAuction: false,
    orderHistory: ['p1'],
  };

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-3xl font-black uppercase mb-6">Login Required</h2>
        <button className="w-full py-4 bg-emerald-600 text-zinc-950 font-bold rounded-xl">
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1 space-y-8">
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 text-center">
            <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-zinc-950">
              {user.name[0]}
            </div>
            <h2 className="text-2xl font-black mb-1">{user.name}</h2>
            <p className="text-zinc-500 text-sm mb-6">{user.email}</p>
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.isApprovedForAuction ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
              {user.isApprovedForAuction ? 'Auction Authorized' : 'Auction Pending Approval'}
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Account Settings</h3>
            <ul className="space-y-4">
              <li><button className="text-zinc-300 hover:text-emerald-500 text-sm font-bold">Edit Profile</button></li>
              <li><button className="text-zinc-300 hover:text-emerald-500 text-sm font-bold">Security & Password</button></li>
              <li><button className="text-zinc-300 hover:text-emerald-500 text-sm font-bold">Payment Methods</button></li>
              <li><button className="text-red-500/80 hover:text-red-500 text-sm font-bold mt-4">Delete Account</button></li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-12">
          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Order History</h3>
            <div className="space-y-4">
              {user.orderHistory.length > 0 ? (
                user.orderHistory.map((id, i) => (
                  <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                    <div>
                      <span className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Order #883210</span>
                      <span className="font-bold">Premium Road Bike Component Group</span>
                    </div>
                    <div className="text-right">
                      <span className="block font-black text-emerald-500">$850.00</span>
                      <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Delivered</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
                  No orders found. <a href="#shop" className="text-emerald-500 hover:underline">Start shopping &rarr;</a>
                </div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Active Bids</h3>
            <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
               You haven't placed any bids yet. <a href="#auctions" className="text-emerald-500 hover:underline">View live auctions &rarr;</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
