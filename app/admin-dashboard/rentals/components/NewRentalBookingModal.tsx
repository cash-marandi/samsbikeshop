'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useCart } from '@/app/context/CartContext'; // Assuming CartContext is accessible
import { RentalBike, Customer } from '@/app/admin-dashboard/rentals/RentalsManagement'; // Reuse interface from parent

interface NewRentalBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBookingSuccess: () => void; // Callback to refresh rentals list
}

export default function NewRentalBookingModal({ isOpen, onClose, onBookingSuccess }: NewRentalBookingModalProps) {
  const { showToast } = useCart();

  const [rentalBikes, setRentalBikes] = useState<RentalBike[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedBikeId, setSelectedBikeId] = useState<string>('');
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch rental bikes and customers
  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [bikesRes, usersRes] = await Promise.all([
          fetch('/api/rentals'),
          fetch('/api/users'),
        ]);

        if (!bikesRes.ok) throw new Error('Failed to fetch rental bikes.');
        if (!usersRes.ok) throw new Error('Failed to fetch customers.');

        const bikesData = await bikesRes.json();
        const usersData = await usersRes.json();

        setRentalBikes(bikesData.rentalBikes || []);
        // Filter users to only show relevant customer properties if needed
        setCustomers(usersData.map((user: any) => ({ _id: user._id, name: user.name, email: user.email })) || []);

      } catch (err: any) {
        setError(err.message || 'Failed to load data.');
        showToast(err.message || 'Failed to load data for new booking.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isOpen, showToast]);

  const calculateTotalPrice = useCallback(() => {
    if (!selectedBikeId || !startDate || !endDate) return 0;

    const bike = rentalBikes.find(b => b._id === selectedBikeId);
    if (!bike) return 0;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) return 0; // End date must be after start date

    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
    
    return diffDays * bike.pricePerDay;
  }, [selectedBikeId, startDate, endDate, rentalBikes]);

  const totalPrice = calculateTotalPrice();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    if (!selectedBikeId || !selectedCustomerId || !startDate || !endDate || totalPrice <= 0) {
      showToast('Please fill all required fields and ensure valid dates.');
      setIsSubmitting(false);
      return;
    }

    const selectedCustomer = customers.find(c => c._id === selectedCustomerId);
    const selectedBike = rentalBikes.find(b => b._id === selectedBikeId);

    if (!selectedCustomer || !selectedBike) {
        showToast('Invalid bike or customer selected.');
        setIsSubmitting(false);
        return;
    }

    try {
      const response = await fetch('/api/rental-reservations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rentalBikeId: selectedBikeId,
          customerId: selectedCustomerId,
          customerName: selectedCustomer.name,
          customerEmail: selectedCustomer.email,
          customerPhone: customerPhone, // Include customerPhone
          startDate,
          endDate,
          totalPrice,
          notes,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create booking.');
      }

      showToast('Rental booking created successfully!');
      onBookingSuccess(); // Callback to refresh parent list
      onClose(); // Close modal on success
      
      // Reset form
      setSelectedBikeId('');
      setSelectedCustomerId('');
      setStartDate('');
      setEndDate('');
      setNotes('');

    } catch (err: any) {
      setError(err.message || 'Error creating booking.');
      showToast(err.message || 'Error creating booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
        <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white text-center">
          Loading rental bikes and customers...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
        <div className="relative p-5 border w-96 shadow-lg rounded-md bg-white text-center text-red-600">
          Error: {error}
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-gray-200 rounded-md">Close</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex justify-center items-center">
      <div className="relative p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
        <h3 className="text-xl font-bold text-gray-900 mb-4">New Rental Booking</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="rentalBike" className="block text-sm font-medium text-gray-700">Rental Bike</label>
            <select
              id="rentalBike"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={selectedBikeId}
              onChange={(e) => setSelectedBikeId(e.target.value)}
              required
            >
              <option value="">Select a bike</option>
              {rentalBikes.map(bike => (
                <option key={bike._id} value={bike._id}>
                  {bike.name} ({bike.type}) - R{bike.pricePerDay}/day
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="customer" className="block text-sm font-medium text-gray-700">Customer</label>
            <select
              id="customer"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              required
            >
              <option value="">Select a customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.name} ({customer.email})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                id="endDate"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">Customer Phone</label>
            <input
              type="text"
              id="customerPhone"
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label htmlFor="notes" className="block text-sm font-medium text-gray-700">Notes (Optional)</label>
            <textarea
              id="notes"
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            ></textarea>
          </div>

          <div className="pt-4 border-t border-gray-200">
            <p className="text-lg font-bold text-gray-900">Total Price: R{totalPrice.toLocaleString()}</p>
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
              {isSubmitting ? 'Booking...' : 'Create Booking'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}