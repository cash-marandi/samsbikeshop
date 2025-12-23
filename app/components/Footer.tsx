
'use client';

import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-4">
            <h3 className="text-xl font-bold flex items-center space-x-2">
              <span className="text-blue-900">SAMS</span>
              <span>BIKE SHOP</span>
            </h3>
            <p className="text-zinc-500 text-sm">
              Your local hub for premium bicycles, expert repairs, and elite racing gear. Join our community today.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-900 mb-6">Quick Links</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/shop" className="hover:text-white">Shop Bikes</Link></li>
              <li><Link href="/rentals" className="hover:text-white">Rentals</Link></li>
              <li><Link href="/auctions" className="hover:text-white">Live Auctions</Link></li>
              <li><Link href="/repairs" className="hover:text-white">Service & Repair</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-900 mb-6">Support</h4>
            <ul className="space-y-3 text-sm text-zinc-400">
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li><Link href="/about" className="hover:text-white">About Our Story</Link></li>
              <li><Link href="#" className="hover:text-white">FAQs</Link></li>
              <li><Link href="#" className="hover:text-white">Privacy Policy</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-bold uppercase tracking-widest text-blue-900 mb-6">Connect</h4>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-blue-950 transition-colors">
                <span className="sr-only">Facebook</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center hover:bg-blue-950 transition-colors">
                <span className="sr-only">Instagram</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.315 2c2.43 0 2.715.013 3.67.056 1.03.045 1.735.209 2.357.452a4.73 4.73 0 0 1 1.683 1.097c.48.48.81 1.02.933 1.683.245.622.41 1.327.455 2.357.042.955.056 1.24.056 3.67 0 2.43-.013 2.715-.056 3.67-.045 1.03-.209 1.735-.452 2.357a4.73 4.73 0 0 1-1.097 1.683c-.48.48-1.02.81-1.683.933-.622.245-1.327.41-2.357.455-.955.042-1.24.056-3.67.056-2.43 0-2.715-.013-3.67-.056-1.03-.045-1.735-.209-2.357-.452a4.73 4.73 0 0 1-1.683-1.097c-.48-.48-.81-1.02-.933-1.683-.245-.622-.41-1.327-.455-2.357C2.013 14.715 2 14.43 2 12c0-2.43.013-2.715.056-3.67.045-1.03.209-1.735.452-2.357a4.73 4.73 0 0 1 1.097-1.683c.48-.48 1.02-.81 1.683-.933.622-.245 1.327-.41 2.357-.455.955-.042 1.24-.056 3.67-.056zm.185 1.815c-2.383 0-2.66.01-3.59.053-.865.039-1.332.183-1.644.304-.413.16-.707.353-.1.646.646.29.29.585.586.998.16.41.35.707.646 1.097a3.442 3.442 0 0 0 1.097 1.097c.41.29.707.48 1.097.646.312.12.78.265 1.644.304.93.042 1.208.053 3.59.053s2.66-.01 3.59-.053c.865-.039 1.332-.265 1.644-.304.413-.16.707-.353 1.01-.646a3.442 3.442 0 0 0 1.097-1.097c.29-.41.48-.707.646-1.097.12-.312.265-.78.304-1.644.042-.93.053-1.208.053-3.59s-.01-2.66-.053-3.59c-.039-.865-.183-1.332-.304-1.644a3.442 3.442 0 0 0-1.097-1.097c-.41-.29-.707-.48-1.097-.646-.312-.12-.78-.265-1.644-.304-.93-.042-1.208-.053-3.59-.053zM12 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16.35a4.35 4.35 0 1 1 0-8.7 4.35 4.35 0 0 1 0 8.7zm6.406-11.845a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-16 border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-zinc-600">
          <p>&copy; 2024 Sams Bike Shop. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Cookie Settings</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
