
import React from 'react';
import { MOCK_RENTALS } from '../constants';

export default function RentalsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-16">
        <h1 className="text-4xl font-black uppercase tracking-tighter">Premium Rentals</h1>
        <p className="text-zinc-500 mt-2">Professional-grade bicycles for every journey.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {MOCK_RENTALS.map(bike => (
          <div key={bike.id} className="bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 flex flex-col md:flex-row">
            <div className="md:w-1/2 h-64 md:h-auto">
              <img src={bike.image} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" alt={bike.name} />
            </div>
            <div className="p-8 md:w-1/2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{bike.type}</span>
                    <h3 className="text-2xl font-black mt-1">{bike.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="block text-zinc-500 text-[10px] uppercase font-bold">Daily Rate</span>
                    <span className="text-2xl font-black text-white">${bike.pricePerDay}</span>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-zinc-400 mb-8">
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    Inspected & Cleaned
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    Helmet Included
                  </li>
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>
                    Emergency Road Kit
                  </li>
                </ul>
              </div>
              <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold rounded-xl transition-all uppercase tracking-widest text-sm">
                Check Availability
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-24 p-12 rounded-3xl bg-zinc-900 border border-zinc-800 text-center relative overflow-hidden">
        <div className="absolute -bottom-10 -right-10 opacity-5">
           <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
        </div>
        <h2 className="text-3xl font-black mb-6">Group & Long-term Rentals</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Planning a charity ride or corporate event? We offer specialized packages for groups of 5 or more with delivery options directly to your trail-head.
        </p>
        <button className="px-10 py-4 border border-zinc-700 hover:border-emerald-500 hover:text-emerald-500 transition-all rounded-xl font-bold">
          Get a Custom Quote
        </button>
      </div>
    </div>
  );
};
