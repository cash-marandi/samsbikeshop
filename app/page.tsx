import React from 'react';
import { MOCK_PRODUCTS, MOCK_AUCTIONS, MOCK_NEWS } from './constants';

export default function HomePage() {
  const featured = MOCK_PRODUCTS.slice(0, 3);
  const liveAuction = MOCK_AUCTIONS.find(a => a.status === 'LIVE');

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="/images/herobg.jpg" 
            alt="Cycling" 
            className="w-full h-full object-cover opacity-40 grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-transparent to-zinc-950/50"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-zinc-950 via-zinc-950/20 to-transparent"></div>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block py-1 px-3 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-900 text-xs font-bold uppercase tracking-widest mb-6">
              Official Dealer & Service Center
            </span>
            <h1 className="text-6xl md:text-8xl font-black text-white leading-none mb-6 tracking-tighter">
              BORN TO <br />
              <span className="text-blue-900">RIDE.</span>
            </h1>
            <p className="text-xl text-zinc-400 mb-10 max-w-lg leading-relaxed">
              Premium cycles, expert repairs, and real-time auctions. Your ultimate cycling destination since 1998.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#shop" className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-zinc-950 font-bold rounded-lg transition-all transform hover:-translate-y-1">
                Shop Inventory
              </a>
              <a href="#auctions" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all border border-zinc-700">
                Join Auction
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Rentals', desc: 'Premium bikes for any terrain.', icon: '🚲', href: '#rentals' },
          { title: 'Repairs', desc: 'Certified master technicians.', icon: '🔧', href: '#repairs' },
          { title: 'Auctions', desc: 'Rare gear at the best prices.', icon: '⏱️', href: '#auctions' },
        ].map((item) => (
          <a key={item.title} href={item.href} className="group p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-900/50 transition-all">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
            <p className="text-zinc-500">{item.desc}</p>
          </a>
        ))}
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">New Arrivals</h2>
            <div className="h-1 w-20 bg-blue-900"></div>
          </div>
          <a href="#shop" className="text-blue-900 hover:underline">View All Shop &rarr;</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featured.map((product) => (
            <div key={product.id} className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 transition-all hover:border-zinc-600">
              <div className="relative h-64 overflow-hidden">
                <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                {product.isSpecial && (
                  <span className="absolute top-4 left-4 bg-yellow-500 text-black px-2 py-1 text-[10px] font-bold uppercase rounded">Special</span>
                )}
              </div>
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <span className="text-blue-900">R{product.price}</span>
                </div>
                <p className="text-zinc-500 text-sm mb-6">{product.description}</p>
                <a href="#shop" className="block w-full text-center py-3 bg-zinc-800 hover:bg-blue-950 hover:text-zinc-950 transition-colors rounded-lg font-bold text-sm uppercase">Details</a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Live Auction Preview */}
      {liveAuction && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-900 rounded-3xl p-1 md:p-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
               <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2c5.514 0 10 4.486 10 10s-4.486 10-10 10-10-4.486-10-10 4.486-10 10-10zm0-2c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm1 12v-4h-2v4h2zm0 4v-2h-2v2h2z"/></svg>
            </div>
            <div className="flex flex-col md:flex-row items-center gap-12 relative z-10">
              <div className="w-full md:w-1/2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-zinc-950/30 text-zinc-950 text-xs font-bold uppercase mb-6">
                  <span className="w-2 h-2 rounded-full bg-zinc-950 animate-pulse"></span>
                  <span>Auction Live Now</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-zinc-950 mb-6 leading-tight">
                  {liveAuction.name}
                </h2>
                <div className="flex items-center gap-8 mb-10">
                  <div>
                    <span className="block text-zinc-950/60 uppercase text-[10px] font-bold">Current Bid</span>
                    <span className="text-3xl font-black text-zinc-950">R{liveAuction.currentBid}</span>
                  </div>
                  <div>
                    <span className="block text-zinc-950/60 uppercase text-[10px] font-bold">Ends In</span>
                    <span className="text-3xl font-black text-zinc-950">02:44:12</span>
                  </div>
                </div>
                <a href="#auctions" className="px-10 py-4 bg-zinc-950 text-white font-bold rounded-xl hover:scale-105 transition-transform inline-block">
                  Place a Bid
                </a>
              </div>
              <div className="w-full md:w-1/2">
                <img src={liveAuction.image} className="rounded-2xl shadow-2xl rotate-3" alt="Auction bike" />
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {MOCK_NEWS.map(post => (
            <div key={post.id} className="group cursor-pointer">
              <div className="h-64 rounded-2xl overflow-hidden mb-6 border border-zinc-800">
                <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={post.title} />
              </div>
              <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{post.date}</span>
              <h3 className="text-2xl font-bold mt-2 mb-4 group-hover:text-emerald-400 transition-colors">{post.title}</h3>
              <p className="text-zinc-500 leading-relaxed line-clamp-2">{post.content}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};