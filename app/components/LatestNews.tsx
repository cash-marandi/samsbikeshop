'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { StaggerContainer, StaggerItem } from './AnimatedSection';

interface NewsPost {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  image: string;
  date: string;
}

interface LatestNewsProps {
  newsPosts: NewsPost[];
}

const ArrowRightIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
  </svg>
);

export default function LatestNews({ newsPosts }: LatestNewsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const latestPosts = newsPosts.slice(0, 4);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-flame-600">News</span>
            </div>
            <h2 className="font-display text-4xl font-bold text-ink-900">Latest News</h2>
          </div>
        </div>

        {latestPosts.length > 0 ? (
          <>
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6" staggerDelay={0.15}>
              {latestPosts.map((post) => {
                const postId = post._id || post.id;
                return (
                <StaggerItem key={postId || Math.random().toString()}>
                  <Link href={`/news/${postId}`}>
                  <motion.div
                    whileHover={{ y: -4 }}
                    className="group cursor-pointer bg-ink-50 rounded-2xl overflow-hidden border border-ink-200/50 shadow-soft hover:shadow-large transition-all duration-300"
                  >
                    <div className="relative h-64 overflow-hidden bg-ink-200">
                      {post.image ? (
                        <Image 
                          src={post.image} 
                          width={800} 
                          height={400} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" 
                          alt={post.title} 
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-ink-100">
                          <span className="text-ink-400 text-sm font-medium">No image</span>
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <span className="text-flame-500 text-xs font-bold uppercase tracking-wider">
                        {formatDate(post.date)}
                      </span>
                      <h3 className="font-display text-xl font-bold mt-2 mb-3 text-ink-900 group-hover:text-flame-600 transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-ink-500 leading-relaxed line-clamp-3 whitespace-pre-line">{post.content}</p>
                    </div>
                  </motion.div>
                  </Link>
                </StaggerItem>
                );
              })}
            </StaggerContainer>

            <div className="mt-12 text-center">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/news"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-ink-900 hover:bg-ink-800 text-white font-bold text-sm uppercase tracking-wider rounded-xl transition-all"
                >
                  Read More Articles
                  <ArrowRightIcon className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </>
        ) : (
          <div className="text-center py-16 bg-ink-50 rounded-2xl border border-ink-200/50">
            <p className="text-ink-500 text-lg">No news posts found.</p>
          </div>
        )}
      </div>
    </section>
  );
}
