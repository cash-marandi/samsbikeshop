'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface RepairBooking {
  _id: string;
  referenceNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address?: string;
  packageName: string;
  serviceType: string;
  price: number;
  status: string;
  paymentStatus: string;
  paymentProofUrl?: string;
  bikeDescription?: string;
  issueDescription?: string;
  preferredDate?: string;
  isMobileService: boolean;
  notes?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export default function RepairBookingsManagement() {
  const [bookings, setBookings] = useState<RepairBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<RepairBooking | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchBookings = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/admin/repairs?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch repair bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const filteredBookings = bookings.filter(booking =>
    booking.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    booking.customerName.toLowerCase().includes(search.toLowerCase()) ||
    booking.customerEmail.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = async (newStatus: string) => {
    if (!selectedBooking) return;

    setUpdating(true);
    try {
      const response = await fetch('/api/admin/repairs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: selectedBooking.referenceNumber,
          status: newStatus,
        }),
      });

      if (response.ok) {
        alert('Status updated successfully!');
        setSelectedBooking(null);
        fetchBookings();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update status');
      }
    } catch {
      alert('Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    pending: bookings.filter(b => b.status === 'PENDING_PAYMENT').length,
    confirmed: bookings.filter(b => b.status === 'CONFIRMED').length,
    inProgress: bookings.filter(b => b.status === 'IN_PROGRESS').length,
    completed: bookings.filter(b => b.status === 'COMPLETED').length,
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-6 px-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Repair Bookings Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold">Pending Payment</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Confirmed</p>
          <p className="text-2xl font-bold text-blue-800">{stats.confirmed}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">In Progress</p>
          <p className="text-2xl font-bold text-purple-800">{stats.inProgress}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-semibold">Completed</p>
          <p className="text-2xl font-bold text-green-800">{stats.completed}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by reference, name, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            <option value="PENDING_PAYMENT">Pending Payment</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredBookings.map((booking) => (
              <tr key={booking._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono font-semibold text-gray-900">{booking.referenceNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-500">{booking.customerEmail}</p>
                    <p className="text-sm text-gray-500">{booking.customerPhone}</p>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="font-medium text-gray-900">{booking.packageName}</p>
                  <p className="text-sm text-gray-500">{booking.serviceType}</p>
                  {booking.isMobileService && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-orange-100 text-orange-800 rounded">Mobile</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-orange-600">
                  R{booking.price}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                    {booking.status.replace(/_/g, ' ')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(booking.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="text-orange-600 hover:text-orange-900 font-medium"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No repair bookings found.
          </div>
        )}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Repair Booking Details</h2>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            <p className="font-mono text-orange-600 text-lg mb-4">{selectedBooking.referenceNumber}</p>

            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Customer Details</h3>
                <p><strong>Name:</strong> {selectedBooking.customerName}</p>
                <p><strong>Email:</strong> {selectedBooking.customerEmail}</p>
                <p><strong>Phone:</strong> {selectedBooking.customerPhone}</p>
                {selectedBooking.address && <p><strong>Address:</strong> {selectedBooking.address}</p>}
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Service Details</h3>
                <p><strong>Package:</strong> {selectedBooking.packageName}</p>
                <p><strong>Type:</strong> {selectedBooking.serviceType}</p>
                <p><strong>Price:</strong> R{selectedBooking.price}</p>
                {selectedBooking.preferredDate && (
                  <p><strong>Preferred Date:</strong> {new Date(selectedBooking.preferredDate).toLocaleDateString()}</p>
                )}
              </div>
            </div>

            {selectedBooking.bikeDescription && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Bike Description</h3>
                <p className="text-gray-600">{selectedBooking.bikeDescription}</p>
              </div>
            )}

            {selectedBooking.issueDescription && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Issue Description</h3>
                <p className="text-gray-600">{selectedBooking.issueDescription}</p>
              </div>
            )}

            {selectedBooking.notes && (
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-1">Notes</h3>
                <p className="text-gray-600">{selectedBooking.notes}</p>
              </div>
            )}

            {selectedBooking.paymentProofUrl && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800 mb-2">Payment Proof Uploaded</p>
                <a
                  href={selectedBooking.paymentProofUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Payment Proof
                </a>
              </div>
            )}

            <div className="mb-6">
              <h3 className="font-semibold text-gray-700 mb-2">Update Status</h3>
              <div className="flex flex-wrap gap-2">
                {['CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'].map((status) => (
                  <button
                    key={status}
                    onClick={() => handleUpdateStatus(status)}
                    disabled={updating || selectedBooking.status === status}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedBooking.status === status
                        ? 'bg-orange-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                    } disabled:opacity-50`}
                  >
                    {status.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
