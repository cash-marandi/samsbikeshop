
'use client';
import React from 'react';

export default function ContactPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
        <div>
          <h1 className="text-6xl font-black uppercase tracking-tighter mb-8 italic">Let's Talk <span className="text-emerald-500">Gear.</span></h1>
          <p className="text-xl text-zinc-400 mb-12">Have questions about a build, a rental, or an upcoming auction? Our experts are standing by.</p>
          
          <div className="space-y-10">
            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 flex-shrink-0 border border-zinc-800">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Workshop Location</h4>
                <p className="text-lg font-bold">128 Velocity Ave, Pedal City, PC 55420</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 flex-shrink-0 border border-zinc-800">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Business Hours</h4>
                <p className="text-lg font-bold">Mon - Fri: 8am - 7pm</p>
                <p className="text-lg font-bold">Sat: 9am - 5pm</p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-12 h-12 bg-zinc-900 rounded-2xl flex items-center justify-center text-emerald-500 flex-shrink-0 border border-zinc-800">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Direct Line</h4>
                <p className="text-lg font-bold text-emerald-500">+1 (888) RIDE-NOW</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-zinc-900 p-12 rounded-[40px] border border-zinc-800 shadow-2xl relative">
          <form className="space-y-6" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-2 gap-6">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Your Name</label>
                 <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-emerald-500" placeholder="John Doe" />
               </div>
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                 <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-emerald-500" placeholder="john@domain.com" />
               </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
              <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-emerald-500 appearance-none">
                <option>Select an inquiry type</option>
                <option>Bike Sales</option>
                <option>Rental Booking</option>
                <option>Auction Question</option>
                <option>Service & Repair</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Your Message</label>
              <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-emerald-500 min-h-[200px]" placeholder="How can we help you get back on the road?"></textarea>
            </div>
            <button className="w-full py-5 bg-emerald-600 text-zinc-950 font-black rounded-2xl hover:bg-emerald-500 hover:scale-[1.01] transition-all uppercase tracking-[0.2em]">Send Transmission</button>
          </form>
        </div>
      </div>
    </div>
  );
};
