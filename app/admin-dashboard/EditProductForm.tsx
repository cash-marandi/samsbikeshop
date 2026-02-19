'use client';
import React, { useState, useEffect } from 'react';
import { Product, ProductType } from '@/app/types';

interface EditProductFormProps {
  onClose: () => void;
  onProductUpdated: () => void;
  initialProduct: Product;
}

const EditProductForm: React.FC<EditProductFormProps> = ({ onClose, onProductUpdated, initialProduct }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    price: string;
    type: ProductType;
    brand: string;
    stock: string;
    isSold: boolean;
    isSpecial: boolean;
    discount: string;
  }>({
    name: initialProduct.name,
    description: initialProduct.description,
    price: initialProduct.price.toString(),
    type: initialProduct.type,
    brand: initialProduct.brand,
    stock: initialProduct.stock.toString(),
    isSold: initialProduct.isSold || false,
    isSpecial: initialProduct.isSpecial || false,
    discount: (initialProduct.discount || 0).toString(),
  });
  const [existingImages, setExistingImages] = useState<string[]>(initialProduct.images || (initialProduct.image ? [initialProduct.image] : []));
  const [newImages, setNewImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let checked: boolean | undefined;

    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      checked = e.target.checked;
    }

    if (type === 'checkbox' && e.target instanceof HTMLInputElement) {
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
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
      data.append('price', formData.price);
      data.append('type', formData.type);
      data.append('brand', formData.brand);
      data.append('stock', formData.stock);
      data.append('isSold', formData.isSold.toString());
      data.append('isSpecial', formData.isSpecial.toString());
      data.append('discount', formData.discount);
      data.append('existingImages', JSON.stringify(existingImages));

      newImages.forEach(image => {
        data.append('images', image);
      });

      const response = await fetch(`/api/products?id=${initialProduct._id}`, {
        method: 'PATCH',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update product');
      }

      setSuccess('Product updated successfully!');
      onProductUpdated();
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-lg border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Product</h2>
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
            <label className="block text-sm font-medium text-zinc-400 mb-2">Product Images</label>
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

          <div className="flex items-center gap-4">
            <input
              type="checkbox"
              id="isSold"
              name="isSold"
              checked={formData.isSold}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded"
            />
            <label htmlFor="isSold" className="text-sm font-medium text-zinc-400">Is Sold?</label>

            <input
              type="checkbox"
              id="isSpecial"
              name="isSpecial"
              checked={formData.isSpecial}
              onChange={handleChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-zinc-700 rounded ml-4"
            />
            <label htmlFor="isSpecial" className="text-sm font-medium text-zinc-400">Is Special Offer?</label>
          </div>

          <div>
            <label htmlFor="discount" className="block text-sm font-medium text-zinc-400">Discount (%)</label>
            <input
              type="number"
              id="discount"
              name="discount"
              value={formData.discount}
              onChange={handleChange}
              step="0.01"
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
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
              {loading ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProductForm;
