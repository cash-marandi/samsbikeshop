'use client'

import React from 'react'
import Link from 'next/link'

interface Post {
  _id: string
  title: string
  content: string
  author: string
  image: string
  date: string
}

export default function ArticlePageContent({ post }: { post: Post }) {
  const paragraphs = post.content.split('\n').filter((p: string) => p.trim())

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <Link href="/news" className="inline-flex items-center gap-2 text-flame-500 font-bold uppercase tracking-widest text-sm hover:text-flame-600 mb-8">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
          Back to News
        </Link>

        <article>
          <div className="flex items-center gap-4 text-xs font-bold uppercase tracking-widest text-ink-600 mb-6">
            <span className="text-flame-500">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
            <span className="w-1 h-1 rounded-full bg-ink-300"></span>
            <span>By {post.author}</span>
          </div>

          <h1 className="text-5xl font-display font-bold text-ink-900 leading-tight mb-8">
            {post.title}
          </h1>

          {post.image && (
            <div className="aspect-video rounded-2xl overflow-hidden mb-10 border border-ink-200">
              <img src={post.image} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}

          <div className="prose prose-lg max-w-none">
            {paragraphs.map((paragraph: string, index: number) => (
              <p key={index} className="text-ink-700 text-lg leading-relaxed mb-6">
                {paragraph}
              </p>
            ))}
          </div>
        </article>

        <div className="mt-16 pt-8 border-t border-ink-200">
          <Link href="/news" className="text-flame-500 font-bold uppercase tracking-widest text-sm hover:text-flame-600 inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to All Articles
          </Link>
        </div>
      </div>
    </div>
  )
}
