'use client';
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import ContactForm from './components/ContactForm';

const LatestNews = dynamic(() => import('./components/LatestNews'), {
  loading: () => <div className="text-center text-gray-500">Loading news...</div>,
});

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const [productsRes, auctionsRes, newsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/auctions'),
        fetch('/api/news'),
      ]);
      const productsData = await productsRes.json();
      const auctionsData = await auctionsRes.json();
      const newsData = await newsRes.json();
      setProducts(productsData.products || []);
      const processedAuctions = (auctionsData.auctions || []).map((auction: any) => {
        const startTime = new Date(auction.startTime).getTime();
        const endTime = new Date(auction.endTime).getTime();
        return {
          ...auction,
          status: getAuctionStatus(startTime, endTime),
          startTime: startTime,
          endTime: endTime,
        };
      });
      setAuctions(processedAuctions || []);
      setNewsPosts(newsData.newsPosts || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  // Helper to format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  const getAuctionStatus = (startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now > endTime) return 'ENDED';
    return 'LIVE';
  };

  const truncateDescription = (text: string, wordLimit: number) => {
    const words = text.split(' ');
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(' ') + '...';
    }
    return text;
  };

  const featuredProducts = products.filter((p: any) => !p.isSold).slice(0, 3);
  const liveAuction = auctions.find((a: any) => a.status === 'LIVE');

  if (loading) {
    return <div className="flex justify-center items-center h-screen text-gray-900 text-xl">Loading...</div>;
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center bg-gray-100">
        <div className="absolute inset-0">
          <Image
            src="/images/herobg.jpg"
            alt="Cycling"
            fill
            className="object-cover opacity-30"
          />
        </div>
        <div className="absolute inset-0 bg-white bg-opacity-90"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <span className="inline-block py-2 px-4 bg-orange-500 text-white text-xs font-bold uppercase mb-6">
              Official Dealer & Service Center
            </span>
            <h1 className="text-5xl md:text-7xl font-black text-gray-900 leading-none mb-6">
              BORN TO <br />
              <span className="text-orange-500">RIDE.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg">
              Premium cycles, expert repairs, and real-time auctions. Mobile repair services and bike pickup available. Your ultimate cycling destination since 1998.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/shop" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
                Shop Inventory
              </Link>
              <Link href="/auctions" className="px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm">
                Join Auction
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Rentals', desc: 'Premium bikes for any terrain.', icon: '🚲', href: '/rentals' },
            { title: 'Repairs', desc: 'Certified technicians. Mobile service available.', icon: '🔧', href: '/repairs' },
            { title: 'Auctions', desc: 'Rare gear at the best prices.', icon: '⏱️', href: '/auctions' },
          ].map((item) => (
            <Link key={item.title} href={item.href} className="group p-8 bg-white border-2 border-gray-200 hover:border-orange-500">
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="text-2xl font-bold mb-2 text-gray-900">{item.title}</h3>
              <p className="text-gray-600">{item.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* About Us Snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold uppercase mb-4 text-gray-900">Our Passion for Cycling</h2>
          <p className="text-xl text-gray-600 leading-relaxed">
            Founded in 2008 by Samuel Maswanganyi, Sams Bike Shop has grown from a humble garage setup to the region's premier hub for performance cycling and elite mechanical service. We believe a bike is more than just a machine; it's a vehicle for freedom, competition, and self-discovery.
          </p>
          <Link href="/about" className="mt-8 inline-block px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
            Learn More About Us
          </Link>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold uppercase mb-2 text-gray-900">New Arrivals</h2>
            <div className="h-1 w-20 bg-orange-500"></div>
          </div>
          <Link href="/shop" className="text-orange-500 hover:text-orange-600 font-medium">View All Shop →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product: any) => (
              <div key={product._id || product.id} className="group bg-white border-2 border-gray-200 overflow-hidden">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image src={product.image} alt={product.name} fill className="object-cover" />
                  {product.isSpecial && (
                    <span className="absolute top-4 left-4 bg-orange-500 text-white px-2 py-1 text-xs font-bold uppercase">Special</span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{product.name}</h3>
                    <span className="text-orange-500 font-bold">R{product.price}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{truncateDescription(product.description, 20)}</p>
                  <Link href={`/shop/${product._id}`} className="block w-full text-center py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm uppercase">Details</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">No new arrivals found.</div>
          )}
        </div>
      </section>

      {/* All Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-bold uppercase mb-2 text-gray-900">All Auctions</h2>
            <div className="h-1 w-20 bg-orange-500"></div>
          </div>
          <Link href="/auctions" className="text-orange-500 hover:text-orange-600 font-medium">View All Auctions →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {auctions.length > 0 ? (
            auctions.map((auction: any) => (
              <div key={auction.id} className="group bg-white border-2 border-gray-200 overflow-hidden">
                <div className="relative h-64 overflow-hidden bg-gray-100">
                  <Image src={auction.image} alt={auction.name} fill className="object-cover" />
                  <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase ${
                    auction.status === 'LIVE' 
                      ? 'bg-green-500 text-white' 
                      : auction.status === 'UPCOMING' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-500 text-white'
                  }`}>
                    {auction.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-gray-900">{auction.name}</h3>
                    <span className="text-orange-500 font-bold">R{auction.currentBid}</span>
                  </div>
                  <p className="text-gray-600 text-sm mb-6">{auction.description}</p>
                  <Link href={`/auctions/${auction.id}`} className="block w-full text-center py-3 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm uppercase">View Details</Link>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-gray-500">No auctions found.</div>
          )}
        </div>
      </section>

      {/* Services Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gray-100 p-12 text-center border-2 border-gray-200">
          <h2 className="text-4xl font-bold uppercase mb-6 text-gray-900">Keep Your Ride Pristine.</h2>
          <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
            Ensure your bicycle performs at its best with our expert maintenance and repair services. 
          </p>
          <p className="text-lg text-gray-700 mb-10 max-w-3xl mx-auto">
            <span className="font-bold text-orange-600">Can&apos;t come to us? We&apos;ll come to you!</span> Our mobile repair team can fix your bike at your home or office, or we can pick up your bike and deliver it back when it&apos;s ready.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/repairs" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
              Book a Service
            </Link>
            <Link href="/contact" className="px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm">
              Request Mobile Repair
            </Link>
          </div>
        </div>
      </section>
      
      {/* Live Auction Preview */}
      {liveAuction ? (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-orange-500 p-8 md:p-12 overflow-hidden">
            <div className="flex flex-col md:flex-row items-center gap-12">
              <div className="w-full md:w-1/2">
                <div className="inline-flex items-center space-x-2 px-3 py-1 bg-white text-orange-500 text-xs font-bold uppercase mb-6">
                  <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                  <span>Auction Live Now</span>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                  {liveAuction.name}
                </h2>
                <div className="flex items-center gap-8 mb-10">
                  <div>
                    <span className="block text-white/80 uppercase text-xs font-bold">Current Bid</span>
                    <span className="text-3xl font-black text-white">R{liveAuction.currentBid}</span>
                  </div>
                  <div>
                    <span className="block text-white/80 uppercase text-xs font-bold">Ends In</span>
                    <span className="text-3xl font-black text-white">
                      {formatTimestamp(liveAuction.endTime)}
                    </span>
                  </div>
                </div>
                <Link href={`/auctions/${liveAuction.id}`} className="px-10 py-4 bg-white text-orange-500 font-bold text-sm inline-block">
                  Place a Bid
                </Link>
              </div>
              <div className="w-full md:w-1/2">
                <Image src={liveAuction.image} width={500} height={400} className="border-4 border-white" alt="Auction bike" />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500">
          No live auctions currently.
        </section>
      )}

      {/* Community Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gray-100 p-12 text-center border-2 border-gray-200">
          <h2 className="text-4xl font-bold uppercase mb-6 text-gray-900">Stay Connected</h2>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto">
            Don't miss out on upcoming auctions, cycling news, and community events. Follow us and join the ride!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auctions" className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm">
              View All Auctions
            </Link>
            <Link href="/news" className="px-8 py-4 bg-gray-800 hover:bg-gray-900 text-white font-bold text-sm">
              Read Our News
            </Link>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <LatestNews newsPosts={newsPosts} />

      {/* Contact Us / Service Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gray-100 p-12 border-2 border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold uppercase mb-4 text-gray-900">Book Your Service or Get in Touch!</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-4">
              Ready to give your bike the expert care it deserves? Use the form below to book a service.
            </p>
            <p className="text-lg text-orange-600 font-semibold max-w-3xl mx-auto">
              🚐 Mobile Repair Available - We come to you or pick up your bike!
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Workshop Location</h4>
                  <p className="text-lg font-bold text-gray-900">2057 Parsley Street</p>
                  <p className="text-base text-gray-700">R558 Main Road, Silver Leaf</p>
                  <p className="text-base text-gray-700">Protea Glen, Soweto, Gauteng</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Business Hours</h4>
                  <p className="text-lg font-bold text-gray-900">Mon - Fri: 8am - 7pm</p>
                  <p className="text-lg font-bold text-gray-900">Sat: 9am - 5pm</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Direct Line</h4>
                  <p className="text-lg font-bold text-orange-500">+27 (0) 11 123 4567</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-orange-500 rounded flex items-center justify-center text-white flex-shrink-0">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase text-gray-500 mb-2">Mobile & Pickup Service</h4>
                  <p className="text-base font-bold text-gray-900">We come to you!</p>
                  <p className="text-sm text-gray-700">Or we can pick up your bike and deliver it back when ready.</p>
                  <Link href="/repairs" className="text-sm text-orange-600 hover:text-orange-700 font-medium">Book Mobile Repair →</Link>
                </div>
              </div>
            </div>

            {/* Service Booking Form */}
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}