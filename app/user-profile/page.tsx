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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-1 space-y-8">
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 text-center">
            <div className="w-24 h-24 bg-emerald-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl font-black text-zinc-950">
              {currentUser.name[0]}
            </div>
            <h2 className="text-2xl font-black mb-1">{currentUser.name}</h2>
            <p className="text-zinc-500 text-sm mb-6">{currentUser.email}</p>
            <div className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${currentUser.isApprovedForAuction ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
              {currentUser.isApprovedForAuction ? 'Auction Authorized' : 'Auction Pending Approval'}
            </div>
          </div>
          
          <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800">
            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-500 mb-6">Account Settings</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/user-profile/edit-profile" className="text-zinc-300 hover:text-emerald-500 text-sm font-bold block">
                  Edit Profile
                </Link>
              </li>
              <li>
                <Link href="/user-profile/security-password" className="text-zinc-300 hover:text-emerald-500 text-sm font-bold block">
                  Security & Password
                </Link>
              </li>
              <li>
                <Link href="/user-profile/payment-methods" className="text-zinc-300 hover:text-emerald-500 text-sm font-bold block">
                  Payment Methods
                </Link>
              </li>
              <li>
                <Link href="/user-profile/delete-account" className="text-red-500/80 hover:text-red-500 text-sm font-bold block mt-4">
                  Delete Account
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:col-span-2 space-y-12">
          {/* Tabs for content */}
          <div className="flex border-b border-zinc-800 mb-8">
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'ALL' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setActiveTab('ALL')}
            >
              Active Bids
            </button>
            <button
              className={`py-3 px-6 text-sm font-medium ${activeTab === 'LIKED' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-zinc-200'}`}
              onClick={() => setActiveTab('LIKED')}
            >
              Liked & History ({userWatchlist.length + (currentUser.orderHistory?.length || 0)})
            </button>
            {currentUser.isApprovedForAuction && hasUserPlacedBids && (
              <button
                className={`py-3 px-6 text-sm font-medium ${activeTab === 'MY_BIDS' ? 'text-emerald-500 border-b-2 border-emerald-500' : 'text-zinc-400 hover:text-zinc-200'}`}
                onClick={() => setActiveTab('MY_BIDS')}
              >
                All My Bids ({userBids.length})
              </button>
            )}
          </div>


          {/* Content based on active tab */}
          {activeTab === 'ALL' && (
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">My Active Bids</h3>
              <div className="space-y-4">
                {userBids.length > 0 ? (
                  userBids.filter(auction => auction.status === 'LIVE' || auction.status === 'UPCOMING').map(auction => (
                    <div key={auction.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {auction.image && <img src={auction.image} alt={auction.name} className="w-16 h-16 object-cover rounded-lg" />}
                        <div>
                          <span className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Auction: {auction.name}</span>
                          <span className="font-bold">Current Bid: R{auction.currentBid}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-emerald-500">{auction.status === 'LIVE' ? 'LIVE' : 'UPCOMING'}</span>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Your last bid: R{auction.bidHistory.find(bid => bid.user.id === currentUser.id)?.amount || 'N/A'}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
                    No active bids yet. <Link href="/auctions" className="text-emerald-500 hover:underline">View live auctions &rarr;</Link>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'LIKED' && (
            <>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">My Watchlist</h3>
                <div className="space-y-4">
                  {userWatchlist.length > 0 ? (
                    userWatchlist.map(auction => (
                      <div key={auction.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <div className="flex items-center space-x-4">
                          {auction.image && <img src={auction.image} alt={auction.name} className="w-16 h-16 object-cover rounded-lg" />}
                          <div>
                            <span className="block font-bold">{auction.name}</span>
                            <span className="text-sm text-zinc-500">Current Bid: R{auction.currentBid}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="block font-black text-emerald-500">{auction.status === 'LIVE' ? 'LIVE' : auction.status}</span>
                          <Link href={`/auctions/${auction.id}`} className="text-[10px] text-emerald-500 hover:underline font-bold uppercase tracking-widest">View &rarr;</Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
                      Your watchlist is empty. <Link href="/auctions" className="text-emerald-500 hover:underline">Browse auctions &rarr;</Link>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-12">
                <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">Order History</h3>
                <div className="space-y-4">
                  {currentUser.orderHistory && currentUser.orderHistory.length > 0 ? (
                    currentUser.orderHistory.map((id, i) => (
                      <div key={i} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                        <div>
                          <span className="block text-[10px] text-zinc-500 font-bold uppercase mb-1">Order #883210</span>
                          <span className="font-bold">Premium Road Bike Component Group</span>
                        </div>
                        <div className="text-right">
                          <span className="block font-black text-emerald-500">$850.00</span>
                          <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">Delivered</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
                      No orders found. <Link href="/shop" className="text-emerald-500 hover:underline">Start shopping &rarr;</Link>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'MY_BIDS' && (
            <div>
              <h3 className="text-2xl font-black uppercase tracking-tighter mb-8">All My Bids</h3>
              <div className="space-y-4">
                {userBids.length > 0 ? (
                  userBids.map(auction => (
                    <div key={auction.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        {auction.image && <img src={auction.image} alt={auction.name} className="w-16 h-16 object-cover rounded-lg" />}
                        <div>
                          <span className="block font-bold">{auction.name}</span>
                          <span className="text-sm text-zinc-500">Your last bid: R{auction.bidHistory.find(bid => bid.user.id === currentUser.id)?.amount || 'N/A'}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="block font-black text-emerald-500">{auction.status === 'LIVE' ? 'LIVE' : auction.status}</span>
                        <Link href={`/auctions/${auction.id}`} className="text-[10px] text-emerald-500 hover:underline font-bold uppercase tracking-widest">View &rarr;</Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="py-12 border-2 border-dashed border-zinc-800 rounded-2xl text-center text-zinc-500">
                    You haven't placed any bids yet. <Link href="/auctions" className="text-emerald-500 hover:underline">View live auctions &rarr;</Link>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};