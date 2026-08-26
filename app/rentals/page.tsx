'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RentalBike } from '../types';

interface BookedRange {
  start: string;
  end: string;
}

interface BookingModalProps {
  bike: RentalBike;
  bookedDates: BookedRange[];
  onClose: () => void;
  onSuccess: () => void;
}

interface BookingResult {
  referenceNumber: string;
  totalPrice: number;
  startDate: string;
  endDate: string;
  paymentStatus: string;
}

function BookingModal({ bike, bookedDates, onClose, onSuccess }: BookingModalProps) {
  const { data: session } = useSession();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [customerName, setCustomerName] = useState(session?.user?.name || '');
  const [customerEmail, setCustomerEmail] = useState(session?.user?.email || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || '');
      setCustomerEmail(session.user.email || '');
    }
  }, [session]);

  const isDateBooked = (date: string) => {
    const checkDate = new Date(date);
    return bookedDates.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return checkDate >= start && checkDate <= end;
    });
  };

  const calculateTotal = () => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, days) * bike.pricePerDay;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!customerName || !customerEmail || !customerPhone) {
      setError('Please fill in all contact details');
      return;
    }

    if (isDateBooked(startDate) || isDateBooked(endDate)) {
      setError('Selected dates are not available');
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/rentals/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bikeId: bike._id,
          startDate,
          endDate,
          customerName,
          customerEmail,
          customerPhone,
          notes,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setBookingResult(data.reservation);
      } else {
        setError(data.message || 'Failed to create booking');
      }
    } catch {
      setError('Failed to create booking');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePaymentUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('referenceNumber', bookingResult?.referenceNumber || '');
    
    setUploading(true);
    try {
      const response = await fetch('/api/user/rentals', {
        method: 'PATCH',
        body: formData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Payment proof uploaded! Your booking is confirmed.');
        onSuccess();
      } else {
        setError(data.message || 'Failed to upload proof');
      }
    } catch {
      setError('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  if (bookingResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-ink-900">Booking Created!</h2>
            <p className="text-ink-600 mt-2">Please complete payment to confirm your rental</p>
          </div>

          <div className="bg-ink-50 rounded-xl p-4 mb-4">
            <p className="text-sm text-ink-600">Reference Number</p>
            <p className="text-2xl font-bold text-flame-600 font-mono">{bookingResult.referenceNumber}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">Banking Details for EFT Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-700">Account Holder:</span>
                <span className="font-medium">Sams Bike Shop and Mobile</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Bank:</span>
                <span className="font-medium">Capitec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Account Type:</span>
                <span className="font-medium">Capitec Business</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-700">Account Number:</span>
                <span className="font-medium font-mono">1054960860</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="text-ink-700">Amount Due:</span>
                <span className="font-bold text-xl text-green-600">R{bookingResult.totalPrice}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-4 mb-4 border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Use <span className="font-mono font-bold">{bookingResult.referenceNumber}</span> as your payment reference
            </p>
          </div>

          <form onSubmit={handlePaymentUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Upload Proof of Payment</label>
              <input
                type="file"
                name="paymentProof"
                accept="image/*,.pdf"
                required
                className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-ink-200 hover:bg-ink-300 text-ink-900 font-bold rounded-xl transition-colors"
              >
                Pay Later
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Submit Payment Proof'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-2">Book: {bike.name}</h2>
        <p className="text-ink-600 mb-4">R{bike.pricePerDay} per day</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={today}
                required
                className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-ink-700 mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                required
                className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
              />
            </div>
          </div>

          {startDate && endDate && (
            <div className="bg-flame-50 p-4 rounded-xl">
              <p className="text-sm text-ink-600">
                Duration: {Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} day(s)
              </p>
              <p className="text-xl font-bold text-flame-600">Total: R{calculateTotal()}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Full Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
              className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Email</label>
            <input
              type="email"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              required
              className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
              placeholder="+27..."
              className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-700 mb-1">Notes (Optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Any special requests..."
              className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500"
            ></textarea>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-ink-200 hover:bg-ink-300 text-ink-900 font-bold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? 'Booking...' : 'Book Now'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function BookingCalendar({ bike, bookedDates, onSelectDates }: { 
  bike: RentalBike; 
  bookedDates: BookedRange[];
  onSelectDates: () => void;
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: { date: Date; isCurrentMonth: boolean }[] = [];
    
    const prevMonth = new Date(year, month, 0);
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonth.getDate() - i),
        isCurrentMonth: false,
      });
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }
    
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }
    
    return days;
  };

  const isDateBooked = (date: Date) => {
    return bookedDates.some(range => {
      const start = new Date(range.start);
      const end = new Date(range.end);
      return date >= start && date <= end;
    });
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'];

  const days = getDaysInMonth(currentMonth);

  return (
    <div className="bg-white rounded-xl p-4 border border-ink-200">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
          className="p-2 hover:bg-ink-100 rounded"
        >
          ←
        </button>
        <h3 className="font-bold">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        <button
          onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
          className="p-2 hover:bg-ink-100 rounded"
        >
          →
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-ink-500">{day}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => {
          const booked = isDateBooked(day.date);
          const past = isPastDate(day.date);
          
          return (
            <div
              key={idx}
              className={`p-2 text-center text-sm rounded ${
                !day.isCurrentMonth 
                  ? 'text-ink-300' 
                  : past 
                    ? 'text-ink-300'
                    : booked 
                      ? 'bg-red-100 text-red-600'
                      : 'bg-green-50 text-ink-900 hover:bg-green-100 cursor-pointer'
              }`}
              onClick={() => {
                if (day.isCurrentMonth && !past && !booked) {
                  onSelectDates();
                }
              }}
            >
              {day.date.getDate()}
            </div>
          );
        })}
      </div>

      <div className="flex gap-4 mt-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-50 border rounded"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border rounded"></div>
          <span>Booked</span>
        </div>
      </div>

      <button
        onClick={onSelectDates}
        className="w-full mt-4 py-2 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors"
      >
        Book This Bike
      </button>
    </div>
  );
}

export default function RentalsPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [rentalBikes, setRentalBikes] = useState<RentalBike[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBike, setSelectedBike] = useState<RentalBike | null>(null);
  const [bookedDates, setBookedDates] = useState<BookedRange[]>([]);
  const [showCalendar, setShowCalendar] = useState(false);

  const fetchRentalBikes = useCallback(async () => {
    try {
      const response = await fetch('/api/rentals');
      if (!response.ok) throw new Error('Failed to fetch rental bikes');
      const data = await response.json();
      setRentalBikes(data.rentalBikes || []);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRentalBikes();
  }, [fetchRentalBikes]);

  const fetchBookedDates = async (bikeId: string) => {
    try {
      const now = new Date();
      const response = await fetch(`/api/rentals/availability?bikeId=${bikeId}&month=${now.getMonth() + 1}&year=${now.getFullYear()}`);
      if (response.ok) {
        const data = await response.json();
        setBookedDates(data.bookedDates || []);
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error);
    }
  };

  const handleSelectBike = async (bike: RentalBike) => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }
    setSelectedBike(bike);
    await fetchBookedDates(bike._id || bike.id);
    setShowCalendar(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen text-ink-900 text-xl">Loading rental bikes...</div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500 text-xl">Error: {error}</div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="mb-16">
        <h1 className="text-4xl font-bold uppercase tracking-tighter">Premium Rentals</h1>
        <p className="text-ink-600 mt-2">Professional-grade bicycles for every journey. Check availability and book online.</p>
      </div>

      {rentalBikes.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {rentalBikes.map(bike => (
            <div key={bike._id || bike.id} className="bg-white rounded-xl overflow-hidden border border-ink-200 flex flex-col md:flex-row">
              <div className="md:w-1/2 h-64 md:h-auto">
                {bike.image ? <img src={bike.image} className="w-full h-full object-cover" alt={bike.name} /> : <div className="w-full h-full bg-ink-100 flex items-center justify-center text-ink-400">No Image</div>}
              </div>
              <div className="p-8 md:w-1/2 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className="text-flame-500 text-xs font-bold uppercase tracking-widest">{bike.type}</span>
                      <h3 className="text-2xl font-bold mt-1">{bike.name}</h3>
                    </div>
                    <div className="text-right">
                      <span className="block text-ink-600 text-[10px] uppercase font-bold">Daily Rate</span>
                      <span className="text-2xl font-bold text-ink-900">R{bike.pricePerDay}</span>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-ink-700 mb-8">
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-flame-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Inspected & Cleaned
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-flame-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Helmet Included
                    </li>
                    <li className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-flame-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                      Emergency Road Kit
                    </li>
                  </ul>
                </div>
                <button 
                  onClick={() => handleSelectBike(bike)}
                  className={`w-full py-4 font-bold rounded-xl uppercase tracking-widest text-sm ${
                    bike.isAvailable 
                      ? 'bg-flame-500 hover:bg-flame-600 text-white' 
                      : 'bg-ink-300 text-ink-500 cursor-not-allowed'
                  }`} 
                  disabled={!bike.isAvailable}
                >
                  {bike.isAvailable ? 'Check Availability & Book' : 'Not Available'}
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-xl border border-ink-200">
          <h2 className="text-2xl font-bold text-ink-600">No rental bikes available at the moment.</h2>
          <p className="text-ink-700 mt-2">Please check back later!</p>
        </div>
      )}

      <div className="mt-24 p-12 rounded-xl bg-ink-100 border border-ink-200 text-center">
        <h2 className="text-3xl font-bold mb-6">Group & Long-term Rentals</h2>
        <p className="text-ink-700 max-w-2xl mx-auto mb-10 leading-relaxed">
          Planning a charity ride or corporate event? We offer specialized packages for groups of 5 or more with delivery options directly to your trail-head.
        </p>
        <button className="px-10 py-4 border border-flame-500 hover:bg-flame-500 hover:text-white text-flame-500 font-bold rounded-xl">
          Get a Custom Quote
        </button>
      </div>

      {selectedBike && showCalendar && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">{selectedBike.name}</h2>
              <button
                onClick={() => {
                  setShowCalendar(false);
                  setSelectedBike(null);
                }}
                className="text-ink-500 hover:text-ink-700 text-2xl"
              >
                ×
              </button>
            </div>
            <BookingCalendar 
              bike={selectedBike} 
              bookedDates={bookedDates}
              onSelectDates={() => {
                setShowCalendar(false);
              }}
            />
            <button
              onClick={() => {
                setShowCalendar(false);
              }}
              className="w-full mt-4 py-2 bg-ink-200 hover:bg-ink-300 text-ink-900 font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {selectedBike && !showCalendar && (
        <BookingModal
          bike={selectedBike}
          bookedDates={bookedDates}
          onClose={() => setSelectedBike(null)}
          onSuccess={() => {
            setSelectedBike(null);
            fetchRentalBikes();
          }}
        />
      )}
    </div>
  );
}
