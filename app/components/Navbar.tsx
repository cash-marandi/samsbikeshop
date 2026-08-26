'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { useCart } from '../context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';

// SVG Icons (Lucide-style, consistent)
const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
  </svg>
);

const MenuIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const navLinks = [
  { name: 'Home', href: '/' },
  { name: 'Shop', href: '/shop' },
  { name: 'Auctions', href: '/auctions' },
  { name: 'Rentals', href: '/rentals' },
  { name: 'Repairs', href: '/repairs' },
  { name: 'News', href: '/news' },
  { name: 'Contact', href: '/contact' },
];

export const Navbar: React.FC = () => {
  const { data: session, status } = useSession();
  const { itemCount } = useCart();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'py-2' 
          : 'py-4'
      }`}
    >
      <div className={`mx-4 md:mx-6 lg:mx-8 transition-all duration-300 ${
        isScrolled 
          ? 'glass rounded-2xl shadow-soft' 
          : ''
      }`}>
        <nav className={`max-w-7xl mx-auto px-4 sm:px-6 ${isScrolled ? '' : 'py-2'}`}>
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 group">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6, ease: "easeInOut" as const }}
                className="relative w-10 h-10 flex items-center justify-center flex-shrink-0"
              >
                <img 
                  src="/images/logo.png" 
                  alt="Sams Bike Shop Logo" 
                  className="h-10 w-auto" 
                />
              </motion.div>
              <div className="flex flex-col">
                <span className="font-display text-xl font-bold tracking-wide text-ink-950">
                  SAMS
                </span>
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ink-400 -mt-1">
                  Bike Shop
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-colors rounded-lg ${
                    isActive(link.href)
                      ? 'text-flame-600'
                      : 'text-ink-600 hover:text-ink-900 hover:bg-ink-100/50'
                  }`}
                >
                  {link.name}
                  {isActive(link.href) && (
                    <motion.div
                      layoutId="activeNav"
                      className="absolute bottom-0 left-2 right-2 h-0.5 bg-flame-500 rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-3">
              <Link 
                href="/cart" 
                className="relative p-2 text-ink-600 hover:text-flame-600 rounded-lg hover:bg-ink-100/50 transition-all"
              >
                <CartIcon />
                <AnimatePresence>
                  {itemCount > 0 && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      className="absolute -top-1 -right-1 bg-flame-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                    >
                      {itemCount}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
              
              {status === 'authenticated' && session.user ? (
                <div className="hidden md:flex items-center space-x-3">
                  <Link 
                    href={session.user.role === 'TEAM_ADMIN' ? '/admin-dashboard' : '/user-profile'} 
                    className="text-sm font-semibold text-flame-600 hover:text-flame-700 transition-colors"
                  >
                    {session.user.name}
                  </Link>
                  <button 
                    onClick={() => signOut()} 
                    className="text-xs text-ink-500 hover:text-ink-900 uppercase font-bold px-3 py-2 hover:bg-ink-100/50 rounded-lg transition-all"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <div className="hidden md:flex items-center space-x-2">
                  <Link 
                    href="/signup" 
                    className="text-sm font-medium text-ink-600 hover:text-ink-900 px-4 py-2 hover:bg-ink-100/50 rounded-lg transition-all"
                  >
                    Sign up
                  </Link>
                  <Link 
                    href="/login" 
                    className="bg-flame-500 hover:bg-flame-600 text-white px-5 py-2.5 font-bold text-sm rounded-xl shadow-glow hover:shadow-glow-lg transition-all"
                  >
                    Login
                  </Link>
                </div>
              )}
              
              {/* Mobile Menu Button */}
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden p-2 text-ink-600 hover:text-flame-600 hover:bg-ink-100/50 rounded-lg transition-all"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <XIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className="lg:hidden mx-4 md:mx-6 mt-2 glass rounded-2xl shadow-large overflow-hidden"
          >
            <div className="p-4 space-y-1">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`block px-4 py-3 text-base font-medium rounded-lg transition-colors ${
                      isActive(link.href)
                        ? 'bg-flame-50 text-flame-600'
                        : 'text-ink-700 hover:bg-ink-100/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                </motion.div>
              ))}

              {status !== 'authenticated' && (
                <div className="pt-4 border-t border-ink-200 mt-4 flex gap-3 px-4">
                  <Link 
                    href="/signup" 
                    className="flex-1 text-center py-3 text-sm font-medium text-ink-700 bg-ink-100/50 hover:bg-ink-200 rounded-xl transition-colors"
                  >
                    Sign up
                  </Link>
                  <Link 
                    href="/login" 
                    className="flex-1 text-center py-3 text-sm font-bold text-white bg-flame-500 hover:bg-flame-600 rounded-xl transition-colors"
                  >
                    Login
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};
