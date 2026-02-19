'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const PACKAGES = [
  {
    id: 'basic',
    name: "Basic Tune-Up",
    price: 85,
    features: ["Brake adjust", "Gear indexing", "Drive-train lube", "Safety inspection", "Tire inflation"],
    recommended: false
  },
  {
    id: 'performance',
    name: "Performance Pro",
    price: 150,
    features: ["All Basic features", "Drive-train deep clean", "Wheel trueing", "Bottom bracket check", "Hub adjustment"],
    recommended: true
  },
  {
    id: 'overhaul',
    name: "Overhaul Elite",
    price: 280,
    features: ["Full strip & rebuild", "Bearing repacking", "New cables & housing", "Brake bleed included", "Hydraulic service"],
    recommended: false
  }
];

interface BookingResult {
  referenceNumber: string;
  price: number;
  status: string;
  paymentStatus: string;
}

export default function RepairsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [bookingResult, setBookingResult] = useState<BookingResult | null>(null);
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    address: '',
    bikeDescription: '',
    issueDescription: '',
    preferredDate: '',
    notes: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePackageSelect = (packageId: string) => {
    if (status !== 'authenticated') {
      router.push('/login');
      return;
    }
    
    setSelectedPackage(packageId);
    setFormData(prev => ({
      ...prev,
      customerName: session?.user?.name || '',
      customerEmail: session?.user?.email || '',
    }));
    setShowBookingModal(true);
  };

  const handleSubmitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPackage) return;

    const pkg = PACKAGES.find(p => p.id === selectedPackage);
    if (!pkg) return;

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/repairs/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          packageName: pkg.name,
          price: pkg.price,
          serviceType: showMobileForm ? 'Mobile Service' : 'In-Shop Service',
          isMobileService: showMobileForm,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setBookingResult(data.booking);
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
    const form = e.currentTarget;
    const fileInput = form.elements.namedItem('paymentProof') as HTMLInputElement;
    
    if (!fileInput?.files?.length || !bookingResult) {
      setError('Please select a file');
      return;
    }

    const uploadFormData = new FormData();
    uploadFormData.append('referenceNumber', bookingResult.referenceNumber);
    uploadFormData.append('paymentProof', fileInput.files[0]);

    setUploading(true);
    try {
      const response = await fetch('/api/repairs/booking', {
        method: 'PATCH',
        body: uploadFormData,
      });

      const data = await response.json();
      if (response.ok) {
        alert('Payment proof uploaded! Your repair booking is confirmed.');
        closeAllModals();
      } else {
        setError(data.message || 'Failed to upload proof');
      }
    } catch {
      setError('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const closeAllModals = () => {
    setShowBookingModal(false);
    setShowMobileForm(false);
    setSelectedPackage(null);
    setBookingResult(null);
    setError('');
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      address: '',
      bikeDescription: '',
      issueDescription: '',
      preferredDate: '',
      notes: '',
    });
  };

  const renderPaymentModal = () => {
    if (!bookingResult) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Repair Booking Created!</h2>
            <p className="text-gray-600 mt-2">Please complete payment to confirm your service</p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-600">Reference Number</p>
            <p className="text-2xl font-bold text-orange-600 font-mono">{bookingResult.referenceNumber}</p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">Banking Details for EFT Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-700">Account Holder:</span>
                <span className="font-medium">Sams Bike Shop and Mobile</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Bank:</span>
                <span className="font-medium">Capitec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Account Type:</span>
                <span className="font-medium">Capitec Business</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-700">Account Number:</span>
                <span className="font-medium font-mono">1054960860</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="text-gray-700">Amount Due:</span>
                <span className="font-bold text-xl text-green-600">R{bookingResult.price}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-lg p-4 mb-4 border border-yellow-200">
            <p className="text-sm text-yellow-700">
              <strong>Important:</strong> Use <span className="font-mono font-bold">{bookingResult.referenceNumber}</span> as your payment reference
            </p>
          </div>

          <form onSubmit={handlePaymentUpload} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Upload Proof of Payment</label>
              <input
                type="file"
                name="paymentProof"
                accept="image/*,.pdf"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeAllModals}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
              >
                Pay Later
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {uploading ? 'Uploading...' : 'Submit Payment Proof'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderBookingModal = () => {
    if (!selectedPackage || bookingResult) return null;
    
    const pkg = PACKAGES.find(p => p.id === selectedPackage);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Book: {pkg?.name}</h2>
            <button onClick={closeAllModals} className="text-gray-500 hover:text-gray-700 text-2xl">×</button>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg mb-4">
            <p className="text-lg font-bold text-orange-600">R{pkg?.price}</p>
            <p className="text-sm text-gray-600">{showMobileForm ? 'Mobile Service' : 'In-Shop Service'}</p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                placeholder="+27..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            {showMobileForm && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Service Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required={showMobileForm}
                  placeholder="Your address for mobile service"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bike Description</label>
              <input
                type="text"
                name="bikeDescription"
                value={formData.bikeDescription}
                onChange={handleInputChange}
                placeholder="e.g., Silverback Sola 2022, Red"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Describe the Issue</label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="What seems to be the problem?"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              ></textarea>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                placeholder="Any special requests..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              ></textarea>
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeAllModals}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
              >
                {submitting ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-20">
        <h1 className="text-5xl font-bold uppercase tracking-tighter mb-4">Certified Service</h1>
        <p className="text-gray-600 text-xl max-w-2xl mx-auto">From daily commuters to world-tour racers, we keep every machine in peak performance condition.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PACKAGES.map(pkg => (
          <div key={pkg.id} className={`relative p-10 rounded-lg bg-white border border-gray-300 flex flex-col justify-between ${pkg.recommended ? 'ring-2 ring-orange-500' : ''}`}>
            {pkg.recommended && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-bold uppercase px-4 py-1.5 rounded-full">Most Popular</span>
            )}
            <div>
              <h3 className="text-2xl font-bold mb-2">{pkg.name}</h3>
              <div className="flex items-baseline gap-1 mb-8">
                <span className="text-4xl font-bold text-orange-500">R{pkg.price}</span>
                <span className="text-gray-600 text-sm font-bold uppercase tracking-widest">Starting at</span>
              </div>
              <ul className="space-y-4 mb-10">
                {pkg.features.map(feat => (
                  <li key={feat} className="flex items-center gap-3 text-gray-700 text-sm">
                    <svg className="w-5 h-5 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"/></svg>
                    {feat}
                  </li>
                ))}
              </ul>
            </div>
            <button 
              onClick={() => handlePackageSelect(pkg.id)}
              className={`w-full py-4 rounded-lg font-bold uppercase tracking-widest text-sm ${pkg.recommended ? 'bg-orange-500 text-white hover:bg-orange-600' : 'bg-gray-200 hover:bg-gray-300 text-gray-900'}`}
            >
              Book Service
            </button>
          </div>
        ))}
      </div>

      <div className="mt-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <h2 className="text-4xl font-bold mb-8 leading-tight">Can&apos;t Make it to the Shop? <br /><span className="text-orange-500">We&apos;ll Come to You.</span></h2>
          <p className="text-gray-700 leading-relaxed text-lg mb-8">
            Introducing Sams Mobile Repair. Our fully-equipped van brings the workshop to your driveway. Perfect for busy professionals and families.
          </p>
          <div className="flex gap-6">
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">24h</span>
              <span className="text-xs text-gray-600 uppercase font-bold tracking-widest">Turnaround</span>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">50+</span>
              <span className="text-xs text-gray-600 uppercase font-bold tracking-widest">Service Vans</span>
            </div>
            <div className="w-px h-12 bg-gray-300"></div>
            <div className="flex flex-col items-center">
              <span className="text-3xl font-bold">100%</span>
              <span className="text-xs text-gray-600 uppercase font-bold tracking-widest">Guaranteed</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-8 rounded-lg border border-gray-300">
          <h3 className="text-xl font-bold mb-4">Request Mobile Service</h3>
          <p className="text-gray-600 mb-6">Select a service package above and choose mobile service during booking.</p>
          <button 
            onClick={() => {
              setShowMobileForm(true);
              setShowBookingModal(true);
              setSelectedPackage('performance');
              setFormData(prev => ({
                ...prev,
                customerName: session?.user?.name || '',
                customerEmail: session?.user?.email || '',
              }));
            }}
            className="w-full py-4 bg-orange-500 text-white font-bold rounded-lg hover:bg-orange-600 uppercase tracking-widest"
          >
            Book Mobile Repair
          </button>
        </div>
      </div>

      {renderBookingModal()}
      {renderPaymentModal()}
    </div>
  );
}
