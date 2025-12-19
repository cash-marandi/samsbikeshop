
'use client';
import React, { useState, useEffect } from 'react';
import { MOCK_AUCTIONS } from '../constants';
// import { useAuth } from '../context/AuthContext';

export default function AuctionsPage() {
  // const { user } = useAuth();
  const user = null; // temporary placeholder
  const [auctions, setAuctions] = useState(MOCK_AUCTIONS);

  // Simulation for live bidding
  useEffect(() => {
    const timer = setInterval(() => {
      // Logic for countdown would go here
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handlePlaceBid = (id: string, amount: number) => {
    if (!user) {
      alert('Please log in to bid.');
      return;
    }
    // if (!user.isApprovedForAuction) {
    //   alert('Your account is not yet approved for bidding. Please contact support.');
    //   return;
    // }
    
    setAuctions(prev => prev.map(auc => {
      if (auc.id === id) {
        if (amount < auc.currentBid + auc.minIncrement) {
          alert(`Minimum bid is $${auc.currentBid + auc.minIncrement}`);
          return auc;
        }
        return {
          ...auc,
          currentBid: amount,
          // bidHistory: [{ user: user.name, amount, time: Date.now() }, ...auc.bidHistory]
        };
      }
      return auc;
    }));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Live Auctions</h1>
        <p className="text-zinc-500 mt-2">Bid on exclusive frames, rare components, and collector bikes.</p>
      </div>

      <div className="space-y-12">
        {auctions.map(auction => (
          <div key={auction.id} className="grid grid-cols-1 lg:grid-cols-12 gap-1 bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
            <div className="lg:col-span-5 h-80 lg:h-auto relative">
              <img src={auction.image} className="w-full h-full object-cover" alt={auction.name} />
              <div className={`absolute top-6 left-6 px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ${auction.status === 'LIVE' ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'}`}>
                {auction.status === 'LIVE' && <span className="w-1.5 h-1.5 rounded-full bg-zinc-950 animate-pulse"></span>}
                {auction.status}
              </div>
            </div>
            
            <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between">
              <div>
                <h2 className="text-3xl font-black mb-4">{auction.name}</h2>
                <p className="text-zinc-400 mb-8 leading-relaxed">{auction.description}</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Current High Bid</span>
                    <span className="text-2xl font-black text-emerald-500">${auction.currentBid}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Min. Increment</span>
                    <span className="text-2xl font-black text-zinc-200">${auction.minIncrement}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800">
                    <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Bidders</span>
                    <span className="text-2xl font-black text-zinc-200">{auction.bidHistory.length}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
                    <span className="block text-[10px] text-emerald-500 uppercase font-bold mb-1">Ends In</span>
                    <span className="text-2xl font-black text-emerald-500 italic font-mono">02:30:11</span>
                  </div>
                </div>
              </div>

              {auction.status === 'LIVE' ? (
                <div className="flex flex-col md:flex-row gap-4">
                  <input 
                    type="number" 
                    placeholder={`Min. $${auction.currentBid + auction.minIncrement}`}
                    className="flex-grow bg-zinc-950 border border-zinc-700 rounded-xl px-6 py-4 focus:outline-none focus:border-emerald-500 font-bold"
                    id={`bid-input-${auction.id}`}
                  />
                  <button 
                    onClick={() => {
                      const input = document.getElementById(`bid-input-${auction.id}`) as HTMLInputElement;
                      handlePlaceBid(auction.id, Number(input.value));
                    }}
                    className="px-10 py-4 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-black rounded-xl transition-all uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={!user}
                  >
                    Place Bid
                  </button>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-zinc-800 text-center text-zinc-400 font-bold uppercase tracking-widest text-sm">
                  Auction Starts in 23h 14m
                </div>
              )}
              
              {(!user) && auction.status === 'LIVE' && (
                <p className="text-xs text-yellow-500 mt-4 font-medium flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                  Note: You need to be logged in and approved to place bids on live auctions.
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Bid History Table (Example for one) */}
      <div className="mt-20">
        <h3 className="text-xl font-black uppercase mb-8">Live Bid Feed</h3>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">User</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Amount</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {auctions[0].bidHistory.map((bid, i) => (
                <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4 font-bold text-sm">{bid.user}</td>
                  <td className="px-6 py-4 font-bold text-sm text-emerald-500">${bid.amount}</td>
                  <td className="px-6 py-4 text-xs text-zinc-500">{new Date(bid.time).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
