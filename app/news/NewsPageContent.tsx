'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { NewsPost } from '../types'

interface NewsPageContentProps {
  newsPosts: NewsPost[]
  categories: any[]
}

export default function NewsPageContent({ newsPosts, categories }: NewsPageContentProps) {
  const [email, setEmail] = useState('')

  const handleNewsletterSubscribe = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'news-page' }),
      })

      const result = await response.json()
      if (response.ok) {
        alert(result.message)
        setEmail('')
      } else {
        alert(result.error)
      }
    } catch (err: any) {
      alert('Failed to subscribe to newsletter')
    }
  }

  const getPostId = (post: NewsPost) => post._id || post.id

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="mb-20 text-center">
        <h1 className="text-6xl font-bold uppercase tracking-tighter mb-4">The Feed</h1>
        <p className="text-ink-600 text-xl">Updates from the workshop, local racing news, and gear reviews.</p>
      </div>

      <section className="mb-12">
        <p className="text-ink-600 leading-relaxed max-w-3xl">
          Stay up to date with the latest from Sam&apos;s Bike Shop in Soweto. Read about cycling gear reviews, local racing events, maintenance tips, and community happenings in the Gauteng cycling scene. Whether you&apos;re a competitive cyclist or a weekend rider, our blog covers everything from equipment recommendations to trail guides across Johannesburg and beyond.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 space-y-20">
          {newsPosts.length > 0 ? newsPosts.map(post => {
            const postId = getPostId(post)
            const lines = post.content.split('\n').filter((l: string) => l.trim())
            const summary = lines.slice(0, 3).join(' ')

            return (
              <article key={postId} className="group">
                <Link href={`/news/${postId}`}>
                  <div className="aspect-video rounded-xl overflow-hidden mb-8 border border-ink-200 relative">
                    <img src={post.image} className="w-full h-full object-cover" alt={post.title} />
                    <div className="absolute top-6 left-6 bg-flame-500 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
                      Featured News
                    </div>
                  </div>
                </Link>
                <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-ink-600 mb-4">
                  <span className="text-flame-500">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                  <span className="w-1 h-1 rounded-full bg-ink-300"></span>
                  <span>By {post.author}</span>
                </div>
                <Link href={`/news/${postId}`}>
                  <h2 className="text-4xl font-bold mb-6 group-hover:text-flame-500 leading-tight">
                    {post.title}
                  </h2>
                </Link>
                <p className="text-ink-700 text-lg leading-relaxed mb-8 whitespace-pre-line line-clamp-3">
                  {summary}
                </p>
                <Link href={`/news/${postId}`} className="text-flame-500 font-bold uppercase tracking-widest text-sm hover:text-flame-600 inline-flex items-center gap-2">
                  Continue Reading
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                </Link>
              </article>
            )
          }) : (
            <div className="text-center py-20 bg-white rounded-xl border border-ink-200">
              <h2 className="text-2xl font-bold text-ink-600">No news posts found.</h2>
              <p className="text-ink-700 mt-2">Check back later for updates!</p>
            </div>
          )}
        </div>

        <aside className="space-y-12">
          <div className="bg-ink-100 p-8 rounded-xl border border-ink-200">
            <h3 className="text-xl font-bold mb-6 uppercase tracking-tight">Categories</h3>
            <ul className="space-y-4">
              {categories.length > 0 ? categories.map(cat => (
                <li key={cat._id} className="flex justify-between items-center group cursor-pointer">
                  <span className="text-ink-700 group-hover:text-ink-900">{cat.name}</span>
                  <span className="text-[10px] font-bold text-ink-600 bg-ink-300 px-2 py-0.5 rounded">{cat.newsCount}</span>
                </li>
              )) : (
                ['Tech Tips', 'Shop Updates', 'Race Results', 'Gear Reviews', 'Community Events'].map(cat => (
                  <li key={cat} className="flex justify-between items-center group cursor-pointer">
                    <span className="text-ink-700 group-hover:text-ink-900">{cat}</span>
                    <span className="text-[10px] font-bold text-ink-600 bg-ink-300 px-2 py-0.5 rounded">12</span>
                  </li>
                ))
              )}
            </ul>
          </div>

          <form onSubmit={handleNewsletterSubscribe} className="bg-flame-500 p-8 rounded-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
               <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/></svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4 relative z-10">Join the Sams newsletter</h3>
            <p className="text-white/90 mb-6 font-medium relative z-10">Get the first look at new stock and secret auction listings.</p>
            <input 
              type="email" 
              placeholder="Your Email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/20 border border-white/30 rounded-xl px-4 py-3 placeholder:text-white/70 mb-4 focus:outline-none" 
            />
            <button type="submit" className="w-full py-4 bg-white text-flame-500 font-bold rounded-xl hover:bg-ink-100">Subscribe</button>
          </form>
        </aside>
      </div>
    </div>
  )
}
