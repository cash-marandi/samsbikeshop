'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { RentalBike } from '@/app/admin-dashboard/rentals/RentalsManagement';

interface EditRentalBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBikeUpdated: () => void;
  bike: RentalBike | null; // The bike to edit
}

export default function EditRentalBikeModal({ isOpen, onClose, onBikeUpdated, bike }: EditRentalBikeModalProps) {
  const { showToast } = useCart();
  const [name, setName] = useState(bike?.name || '');
  const [type, setType] = useState(bike?.type || '');
  const [pricePerDay, setPricePerDay] = useState<number | string>(bike?.pricePerDay || '');
  const [isAvailable, setIsAvailable] = useState(bike?.isAvailable ?? true);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(bike?.image || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form fields when the 'bike' prop changes (e.g., when modal opens for a new bike)
  useEffect(() => {
    if (bike) {
      setName(bike.name);
      setType(bike.type);
      setPricePerDay(bike.pricePerDay);
      setIsAvailable(bike.isAvailable);
      setImage(null); // Clear selected file when switching bikes
      setImagePreview(bike.image || null);
    }
  }, [bike]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImage(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImage(null);
      if (bike?.image) { // If there was an existing image and none selected, revert to existing
        setImagePreview(bike.image);
      } else {
        setImagePreview(null);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!bike?._id) {
      showToast('Error: No bike ID provided for update.');
      setIsSubmitting(false);
      return;
    }
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
    } else if (imagePreview) { // If no new image, but there's an image preview (existing image)
      formData.append('existingImage', imagePreview);
    } else { // If no image and no preview (image was cleared)
        formData.append('image', new File([], 'empty.txt', { type: 'text/plain' })); // Signal to clear image
    }


    try {
      const response = await fetch(`/api/rentals/${bike._id}`, {
        method: 'PATCH',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update rental bike.');
      }

      showToast('Rental bike updated successfully!');
      onBikeUpdated();
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Error updating rental bike.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !bike) return null; // Ensure bike is provided when modal is open

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Edit Rental Bike: {bike.name}</h3>
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
              <div className="mt-2 flex items-center space-x-2">
                <img src={imagePreview} alt="Image Preview" className="h-20 w-20 object-cover rounded-md" />
                <button
                    type="button"
                    onClick={() => setImagePreview(null)}
                    className="text-sm text-red-600 hover:text-red-800"
                >
                    Remove Image
                </button>
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
              {isSubmitting ? 'Updating...' : 'Update Bike'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
