'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface RentalBooking {
  _id: string;
  referenceNumber: string;
  rentalBikeId: {
    name: string;
    type: string;
    image: string;
  };
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentProofUrl?: string;
  createdAt: string;
}

interface RepairBooking {
  _id: string;
  referenceNumber: string;
  packageName: string;
  serviceType: string;
  price: number;
  status: string;
  paymentStatus: string;
  paymentProofUrl?: string;
  createdAt: string;
}

export default function MyBookingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rentalBookings, setRentalBookings] = useState<RentalBooking[]>([]);
  const [repairBookings, setRepairBookings] = useState<RepairBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rentals' | 'repairs'>('rentals');
  const [selectedBooking, setSelectedBooking] = useState<RentalBooking | RepairBooking | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchBookings();
    }
  }, [status, router]);

  const fetchBookings = async () => {
    try {
      const [rentalsRes, repairsRes] = await Promise.all([
        fetch('/api/user/rentals'),
        fetch('/api/repairs/booking'),
      ]);

      if (rentalsRes.ok) {
        const data = await rentalsRes.json();
        setRentalBookings(data.reservations || []);
      }
      if (repairsRes.ok) {
        const data = await repairsRes.json();
        setRepairBookings(data.bookings || []);
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentUpload = async (e: React.FormEvent<HTMLFormElement>, type: 'rental' | 'repair') => {
    e.preventDefault();
    if (!selectedBooking) return;

    const formData = new FormData(e.currentTarget);
    formData.set('referenceNumber', selectedBooking.referenceNumber);

    setUploading(true);
    try {
      const endpoint = type === 'rental' ? '/api/user/rentals' : '/api/repairs/booking';
      const response = await fetch(endpoint, {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        alert('Payment proof uploaded successfully!');
        setSelectedBooking(null);
        fetchBookings();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to upload proof');
      }
    } catch {
      alert('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING_PAYMENT':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'PAID':
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-purple-100 text-purple-800';
      case 'COMPLETED':
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tighter">My Bookings</h1>
        <Link href="/user-profile" className="text-orange-600 hover:text-orange-700">
          ← Back to Profile
        </Link>
      </div>

      <div className="mb-6 border-b border-gray-200">
        <nav className="flex -mb-px">
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'rentals'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('rentals')}
          >
            Bike Rentals ({rentalBookings.length})
          </button>
          <button
            className={`py-4 px-6 text-sm font-medium border-b-2 ${
              activeTab === 'repairs'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('repairs')}
          >
            Repair Services ({repairBookings.length})
          </button>
        </nav>
      </div>

      {activeTab === 'rentals' && (
        <div className="space-y-6">
          {rentalBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-300">
              <p className="text-xl text-gray-700 mb-4">No rental bookings yet</p>
              <Link href="/rentals" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
                Browse Rentals
              </Link>
            </div>
          ) : (
            rentalBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow border border-gray-300 p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    {booking.rentalBikeId?.image && (
                      <img src={booking.rentalBikeId.image} alt={booking.rentalBikeId.name} className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <div>
                      <p className="font-mono text-sm text-gray-500">{booking.referenceNumber}</p>
                      <h3 className="text-lg font-bold">{booking.rentalBikeId?.name || 'Bike Rental'}</h3>
                      <p className="text-sm text-gray-600">{booking.rentalBikeId?.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                    <p className="text-xl font-bold text-orange-600 mt-2">R{booking.totalPrice}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 text-sm text-gray-600 mb-4">
                  <div>
                    <span className="font-medium">From:</span>{' '}
                    {new Date(booking.startDate).toLocaleDateString()}
                  </div>
                  <div>
                    <span className="font-medium">To:</span>{' '}
                    {new Date(booking.endDate).toLocaleDateString()}
                  </div>
                </div>

                {booking.paymentProofUrl ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">✓ Payment confirmed</p>
                  </div>
                ) : booking.paymentStatus === 'PENDING_PAYMENT' ? (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full mt-4 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Upload Payment Proof
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === 'repairs' && (
        <div className="space-y-6">
          {repairBookings.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-lg border border-gray-300">
              <p className="text-xl text-gray-700 mb-4">No repair bookings yet</p>
              <Link href="/repairs" className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
                Book a Service
              </Link>
            </div>
          ) : (
            repairBookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow border border-gray-300 p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <p className="font-mono text-sm text-gray-500">{booking.referenceNumber}</p>
                    <h3 className="text-lg font-bold">{booking.packageName}</h3>
                    <p className="text-sm text-gray-600">{booking.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(booking.status)}`}>
                      {booking.status.replace(/_/g, ' ')}
                    </span>
                    <p className="text-xl font-bold text-orange-600 mt-2">R{booking.price}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">Booked:</span>{' '}
                  {new Date(booking.createdAt).toLocaleDateString()}
                </div>

                {booking.paymentProofUrl ? (
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">✓ Payment confirmed</p>
                  </div>
                ) : booking.paymentStatus === 'PENDING_PAYMENT' ? (
                  <button
                    onClick={() => setSelectedBooking(booking)}
                    className="w-full mt-4 px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Upload Payment Proof
                  </button>
                ) : null}
              </div>
            ))
          )}
        </div>
      )}

      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-2">Upload Payment Proof</h2>
            <p className="text-gray-600 mb-4">
              Reference: <span className="font-mono font-semibold">{selectedBooking.referenceNumber}</span>
            </p>

            <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
              <h3 className="font-bold text-blue-800 mb-2">Banking Details</h3>
              <div className="text-sm space-y-1">
                <p><strong>Account:</strong> Sams Bike Shop and Mobile</p>
                <p><strong>Bank:</strong> Capitec Business</p>
                <p><strong>Account No:</strong> 1054960860</p>
                <p><strong>Reference:</strong> {selectedBooking.referenceNumber}</p>
                <p className="text-lg font-bold text-green-600 pt-2">
                  Amount: R{activeTab === 'rentals' 
                    ? (selectedBooking as RentalBooking).totalPrice 
                    : (selectedBooking as RepairBooking).price}
                </p>
              </div>
            </div>

            <form onSubmit={(e) => handlePaymentUpload(e, activeTab === 'rentals' ? 'rental' : 'repair')}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Proof of Payment
                </label>
                <input
                  type="file"
                  name="paymentProof"
                  accept="image/*,.pdf"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Uploading...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
