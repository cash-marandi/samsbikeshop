
'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { TeamMember } from '../types';

const PLACEHOLDER_IMAGE_PATH = '/file.svg'; // Placeholder image for missing team member images

export default function AboutPage() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        const response = await fetch('/api/team-members');
        if (!response.ok) {
          throw new Error('Failed to fetch team members');
        }
        const data = await response.json();
        setTeamMembers(data.teamMembers || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  // Show loading state while fetching team members
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-ink-900 text-xl">Loading team information...</div>
    );
  }

  // Return static content with dynamic team section
  return (
    <div className="space-y-24 pb-24">
      <section className="relative py-24 bg-ink-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl">
            <h1 className="text-7xl font-bold uppercase tracking-tighter mb-8 italic">
              WE LIVE <br />
              <span className="text-flame-500">AND BREATHE</span> <br />
              CYCLING.
            </h1>
            <p className="text-xl text-ink-700 leading-relaxed">
              Founded in 1998 by Sam Henderson, Sams Bike Shop has grown from a humble garage setup to the region's premier hub for performance cycling and elite mechanical service.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-20 items-center">
        <div className="order-2 md:order-1">
          <Image src="https://picsum.photos/seed/workshop/800/1000" width={800} height={1000} className="rounded-xl grayscale border border-ink-200" alt="Workshop" />
        </div>
        <div className="order-1 md:order-2 space-y-10">
          <div>
          <h2 className="text-4xl font-bold uppercase tracking-tight mb-6">Our Philosophy</h2>
          <p className="text-ink-700 leading-relaxed text-lg">
              We believe a bike is more than just a machine; it's a vehicle for freedom, competition, and self-discovery. That's why every bolt we turn and every frame we sell is handled with obsessive precision.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h4 className="text-flame-500 font-bold uppercase text-xs tracking-widest mb-2">Expertise</h4>
              <p className="text-ink-700 text-sm">UCI Certified mechanics on-site for all performance builds.</p>
            </div>
            <div>
              <h4 className="text-flame-500 font-bold uppercase text-xs tracking-widest mb-2">Quality</h4>
              <p className="text-ink-700 text-sm">Only the finest components from global leaders like Shimano and SRAM.</p>
            </div>
            <div>
              <h4 className="text-flame-500 font-bold uppercase text-xs tracking-widest mb-2">Community</h4>
              <p className="text-ink-700 text-sm">Proud sponsors of regional youth racing and trail conservation.</p>
            </div>
            <div>
              <h4 className="text-flame-500 font-bold uppercase text-xs tracking-widest mb-2">Heritage</h4>
              <p className="text-ink-700 text-sm">25+ years of mechanical wisdom passed down through generations.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold uppercase tracking-tight mb-12 text-center">Our Services</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
            <h3 className="text-xl font-bold mb-4 text-flame-500">Maintenance & Service</h3>
            <p className="text-ink-700">Expert care for all types of bicycles, from routine tune-ups to complex repairs, ensuring your ride is always in peak condition.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
            <h3 className="text-xl font-bold mb-4 text-flame-500">Sales & Custom Builds</h3>
            <p className="text-ink-700">Discover a wide range of new and pre-owned bicycles, parts, and accessories. We also offer custom build services to create your dream bike.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-ink-200 text-center ring-2 ring-flame-500">
            <h3 className="text-xl font-bold mb-4 text-flame-500">Mobile Repair Service</h3>
            <p className="text-ink-700">Can&apos;t come to us? Our fully-equipped mobile workshop van comes to you! Perfect for busy professionals and families throughout Soweto and Johannesburg.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-ink-200 text-center ring-2 ring-flame-500">
            <h3 className="text-xl font-bold mb-4 text-flame-500">Bike Pickup & Delivery</h3>
            <p className="text-ink-700">We&apos;ll pick up your bike, service it at our workshop, and deliver it back to you. Hassle-free bike maintenance at your convenience.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
            <h3 className="text-xl font-bold mb-4 text-flame-500">Bicycle Rentals</h3>
            <p className="text-ink-700">Explore Johannesburg on two wheels with our diverse fleet of rental bikes, perfect for casual rides or adventurous trails.</p>
          </div>
          <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
            <h3 className="text-xl font-bold mb-4 text-flame-500">Auctions & Vintage Finds</h3>
            <p className="text-ink-700">Participate in exciting auctions for unique bicycles, rare parts, and vintage accessories. Find your next treasure with us.</p>
          </div>
        </div>
      </section>

      {/* Meet Our Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <h2 className="text-4xl font-bold uppercase tracking-tight mb-12 text-center">Meet Our Team</h2>
        {error ? (
          <div className="text-center py-12">
            <p className="text-red-500 text-xl">Error loading team information: {error}</p>
          </div>
        ) : teamMembers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            {teamMembers.map(member => (
              <div key={member._id || member.id} className="bg-white p-8 rounded-xl border border-ink-200 text-center">
                <Image 
                  src={member.image || PLACEHOLDER_IMAGE_PATH} 
                  width={128} 
                  height={128} 
                  alt={member.name} 
                  className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" 
                />
                <h3 className="text-2xl font-bold mb-2 text-ink-900">{member.name}</h3>
                <p className="text-flame-500 uppercase text-sm font-semibold mb-4">{member.role.replace('_', ' ')}</p>
                <p className="text-ink-700">Passionate team member dedicated to providing the best cycling experience for our customers.</p>
              </div>
            ))}
          </div>
        ) : (
          // Fallback to hardcoded team members if no database data
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
              <Image src="https://picsum.photos/seed/person1/200/200" width={128} height={128} alt="Sam Henderson" className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" />
              <h3 className="text-2xl font-bold mb-2 text-ink-900">Sam Henderson</h3>
              <p className="text-flame-500 uppercase text-sm font-semibold mb-4">Founder & Master Mechanic</p>
              <p className="text-ink-700">With over 25 years of experience, Sam is the heart and soul of Sams Bike Shop, a true visionary in the cycling world.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
              <Image src="https://picsum.photos/seed/person2/200/200" width={128} height={128} alt="Maria Lopez" className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" />
              <h3 className="text-2xl font-bold mb-2 text-ink-900">Maria Lopez</h3>
              <p className="text-flame-500 uppercase text-sm font-semibold mb-4">Sales & Customer Relations</p>
              <p className="text-ink-700">Maria ensures every customer finds their perfect ride, providing unparalleled service and expert advice.</p>
            </div>
            <div className="bg-white p-8 rounded-xl border border-ink-200 text-center">
              <Image src="https://picsum.photos/seed/person3/200/200" width={128} height={128} alt="Thabo Mokoena" className="rounded-full w-32 h-32 mx-auto mb-6 object-cover grayscale" />
              <h3 className="text-2xl font-bold mb-2 text-ink-900">Thabo Mokoena</h3>
              <p className="text-flame-500 uppercase text-sm font-semibold mb-4">Bike Fit Specialist & Rentals</p>
              <p className="text-ink-700">Thabo combines precision bike fitting with managing our diverse rental fleet, making cycling accessible to everyone.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
