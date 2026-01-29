'use client';
import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { RentalBike } from '@/app/admin-dashboard/rentals/RentalsManagement';
import { useCart } from '@/app/context/CartContext'; // For showToast
import AddRentalBikeModal from './AddRentalBikeModal';
import EditRentalBikeModal from './EditRentalBikeModal'; // Import the new modal

interface RentalBikeManagementProps {
  // onRentalBikesUpdated: () => void; // Callback to refresh parent list if needed
}

export default function RentalBikeManagement({ /* onRentalBikesUpdated */ }: RentalBikeManagementProps) {
  const { showToast } = useCart();
  const [rentalBikes, setRentalBikes] = useState<RentalBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddBikeModal, setShowAddBikeModal] = useState(false);
  const [showEditBikeModal, setShowEditBikeModal] = useState(false); // New state for edit modal
  const [bikeToEdit, setBikeToEdit] = useState<RentalBike | null>(null); // State to hold bike being edited

  const fetchRentalBikes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/rentals');
      if (!response.ok) {
        throw new Error('Failed to fetch rental bikes');
      }
      const data = await response.json();
      setRentalBikes(data.rentalBikes || []);
    } catch (err: any) {
      setError(err.message || 'Error fetching rental bikes.');
      showToast(err.message || 'Error fetching rental bikes.');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    fetchRentalBikes();
  }, [fetchRentalBikes]);

  const handleEdit = (bikeId: string) => {
    const bike = rentalBikes.find(b => b._id === bikeId);
    if (bike) {
      setBikeToEdit(bike);
      setShowEditBikeModal(true);
    }
  };

  const handleDelete = async (bikeId: string) => {
    if (!confirm('Are you sure you want to delete this rental bike?')) {
      return;
    }
    try {
      const response = await fetch(`/api/rentals/${bikeId}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete rental bike.');
      }
      showToast('Rental bike deleted successfully!');
      fetchRentalBikes(); // Refresh the list
    } catch (err: any) {
      showToast(err.message || 'Error deleting rental bike.');
      setError(err.message || 'Error deleting rental bike.'); // Also set local error state
    }
  };

  const handleAddNewBike = () => {
    setShowAddBikeModal(true); // Open the modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Rental Bike Inventory</h2>
        <button
          onClick={handleAddNewBike}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium"
        >
          Add New Bike
        </button>
      </div>

      {rentalBikes.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No rental bikes found. Add a new bike to get started!
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price/Day</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rentalBikes.map((bike) => (
                <tr key={bike._id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {bike.image ? (
                      <Image 
                        src={bike.image} 
                        alt={bike.name} 
                        width={40} 
                        height={40} 
                        className="rounded-full object-cover" 
                      />
                    ) : (
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-xl">🚲</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bike.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bike.type}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">R{bike.pricePerDay}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bike.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {bike.isAvailable ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button onClick={() => handleEdit(bike._id)} className="text-indigo-600 hover:text-indigo-900 mr-3">Edit</button>
                    <button onClick={() => handleDelete(bike._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AddRentalBikeModal
        isOpen={showAddBikeModal}
        onClose={() => setShowAddBikeModal(false)}
        onBikeAdded={fetchRentalBikes}
      />

      <EditRentalBikeModal
        isOpen={showEditBikeModal}
        onClose={() => setShowEditBikeModal(false)}
        onBikeUpdated={fetchRentalBikes}
        bike={bikeToEdit}
      />
    </div>
  );
}
