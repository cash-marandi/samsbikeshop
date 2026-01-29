'use client';
import React, { useState } from 'react';

interface AddRentalBikeFormProps {
  onClose: () => void;
  onRentalBikeAdded: () => void;
}

const AddRentalBikeForm: React.FC<AddRentalBikeFormProps> = ({ onClose, onRentalBikeAdded }) => {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    pricePerDay: '',
    image: null as File | string | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (e.target instanceof HTMLInputElement && e.target.type === 'file') {
      const fileInput = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: fileInput.files ? fileInput.files[0] : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', formData.type);
      data.append('pricePerDay', formData.pricePerDay);
      
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else {
        // Use a default image if no image provided
        data.append('image', `https://picsum.photos/seed/rental${Date.now()}/600/400`);
      }

      const response = await fetch('/api/rentals', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create rental bike');
      }

      onRentalBikeAdded();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-lg border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Rental Bike</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400">Bike Name</label>
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
            <label htmlFor="type" className="block text-sm font-medium text-zinc-400">Bike Type</label>
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              <option value="">Select a type</option>
              <option value="Mountain">Mountain</option>
              <option value="Road">Road</option>
              <option value="Hybrid">Hybrid</option>
              <option value="Electric">Electric</option>
              <option value="Kids">Kids</option>
            </select>
          </div>
          <div>
            <label htmlFor="pricePerDay" className="block text-sm font-medium text-zinc-400">Price Per Day (R)</label>
            <input
              type="number"
              id="pricePerDay"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              step="0.01"
              min="0"
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-zinc-400">Bike Image</label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Rental bike preview" className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              accept="image/*"
              className="mt-1 block w-full text-white
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

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
              {loading ? 'Adding...' : 'Add Rental Bike'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRentalBikeForm;