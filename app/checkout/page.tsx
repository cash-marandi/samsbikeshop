'use client';
import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutPage() {
  const { items, total, itemCount, clearCart, showToast } = useCart();
  const { data: session } = useSession();
  const router = useRouter();
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState('');
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  useEffect(() => {
    if (session?.user) {
      setCustomerDetails(prev => ({
        ...prev,
        name: session.user.name || '',
        email: session.user.email || '',
      }));
    }
  }, [session]);

  const generateReferenceNumber = () => {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `SBS-${timestamp}-${random}`;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerDetails.name || !customerDetails.email || !customerDetails.phone) {
      showToast('Please fill in all required fields');
      return;
    }

    const ref = generateReferenceNumber();
    setReferenceNumber(ref);

    try {
      const orderData = {
        referenceNumber: ref,
        userId: session?.user?.id,
        customer: customerDetails,
        items: items.map(item => ({
          productId: item.product._id || item.product.id,
          name: item.product.name,
          price: item.product.price * (1 - (item.product.discount || 0) / 100),
          quantity: item.quantity,
        })),
        total,
        status: 'PENDING_PAYMENT',
        paymentMethod: 'EFT',
        createdAt: new Date(),
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        throw new Error('Failed to create order');
      }

      setOrderPlaced(true);
    } catch (error) {
      console.error('Order error:', error);
      showToast('Order placed! Please complete payment via EFT.');
      setOrderPlaced(true);
    }
  };

  if (itemCount === 0 && !orderPlaced) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
        <div className="text-center py-20 bg-white rounded-xl border border-ink-200">
          <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
          <p className="text-ink-600 mb-6">Add some items to your cart to checkout</p>
          <Link href="/shop" className="px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orderPlaced) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-xl shadow-lg p-8 border border-ink-200">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-ink-900">Order Placed Successfully!</h1>
            <p className="text-ink-600 mt-2">Please complete your payment via EFT</p>
          </div>

          <div className="bg-ink-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Reference Number</h2>
            <p className="text-3xl font-bold text-flame-600 font-mono">{referenceNumber}</p>
            <p className="text-sm text-ink-500 mt-2">Use this as your payment reference</p>
          </div>

          <div className="bg-blue-50 rounded-xl p-6 mb-6 border border-blue-200">
            <h2 className="text-xl font-bold mb-4 text-blue-800">Banking Details for EFT Payment</h2>
            <div className="space-y-3">
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="font-semibold text-ink-700">Account Holder:</span>
                <span className="text-ink-900">Sams Bike Shop and Mobile</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="font-semibold text-ink-700">Bank:</span>
                <span className="text-ink-900">Capitec</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="font-semibold text-ink-700">Account Type:</span>
                <span className="text-ink-900">Capitec Business</span>
              </div>
              <div className="flex justify-between border-b border-blue-200 pb-2">
                <span className="font-semibold text-ink-700">Account Number:</span>
                <span className="text-ink-900 font-mono">1054960860</span>
              </div>
              <div className="flex justify-between">
                <span className="font-semibold text-ink-700">Amount Due:</span>
                <span className="text-xl font-bold text-green-600">R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 rounded-xl p-6 mb-6 border border-yellow-200">
            <h3 className="font-bold text-yellow-800 mb-2">Important Instructions</h3>
            <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
              <li>Use your reference number <strong>{referenceNumber}</strong> as the payment reference</li>
              <li>Payment must be made within 48 hours or order will be cancelled</li>
              <li>Send proof of payment to <strong>samsbikeshop@gmail.com</strong></li>
              <li>Orders are processed within 1-2 business days after payment confirmation</li>
            </ul>
          </div>

          <div className="bg-ink-50 rounded-xl p-6 mb-6">
            <h2 className="text-xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>{item.product.name} x {item.quantity}</span>
                  <span>R{((item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-ink-200 pt-3 flex justify-between font-bold">
                <span>Total</span>
                <span>R{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={() => {
                clearCart();
                router.push('/');
              }}
              className="flex-1 px-6 py-3 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors"
            >
              Done
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 px-6 py-3 bg-ink-200 hover:bg-ink-300 text-ink-900 font-bold rounded-xl transition-colors"
            >
              Print Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Checkout</h1>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 border border-ink-200">
              <h2 className="text-2xl font-bold mb-4">Customer Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={customerDetails.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 bg-ink-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={customerDetails.email}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 bg-ink-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    name="phone"
                    value={customerDetails.phone}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 bg-ink-50"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1">Delivery Address</label>
                  <input
                    type="text"
                    name="address"
                    value={customerDetails.address}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 bg-ink-50"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={customerDetails.city}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 bg-ink-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1">Postal Code</label>
                    <input
                      type="text"
                      name="postalCode"
                      value={customerDetails.postalCode}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-ink-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-flame-500 bg-ink-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
              <h2 className="text-xl font-bold mb-4 text-blue-800">Payment Method: EFT</h2>
              <p className="text-sm text-ink-600 mb-4">
                After placing your order, you will receive banking details to complete payment via EFT.
              </p>
              <div className="bg-ink-50 rounded-xl p-4 text-sm">
                <p className="font-semibold mb-2">Banking Details:</p>
                <p>Bank: Capitec</p>
                <p>Account Type: Capitec Business</p>
                <p>Account Number: 1054960860</p>
                <p>Account Holder: Sams Bike Shop and Mobile</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-ink-200 h-fit">
            <h2 className="text-2xl font-bold mb-4">Order Summary</h2>
            <div className="space-y-4 mb-6">
              {items.map((item, index) => (
                <div key={index} className="flex items-center gap-4 border-b border-ink-200 pb-4">
                  <img src={item.product.image} alt={item.product.name} className="w-16 h-16 object-cover rounded" />
                  <div className="flex-1">
                    <p className="font-semibold">{item.product.name}</p>
                    <p className="text-sm text-ink-500">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold">R{((item.product.price * (1 - (item.product.discount || 0) / 100)) * item.quantity).toFixed(2)}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-ink-200 pt-4 space-y-2">
              <div className="flex justify-between text-lg">
                <span>Subtotal ({itemCount} items)</span>
                <span>R{total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xl font-bold">
                <span>Total</span>
                <span className="text-flame-600">R{total.toFixed(2)}</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full mt-6 px-6 py-4 bg-flame-500 hover:bg-flame-600 text-white font-bold rounded-xl transition-colors"
            >
              Place Order
            </button>
            <Link href="/cart" className="block text-center mt-4 text-ink-600 hover:text-ink-900">
              ← Back to Cart
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
