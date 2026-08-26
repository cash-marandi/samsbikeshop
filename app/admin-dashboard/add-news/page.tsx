'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function AddNewsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('author', author);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      const response = await fetch('/api/news', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        setSuccess('Post created successfully!');
        setTimeout(() => {
          router.push('/admin-dashboard');
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create post');
      }
    } catch (error) {
      setError('Error creating post');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        <div className="bg-white rounded-2xl shadow-premium border border-ink-100">
          <div className="px-8 py-6 border-b border-ink-100">
            <h1 className="text-2xl font-display font-bold text-ink-900">Create New Post</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <p className="text-green-600 text-sm">{success}</p>
              </div>
            )}

            <div>
              <label htmlFor="title" className="block text-sm font-semibold text-ink-700 mb-2">
                Post Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 focus:border-transparent text-ink-900 bg-ink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="author" className="block text-sm font-semibold text-ink-700 mb-2">
                Author
              </label>
              <input
                type="text"
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full px-4 py-3 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 focus:border-transparent text-ink-900 bg-ink-50"
                required
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-semibold text-ink-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 focus:border-transparent text-ink-900 bg-ink-50 resize-y"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-2">
                Post Image
              </label>
              <div className="space-y-4">
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-48 w-80 object-cover rounded-xl border border-ink-200"
                  />
                )}
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 text-ink-900 bg-ink-50 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-flame-50 file:text-flame-700 hover:file:bg-flame-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6 border-t border-ink-100">
              <button
                type="button"
                onClick={() => router.push('/admin-dashboard')}
                className="px-6 py-3 border border-ink-200 rounded-xl text-ink-700 hover:bg-ink-50 font-medium transition-all"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold text-sm uppercase tracking-wider rounded-xl shadow-glow transition-all disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Publishing...' : 'Publish Post'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
