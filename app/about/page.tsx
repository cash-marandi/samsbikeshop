
import React from 'react';

export default function AboutPage() {
  return (
    <div className="space-y-24 pb-24">
      <section className="relative py-24 bg-grid">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-7xl font-black uppercase tracking-tighter mb-8 italic">
              WE LIVE <br />
              <span className="text-blue-900">AND BREATHE</span> <br />
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
              <h4 className="text-blue-900 font-black uppercase text-xs tracking-widest mb-2">Expertise</h4>
              <p className="text-zinc-300 text-sm">UCI Certified mechanics on-site for all performance builds.</p>
            </div>
            <div>
              <h4 className="text-blue-900 font-black uppercase text-xs tracking-widest mb-2">Quality</h4>
              <p className="text-zinc-300 text-sm">Only the finest components from global leaders like Shimano and SRAM.</p>
            </div>
            <div>
              <h4 className="text-blue-900 font-black uppercase text-xs tracking-widest mb-2">Community</h4>
              <p className="text-zinc-300 text-sm">Proud sponsors of regional youth racing and trail conservation.</p>
            </div>
            <div>
              <h4 className="text-blue-900 font-black uppercase text-xs tracking-widest mb-2">Heritage</h4>
              <p className="text-zinc-300 text-sm">25+ years of mechanical wisdom passed down through generations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Maintenance & Service</h3>
            <p className="text-zinc-400">Expert care for all types of bicycles, from routine tune-ups to complex repairs, ensuring your ride is always in peak condition.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Sales & Custom Builds</h3>
            <p className="text-zinc-400">Discover a wide range of new and pre-owned bicycles, parts, and accessories. We also offer custom build services to create your dream bike.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Bicycle Rentals</h3>
            <p className="text-zinc-400">Explore Johannesburg on two wheels with our diverse fleet of rental bikes, perfect for casual rides or adventurous trails.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <h3 className="text-xl font-bold mb-4 text-blue-900">Auctions & Vintage Finds</h3>
            <p className="text-zinc-400">Participate in exciting auctions for unique bicycles, rare parts, and vintage accessories. Find your next treasure with us.</p>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-black uppercase tracking-tight mb-12 text-center">Meet Our Team</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <img src="https://picsum.photos/seed/person1/200/200" alt="Sam Henderson" className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" />
            <h3 className="text-2xl font-bold mb-2 text-white">Sam Henderson</h3>
            <p className="text-blue-900 uppercase text-sm font-semibold mb-4">Founder & Master Mechanic</p>
            <p className="text-zinc-400">With over 25 years of experience, Sam is the heart and soul of Sams Bike Shop, a true visionary in the cycling world.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <img src="https://picsum.photos/seed/person2/200/200" alt="Maria Lopez" className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" />
            <h3 className="text-2xl font-bold mb-2 text-white">Maria Lopez</h3>
            <p className="text-blue-900 uppercase text-sm font-semibold mb-4">Sales & Customer Relations</p>
            <p className="text-zinc-400">Maria ensures every customer finds their perfect ride, providing unparalleled service and expert advice.</p>
          </div>
          <div className="bg-zinc-900 p-8 rounded-xl border border-zinc-800 text-center">
            <img src="https://picsum.photos/seed/person3/200/200" alt="Thabo Mokoena" className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" />
            <h3 className="text-2xl font-bold mb-2 text-white">Thabo Mokoena</h3>
            <p className="text-blue-900 uppercase text-sm font-semibold mb-4">Bike Fit Specialist & Rentals</p>
            <p className="text-zinc-400">Thabo combines precision bike fitting with managing our diverse rental fleet, making cycling accessible to everyone.</p>
          </div>
        </div>
      </section>
    </div>
  );
};
