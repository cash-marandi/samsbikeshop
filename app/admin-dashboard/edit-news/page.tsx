'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface NewsPost {
  _id: string;
  title: string;
  content: string;
  author: string;
  image: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditNewsPage() {
  const router = useRouter();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const postId = searchParams.get('id');
        
        if (!postId) {
          setError('Post ID is required');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/news');
        if (response.ok) {
          const data = await response.json();
          const foundPost = data.newsPosts?.find((p: NewsPost) => p._id === postId);
          
          if (foundPost) {
            setPost(foundPost);
          } else {
            setError('Post not found');
          }
        } else {
          setError('Failed to fetch post');
        }
      } catch (error) {
        setError('Error fetching post from database');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('title', post.title);
      formData.append('content', post.content);
      formData.append('author', post.author);

      const response = await fetch(`/api/news?id=${post._id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Create new post with updated content
        const createResponse = await fetch('/api/news', {
          method: 'POST',
          body: formData,
        });

        if (createResponse.ok) {
          setSuccess('Post updated successfully!');
          setTimeout(() => {
            router.push('/admin-dashboard');
          }, 2000);
        } else {
          setError('Failed to update post');
        }
      } else {
        setError('Failed to update post');
      }
    } catch (error) {
      setError('Error updating post');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && post) {
      // For now, just set a placeholder
      // In a real implementation, you'd upload this to Cloudinary
      setPost({ ...post, image: URL.createObjectURL(file) });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin-dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading post...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit News Post</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={post.title}
                  onChange={(e) => setPost({ ...post, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-2">
                  Author
                </label>
                <input
                  type="text"
                  id="author"
                  value={post.author}
                  onChange={(e) => setPost({ ...post, author: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  id="content"
                  value={post.content}
                  onChange={(e) => setPost({ ...post, content: e.target.value })}
                  rows={10}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Post Image
                </label>
                <div className="space-y-2">
                  {post.image && (
                    <div className="mb-4">
                      <img 
                        src={post.image} 
                        alt={post.title} 
                        className="h-48 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin-dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}