'use client';
import React, { useState, useEffect } from 'react';
import { Auction } from '@/app/types';

interface EditAuctionFormProps {
  onClose: () => void;
  onAuctionUpdated: () => void;
  initialAuction: Auction;
}

const EditAuctionForm: React.FC<EditAuctionFormProps> = ({ onClose, onAuctionUpdated, initialAuction }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    image: File | string | null; // Can be File, URL string, or null
    currentBid: string;
    minIncrement: string;
    startTime: string; // ISO string
    endTime: string;   // ISO string
  }>({
    name: initialAuction.name,
    description: initialAuction.description,
    image: initialAuction.image || null, // Pre-populate with existing image URL
    currentBid: initialAuction.currentBid.toString(),
    minIncrement: initialAuction.minIncrement.toString(),
    startTime: new Date(initialAuction.startTime).toISOString().slice(0, 16),
    endTime: new Date(initialAuction.endTime).toISOString().slice(0, 16),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialAuction.image || null);

  useEffect(() => {
    if (formData.image instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(formData.image);
    } else if (typeof formData.image === 'string') {
      setImagePreview(formData.image);
    } else {
      setImagePreview(null);
    }
  }, [formData.image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const fileInput = e.target as HTMLInputElement; // Explicitly cast to HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: fileInput.files ? fileInput.files[0] : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('currentBid', formData.currentBid);
      data.append('minIncrement', formData.minIncrement);
      data.append('startTime', new Date(formData.startTime).getTime().toString());
      data.append('endTime', new Date(formData.endTime).getTime().toString());

      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else if (typeof formData.image === 'string' && formData.image !== '') {
        // If image is an existing URL and not changed, send it as a string to preserve
        // The backend should ignore this if it's already an existing image URL
        // or ensure it doesn't try to re-upload. For now, we'll just not append it
        // if it's the original image URL and no new file was selected.
        // A more robust solution might send a flag indicating "no change to image"
        // or only send the image if it's a new File object.
        // For simplicity, if it's a string (URL) and no new file, we don't append
        // it to formData so backend doesn't try to process it as a new upload.
        // If user wants to *remove* image, they'd have to clear file input, making formData.image null.
      } else if (formData.image === null) {
        // User explicitly cleared image, send an empty string or specific flag
        data.append('image', ''); // Backend should handle this as clearing the image
      }


      const response = await fetch(`/api/auctions?id=${initialAuction._id}`, {
        method: 'PATCH',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update auction');
      }

      setSuccess('Auction updated successfully!');
      onAuctionUpdated(); // Notify parent to refresh auction list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-lg border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Auction</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400">Auction Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-zinc-400">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            ></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="currentBid" className="block text-sm font-medium text-zinc-400">Starting Bid</label>
              <input
                type="number"
                id="currentBid"
                name="currentBid"
                value={formData.currentBid}
                onChange={handleChange}
                step="0.01"
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="minIncrement" className="block text-sm font-medium text-zinc-400">Minimum Increment</label>
              <input
                type="number"
                id="minIncrement"
                name="minIncrement"
                value={formData.minIncrement}
                onChange={handleChange}
                step="0.01"
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-zinc-400">Auction Image</label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Current Auction" className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              className="mt-1 block w-full text-white
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-zinc-400">Start Time</label>
              <input
                type="datetime-local"
                id="startTime"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-zinc-400">End Time</label>
              <input
                type="datetime-local"
                id="endTime"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-zinc-400 hover:text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Auction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAuctionForm;
