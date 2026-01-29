import React from 'react';
import Image from 'next/image';

interface NewsPost {
  id: string;
  title: string;
  content: string;
  image: string;
  date: string;
}

interface LatestNewsProps {
  newsPosts: NewsPost[];
}

export default function LatestNews({ newsPosts }: LatestNewsProps) {
  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-bold uppercase mb-12 text-gray-900">Latest News</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {newsPosts.length > 0 ? (
          newsPosts.map((post) => (
            <div key={post.id} className="group cursor-pointer bg-white border-2 border-gray-200 overflow-hidden">
              <div className="h-64 overflow-hidden">
                <Image src={post.image} width={400} height={256} className="w-full h-full object-cover" alt={post.title} />
              </div>
              <div className="p-6">
                <span className="text-orange-500 text-xs font-bold uppercase">{formatTimestamp(new Date(post.date).getTime())}</span>
                <h3 className="text-2xl font-bold mt-2 mb-4 text-gray-900 group-hover:text-orange-600">{post.title}</h3>
                <p className="text-gray-600 leading-relaxed line-clamp-3">{post.content}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">No news posts found.</div>
        )}
      </div>
    </section>
  );
}