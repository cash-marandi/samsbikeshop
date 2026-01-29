'use client';
import React from 'react';

const PACKAGES = [
  {
    name: "Basic Tune-Up",
    price: 85,
    features: ["Brake adjust", "Gear indexing", "Drive-train lube", "Safety inspection", "Tire inflation"],
    recommended: false
  },
  {
    name: "Performance Pro",
    price: 150,
    features: ["All Basic features", "Drive-train deep clean", "Wheel trueing", "Bottom bracket check", "Hub adjustment"],
    recommended: true
  },
  {
    name: "Overhaul Elite",
    price: 280,
    features: ["Full strip & rebuild", "Bearing repacking", "New cables & housing", "Brake bleed included", "Hydraulic service"],
    recommended: false
  }
];

export default function RepairsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">Certified Service</h1>
        <p className="text-gray-600 text-xl max-w-2xl mx-auto">From daily commuters to world-tour racers, we keep every machine in peak performance condition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PACKAGES.map(pkg => (
          <div key={pkg.name} className={`relative p-10 rounded-lg bg-white border border-gray-300 flex flex-col justify-between ${pkg.recommended ? 'ring-2 ring-orange-500' : ''}`}>
            {pkg.recommended && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded-full">Most Popular</span>
            )}
            <div>
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-orange-500">R{pkg.price}</span>
                <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">Starting at</span>
              </div>
              <ul className="space-y-4 mb-10">
                {pkg.features.map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-gray-700 text-sm">
                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <button className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm ${pkg.recommended ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}>
              Book Service
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-8 leading-tight">Can't Make it to the Shop? <br /><span className="text-orange-500">We'll Come to You.</span></h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-8">
            Introducing Sams Mobile Repair. Our fully-equipped van brings the workshop to your driveway. Perfect for busy professionals and families.
          </p>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">24h</span>
              <span className="text-xs text-gray-600 uppercase font-bold tracking-widest">Turnaround</span>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">50+</span>
              <span className="text-xs text-gray-600 uppercase font-bold tracking-widest">Service Vans</span>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">100%</span>
              <span className="text-xs text-gray-600 uppercase font-bold tracking-widest">Guaranteed</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-300">
           <form className="space-y-4" onSubmit={e => e.preventDefault()}>
             <div className="grid grid-cols-2 gap-4">
               <input type="text" placeholder="Full Name" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500" />
               <input type="email" placeholder="Email Address" className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500" />
             </div>
             <select className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 text-gray-600">
               <option>Select Service</option>
               <option>Tune-up</option>
               <option>Brake Repair</option>
               <option>Wheel Build</option>
             </select>
             <textarea placeholder="Describe your bike's issue..." className="w-full bg-white border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-orange-500 min-h-[120px]"></textarea>
             <button className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 uppercase tracking-widest">Send Request</button>
           </form>
        </div>
      </div>
    </div>
  );
};