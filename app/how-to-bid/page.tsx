'use client';
import React from 'react';
import Link from 'next/link';

export default function HowToBidPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8 text-center">How to Bid</h1>
      
      <div className="bg-white rounded-lg shadow-lg p-8 border border-gray-300 mb-8">
        <p className="text-lg text-gray-700 mb-6">
          Welcome to Sam&apos;s Bike Shop Auctions! Follow these simple steps to start bidding on premium bicycles and cycling gear.
        </p>

        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              1
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Create an Account</h2>
              <p className="text-gray-600">
                Click the <Link href="/signup" className="text-orange-600 hover:text-orange-700 font-semibold">Sign Up</Link> button in the navigation bar to create your free account. 
                Fill in your name, email address, and create a secure password.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              2
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Pay the Auction Deposit</h2>
              <p className="text-gray-600 mb-4">
                To participate in auctions, you&apos;ll need to pay a refundable deposit of <strong>R500</strong>. 
                This deposit ensures serious bidders and helps maintain a fair auction environment.
              </p>
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <p className="font-semibold text-blue-800 mb-2">Banking Details for Deposit:</p>
                <div className="text-sm space-y-1">
                  <p><span className="font-medium">Account Holder:</span> Sams Bike Shop and Mobile</p>
                  <p><span className="font-medium">Bank:</span> Capitec</p>
                  <p><span className="font-medium">Account Type:</span> Capitec Business</p>
                  <p><span className="font-medium">Account Number:</span> 1054960860</p>
                  <p><span className="font-medium">Reference:</span> Your registered email address</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              3
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Get Approved</h2>
              <p className="text-gray-600">
                After making your deposit, send proof of payment to <strong>samsbikeshop@gmail.com</strong>. 
                Our team will verify your payment and activate your auction bidding privileges within 24-48 hours. 
                You&apos;ll receive an email confirmation once approved.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              4
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Start Bidding!</h2>
              <p className="text-gray-600">
                Once approved, browse our <Link href="/auctions" className="text-orange-600 hover:text-orange-700 font-semibold">Live Auctions</Link> and 
                place your bids on any items that interest you. Enter your maximum bid and our system will 
                automatically bid on your behalf up to your limit.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold text-xl">
              5
            </div>
            <div>
              <h2 className="text-xl font-bold mb-2">Win & Pay</h2>
              <p className="text-gray-600">
                If you win an auction, you&apos;ll be notified via email. Complete payment within 48 hours 
                using the same banking details. Your R500 deposit will be deducted from your final payment 
                or refunded if you don&apos;t win any auctions.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 rounded-lg p-6 border border-yellow-200 mb-8">
        <h3 className="font-bold text-yellow-800 mb-3">Important Rules</h3>
        <ul className="list-disc list-inside text-yellow-700 space-y-2">
          <li>All bids are binding - only bid if you intend to purchase</li>
          <li>Bids cannot be retracted once placed</li>
          <li>The highest bidder at auction close wins the item</li>
          <li>Payment must be completed within 48 hours of winning</li>
          <li>Non-payment may result in account suspension and loss of deposit</li>
          <li>Items are sold as-is unless otherwise stated</li>
        </ul>
      </div>

      <div className="bg-gray-100 rounded-lg p-6 mb-8">
        <h3 className="font-bold text-gray-900 mb-3">Frequently Asked Questions</h3>
        <div className="space-y-4">
          <div>
            <p className="font-semibold text-gray-800">Is my deposit refundable?</p>
            <p className="text-gray-600">Yes! Your R500 deposit is fully refundable if you don&apos;t win any auctions, or it will be applied to your purchase.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">How do I know if I&apos;ve been outbid?</p>
            <p className="text-gray-600">You&apos;ll receive real-time notifications when someone places a higher bid on items you&apos;re watching.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">Can I bid on multiple items?</p>
            <p className="text-gray-600">Yes! Once approved, you can bid on as many auctions as you like.</p>
          </div>
          <div>
            <p className="font-semibold text-gray-800">How do I collect my item?</p>
            <p className="text-gray-600">Items can be collected from our shop at 2057 Parsley Street, R558 Main Road, Silver Leaf, Protea Glen, Soweto. Shipping can be arranged at additional cost.</p>
          </div>
        </div>
      </div>

      <div className="text-center">
        <p className="text-gray-600 mb-4">Ready to start bidding?</p>
        <div className="flex gap-4 justify-center">
          <Link href="/signup" className="px-8 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-lg transition-colors">
            Create Account
          </Link>
          <Link href="/auctions" className="px-8 py-3 bg-gray-200 hover:bg-gray-300 text-gray-900 font-bold rounded-lg transition-colors">
            View Auctions
          </Link>
        </div>
      </div>
    </div>
  );
}
