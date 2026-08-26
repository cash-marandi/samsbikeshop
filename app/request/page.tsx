
'use client';
import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { RequestType } from '@/app/types'; // Import RequestType enum from client-safe types
import { useCart } from '@/app/context/CartContext'; // For showToast

export default function RequestPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showToast } = useCart();

  const [requestType, setRequestType] = useState<RequestType>(RequestType.BIKE);
  const [details, setDetails] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not authenticated
  if (status === 'loading') {
    return <div className="flex justify-center items-center h-screen text-xl">Loading...</div>;
  }
  if (status === 'unauthenticated') {
    router.push('/login'); // Redirect to login if not authenticated
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!session?.user?.id) {
      showToast('You must be logged in to submit a request.');
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch('/api/bike-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requestType,
          details,
          budget: budget === '' ? undefined : Number(budget),
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        showToast(result.message || 'Failed to submit request.');
        return;
      }

      showToast('Request submitted successfully! We will get back to you soon.');
      setRequestType(RequestType.BIKE);
      setDetails('');
      setBudget('');
    } catch (error: any) {
      console.error('Error submitting request:', error);
      showToast(error.message || 'An error occurred while submitting your request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Request a Bike or Part</h1>
      <p className="text-ink-700 mb-8">
        Can't find what you're looking for? Let us know! Fill out the form below with details about the bike or part
        you need, and we'll do our best to source it for you.
      </p>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg p-8 border border-ink-200 space-y-6">
        <div>
          <label htmlFor="requestType" className="block text-sm font-medium text-ink-700 mb-2">
            Request Type
          </label>
          <select
            id="requestType"
            className="w-full px-4 py-2 bg-white border border-ink-200 rounded-lg focus:outline-none focus:border-flame-500"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value as RequestType)}
            required
          >
            {Object.values(RequestType).map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="details" className="block text-sm font-medium text-ink-700 mb-2">
            Details (e.g., brand, model, size, color, condition)
          </label>
          <textarea
            id="details"
            rows={6}
            className="w-full px-4 py-2 bg-white border border-ink-200 rounded-lg focus:outline-none focus:border-flame-500"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Tell us what you're looking for..."
            required
          ></textarea>
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-ink-700 mb-2">
            Your Budget (Optional)
          </label>
          <input
            type="number"
            id="budget"
            className="w-full px-4 py-2 bg-white border border-ink-200 rounded-lg focus:outline-none focus:border-flame-500"
            value={budget}
            onChange={(e) => setBudget(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="e.g., 5000"
            min="0"
          />
        </div>

        <button
          type="submit"
          className="w-full px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-lg disabled:opacity-50"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </form>
    </div>
  );
}
