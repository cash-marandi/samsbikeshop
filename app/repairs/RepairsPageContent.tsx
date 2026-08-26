'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimatedSection, StaggerContainer, StaggerItem } from '../components/AnimatedSection';
import { Breadcrumbs } from '../components/Breadcrumbs';

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

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-flame-500 flex-shrink-0">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const WrenchIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/>
  </svg>
);

const TruckIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);

const ClockIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);

const StarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="text-white">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
  </svg>
);

interface BookingResult {
  referenceNumber: string;
  price: number;
  status: string;
  paymentStatus: string;
}

export default function RepairsPageContent() {
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={closeAllModals}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-large border border-ink-200/50"
          onClick={e => e.stopPropagation()}
        >
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-ink-900">Repair Booking Created!</h2>
            <p className="text-ink-500 mt-2">Please complete payment to confirm your service</p>
          </div>

          <div className="bg-ink-50 rounded-xl p-4 mb-4 border border-ink-200/50">
            <p className="text-xs text-ink-500 uppercase tracking-wider font-semibold">Reference Number</p>
            <p className="text-2xl font-display font-bold text-flame-500 font-mono mt-1">{bookingResult.referenceNumber}</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-4 mb-4 border border-blue-200">
            <h3 className="font-bold text-blue-800 mb-3">Banking Details for EFT Payment</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-600">Account Holder:</span>
                <span className="font-medium text-ink-900">Sams Bike Shop and Mobile</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Bank:</span>
                <span className="font-medium text-ink-900">Capitec</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Account Type:</span>
                <span className="font-medium text-ink-900">Capitec Business</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-600">Account Number:</span>
                <span className="font-medium font-mono text-ink-900">1054960860</span>
              </div>
              <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
                <span className="text-ink-600">Amount Due:</span>
                <span className="font-bold text-xl text-green-600">R{bookingResult.price}</span>
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
              <label className="block text-sm font-semibold text-ink-700 mb-1">Upload Proof of Payment</label>
              <input
                type="file"
                name="paymentProof"
                accept="image/*,.pdf"
                required
                className="w-full px-4 py-3 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-flame-50 file:text-flame-700 hover:file:bg-flame-100"
              />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeAllModals}
                className="flex-1 px-4 py-3 bg-ink-100 hover:bg-ink-200 text-ink-900 font-bold rounded-xl transition-colors"
              >
                Pay Later
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex-1 px-4 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-glow"
              >
                {uploading ? 'Uploading...' : 'Submit Payment Proof'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  const renderBookingModal = () => {
    if (!selectedPackage || bookingResult) return null;
    
    const pkg = PACKAGES.find(p => p.id === selectedPackage);

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-ink-950/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={closeAllModals}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-white rounded-2xl p-6 lg:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-large border border-ink-200/50"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-display text-2xl font-bold text-ink-900">Book: {pkg?.name}</h2>
            <button 
              onClick={closeAllModals} 
              className="text-ink-400 hover:text-ink-900 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-ink-100 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          <div className="bg-flame-50 p-4 rounded-xl mb-6 border border-flame-200/50">
            <p className="font-display text-lg font-bold text-flame-600">R{pkg?.price}</p>
            <p className="text-sm text-ink-500">{showMobileForm ? 'Mobile Service' : 'In-Shop Service'}</p>
          </div>

          <form onSubmit={handleSubmitBooking} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1">Email *</label>
                <input
                  type="email"
                  name="customerEmail"
                  value={formData.customerEmail}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleInputChange}
                required
                placeholder="+27..."
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
              />
            </div>

            {showMobileForm && (
              <div>
                <label className="block text-sm font-semibold text-ink-700 mb-1">Service Address *</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required={showMobileForm}
                  placeholder="Your address for mobile service"
                  className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1">Bike Description</label>
              <input
                type="text"
                name="bikeDescription"
                value={formData.bikeDescription}
                onChange={handleInputChange}
                placeholder="e.g., Silverback Sola 2022, Red"
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1">Describe the Issue</label>
              <textarea
                name="issueDescription"
                value={formData.issueDescription}
                onChange={handleInputChange}
                rows={3}
                placeholder="What seems to be the problem?"
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1">Preferred Date</label>
              <input
                type="date"
                name="preferredDate"
                value={formData.preferredDate}
                onChange={handleInputChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink-700 mb-1">Additional Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={2}
                placeholder="Any special requests..."
                className="w-full px-4 py-3 bg-ink-50 border border-ink-200 rounded-xl text-sm focus:outline-none focus:border-flame-500 focus:ring-2 focus:ring-flame-500/20 transition-all resize-none"
              />
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg">{error}</p>}

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={closeAllModals}
                className="flex-1 px-4 py-3 bg-ink-100 hover:bg-ink-200 text-ink-900 font-bold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-4 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors disabled:opacity-50 shadow-glow"
              >
                {submitting ? 'Booking...' : 'Book Now'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-ink-50 pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumbs items={[{ label: 'Repairs' }]} />

        {/* Header */}
        <AnimatedSection>
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-50 border border-flame-200 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-flame-500" />
              <span className="text-xs font-bold uppercase tracking-wider text-flame-600">Services</span>
            </div>
            <h1 className="font-display text-4xl lg:text-5xl font-bold text-ink-900 tracking-tight mb-4">
              Certified Service
            </h1>
            <p className="text-ink-500 text-lg max-w-2xl mx-auto">
              From daily commuters to world-tour racers, we keep every machine in peak performance condition.
            </p>
          </div>
        </AnimatedSection>

        <section className="mb-12">
          <p className="text-ink-600 leading-relaxed max-w-3xl">
            Keep your bicycle performing at its best with Sam&apos;s Bike Shop expert repair and maintenance services in Soweto, Gauteng. Our UCI-certified mechanics handle everything from basic tune-ups and brake adjustments to full suspension overhauls and custom wheel builds. We use only genuine parts from brands like Shimano, SRAM, and Campagnolo. Can&apos;t make it to our workshop? Our mobile repair van comes to your home or office throughout Soweto and Johannesburg. We also offer bike pickup and delivery for your convenience.
          </p>
        </section>

        {/* Pricing Cards */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8" staggerDelay={0.15}>
          {PACKAGES.map(pkg => (
            <StaggerItem key={pkg.id}>
              <motion.div
                whileHover={{ y: -8 }}
                className={`relative p-8 lg:p-10 rounded-2xl bg-white border border-ink-200/50 shadow-soft hover:shadow-large transition-all duration-300 flex flex-col justify-between h-full ${
                  pkg.recommended ? 'ring-2 ring-flame-500 shadow-glow' : ''
                }`}
              >
                {pkg.recommended && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-flame-500 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-glow flex items-center gap-1.5">
                    <StarIcon />
                    Most Popular
                  </span>
                )}
                <div>
                  <h3 className="font-display text-2xl font-bold text-ink-900 mb-2">{pkg.name}</h3>
                  <div className="flex items-baseline gap-2 mb-8">
                    <span className="font-display text-4xl font-bold text-flame-500">R{pkg.price}</span>
                    <span className="text-ink-400 text-sm font-bold uppercase tracking-wider">Starting at</span>
                  </div>
                  <ul className="space-y-3 mb-10">
                    {pkg.features.map(feat => (
                      <li key={feat} className="flex items-center gap-3 text-ink-700 text-sm">
                        <CheckIcon />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <motion.button 
                  onClick={() => handlePackageSelect(pkg.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`w-full py-4 rounded-xl font-bold uppercase tracking-wider text-sm transition-all ${
                    pkg.recommended 
                      ? 'bg-flame-500 hover:bg-flame-600 text-white shadow-glow hover:shadow-glow-lg' 
                      : 'bg-ink-100 hover:bg-ink-200 text-ink-900'
                  }`}
                >
                  Book Service
                </motion.button>
              </motion.div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {/* Mobile Service Section */}
        <AnimatedSection className="mt-24">
          <div className="relative bg-ink-900 rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-20">
              <div className="absolute inset-0" style={{
                backgroundImage: `radial-gradient(circle at 30% 50%, rgba(249,115,22,0.3) 0%, transparent 50%)`
              }} />
            </div>
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 lg:p-16">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-flame-500/20 border border-flame-500/30 rounded-full mb-6">
                  <TruckIcon className="w-3 h-3 text-flame-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-flame-400">Mobile Service</span>
                </div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold text-white mb-6 leading-tight">
                  Can&apos;t Make it to the Shop? <br />
                  <span className="text-flame-400">We&apos;ll Come to You.</span>
                </h2>
                <p className="text-ink-400 leading-relaxed text-lg mb-8">
                  Introducing Sams Mobile Repair. Our fully-equipped van brings the workshop to your driveway. Perfect for busy professionals and families.
                </p>
                <div className="flex flex-wrap gap-8">
                  {[
                    { value: '24h', label: 'Turnaround' },
                    { value: '50+', label: 'Service Vans' },
                    { value: '100%', label: 'Guaranteed' },
                  ].map((stat) => (
                    <div key={stat.label} className="flex flex-col items-center lg:items-start">
                      <span className="font-display text-2xl font-bold text-white">{stat.value}</span>
                      <span className="text-xs text-ink-400 uppercase font-bold tracking-widest mt-1">{stat.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10">
                <h3 className="text-xl font-bold text-white mb-2">Request Mobile Service</h3>
                <p className="text-ink-400 mb-6">Select a service package above and choose mobile service during booking.</p>
                <motion.button
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
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors shadow-glow"
                >
                  Book Mobile Repair
                </motion.button>
              </div>
            </div>
          </div>
        </AnimatedSection>
      </div>

      <AnimatePresence>
        {renderBookingModal()}
        {renderPaymentModal()}
      </AnimatePresence>

      <div className="mt-24 max-w-3xl mx-auto">
        <h2 className="font-display text-3xl font-bold text-ink-900 mb-8 text-center">Frequently Asked Questions</h2>
        <div className="bg-ink-100 rounded-lg p-6 space-y-6">
          <div>
            <h3 className="font-bold text-ink-900 mb-2">Do you offer mobile bike repairs?</h3>
            <p className="text-ink-600">Yes! Our fully-equipped mobile workshop van comes to your home or office throughout Soweto and Johannesburg. We can also pick up your bike, service it, and deliver it back.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-2">How long does a bike service take?</h3>
            <p className="text-ink-600">Basic tune-ups are completed same-day. Full overhauls typically take 2-3 business days. We'll give you a timeline when you book.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-2">Do you service all bike brands?</h3>
            <p className="text-ink-600">Yes, our UCI certified mechanics service all brands including Trek, Specialized, Giant, Cannondale, and more.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink-900 mb-2">What payment methods do you accept?</h3>
            <p className="text-ink-600">We accept EFT, credit/debit cards, and cash. Payment is due upon collection or delivery.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
