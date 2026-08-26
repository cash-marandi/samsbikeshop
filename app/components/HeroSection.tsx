'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
    },
  },
};

const floatingAnimation = {
  y: [0, -20, 0],
  transition: {
    duration: 6,
    repeat: Infinity,
    ease: "easeInOut" as const,
  },
};

export default function HeroSection() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  return (
    <section ref={ref} className="relative min-h-[100dvh] flex items-center overflow-hidden bg-ink-950">
      {/* Background Image with Parallax */}
      <motion.div 
        style={{ y, scale }}
        className="absolute inset-0 z-0"
      >
        <Image
          src="/images/herobg.jpg"
          alt="Cycling background"
          fill
          priority
          className="object-cover opacity-40"
          sizes="100vw"
        />
        {/* Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-b from-ink-950/80 via-ink-950/50 to-ink-950" />
        <div className="absolute inset-0 bg-gradient-to-r from-ink-950/90 via-transparent to-transparent" />
      </motion.div>

      {/* Animated Decorative Elements */}
      <div className="absolute inset-0 z-[1] overflow-hidden pointer-events-none">
        {/* Floating geometric shapes */}
        <motion.div
          animate={floatingAnimation}
          className="absolute top-20 right-[10%] w-72 h-72 rounded-full bg-flame-500/10 blur-3xl"
        />
        <motion.div
          animate={{
            y: [0, 30, 0],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut" as const }
          }}
          className="absolute bottom-40 right-[20%] w-96 h-96 rounded-full bg-flame-600/5 blur-3xl"
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} />
      </div>

      {/* Content */}
      <motion.div 
        style={{ opacity }}
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-40"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-3xl"
        >
          {/* Badge */}
          <motion.div variants={itemVariants} className="mb-8">
            <motion.span 
              className="inline-flex items-center gap-2 px-4 py-2 bg-flame-500/10 border border-flame-500/20 rounded-full"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <span className="w-2 h-2 rounded-full bg-flame-500 animate-pulse" />
              <span className="text-sm font-medium text-flame-400 uppercase tracking-wider">
                Official Dealer & Service Center
              </span>
            </motion.span>
          </motion.div>

          {/* Headline */}
          <motion.h1 
            variants={itemVariants}
            className="font-display text-6xl sm:text-7xl lg:text-8xl xl:text-9xl font-bold text-white leading-[0.9] tracking-tight mb-8"
          >
            <span className="block">BORN TO</span>
            <motion.span 
              className="block gradient-text mt-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8, duration: 0.8 }}
            >
              RIDE.
            </motion.span>
          </motion.h1>

          {/* Description */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl text-ink-300 max-w-xl mb-12 leading-relaxed"
          >
            Premium cycles, expert repairs, and real-time auctions. 
            Mobile repair services and bike pickup available. 
            Your ultimate cycling destination since 1998.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-wrap gap-4"
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/shop" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-flame-500 hover:bg-flame-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5V14l-3-3 4-3 2 3h2"/></svg>
                Shop Inventory
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link 
                href="/auctions" 
                className="inline-flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-bold text-sm uppercase tracking-wider rounded-xl border border-white/20 backdrop-blur-sm transition-all"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                Join Auction
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            variants={itemVariants}
            className="mt-16 pt-8 border-t border-white/10"
          >
            <div className="grid grid-cols-3 gap-8 max-w-md">
              {[
                { value: '25+', label: 'Years Experience' },
                { value: '5000+', label: 'Bikes Sold' },
                { value: '100%', label: 'Satisfaction' },
              ].map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
                  className="text-center sm:text-left"
                >
                  <div className="text-2xl sm:text-3xl font-display font-bold text-white">{stat.value}</div>
                  <div className="text-xs text-ink-400 uppercase tracking-wider mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>

        {/* Right side decorative element - bike wheel abstract */}
        <motion.div 
          className="hidden lg:block absolute right-[5%] top-1/2 -translate-y-1/2"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" className="opacity-[0.07]">
            <circle cx="200" cy="200" r="190" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="200" r="150" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="200" r="110" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="200" r="70" stroke="white" strokeWidth="1"/>
            <circle cx="200" cy="200" r="30" stroke="white" strokeWidth="2"/>
            {[...Array(12)].map((_, i) => (
              <line key={i} x1="200" y1="10" x2="200" y2="390" stroke="white" strokeWidth="1" transform={`rotate(${i * 30} 200 200)`}/>
            ))}
          </svg>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-xs text-ink-500 uppercase tracking-widest">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ink-500">
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </motion.div>
      </motion.div>
    </section>
  );
}
