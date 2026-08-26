'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

const footerLinks = {
  shop: [
    { name: 'Shop Bikes', href: '/shop' },
    { name: 'Rentals', href: '/rentals' },
    { name: 'Live Auctions', href: '/auctions' },
    { name: 'Service & Repair', href: '/repairs' },
  ],
  support: [
    { name: 'Contact Us', href: '/contact' },
    { name: 'About Our Story', href: '/about' },
    { name: 'How to Bid', href: '/how-to-bid' },
    { name: 'Privacy Policy', href: '#' },
  ],
  services: [
    { name: 'Mobile Repair', href: '/repairs' },
    { name: 'Bike Fitting', href: '/shop' },
    { name: 'Custom Builds', href: '/request' },
    { name: 'Trade-Ins', href: '/contact' },
  ],
};

const socialLinks = [
  { name: 'Facebook', href: '#', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
  )},
  { name: 'Instagram', href: '#', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.715.013 3.67.056 1.03.045 1.735.209 2.357.452a4.73 4.73 0 0 1 1.683 1.097c.48.48.81 1.02.933 1.683.245.622.41 1.327.455 2.357.042.955.056 1.24.056 3.67 0 2.43-.013 2.715-.056 3.67-.045 1.03-.209 1.735-.452 2.357a4.73 4.73 0 0 1-1.097 1.683c-.48.48-1.02.81-1.683.933-.622.245-1.327.41-2.357.455-.955.042-1.24.056-3.67.056-2.43 0-2.715-.013-3.67-.056-1.03-.045-1.735-.209-2.357-.452a4.73 4.73 0 0 1-1.683-1.097c-.48-.48-.81-1.02-.933-1.683-.245-.622-.41-1.327-.455-2.357C2.013 14.715 2 14.43 2 12c0-2.43.013-2.715.056-3.67.045-1.03.209-1.735.452-2.357a4.73 4.73 0 0 1 1.097-1.683c.48-.48 1.02-.81 1.683-.933.622-.245 1.327-.41 2.357-.455.955-.042 1.24-.056-3.67-.056zm.185 1.815c-2.383 0-2.66.01-3.59.053-.865.039-1.332.183-1.644.304-.413.16-.707.353-.1.646.646.29.29.585.586.998.16.41.35.707.646 1.097a3.442 3.442 0 0 0 1.097 1.097c.41.29.707.48 1.097.646.312.12.78.265 1.644.304.93.042 1.208.053 3.59.053s2.66-.01 3.59-.053c.865-.039 1.332-.265 1.644-.304.413-.16.707-.353 1.01-.646a3.442 3.442 0 0 0 1.097-1.097c.29-.41.48-.707.646-1.097.12-.312.265-.78.304-1.644.042-.93.053-1.208.053-3.59s-.01-2.66-.053-3.59c-.039-.865-.183-1.332-.304-1.644a3.442 3.442 0 0 0-1.097-1.097c-.41-.29-.707-.48-1.097-.646-.312-.12-.78-.265-1.644-.304-.93-.042-1.208-.053-3.59-.053zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16.35a4.35 4.35 0 1 1 0-8.7 4.35 4.35 0 0 1 0 8.7zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
  )},
  { name: 'Twitter', href: '#', icon: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
  )},
];

export const Footer: React.FC = () => {
  return (
    <footer className="relative bg-ink-950 overflow-hidden">
      {/* Top decorative line */}
      <div className="h-1 bg-gradient-to-r from-flame-500 via-flame-400 to-flame-600" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-flame-500 flex items-center justify-center flex-shrink-0">
                  <img 
                    src="/images/logo.png" 
                    alt="Sams Bike Shop" 
                    className="w-6 h-6 object-contain invert"
                  />
                </div>
                <div>
                  <span className="font-display text-xl font-bold tracking-wide text-white">SAMS</span>
                  <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-ink-300 -mt-1">Bike Shop</span>
                </div>
              </div>
            </Link>
            
            <p className="text-ink-300 text-sm leading-relaxed max-w-sm">
              Your local hub for premium bicycles, expert repairs, and elite racing gear. 
              Join our community and discover the freedom of cycling.
            </p>
            
            <div className="text-ink-300 text-sm space-y-2">
              <p className="font-semibold text-white">Address:</p>
              <p>2057 Parsley Street</p>
              <p>R558 Main Road, Silver Leaf</p>
              <p>Protea Glen, Soweto, Gauteng</p>
            </div>

            <div className="flex items-center space-x-3">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-10 h-10 rounded-xl bg-ink-800 hover:bg-flame-500 flex items-center justify-center text-ink-300 hover:text-white transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-flame-400 mb-6">Shop</h4>
            <ul className="space-y-3">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-ink-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-flame-500 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-flame-400 mb-6">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-ink-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-flame-500 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-flame-400 mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className="text-sm text-ink-300 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    <span className="w-0 group-hover:w-2 h-px bg-flame-500 transition-all duration-300" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-ink-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-ink-400">
              &copy; {new Date().getFullYear()} Sams Bike Shop. All rights reserved.
            </p>
            <p className="text-xs text-ink-400">
              Built by <a href="https://www.livelonke.co.za" target="_blank" rel="noopener noreferrer" className="hover:text-flame-400 transition-colors">Live Lonke ICT</a>
            </p>
            <div className="flex space-x-6">
              <Link href="#" className="text-xs text-ink-400 hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="text-xs text-ink-400 hover:text-white transition-colors">Privacy</Link>
              <Link href="#" className="text-xs text-ink-400 hover:text-white transition-colors">Cookies</Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-flame-500/20 to-transparent" />
    </footer>
  );
};
