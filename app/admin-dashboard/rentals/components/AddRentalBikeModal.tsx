'use client';
import React, { useState } from 'react';
import { useCart } from '@/app/context/CartContext'; // For showToast

interface AddRentalBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBikeAdded: () => void;
}

export default function AddRentalBikeModal({ isOpen, onClose, onBikeAdded }: AddRentalBikeModalProps) {
  const { showToast } = useCart();
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [pricePerDay, setPricePerDay] = useState<number | string>('');
  const [isAvailable, setIsAvailable] = useState(true);
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file)); // Create a preview URL
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!name || !type || !pricePerDay) {
      showToast('Please fill in all required fields.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('pricePerDay', String(pricePerDay));
    formData.append('isAvailable', String(isAvailable));
    if (image) {
      formData.append('image', image);
    }

    try {
      const response = await fetch('/api/rentals', {
        method: 'POST',
        body: formData, // No Content-Type header needed for FormData
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to add new rental bike.');
      }

      showToast('Rental bike added successfully!');
      onBikeAdded();
      onClose(); // Close modal on success

      // Reset form
      setName('');
      setType('');
      setPricePerDay('');
      setIsAvailable(true);
      setImage(null);
      setImagePreview(null);
    } catch (err: any) {
      showToast(err.message || 'Error adding rental bike.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Rental Bike</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Bike Name</label>
            <input
              type="text"
              id="name"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">Bike Type</label>
            <input
              type="text"
              id="type"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={type}
              onChange={(e) => setType(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="pricePerDay" className="block text-sm font-medium text-gray-700">Price Per Day (R)</label>
            <input
              type="number"
              id="pricePerDay"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={pricePerDay}
              onChange={(e) => setPricePerDay(e.target.value)}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-gray-700">Bike Image</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              onChange={handleImageChange}
            />
            {imagePreview && (
              <div className="mt-2">
                <img src={imagePreview} alt="Image Preview" className="h-20 w-20 object-cover rounded-md" />
              </div>
            )}
          </div>

          <div className="flex items-center">
            <input
              id="isAvailable"
              type="checkbox"
              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
              checked={isAvailable}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label htmlFor="isAvailable" className="ml-2 block text-sm text-gray-900">Is Available for Rent</label>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-orange-600 border border-transparent rounded-md shadow-sm hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Bike'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
