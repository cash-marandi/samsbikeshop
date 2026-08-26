'use client';
import React, { useState, useEffect, useCallback } from 'react';

interface Order {
  _id: string;
  referenceNumber: string;
  userId?: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    postalCode?: string;
  };
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
  }[];
  total: number;
  status: string;
  paymentMethod: string;
  paymentProofUrl?: string;
  trackingNumber?: string;
  notes?: string;
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

export default function OrdersManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchOrders = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filter !== 'all') params.append('status', filter);
      
      const response = await fetch(`/api/orders?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const filteredOrders = orders.filter(order => 
    order.referenceNumber.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.name.toLowerCase().includes(search.toLowerCase()) ||
    order.customer.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const formData = new FormData(e.currentTarget);
    const status = formData.get('status') as string;
    const trackingNumber = formData.get('trackingNumber') as string;
    const notes = formData.get('notes') as string;

    setUpdating(true);
    try {
      const response = await fetch('/api/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          referenceNumber: selectedOrder.referenceNumber,
          status,
          trackingNumber,
          notes,
        }),
      });

      if (response.ok) {
        alert('Order updated successfully!');
        setSelectedOrder(null);
        fetchOrders();
      } else {
        const data = await response.json();
        alert(data.message || 'Failed to update order');
      }
    } catch (error) {
      alert('Failed to update order');
    } finally {
      setUpdating(false);
    }
  };

  const stats = {
    pending: orders.filter(o => o.status === 'PENDING_PAYMENT').length,
    paid: orders.filter(o => o.status === 'PAID').length,
    processing: orders.filter(o => o.status === 'PROCESSING').length,
    shipped: orders.filter(o => o.status === 'SHIPPED').length,
    delivered: orders.filter(o => o.status === 'DELIVERED').length,
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Orders Management</h1>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
          <p className="text-xs text-yellow-600 font-semibold">Pending Payment</p>
          <p className="text-2xl font-bold text-yellow-800">{stats.pending}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <p className="text-xs text-blue-600 font-semibold">Paid</p>
          <p className="text-2xl font-bold text-blue-800">{stats.paid}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
          <p className="text-xs text-purple-600 font-semibold">Processing</p>
          <p className="text-2xl font-bold text-purple-800">{stats.processing}</p>
        </div>
        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
          <p className="text-xs text-indigo-600 font-semibold">Shipped</p>
          <p className="text-2xl font-bold text-indigo-800">{stats.shipped}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border border-green-200">
          <p className="text-xs text-green-600 font-semibold">Delivered</p>
          <p className="text-2xl font-bold text-green-800">{stats.delivered}</p>
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
            <option value="PAID">Paid</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="DELIVERED">Delivered</option>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="font-mono font-semibold text-gray-900">{order.referenceNumber}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <p className="font-medium text-gray-900">{order.customer.name}</p>
                    <p className="text-sm text-gray-500">{order.customer.email}</p>
                    <p className="text-sm text-gray-500">{order.customer.phone}</p>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="text-sm">
                    {order.items.map((item, idx) => (
                      <div key={idx}>{item.name} x{item.quantity}</div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap font-bold text-orange-600">
                  R{order.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusColors[order.status] || 'bg-gray-100 text-gray-800'}`}>
                    {order.status.replace(/_/g, ' ')}
                  </span>
                  {order.trackingNumber && (
                    <p className="text-xs text-gray-500 mt-1">{order.trackingNumber}</p>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button
                    onClick={() => setSelectedOrder(order)}
                    className="text-orange-600 hover:text-orange-900 font-medium"
                  >
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredOrders.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No orders found.
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Manage Order</h2>
            <p className="text-lg font-mono text-orange-600 mb-4">{selectedOrder.referenceNumber}</p>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Customer Details</h3>
                <p><strong>Name:</strong> {selectedOrder.customer.name}</p>
                <p><strong>Email:</strong> {selectedOrder.customer.email}</p>
                <p><strong>Phone:</strong> {selectedOrder.customer.phone}</p>
                {selectedOrder.customer.address && (
                  <p><strong>Address:</strong> {selectedOrder.customer.address}, {selectedOrder.customer.city} {selectedOrder.customer.postalCode}</p>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">Order Items</h3>
                {selectedOrder.items.map((item, idx) => (
                  <p key={idx}>{item.name} x{item.quantity} - R{(item.price * item.quantity).toFixed(2)}</p>
                ))}
                <p className="font-bold mt-2">Total: R{selectedOrder.total.toFixed(2)}</p>
              </div>
            </div>

            {selectedOrder.paymentProofUrl && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
                <p className="font-semibold text-green-800 mb-2">Payment Proof Uploaded</p>
                <a 
                  href={selectedOrder.paymentProofUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  View Payment Proof
                </a>
              </div>
            )}

            <form onSubmit={handleUpdateOrder}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    defaultValue={selectedOrder.status}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="PENDING_PAYMENT">Pending Payment</option>
                    <option value="PAID">Paid</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tracking Number</label>
                  <input
                    type="text"
                    name="trackingNumber"
                    defaultValue={selectedOrder.trackingNumber || ''}
                    placeholder="Enter tracking number..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    name="notes"
                    defaultValue={selectedOrder.notes || ''}
                    placeholder="Internal notes..."
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  ></textarea>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
                >
                  {updating ? 'Updating...' : 'Update Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
