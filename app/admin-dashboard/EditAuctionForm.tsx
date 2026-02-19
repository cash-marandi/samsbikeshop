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
    currentBid: string;
    minIncrement: string;
    startTime: string;
    endTime: string;
  }>({
    name: initialAuction.name,
    description: initialAuction.description,
    currentBid: initialAuction.currentBid.toString(),
    minIncrement: initialAuction.minIncrement.toString(),
    startTime: new Date(initialAuction.startTime).toISOString().slice(0, 16),
    endTime: new Date(initialAuction.endTime).toISOString().slice(0, 16),
  });
  const [existingImages, setExistingImages] = useState<string[]>(initialAuction.images || (initialAuction.image ? [initialAuction.image] : []));
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setNewImages(prev => [...prev, ...fileArray]);
      
      const newPreviews: string[] = [];
      fileArray.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result as string);
          if (newPreviews.length === fileArray.length) {
            setImagePreviews(prev => [...prev, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setNewImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (existingImages.length + newImages.length === 0) {
      setError('At least one image is required.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('currentBid', formData.currentBid);
      data.append('minIncrement', formData.minIncrement);
      data.append('startTime', new Date(formData.startTime).getTime().toString());
      data.append('endTime', new Date(formData.endTime).getTime().toString());
      data.append('existingImages', JSON.stringify(existingImages));

      newImages.forEach(image => {
        data.append('images', image);
      });

      const response = await fetch(`/api/auctions?id=${initialAuction._id}`, {
        method: 'PATCH',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update auction');
      }

      setSuccess('Auction updated successfully!');
      onAuctionUpdated();
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
            <label className="block text-sm font-medium text-zinc-400 mb-2">Auction Images</label>
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-zinc-500 mb-2">Current Images:</p>
                <div className="flex flex-wrap gap-2">
                  {existingImages.map((img, index) => (
                    <div key={index} className="relative">
                      <img src={img} alt={`Current ${index + 1}`} className="h-20 w-20 object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => removeExistingImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {imagePreviews.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-zinc-500 mb-2">New Images to Add:</p>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`New ${index + 1}`} className="h-20 w-20 object-cover rounded-md border-2 border-blue-500" />
                      <button
                        type="button"
                        onClick={() => removeNewImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <input
              type="file"
              id="images"
              name="images"
              multiple
              accept="image/*"
              onChange={handleImageChange}
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
