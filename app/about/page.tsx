
import React from 'react';

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-24">
      <section className="relative py-24 bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-7xl font-black uppercase tracking-tighter mb-8 italic">
              WE LIVE <br />
              <span className="text-emerald-500">AND BREATHE</span> <br />
              CYCLING.
            </h1>
            <p className="text-xl text-zinc-400 leading-relaxed">
              Founded in 1998 by Sam Henderson, Sams Bike Shop has grown from a humble garage setup to the region's premier hub for performance cycling and elite mechanical service.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="order-2 md:order-1">
          <img src="https://picsum.photos/seed/workshop/800/1000" className="rounded-3xl shadow-2xl grayscale border border-zinc-800" alt="Workshop" />
        </div>
        <div className="order-1 md:order-2 space-y-10">
          <div>
            <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Our Philosophy</h2>
            <p className="text-zinc-400 leading-relaxed text-lg">
              We believe a bike is more than just a machine; it's a vehicle for freedom, competition, and self-discovery. That's why every bolt we turn and every frame we sell is handled with obsessive precision.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-emerald-500 font-black uppercase text-xs tracking-widest mb-2">Expertise</h4>
              <p className="text-zinc-300 text-sm">UCI Certified mechanics on-site for all performance builds.</p>
            </div>
            <div>
              <h4 className="text-emerald-500 font-black uppercase text-xs tracking-widest mb-2">Quality</h4>
              <p className="text-zinc-300 text-sm">Only the finest components from global leaders like Shimano and SRAM.</p>
            </div>
            <div>
              <h4 className="text-emerald-500 font-black uppercase text-xs tracking-widest mb-2">Community</h4>
              <p className="text-zinc-300 text-sm">Proud sponsors of regional youth racing and trail conservation.</p>
            </div>
            <div>
              <h4 className="text-emerald-500 font-black uppercase text-xs tracking-widest mb-2">Heritage</h4>
              <p className="text-zinc-300 text-sm">25+ years of mechanical wisdom passed down through generations.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
