'use client';

import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import ContactForm from './components/ContactForm';
import HeroSection from './components/HeroSection';
import { AnimatedSection, StaggerContainer, StaggerItem } from './components/AnimatedSection';

const LatestNews = dynamic(() => import('./components/LatestNews'), {
  loading: () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-ink-200 rounded-lg w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1,2,3].map(i => (
            <div key={i} className="h-64 bg-ink-200 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  ),
});

// Icons
const BikeIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/>
    <path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/>
  </svg>
);

const WrenchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const ArrowRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

const MapPinIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
  </svg>
);

const PhoneIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const TruckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const CalendarIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
);

// Skeleton Components
const ProductSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-ink-200 rounded-t-xl" />
    <div className="p-6 space-y-4">
      <div className="h-4 bg-ink-200 rounded w-3/4" />
      <div className="h-4 bg-ink-200 rounded w-1/2" />
      <div className="h-8 bg-ink-200 rounded w-1/3" />
    </div>
  </div>
);

const AuctionSkeleton = () => (
  <div className="animate-pulse">
    <div className="h-64 bg-ink-200 rounded-t-xl" />
    <div className="p-6 space-y-4">
      <div className="h-4 bg-ink-200 rounded w-3/4" />
      <div className="h-4 bg-ink-200 rounded w-full" />
      <div className="h-8 bg-ink-200 rounded w-1/3" />
    </div>
  </div>
);

export default function HomePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [newsPosts, setNewsPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
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
            id: auction._id?.toString() || auction.id,
            status: getAuctionStatus(startTime, endTime),
            startTime,
            endTime,
          };
        });
        setAuctions(processedAuctions || []);
        setNewsPosts(newsData.newsPosts || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

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
    return (
      <div className="min-h-screen bg-ink-50">
        <div className="h-screen bg-ink-900 animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <div key={i} className="h-48 bg-ink-200 rounded-xl" />)}
          </div>
          <div className="h-8 bg-ink-200 rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1,2,3].map(i => <ProductSkeleton key={i} />)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-ink-50">
      <HeroSection />

      {/* Quick Access */}
      <section className="relative z-20 -mt-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {[
              { title: 'Rentals', desc: 'Premium bikes for any terrain.', icon: <BikeIcon className="w-8 h-8" />, href: '/rentals', color: 'bg-flame-500' },
              { title: 'Repairs', desc: 'Certified technicians. Mobile service available.', icon: <WrenchIcon className="w-8 h-8" />, href: '/repairs', color: 'bg-ink-800' },
              { title: 'Auctions', desc: 'Rare gear at the best prices.', icon: <ClockIcon className="w-8 h-8" />, href: '/auctions', color: 'bg-ink-900' },
            ].map((item) => (
              <StaggerItem key={item.title}>
                <motion.div
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Link 
                    href={item.href} 
                    className="group block p-8 rounded-2xl bg-white shadow-soft hover:shadow-large transition-all duration-300 border border-ink-200/50"
                  >
                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${item.color} text-white mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {item.icon}
                    </div>
                    <h3 className="text-xl font-display font-bold mb-2 text-ink-900">{item.title}</h3>
                    <p className="text-ink-500 text-sm leading-relaxed">{item.desc}</p>
                    <div className="mt-4 flex items-center text-flame-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span>Explore</span>
                      <ArrowRightIcon className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* About Us Snippet */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <AnimatedSection>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-6">
                  <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-flame-600">Our Story</span>
                </div>
                <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 mb-6 leading-tight">
                  Our Passion for <span className="gradient-text">Cycling</span>
                </h2>
                <p className="text-lg text-ink-600 leading-relaxed mb-6">
                  Founded in 2008 by Samuel Maswanganyi, Sams Bike Shop has grown from a humble garage setup to the region&apos;s premier hub for performance cycling and elite mechanical service.
                </p>
                <p className="text-ink-500 leading-relaxed mb-8">
                  We believe a bike is more than just a machine; it&apos;s a vehicle for freedom, competition, and self-discovery. Every bike that leaves our shop is a testament to our commitment to excellence.
                </p>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/about" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-ink-900 hover:bg-ink-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors"
                  >
                    Learn More About Us
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                </motion.div>
              </div>
              <div className="relative">
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden">
                  <Image
                    src="/images/herobg.jpg"
                    alt="Sam's Bike Shop workshop"
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-ink-900/40 to-transparent" />
                </div>
                {/* Floating stats card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-large p-6 border border-ink-200/50"
                >
                  <div className="text-3xl font-display font-bold text-flame-500">2008</div>
                  <div className="text-sm text-ink-500">Established</div>
                </motion.div>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
                  <span className="text-xs font-bold uppercase tracking-wider text-flame-600">Latest Drops</span>
                </div>
                <h2 className="font-display text-4xl font-bold text-ink-900">New Arrivals</h2>
              </div>
              <motion.div whileHover={{ x: 4 }}>
                <Link href="/shop" className="inline-flex items-center gap-2 text-flame-600 hover:text-flame-700 font-semibold">
                  View All Shop
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>

          {featuredProducts.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.15}>
              {featuredProducts.map((product: any) => (
                <StaggerItem key={product._id || product.id}>
                  <motion.div 
                    className="group relative bg-ink-50 rounded-2xl overflow-hidden border border-ink-200/50"
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="relative h-72 overflow-hidden">
                      <Image 
                        src={product.image} 
                        alt={product.name} 
                        fill 
                        className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      />
                      {product.isSpecial && (
                        <span className="absolute top-4 left-4 bg-flame-500 text-white px-3 py-1 text-xs font-bold uppercase rounded-lg shadow-glow">
                          Special
                        </span>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-ink-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <motion.div
                        initial={{ opacity: 0 }}
                        whileHover={{ opacity: 1 }}
                        className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Link 
                          href={`/shop/${product._id}`}
                          className="block w-full text-center py-3 bg-white text-ink-900 font-bold text-sm uppercase tracking-wider rounded-xl hover:bg-flame-500 hover:text-white transition-colors"
                        >
                          View Details
                        </Link>
                      </motion.div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-display font-bold text-lg text-ink-900">{product.name}</h3>
                        <span className="text-flame-500 font-display font-bold text-xl">R{product.price}</span>
                      </div>
                      <p className="text-ink-500 text-sm line-clamp-2">{truncateDescription(product.description, 20)}</p>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <AnimatedSection>
              <div className="text-center py-16 bg-ink-50 rounded-2xl border border-ink-200/50">
                <BikeIcon className="w-12 h-12 text-ink-300 mx-auto mb-4" />
                <p className="text-ink-500 text-lg">No new arrivals found.</p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* All Auctions Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full mb-4">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-green-600">Active Now</span>
                </div>
                <h2 className="font-display text-4xl font-bold text-ink-900">All Auctions</h2>
              </div>
              <motion.div whileHover={{ x: 4 }}>
                <Link href="/auctions" className="inline-flex items-center gap-2 text-flame-600 hover:text-flame-700 font-semibold">
                  View All Auctions
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>

          {auctions.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6" staggerDelay={0.15}>
              {auctions.map((auction: any) => (
                <StaggerItem key={auction.id}>
                  <motion.div 
                    className="group relative bg-white rounded-2xl overflow-hidden border border-ink-200/50 shadow-soft hover:shadow-large transition-all duration-300"
                    whileHover={{ y: -4 }}
                  >
                    <div className="relative h-64 overflow-hidden bg-ink-200">
                      {auction.image ? (
                        <Image 
                          src={auction.image} 
                          alt={auction.name} 
                          fill 
                          className="object-cover group-hover:scale-105 transition-transform duration-700" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-ink-400 text-sm font-medium">No image</span>
                        </div>
                      )}
                      <div className={`absolute top-4 left-4 px-3 py-1.5 text-xs font-bold uppercase rounded-lg ${
                        auction.status === 'LIVE' 
                          ? 'bg-green-500 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)]' 
                          : auction.status === 'UPCOMING' 
                          ? 'bg-blue-500 text-white' 
                          : 'bg-ink-400 text-white'
                      }`}>
                        {auction.status}
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-display font-bold text-lg text-ink-900">{auction.name}</h3>
                        <span className="text-flame-500 font-display font-bold text-xl">R{auction.currentBid}</span>
                      </div>
                      <p className="text-ink-500 text-sm mb-4 line-clamp-2">{auction.description}</p>
                      <Link 
                        href={`/auctions/${auction.id}`}
                        className="block w-full text-center py-3 bg-ink-900 hover:bg-ink-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-colors"
                      >
                        {auction.status === 'LIVE' ? 'Place a Bid' : 'View Details'}
                      </Link>
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <AnimatedSection>
              <div className="text-center py-16 bg-ink-50 rounded-2xl border border-ink-200/50">
                <ClockIcon className="w-12 h-12 text-ink-300 mx-auto mb-4" />
                <p className="text-ink-500 text-lg">No auctions found.</p>
              </div>
            </AnimatedSection>
          )}
        </div>
      </section>

      {/* Services Call to Action */}
      <section className="py-24 bg-ink-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 25% 50%, rgba(249,115,22,0.3) 0%, transparent 50%),
                             radial-gradient(circle at 75% 50%, rgba(249,115,22,0.2) 0%, transparent 50%)`
          }} />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-500/20 border border-flame-500/30 rounded-full mb-6">
              <WrenchIcon className="w-3 h-3 text-flame-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-flame-400">Expert Service</span>
            </div>
            <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6">
              Keep Your Ride <span className="gradient-text">Pristine.</span>
            </h2>
            <p className="text-lg text-ink-400 mb-6 leading-relaxed">
              Ensure your bicycle performs at its best with our expert maintenance and repair services. 
            </p>
            <p className="text-base text-ink-300 mb-10">
              <span className="font-bold text-flame-400">Can&apos;t come to us? We&apos;ll come to you!</span> Our mobile repair team can fix your bike at your home or office, or we can pick up your bike and deliver it back when it&apos;s ready.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/repairs" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-ink-100 text-ink-900 font-bold text-sm uppercase tracking-wider rounded-xl border border-white shadow-soft hover:shadow-large transition-all"
                >
                  <WrenchIcon className="w-4 h-4" />
                  Book a Service
                </Link>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                <Link 
                  href="/contact" 
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-ink-100 text-ink-900 font-bold text-sm uppercase tracking-wider rounded-xl border border-white shadow-soft hover:shadow-large transition-all"
                >
                  <TruckIcon className="w-4 h-4" />
                  Request Mobile Repair
                </Link>
              </motion.div>
            </div>
          </AnimatedSection>
        </div>
      </section>

      {/* Live Auction Preview */}
      {liveAuction ? (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedSection>
              <div className="relative bg-gradient-to-br from-flame-500 to-flame-600 rounded-3xl overflow-hidden shadow-glow-lg">
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute inset-0" style={{
                    backgroundImage: `radial-gradient(circle at 80% 20%, rgba(255,255,255,0.3) 0%, transparent 40%)`
                  }} />
                </div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12 p-8 lg:p-16">
                  <div className="flex-1">
                    <motion.div 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full mb-6"
                    >
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Auction Live Now</span>
                    </motion.div>
                    <h2 className="font-display text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
                      {liveAuction.name}
                    </h2>
                    <div className="flex flex-wrap items-center gap-8 mb-10">
                      <div>
                        <span className="block text-white/70 uppercase text-xs font-bold tracking-wider mb-1">Current Bid</span>
                        <span className="text-3xl lg:text-4xl font-display font-bold text-white">R{liveAuction.currentBid}</span>
                      </div>
                      <div className="w-px h-12 bg-white/20 hidden sm:block" />
                      <div>
                        <span className="block text-white/70 uppercase text-xs font-bold tracking-wider mb-1">Ends At</span>
                        <span className="text-xl font-display font-bold text-white/90">{formatTimestamp(liveAuction.endTime)}</span>
                      </div>
                    </div>
                    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                      <Link 
                        href={`/auctions/${liveAuction.id}`} 
                        className="inline-flex items-center gap-2 px-10 py-4 bg-white text-flame-600 font-bold text-sm uppercase tracking-wider rounded-xl shadow-soft hover:shadow-large transition-all"
                      >
                        Place a Bid
                        <ArrowRightIcon className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  </div>
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="w-full lg:w-1/2"
                  >
                    <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-4 border-white/20 shadow-2xl bg-ink-200">
                      {liveAuction.image ? (
                        <Image 
                          src={liveAuction.image} 
                          alt={liveAuction.name}
                          fill 
                          className="object-cover" 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-ink-400 font-medium">No image available</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      ) : (
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <ClockIcon className="w-12 h-12 text-ink-300 mx-auto mb-4" />
            <p className="text-ink-500 text-lg">No live auctions currently. Check back soon!</p>
          </div>
        </section>
      )}

      {/* Community Call to Action */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="relative bg-ink-50 rounded-3xl p-12 lg:p-16 border border-ink-200/50 overflow-hidden">
            <div className="relative z-10 text-center max-w-3xl mx-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-flame-600">Community</span>
              </div>
              <h2 className="font-display text-4xl font-bold text-ink-900 mb-6">
                Stay Connected
              </h2>
              <p className="text-lg text-ink-500 mb-10 leading-relaxed">
                Don&apos;t miss out on upcoming auctions, cycling news, and community events. Follow us and join the ride!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/auctions" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-ink-950 hover:bg-black text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-large hover:shadow-xl transition-all"
                  >
                    <ClockIcon className="w-4 h-4" />
                    View All Auctions
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.98 }}>
                  <Link 
                    href="/news" 
                    className="inline-flex items-center gap-2 px-8 py-4 bg-ink-950 hover:bg-black text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-large hover:shadow-xl transition-all"
                  >
                    <ArrowRightIcon className="w-4 h-4" />
                    Read Our News
                  </Link>
                </motion.div>
              </div>
            </div>
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-flame-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-flame-500/5 rounded-full blur-3xl" />
          </AnimatedSection>
        </div>
      </section>

      {/* Latest News */}
      <LatestNews newsPosts={newsPosts} />

      {/* Contact Us / Service Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection>
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-flame-600">Get In Touch</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 mb-4">
                Book Your Service
              </h2>
              <p className="text-lg text-ink-500 max-w-2xl mx-auto mb-4">
                Ready to give your bike the expert care it deserves? Use the form below to book a service.
              </p>
              <p className="text-flame-600 font-semibold flex items-center justify-center gap-2">
                <TruckIcon className="w-5 h-5" />
                Mobile Repair Available - We come to you or pick up your bike!
              </p>
            </div>
          </AnimatedSection>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <StaggerContainer className="space-y-6" staggerDelay={0.1}>
              {[
                {
                  icon: <MapPinIcon className="w-6 h-6" />,
                  title: 'Workshop Location',
                  lines: ['2057 Parsley Street', 'R558 Main Road, Silver Leaf', 'Protea Glen, Soweto, Gauteng'],
                },
                {
                  icon: <CalendarIcon className="w-6 h-6" />,
                  title: 'Business Hours',
                  lines: ['Mon - Fri: 8am - 7pm', 'Sat: 9am - 5pm'],
                },
                {
                  icon: <PhoneIcon className="w-6 h-6" />,
                  title: 'Direct Line',
                  lines: ['+27 (0) 11 123 4567'],
                  highlight: true,
                },
                {
                  icon: <TruckIcon className="w-6 h-6" />,
                  title: 'Mobile & Pickup Service',
                  lines: ['We come to you!', 'Or we can pick up your bike and deliver it back when ready.'],
                  link: { text: 'Book Mobile Repair →', href: '/repairs' },
                },
              ].map((item, index) => (
                <StaggerItem key={index}>
                  <motion.div 
                    className="flex items-start gap-5 p-6 bg-ink-50 rounded-2xl border border-ink-200/50 hover:border-flame-300/50 transition-colors"
                    whileHover={{ x: 4 }}
                  >
                    <div className="w-12 h-12 bg-flame-500 rounded-xl flex items-center justify-center text-white flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-ink-400 mb-2">{item.title}</h4>
                      {item.lines.map((line, i) => (
                        <p 
                          key={i} 
                          className={`text-base ${item.highlight ? 'font-bold text-flame-500' : 'text-ink-900'} ${i > 0 ? 'text-ink-500 text-sm mt-0.5' : ''}`}
                        >
                          {line}
                        </p>
                      ))}
                      {item.link && (
                        <Link href={item.link.href} className="text-sm text-flame-500 hover:text-flame-600 font-medium inline-block mt-2">
                          {item.link.text}
                        </Link>
                      )}
                    </div>
                  </motion.div>
                </StaggerItem>
              ))}
            </StaggerContainer>

            {/* Service Booking Form */}
            <AnimatedSection delay={0.2}>
              <div className="bg-white rounded-2xl border border-ink-200/50 shadow-soft p-8">
                <ContactForm />
              </div>
            </AnimatedSection>
          </div>
        </div>
      </section>
    </div>
  );
}
