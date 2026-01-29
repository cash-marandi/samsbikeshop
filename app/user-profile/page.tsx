'use client';
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { User, Auction } from '../types';
import Link from 'next/link'; // Import Link

// Helper to determine auction status based on current time
const getAuctionStatus = (startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
  const now = Date.now();
  if (now < startTime) return 'UPCOMING';
  if (now > endTime) return 'ENDED';
  return 'LIVE';
};

export default function UserProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userBids, setUserBids] = useState<Auction[]>([]);
  const [userWatchlist, setUserWatchlist] = useState<Auction[]>([]);
  const [loadingUserData, setLoadingUserData] = useState(true);
  const [activeTab, setActiveTab] = useState<'ALL' | 'LIKED' | 'MY_BIDS'>('ALL');

  useEffect(() => {
    if (status === 'loading') {
      return; // Do nothing while session is loading
    }
    if (status === 'unauthenticated') {
      router.push('/login'); // Redirect to login if not authenticated
      return;
    }

    if (session?.user?.id) {
      const fetchUserData = async () => {
        try {
          setLoadingUserData(true);
          const res = await fetch(`/api/user/${session.user.id}`);
          if (res.ok) {
            const { user, bids, watchlist } = await res.json();
            
            // Map _id to id and calculate status for bids and watchlist
            const processedBids = bids.map((auc: any) => ({
              ...auc,
              id: auc._id.toString(),
              startTime: new Date(auc.startTime).getTime(),
              endTime: new Date(auc.endTime).getTime(),
              status: getAuctionStatus(new Date(auc.startTime).getTime(), new Date(auc.endTime).getTime()),
              // Ensure bidHistory user is populated correctly
              bidHistory: auc.bidHistory ? auc.bidHistory.map((bid: any) => ({
                ...bid,
                user: { id: bid.user._id.toString(), name: bid.user.name },
                time: new Date(bid.time).getTime(),
              })) : [],
            }));

            const processedWatchlist = watchlist.map((auc: any) => ({
              ...auc,
              id: auc._id.toString(),
              startTime: new Date(auc.startTime).getTime(),
              endTime: new Date(auc.endTime).getTime(),
              status: getAuctionStatus(new Date(auc.startTime).getTime(), new Date(auc.endTime).getTime()),
            }));


            setCurrentUser(user);
            setUserBids(processedBids);
            setUserWatchlist(processedWatchlist);
          } else {
            console.error('Failed to fetch user data');
            setCurrentUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          setCurrentUser(null);
        } finally {
          setLoadingUserData(false);
        }
      };
      fetchUserData();
    }
  }, [session, status, router]);

  if (status === 'loading' || loadingUserData) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center text-zinc-500">
        Loading user profile...
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <h2 className="text-3xl font-black uppercase mb-6">User data not found</h2>
        <button className="w-full py-4 bg-emerald-600 text-zinc-950 font-bold rounded-xl" onClick={() => router.push('/login')}>
          Sign In
        </button>
      </div>
    );
  }
  
  const hasUserPlacedBids = userBids.some(auction => auction.bidHistory.some(bid => bid.user.id === currentUser.id));


  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="text-center">
                <div className="w-20 h-20 bg-orange-500 rounded-full mx-auto mb-4 flex items-center justify-center text-2xl font-bold text-white">
                  {currentUser.name[0]}
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">{currentUser.name}</h2>
                <p className="text-gray-600 text-sm mb-4">{currentUser.email}</p>
                <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
                  currentUser.isApprovedForAuction 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {currentUser.isApprovedForAuction ? 'Auction Authorized' : 'Auction Pending Approval'}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">Account Settings</h3>
              <nav className="space-y-2">
                <Link href="/user-profile/edit-profile" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  Edit Profile
                </Link>
                <Link href="/user-profile/security-password" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  Security & Password
                </Link>
                <Link href="/user-profile/payment-methods" className="block px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                  Payment Methods
                </Link>
                <Link href="/user-profile/delete-account" className="block px-3 py-2 rounded-md text-sm font-medium text-red-600 hover:bg-red-50 hover:text-red-700 mt-4">
                  Delete Account
                </Link>
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-lg shadow mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex -mb-px">
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'ALL' 
                        ? 'border-orange-500 text-orange-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('ALL')}
                  >
                    Active Bids
                  </button>
                  <button
                    className={`py-4 px-6 text-sm font-medium border-b-2 ${
                      activeTab === 'LIKED' 
                        ? 'border-orange-500 text-orange-600' 
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    onClick={() => setActiveTab('LIKED')}
                  >
                    Liked & History ({userWatchlist.length + (currentUser.orderHistory?.length || 0)})
                  </button>
                  {currentUser.isApprovedForAuction && hasUserPlacedBids && (
                    <button
                      className={`py-4 px-6 text-sm font-medium border-b-2 ${
                        activeTab === 'MY_BIDS' 
                          ? 'border-orange-500 text-orange-600' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                      onClick={() => setActiveTab('MY_BIDS')}
                    >
                      All My Bids ({userBids.length})
                    </button>
                  )}
                </nav>
              </div>
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-lg shadow p-6">
              {activeTab === 'ALL' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">My Active Bids</h3>
                  <div className="space-y-4">
                    {userBids.length > 0 ? (
                      userBids.filter(auction => auction.status === 'LIVE' || auction.status === 'UPCOMING').map(auction => (
                        <div key={auction.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            {auction.image && <img src={auction.image} alt={auction.name} className="w-16 h-16 object-cover rounded-lg" />}
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Auction: {auction.name}</p>
                              <p className="font-semibold text-gray-900">Current Bid: R{auction.currentBid}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              auction.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {auction.status === 'LIVE' ? 'LIVE' : 'UPCOMING'}
                            </span>
                            <p className="text-xs text-gray-600 mt-1">
                              Your last bid: R{auction.bidHistory.find(bid => bid.user.id === currentUser.id)?.amount || 'N/A'}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 mb-2">No active bids yet.</p>
                        <Link href="/auctions" className="text-orange-600 hover:text-orange-700 font-medium">View live auctions →</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'LIKED' && (
                <>
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">My Watchlist</h3>
                    <div className="space-y-4">
                      {userWatchlist.length > 0 ? (
                        userWatchlist.map(auction => (
                          <div key={auction.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                            <div className="flex items-center space-x-4">
                              {auction.image && <img src={auction.image} alt={auction.name} className="w-16 h-16 object-cover rounded-lg" />}
                              <div>
                                <p className="font-semibold text-gray-900">{auction.name}</p>
                                <p className="text-sm text-gray-600">Current Bid: R{auction.currentBid}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                                auction.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                              }`}>
                                {auction.status === 'LIVE' ? 'LIVE' : auction.status}
                              </span>
                              <Link href={`/auctions/${auction.id}`} className="block text-xs text-orange-600 hover:text-orange-700 font-medium mt-1">
                                View →
                              </Link>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500 mb-2">Your watchlist is empty.</p>
                          <Link href="/auctions" className="text-orange-600 hover:text-orange-700 font-medium">Browse auctions →</Link>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Order History</h3>
                    <div className="space-y-4">
                      {currentUser.orderHistory && currentUser.orderHistory.length > 0 ? (
                        currentUser.orderHistory.map((id, i) => (
                          <div key={i} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                            <div>
                              <p className="text-sm text-gray-600 mb-1">Order #883210</p>
                              <p className="font-semibold text-gray-900">Premium Road Bike Component Group</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-green-600">$850.00</p>
                              <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 mt-1">
                                Delivered
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                          <p className="text-gray-500 mb-2">No orders found.</p>
                          <Link href="/shop" className="text-orange-600 hover:text-orange-700 font-medium">Start shopping →</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'MY_BIDS' && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">All My Bids</h3>
                  <div className="space-y-4">
                    {userBids.length > 0 ? (
                      userBids.map(auction => (
                        <div key={auction.id} className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:bg-gray-50">
                          <div className="flex items-center space-x-4">
                            {auction.image && <img src={auction.image} alt={auction.name} className="w-16 h-16 object-cover rounded-lg" />}
                            <div>
                              <p className="font-semibold text-gray-900">{auction.name}</p>
                              <p className="text-sm text-gray-600">Your last bid: R{auction.bidHistory.find(bid => bid.user.id === currentUser.id)?.amount || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${
                              auction.status === 'LIVE' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {auction.status === 'LIVE' ? 'LIVE' : auction.status}
                            </span>
                            <Link href={`/auctions/${auction.id}`} className="block text-xs text-orange-600 hover:text-orange-700 font-medium mt-1">
                              View →
                            </Link>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500 mb-2">You haven't placed any bids yet.</p>
                        <Link href="/auctions" className="text-orange-600 hover:text-orange-700 font-medium">View live auctions →</Link>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};