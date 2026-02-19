'use client';
import React, { useState } from 'react';
import { ProductType } from '@/app/types';

interface AddProductFormProps {
  onClose: () => void;
  onProductAdded: () => void;
}

const AddProductForm: React.FC<AddProductFormProps> = ({ onClose, onProductAdded }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    images: File[];
    type: ProductType;
    brand: string;
    stock: string;
  }>({
    name: '',
    description: '',
    price: '',
    images: [],
    type: ProductType.BIKE,
    brand: '',
    stock: '',
  });
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setFormData(prev => ({ ...prev, images: [...prev.images, ...fileArray] }));
      
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

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.images.length === 0) {
      setError('At least one image is required.');
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('price', formData.price);
      formData.images.forEach(image => {
        data.append('images', image);
      });
      data.append('type', formData.type);
      data.append('brand', formData.brand);
      data.append('stock', formData.stock);

      const response = await fetch('/api/products', {
        method: 'POST',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add product');
      }

      setSuccess('Product added successfully!');
      setFormData({
        name: '',
        description: '',
        price: '',
        images: [],
        type: ProductType.BIKE,
        brand: '',
        stock: '',
      });
      setImagePreviews([]);
      onProductAdded();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-lg border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Add New Product</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400">Name</label>
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
              <label htmlFor="price" className="block text-sm font-medium text-zinc-400">Price</label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleChange}
                step="0.01"
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label htmlFor="stock" className="block text-sm font-medium text-zinc-400">Stock</label>
              <input
                type="number"
                id="stock"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              />
            </div>
          </div>
          <div>
            <label htmlFor="images" className="block text-sm font-medium text-zinc-400">Product Images</label>
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
              required
            />
            {imagePreviews.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img src={preview} alt={`Preview ${index + 1}`} className="h-20 w-20 object-cover rounded-md" />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-zinc-400">Type</label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required
              >
                {Object.values(ProductType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="brand" className="block text-sm font-medium text-zinc-400">Brand</label>
              <input
                type="text"
                id="brand"
                name="brand"
                value={formData.brand}
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
              {loading ? 'Adding...' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProductForm;
