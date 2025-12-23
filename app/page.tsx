'use client';
import React, { useState, useEffect } from 'react';
import { Product, Auction, NewsPost } from '@/app/types'; // Assuming these types are available

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [newsPosts, setNewsPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // States for the embedded contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('Service & Repair'); // Default to Service & Repair
  const [message, setMessage] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, auctionsRes, newsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/auctions'),
          fetch('/api/news'),
        ]);

        if (!productsRes.ok) throw new Error('Failed to fetch products');
        if (!auctionsRes.ok) throw new Error('Failed to fetch auctions');
        if (!newsRes.ok) throw new Error('Failed to fetch news');

        const productsData = await productsRes.json();
        const auctionsData = await auctionsRes.json();
        const newsData = await newsRes.json(); // Added this line

        const newAuctions = auctionsData.map((auction: Auction) => ({
          ...auction,
          id: auction._id?.toString() || auction.id, // Ensure consistent ID
          status: getAuctionStatus(auction.startTime, auction.endTime),
        }));
        setAuctions(newAuctions);
        setNewsPosts(newsData);
        setProducts(productsData);

      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError(err.message || 'An error occurred while fetching data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);


  // Helper to format timestamp for display
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  // Helper to determine auction status based on current time
  const getAuctionStatus = (startTime: number, endTime: number) => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now >= startTime && now <= endTime) return 'LIVE';
    return 'ENDED';
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    setFormSuccess(false);

    try {
      // Here you would send the form data to your API endpoint
      // For now, we'll just simulate a success
      console.log({ name, email, appointmentDate, selectedSubject, message });
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      setFormSuccess(true);
      // Clear form
      setName('');
      setEmail('');
      setAppointmentDate('');
      setSelectedSubject('Service & Repair');
      setMessage('');
    } catch (err) {
      console.error('Contact form submission error:', err);
      setFormSuccess(false);
    } finally {
      setFormSubmitted(false);
    }
  };


  const featuredProducts = products.filter(p => !p.isSold).slice(0, 3); // Example: take first 3 available products
  const liveAuction = auctions.find(a => getAuctionStatus(a.startTime, a.endTime) === 'LIVE'); // Find a live auction
  console.log('Live Auction:', liveAuction); // Debug log

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-white text-xl">Loading...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>
    );
  }

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
              <a href="/shop" className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-zinc-950 font-bold rounded-lg transition-all transform hover:-translate-y-1">
                Shop Inventory
              </a>
              <a href="/auctions" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all border border-zinc-700">
                Join Auction
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Access */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { title: 'Rentals', desc: 'Premium bikes for any terrain.', icon: '🚲', href: '/rentals' },
          { title: 'Repairs', desc: 'Certified master technicians.', icon: '🔧', href: '/repairs' },
          { title: 'Auctions', desc: 'Rare gear at the best prices.', icon: '⏱️', href: '/auctions' },
        ].map((item) => (
          <a key={item.title} href={item.href} className="group p-8 rounded-2xl bg-zinc-900 border border-zinc-800 hover:border-blue-900/50 transition-all">
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">{item.icon}</div>
            <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
            <p className="text-zinc-500">{item.desc}</p>
          </a>
        ))}
      </section>

      {/* About Us Snippet */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Our Passion for Cycling</h2>
          <p className="text-xl text-zinc-400 leading-relaxed">
            Founded in 1998 by Sam Henderson, Sams Bike Shop has grown from a humble garage setup to the region's premier hub for performance cycling and elite mechanical service. We believe a bike is more than just a machine; it's a vehicle for freedom, competition, and self-discovery.
          </p>
          <a href="/about" className="mt-8 inline-block px-8 py-3 bg-blue-900 hover:bg-blue-800 text-zinc-950 font-bold rounded-lg transition-all transform hover:-translate-y-1">
            Learn More About Us
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">New Arrivals</h2>
            <div className="h-1 w-20 bg-blue-900"></div>
          </div>
          <a href="/shop" className="text-blue-900 hover:underline">View All Shop &rarr;</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredProducts.length > 0 ? (
            featuredProducts.map((product) => (
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
                  <a href={`/shop/${product.id}`} className="block w-full text-center py-3 bg-zinc-800 hover:bg-blue-950 hover:text-zinc-950 transition-colors rounded-lg font-bold text-sm uppercase">Details</a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-zinc-500">No new arrivals found.</div>
          )}
        </div>
      </section>

      {/* All Auctions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-2">All Auctions</h2>
            <div className="h-1 w-20 bg-blue-900"></div>
          </div>
          <a href="/auctions" className="text-blue-900 hover:underline">View All Auctions &rarr;</a>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {auctions.length > 0 ? (
            auctions.map((auction) => (
              <div key={auction.id} className="group bg-zinc-900 rounded-2xl overflow-hidden border border-zinc-800 transition-all hover:border-zinc-600">
                <div className="relative h-64 overflow-hidden">
                  <img src={auction.image} alt={auction.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  <span className={`absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-black uppercase ${auction.status === 'LIVE' ? 'bg-emerald-500 text-zinc-950' : auction.status === 'UPCOMING' ? 'bg-blue-500/10 text-blue-900 border border-blue-500/20' : 'bg-zinc-800 text-zinc-400'}`}>
                    {auction.status}
                  </span>
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg">{auction.name}</h3>
                    <span className="text-blue-900">R{auction.currentBid}</span>
                  </div>
                  <p className="text-zinc-500 text-sm mb-6">{auction.description}</p>
                  <a href={`/auctions/${auction.id}`} className="block w-full text-center py-3 bg-zinc-800 hover:bg-blue-950 hover:text-zinc-950 transition-colors rounded-lg font-bold text-sm uppercase">View Details</a>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-zinc-500">No auctions found.</div>
          )}
        </div>
      </section>

      {/* Services Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Keep Your Ride Pristine.</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-3xl mx-auto">
            Ensure your bicycle performs at its best with our expert maintenance and repair services. Book your service appointment today!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/contact" className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-zinc-950 font-bold rounded-lg transition-all transform hover:-translate-y-1">
              Book a Service Now
            </a>
            <a href="/rentals" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all border border-zinc-700">
              Explore Rentals
            </a>
          </div>
        </div>
      </section>
      
      {/* Live Auction Preview */}
      {liveAuction ? (
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
                    <span className="text-3xl font-black text-zinc-950">
                      {/* Placeholder for countdown, actual countdown logic needed */}
                      {formatTimestamp(liveAuction.endTime)}
                    </span>
                  </div>
                </div>
                <a href={`/auctions/${liveAuction.id}`} className="px-10 py-4 bg-zinc-950 text-white font-bold rounded-xl hover:scale-105 transition-transform inline-block">
                  Place a Bid
                </a>
              </div>
              <div className="w-full md:w-1/2">
                <img src={liveAuction.image} className="rounded-2xl shadow-2xl rotate-3" alt="Auction bike" />
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-zinc-500">
          No live auctions currently.
        </section>
      )}

      {/* Community Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-zinc-900 rounded-3xl p-12 text-center border border-zinc-800">
          <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Stay Connected</h2>
          <p className="text-xl text-zinc-400 mb-10 max-w-3xl mx-auto">
            Don't miss out on upcoming auctions, cycling news, and community events. Follow us and join the ride!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a href="/auctions" className="px-8 py-4 bg-blue-900 hover:bg-blue-800 text-zinc-950 font-bold rounded-lg transition-all transform hover:-translate-y-1">
              View All Auctions
            </a>
            <a href="/news" className="px-8 py-4 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-lg transition-all border border-zinc-700">
              Read Our News
            </a>
          </div>
        </div>
      </section>

      {/* Latest News */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-black uppercase tracking-tighter mb-12">Latest News</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {newsPosts.length > 0 ? (
            newsPosts.map(post => (
              <div key={post.id} className="group cursor-pointer">
                <div className="h-64 rounded-2xl overflow-hidden mb-6 border border-zinc-800">
                  <img src={post.image} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt={post.title} />
                </div>
                <span className="text-emerald-500 text-xs font-bold uppercase tracking-widest">{formatTimestamp(new Date(post.date).getTime())}</span>
                <h3 className="text-2xl font-bold mt-2 mb-4 group-hover:text-emerald-400 transition-colors">{post.title}</h3>
                <p className="text-zinc-500 leading-relaxed line-clamp-2">{post.content}</p>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center text-zinc-500">No news posts found.</div>
          )}
        </div>
      </section>

      {/* Moved and Enhanced Contact Us / Need a Service Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-zinc-900 rounded-3xl p-12 border border-zinc-800 shadow-2xl relative">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black uppercase tracking-tight mb-6">Book Your Service or Get in Touch!</h2>
            <p className="text-xl text-zinc-400 max-w-3xl mx-auto">
              Ready to give your bike the expert care it deserves? Use the form below to book a service. Have questions? We're here to help!
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-blue-900 flex-shrink-0 border border-zinc-800">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Workshop Location</h4>
                  <p className="text-lg font-bold">128 Velocity Ave, Pedal City, PC 55420</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-blue-900 flex-shrink-0 border border-zinc-800">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Business Hours</h4>
                  <p className="text-lg font-bold">Mon - Fri: 8am - 7pm</p>
                  <p className="text-lg font-bold">Sat: 9am - 5pm</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 bg-zinc-950 rounded-2xl flex items-center justify-center text-blue-900 flex-shrink-0 border border-zinc-800">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/></svg>
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Direct Line</h4>
                  <p className="text-lg font-bold text-blue-900">+1 (888) RIDE-NOW</p>
                </div>
              </div>
            </div>

            {/* Service Booking Form */}
            <form className="space-y-6" onSubmit={e => handleContactSubmit(e)}>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Your Name</label>
                  <input type="text" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-900" placeholder="John Doe" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Email Address</label>
                  <input type="email" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-900" placeholder="john@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Appointment Date</label>
                <input type="date" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-900" value={appointmentDate} onChange={(e) => setAppointmentDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Subject</label>
                <select className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-900 appearance-none" value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)}>
                  <option value="Select an inquiry type">Select an inquiry type</option>
                  <option value="Bike Sales">Bike Sales</option>
                  <option value="Rental Booking">Rental Booking</option>
                  <option value="Auction Question">Auction Question</option>
                  <option value="Service & Repair">Service & Repair</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 ml-1">Your Message</label>
                <textarea className="w-full bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-4 focus:outline-none focus:border-blue-900 min-h-[200px]" placeholder="How can we help you get back on the road?" value={message} onChange={(e) => setMessage(e.target.value)}></textarea>
              </div>
              <button type="submit" className="w-full py-5 bg-blue-900 text-zinc-950 font-black rounded-2xl hover:bg-blue-950 hover:scale-[1.01] transition-all uppercase tracking-[0.2em]" disabled={formSubmitted}>
                {formSubmitted ? 'Sending...' : 'Send Transmission'}
              </button>
              {formSuccess && <p className="text-green-500 text-center mt-4">Message sent successfully!</p>}
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};