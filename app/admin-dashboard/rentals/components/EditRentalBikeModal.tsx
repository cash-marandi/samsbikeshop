'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '@/app/context/CartContext';
import { RentalBike } from '@/app/admin-dashboard/rentals/RentalsManagement';

interface EditRentalBikeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBikeUpdated: () => void;
  bike: RentalBike | null;
}

export default function EditRentalBikeModal({ isOpen, onClose, onBikeUpdated, bike }: EditRentalBikeModalProps) {
  const { showToast } = useCart();
  const [name, setName] = useState(bike?.name || '');
  const [type, setType] = useState(bike?.type || '');
  const [pricePerDay, setPricePerDay] = useState<number | string>(bike?.pricePerDay || '');
  const [isAvailable, setIsAvailable] = useState(bike?.isAvailable ?? true);
  const [existingImages, setExistingImages] = useState<string[]>(bike?.images || (bike?.image ? [bike.image] : []));
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (bike) {
      setName(bike.name);
      setType(bike.type);
      setPricePerDay(bike.pricePerDay);
      setIsAvailable(bike.isAvailable);
      setExistingImages(bike.images || (bike.image ? [bike.image] : []));
      setNewImages([]);
      setImagePreviews([]);
    }
  }, [bike]);

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

    if (existingImages.length + newImages.length === 0) {
      showToast('At least one image is required.');
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('type', type);
    formData.append('pricePerDay', String(pricePerDay));
    formData.append('isAvailable', String(isAvailable));
    formData.append('existingImages', JSON.stringify(existingImages));

    newImages.forEach(image => {
      formData.append('images', image);
    });

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

  if (!isOpen || !bike) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white max-h-[90vh] overflow-y-auto">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Bike Images</label>
            {existingImages.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-gray-500 mb-2">Current Images:</p>
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
                <p className="text-xs text-gray-500 mb-2">New Images to Add:</p>
                <div className="flex flex-wrap gap-2">
                  {imagePreviews.map((preview, index) => (
                    <div key={index} className="relative">
                      <img src={preview} alt={`New ${index + 1}`} className="h-20 w-20 object-cover rounded-md border-2 border-orange-500" />
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
              multiple
              accept="image/*"
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              onChange={handleImageChange}
            />
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
