'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Order {
  _id: string;
  referenceNumber: string;
  customer: {
    name: string;
    email: string;
  };
  items: {
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentProofUrl?: string;
  trackingNumber?: string;
  createdAt: string;
}

const statusColors: Record<string, string> = {
  PENDING_PAYMENT: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const statusSteps = ['PENDING_PAYMENT', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrdersPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [uploading, setUploading] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      fetchOrders();
    }
  }, [status, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/user/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentProofUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const formData = new FormData(e.currentTarget);
    formData.set('orderId', selectedOrder.referenceNumber);

    setUploading(true);
    try {
      const response = await fetch('/api/user/orders', {
        method: 'PATCH',
        body: formData,
      });

      if (response.ok) {
        alert('Payment proof uploaded successfully!');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to upload proof');
      }
    } catch (error) {
      alert('Failed to upload payment proof');
    } finally {
      setUploading(false);
    }
  };

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-flame-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold uppercase tracking-tighter">My Orders</h1>
        <Link href="/user-profile" className="text-flame-600 hover:text-flame-700">
          ← Back to Profile
        </Link>
      </div>

      <div className="mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flame-500"
        >
          <option value="all">All Orders</option>
          <option value="PENDING_PAYMENT">Pending Payment</option>
          <option value="PAID">Paid</option>
          <option value="PROCESSING">Processing</option>
          <option value="SHIPPED">Shipped</option>
          <option value="DELIVERED">Delivered</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-ink-200">
          <p className="text-xl text-ink-700 mb-4">No orders found</p>
          <Link href="/shop" className="px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-lg transition-colors">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map((order) => (
            <div key={order._id} className="bg-white rounded-lg shadow border border-ink-200 overflow-hidden">
              <div className="p-6">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-bold">{order.referenceNumber}</h3>
                    <p className="text-ink-500 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('en-ZA', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status] || 'bg-ink-100 text-gray-800'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                </div>

                {order.status !== 'CANCELLED' && order.status !== 'PENDING_PAYMENT' && (
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      {statusSteps.map((step, index) => {
                        const stepIndex = statusSteps.indexOf(order.status);
                        const isActive = index <= stepIndex;
                        const isCurrent = step === order.status;
                        return (
                          <React.Fragment key={step}>
                            <div className="flex flex-col items-center">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                                isActive ? 'bg-flame-500 text-white' : 'bg-ink-200 text-ink-500'
                              } ${isCurrent ? 'ring-4 ring-flame-200' : ''}`}>
                                {index + 1}
                              </div>
                              <span className={`text-xs mt-1 text-center ${isActive ? 'text-flame-600 font-semibold' : 'text-ink-400'}`}>
                                {step.replace(/_/g, ' ').split(' ')[0]}
                              </span>
                            </div>
                            {index < statusSteps.length - 1 && (
                              <div className={`flex-1 h-1 mx-2 ${index < stepIndex ? 'bg-flame-500' : 'bg-ink-200'}`}></div>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </div>
                  </div>
                )}

                {order.trackingNumber && (
                  <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm"><span className="font-semibold">Tracking Number:</span> {order.trackingNumber}</p>
                  </div>
                )}

                <div className="space-y-2 mb-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>R{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center border-t border-ink-200 pt-4">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-bold text-flame-600">R{order.total.toFixed(2)}</span>
                </div>

                {order.status === 'PENDING_PAYMENT' && !order.paymentProofUrl && (
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="w-full mt-4 px-4 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Upload Payment Proof
                  </button>
                )}

                {order.paymentProofUrl && (
                  <div className="mt-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-700 font-semibold">✓ Payment proof uploaded</p>
                    <a 
                      href={order.paymentProofUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline"
                    >
                      View uploaded proof
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-2xl font-bold mb-4">Upload Payment Proof</h2>
            <p className="text-ink-600 mb-4">
              Order: <span className="font-semibold">{selectedOrder.referenceNumber}</span>
            </p>
            <p className="text-ink-600 mb-4">
              Amount: <span className="font-bold text-flame-600">R{selectedOrder.total.toFixed(2)}</span>
            </p>

            <form onSubmit={handlePaymentProofUpload}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-ink-700 mb-2">
                  Upload Proof of Payment (Image or PDF)
                </label>
                <input
                  type="file"
                  name="paymentProof"
                  accept="image/*,.pdf"
                  required
                  className="w-full px-4 py-2 bg-ink-50 border border-ink-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-flame-500"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 bg-ink-200 hover:bg-ink-300 text-ink-900 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-4 py-2 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
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
