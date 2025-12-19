
'use client';
import React, { useState } from 'react';
import { MOCK_PRODUCTS, MOCK_AUCTIONS, MOCK_USERS, MOCK_NEWS } from '../constants';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'INVENTORY' | 'AUCTIONS' | 'USERS' | 'NEWS'>('ANALYTICS');

  const renderContent = () => {
    switch (activeTab) {
      case 'ANALYTICS': return <StatsOverview />;
      case 'INVENTORY': return <InventoryManagement />;
      case 'AUCTIONS': return <AuctionManagement />;
      case 'USERS': return <UserManagement />;
      case 'NEWS': return <NewsManagement />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Control Panel</h2>
          <nav className="space-y-1">
            {[
              { id: 'ANALYTICS', label: 'Dashboard', icon: '📊' },
              { id: 'INVENTORY', label: 'Inventory', icon: '🚲' },
              { id: 'AUCTIONS', label: 'Auctions', icon: '⏱️' },
              { id: 'USERS', label: 'Customers', icon: '👥' },
              { id: 'NEWS', label: 'Blog & News', icon: '📰' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id ? 'bg-blue-900/10 text-blue-900' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-zinc-800">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-blue-900 flex items-center justify-center font-bold text-zinc-950">S</div>
             <div className="flex flex-col">
               <span className="text-xs font-bold">Sam Admin</span>
               <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Verified Owner</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto bg-zinc-950 p-12">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

const StatsOverview = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Revenue', value: '$128,430', trend: '+12.5%', icon: '💰' },
        { label: 'Active Rentals', value: '42', trend: '+8.2%', icon: '📅' },
        { label: 'Live Auctions', value: '3', trend: 'Stable', icon: '⚡' },
        { label: 'New Users', value: '1,204', trend: '+18.1%', icon: '📈' },
      ].map(stat => (
        <div key={stat.label} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">{stat.icon}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${stat.trend.startsWith('+') ? 'bg-blue-900/10 text-blue-900' : 'bg-zinc-800 text-zinc-500'}`}>{stat.trend}</span>
          </div>
          <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</span>
          <span className="text-3xl font-black">{stat.value}</span>
        </div>
      ))}
    </div>

    <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 h-96 flex items-center justify-center">
       <div className="text-center text-zinc-500">
         <div className="text-4xl mb-4">📉</div>
         <p className="font-bold">Sales Volume Chart will render here using Recharts</p>
         <p className="text-xs mt-2 uppercase tracking-widest">Real-time data synchronization active</p>
       </div>
    </div>
  </div>
);

const InventoryManagement = () => (
  <div>
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Product Inventory</h2>
      <button className="bg-blue-900 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-blue-900">
        + Add New Product
      </button>
    </div>
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-zinc-800/50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Name</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Type</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Price</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Status</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {MOCK_PRODUCTS.map(product => (
            <tr key={product.id} className="hover:bg-zinc-800/20 transition-colors">
              <td className="px-6 py-4 font-bold text-sm">{product.name}</td>
              <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{product.type}</td>
              <td className="px-6 py-4 font-bold text-blue-900">${product.price}</td>
              <td className="px-6 py-4">
                <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${product.isSold ? 'bg-red-500/10 text-red-500' : 'bg-blue-900/10 text-blue-900'}`}>
                  {product.isSold ? 'SOLD' : 'AVAILABLE'}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-zinc-500 hover:text-white mr-4">Edit</button>
                <button className="text-red-500/60 hover:text-red-500">Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AuctionManagement = () => (
  <div>
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Live Auctions</h2>
      <button className="bg-blue-900 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-blue-900">
        + Create Auction
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {MOCK_AUCTIONS.map(auc => (
        <div key={auc.id} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
             <h3 className="font-bold">{auc.name}</h3>
             <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${auc.status === 'LIVE' ? 'bg-blue-900 text-zinc-950' : 'bg-zinc-800 text-zinc-500'}`}>{auc.status}</span>
          </div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="block text-[10px] text-zinc-500 uppercase font-bold">Current Bid</span>
              <span className="text-xl font-black">${auc.currentBid}</span>
            </div>
            <div className="text-right">
              <span className="block text-[10px] text-zinc-500 uppercase font-bold">Bids</span>
              <span className="text-xl font-black">{auc.bidHistory.length}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="flex-grow py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded text-xs font-bold uppercase tracking-widest">End Now</button>
            <button className="flex-grow py-2 border border-zinc-700 hover:border-zinc-500 rounded text-xs font-bold uppercase tracking-widest">Edit Listing</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const UserManagement = () => (
  <div>
    <div className="mb-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Customer Directory</h2>
    </div>
    <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-zinc-800/50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Customer</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Role</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Auction Status</th>
            <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest text-right">Control</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {MOCK_USERS.map(user => (
            <tr key={user.id}>
              <td className="px-6 py-4">
                <div className="font-bold text-sm">{user.name}</div>
                <div className="text-xs text-zinc-500">{user.email}</div>
              </td>
              <td className="px-6 py-4">
                <span className="text-[10px] font-bold uppercase text-zinc-400">{user.role}</span>
              </td>
              <td className="px-6 py-4">
                {user.isApprovedForAuction ? (
                  <span className="flex items-center gap-1.5 text-blue-900 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-900"></span> Approved
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending
                  </span>
                )}
              </td>
              <td className="px-6 py-4 text-right">
                {!user.isApprovedForAuction && (
                  <button className="bg-blue-900/10 text-blue-900 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-blue-900 hover:text-zinc-950 transition-all">
                    Approve for Auction
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const NewsManagement = () => (
  <div>
    <div className="flex justify-between items-center mb-10">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Blog & News Management</h2>
      <button className="bg-blue-900 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-blue-900">
        + Write New Post
      </button>
    </div>
    <div className="space-y-4">
      {MOCK_NEWS.map(post => (
        <div key={post.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={post.image} className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold">{post.title}</h3>
            <span className="text-xs text-zinc-500">{post.date} • By {post.author}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:text-blue-900 transition-colors">Edit</button>
            <button className="p-2 hover:text-red-500 transition-colors">Remove</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);
