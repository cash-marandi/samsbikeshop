
import React from 'react';
import { MOCK_NEWS } from '../constants';

export default function NewsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="mb-20 text-center">
        <h1 className="text-6xl font-black uppercase tracking-tighter mb-4">The Feed</h1>
        <p className="text-zinc-500 text-xl">Updates from the workshop, local racing news, and gear reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-20">
          {MOCK_NEWS.map(post => (
            <article key={post.id} className="group">
              <div className="aspect-video rounded-3xl overflow-hidden mb-8 border border-zinc-800 relative">
                <img src={post.image} className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105" alt={post.title} />
                <div className="absolute top-6 left-6 bg-blue-900 text-zinc-950 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest">
                  Featured News
                </div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-zinc-500 mb-4">
                <span className="text-blue-900">{post.date}</span>
                <span className="w-1 h-1 rounded-full bg-zinc-800"></span>
                <span>By {post.author}</span>
              </div>
              <h2 className="text-4xl font-black mb-6 group-hover:text-blue-950 transition-colors leading-tight">
                {post.title}
              </h2>
              <p className="text-zinc-400 text-lg leading-relaxed mb-8">
                {post.content} It's that time of year again when the trails dry out and the urge to ride becomes undeniable. Our team has been working around the clock...
              </p>
              <button className="text-blue-900 font-black uppercase tracking-widest text-sm hover:translate-x-2 transition-transform inline-flex items-center gap-2">
                Continue Reading
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
            </article>
          ))}
        </div>

        <aside className="space-y-12">
          <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-800">
            <h3 className="text-xl font-black mb-6 uppercase tracking-tight">Categories</h3>
            <ul className="space-y-4">
              {['Tech Tips', 'Shop Updates', 'Race Results', 'Gear Reviews', 'Community Events'].map(cat => (
                <li key={cat} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-zinc-400 group-hover:text-white transition-colors">{cat}</span>
                  <span className="text-[10px] font-bold text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded">12</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-blue-900 p-8 rounded-3xl relative overflow-hidden group cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 -rotate-12 group-hover:rotate-0 transition-transform duration-500">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <h3 className="text-2xl font-black text-zinc-950 mb-4 relative z-10">Join the Sams newsletter</h3>
            <p className="text-zinc-950/70 mb-6 font-medium relative z-10">Get the first look at new stock and secret auction listings.</p>
            <input type="email" placeholder="Your Email" className="w-full bg-zinc-950/20 border border-zinc-950/30 rounded-xl px-4 py-3 placeholder:text-zinc-950/50 mb-4 focus:outline-none focus:bg-zinc-950/40" />
            <button className="w-full py-4 bg-zinc-950 text-white font-black rounded-xl hover:scale-[1.02] transition-transform">Subscribe</button>
          </div>
        </aside>
      </div>
    </div>
  );
};
