'use client';
import React, { useState, useEffect, useCallback } from 'react';

import NewRentalBookingModal from './components/NewRentalBookingModal';
import RentalBikeManagement from './components/RentalBikeManagement';

export interface RentalBike {
  _id: string;
  name: string;
  type: string;
  image: string;
  images?: string[];
  pricePerDay: number;
  isAvailable: boolean;
}

export interface Customer {
  _id: string;
  name: string;
  email: string;
}

interface RentalReservation {
  _id: string;
  rentalBikeId: RentalBike | string; // Can be populated object or string
  customerId: Customer | string; // Can be populated object or string
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  notes?: string;
  createdAt: string;
  status: 'Active' | 'Returned' | 'Upcoming' | 'Overdue';
}

export function RentalsManagement() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [rentals, setRentals] = useState<RentalReservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewRentalModal, setShowNewRentalModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'reservations' | 'bikes'>('reservations');

  const fetchRentals = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/rental-reservations');
      if (response.ok) {
        const data = await response.json();
        console.log('Raw rental reservations data:', data); // Log raw data
        const processedRentals = (data.reservations || []).map((rental: any) => {
          const now = new Date();
          const startDate = new Date(rental.startDate);
          const endDate = new Date(rental.endDate);
          
          let status: RentalReservation['status'];
          if (now < startDate) {
            status = 'Upcoming';
          } else if (now > endDate) {
            status = 'Returned';
          } else {
            status = 'Active';
          }
          
          // Check if it's overdue (active but past end date)
          if (status === 'Active' && now > endDate) {
            status = 'Overdue';
          }
          
          return { ...rental, status };
        }) || [];
        console.log('Processed rental reservations:', processedRentals); // Log processed data
        setRentals(processedRentals);
      } else {
        setError('Failed to fetch rental reservations');
      }
    } catch (error) {
      setError('Error fetching rental reservations from database');
    } finally {
      setLoading(false);
    }
  }, []); // Dependencies for useCallback. Add any state/props that fetchRentals depends on.

  useEffect(() => {
    fetchRentals();
  }, [fetchRentals]);

  const filteredRentals = rentals.filter(rental => {
    const matchesStatus = selectedStatus === 'all' || rental.status === selectedStatus;
    const matchesSearch = rental.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         rental.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (typeof rental.rentalBikeId === 'object' && rental.rentalBikeId?.name?.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Returned': return 'bg-blue-100 text-blue-800';
      case 'Upcoming': return 'bg-yellow-100 text-yellow-800';
      case 'Overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const calculateStats = () => {
    const active = rentals.filter(r => r.status === 'Active').length;
    const upcoming = rentals.filter(r => r.status === 'Upcoming').length;
    const overdue = rentals.filter(r => r.status === 'Overdue').length;
    const monthlyRevenue = rentals
      .filter(r => {
        const rentalDate = new Date(r.createdAt);
        const now = new Date();
        return rentalDate.getMonth() === now.getMonth() && rentalDate.getFullYear() === now.getFullYear();
      })
      .reduce((sum, r) => sum + (r.totalPrice || 0), 0);

    return { active, upcoming, overdue, monthlyRevenue };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('reservations')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'reservations' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Rental Reservations
          </button>
          <button
            onClick={() => setActiveTab('bikes')}
            className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'bikes' ? 'border-orange-500 text-orange-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          >
            Rental Bike Inventory
          </button>
        </nav>
      </div>
      
      {activeTab === 'reservations' && (
        <>
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Rental Reservations</h1>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium"
              onClick={() => setShowNewRentalModal(true)}
            >
              New Rental Booking
            </button>
          </div>

          <NewRentalBookingModal
            isOpen={showNewRentalModal}
            onClose={() => setShowNewRentalModal(false)}
            onBookingSuccess={fetchRentals}
          />

          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="Search by customer or bike..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Returned">Returned</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                  Export
                </button>
                <button className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium">
                  Calendar View
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <span className="text-xl">🚲</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-600">Active Rentals</p>
                  <p className="text-xl font-bold text-gray-900">{stats.active}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <span className="text-xl">📅</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-600">Upcoming</p>
                  <p className="text-xl font-bold text-gray-900">{stats.upcoming}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-red-100 rounded-lg">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-600">Overdue</p>
                  <p className="text-xl font-bold text-gray-900">{stats.overdue}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <span className="text-xl">💰</span>
                </div>
                <div className="ml-3">
                  <p className="text-xs text-gray-600">Monthly Revenue</p>
                  <p className="text-xl font-bold text-gray-900">R{stats.monthlyRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bike Model
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rental Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredRentals.map((rental) => (
                  <tr key={rental._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {typeof rental.customerId === 'object' ? rental.customerId.name : rental.customerName || rental.customerId}
                        </div>
                        <div className="text-sm text-gray-600">
                          {typeof rental.customerId === 'object' ? rental.customerId.email : rental.customerEmail || rental.customerId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {rental.rentalBikeId && typeof rental.rentalBikeId === 'object' && rental.rentalBikeId.image ? (
                          <img
                            src={rental.rentalBikeId.image}
                            alt={rental.rentalBikeId.name || 'Rental Bike'}
                            className="w-10 h-10 object-cover rounded-lg mr-2"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg mr-2 flex items-center justify-center">
                            🚲
                          </div>
                        )}
                        <div>
                          <div className="text-sm text-gray-900">
                            {typeof rental.rentalBikeId === 'object' ? rental.rentalBikeId.name : rental.rentalBikeId || 'Unknown Bike'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {typeof rental.rentalBikeId === 'object' ? rental.rentalBikeId.type : 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(rental.startDate)} - {formatDate(rental.endDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(rental.status)}`}>
                        {rental.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R{rental.totalPrice?.toLocaleString() || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-orange-600 hover:text-orange-900 mr-3">View</button>
                      {rental.status === 'Active' && (
                        <button className="text-green-600 hover:text-green-900 mr-3">Return</button>
                      )}
                      <button className="text-red-600 hover:text-red-900">Cancel</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredRentals.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No rental reservations found matching your criteria.
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'bikes' && (
        <RentalBikeManagement />
      )}
    </div>
  );
}