'use client';
import React, { useState, useEffect } from 'react';
import { MOCK_USERS, MOCK_NEWS } from '../constants'; // MOCK_PRODUCTS and MOCK_AUCTIONS removed
import { Product, Auction, NewsPost, User, TeamMember } from '../types';
import AddProductForm from './AddProductForm'; // Import AddProductForm
import AddAuctionForm from './AddAuctionForm'; // Import AddAuctionForm
import EditAuctionForm from './EditAuctionForm'; // Import EditAuctionForm
import EditProductForm from './EditProductForm'; // Import EditProductForm
import AddTeamMemberForm from './AddTeamMemberForm'; // Import AddTeamMemberForm
import EditTeamMemberForm from './EditTeamMemberForm'; // Import EditTeamMemberForm

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<'ANALYTICS' | 'INVENTORY' | 'AUCTIONS' | 'USERS' | 'NEWS' | 'TEAM'>('ANALYTICS');

  const renderContent = () => {
    switch (activeTab) {
      case 'ANALYTICS': return <StatsOverview />;
      case 'INVENTORY': return <InventoryManagement />;
      case 'AUCTIONS': return <AuctionManagement />;
      case 'USERS': return <UserManagement />;
      case 'NEWS': return <NewsManagement />;
      case 'TEAM': return <TeamManagement />;
      default: return null;
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-zinc-900 border-r border-zinc-800 flex flex-col">
        <div className="p-6">
          <h2 className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Control Panel</h2>
          <nav className="space-y-1">
            {[
              { id: 'ANALYTICS', label: 'Dashboard', icon: '📊' },
              { id: 'INVENTORY', label: 'Inventory', icon: '🚲' },
              { id: 'AUCTIONS', label: 'Auctions', icon: '⏱️' },
              { id: 'USERS', label: 'Customers', icon: '👥' },
              { id: 'NEWS', label: 'Blog & News', icon: '📰' },
              { id: 'TEAM', label: 'Team Members', icon: '🧑‍💻' }, // New Team tab
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${activeTab === item.id ? 'bg-emerald-600/10 text-emerald-500' : 'text-zinc-400 hover:text-white hover:bg-zinc-800'}`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="mt-auto p-6 border-t border-zinc-800">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center font-bold text-zinc-950">S</div>
             <div className="flex flex-col">
               <span className="text-xs font-bold">Sam Admin</span>
               <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">Verified Owner</span>
             </div>
           </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow overflow-y-auto bg-zinc-950 p-12">
        <div className="max-w-6xl mx-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

const StatsOverview = () => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[
        { label: 'Total Revenue', value: '28,430', trend: '+12.5%', icon: '💰' },
        { label: 'Active Rentals', value: '42', trend: '+8.2%', icon: '📅' },
        { label: 'Live Auctions', value: '3', trend: 'Stable', icon: '⚡' },
        { label: 'New Users', value: '1,204', trend: '+18.1%', icon: '📈' },
      ].map(stat => (
        <div key={stat.label} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800">
          <div className="flex justify-between items-start mb-4">
            <span className="text-2xl">{stat.icon}</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${stat.trend.startsWith('+') ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'}`}>{stat.trend}</span>
          </div>
          <span className="block text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</span>
          <span className="text-3xl font-black">{stat.value}</span>
        </div>
      ))}
    </div>

    <div className="bg-zinc-900 rounded-3xl p-8 border border-zinc-800 h-96 flex items-center justify-center">
       <div className="text-center text-zinc-500">
         <div className="text-4xl mb-4">📉</div>
         <p className="font-bold">Sales Volume Chart will render here using Recharts</p>
         <p className="text-xs mt-2 uppercase tracking-widest">Real-time data synchronization active</p>
       </div>
    </div>
  </div>
);

const InventoryManagement = () => {
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showEditProductModal, setShowEditProductModal] = useState(false); // New state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // New state
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const fetchProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
      // Optionally set an error state here
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []); // Fetch products on component mount

  const handleDeleteProduct = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`/api/products?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete product');
        }

        alert('Product deleted successfully!');
        fetchProducts(); // Refresh the list
      } catch (error: any) {
        console.error('Error deleting product:', error);
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Product Inventory</h2>
        <button
          onClick={() => setShowAddProductModal(true)}
          className="bg-emerald-600 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-emerald-500"
        >
          + Add New Product
        </button>
      </div>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loadingProducts ? (
          <div className="p-6 text-center text-zinc-500">Loading products...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Image</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Name</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Type</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Price</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Stock</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {products.length > 0 ? (
                products.map(product => (
                  <tr key={product.id} className="hover:bg-zinc-800/20 transition-colors">
                    <td className="px-6 py-4">
                      {product.image && (
                        <img src={product.image} alt={product.name} className="w-12 h-12 object-cover rounded-md" />
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-sm">{product.name}</td>
                    <td className="px-6 py-4 text-xs text-zinc-400 font-mono">{product.type}</td>
                    <td className="px-6 py-4 font-bold text-emerald-500">${product.price}</td>
                    <td className="px-6 py-4 text-sm">{product.stock}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${product.stock === 0 ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {product.stock === 0 ? 'OUT OF STOCK' : 'IN STOCK'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingProduct(product);
                          setShowEditProductModal(true);
                        }}
                        className="text-zinc-500 hover:text-white mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-500/60 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-zinc-500">No products found. Add a new product!</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddProductModal && (
        <AddProductForm
          onClose={() => setShowAddProductModal(false)}
          onProductAdded={() => {
            setShowAddProductModal(false);
            fetchProducts(); // Refresh products after adding a new one
          }}
        />
      )}

      {showEditProductModal && editingProduct && (
        <EditProductForm
          onClose={() => {
            setShowEditProductModal(false);
            setEditingProduct(null);
          }}
          onProductUpdated={() => {
            setShowEditProductModal(false);
            setEditingProduct(null);
            fetchProducts(); // Refresh products after updating
          }}
          initialProduct={editingProduct}
        />
      )}
    </div>
  );
};

import AuctionCountdown from './AuctionCountdown'; // Import the new component

// ... other code ...

const AuctionManagement = () => {
  const [showAddAuctionModal, setShowAddAuctionModal] = useState(false);
  const [showEditAuctionModal, setShowEditAuctionModal] = useState(false);
  const [editingAuction, setEditingAuction] = useState<Auction | null>(null);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loadingAuctions, setLoadingAuctions] = useState(true);

  const formatTimestamp = (timestamp: number) => new Date(timestamp).toLocaleString();

  const getAuctionStatus = (startTime: number, endTime: number): 'UPCOMING' | 'LIVE' | 'ENDED' => {
    const now = Date.now();
    if (now < startTime) return 'UPCOMING';
    if (now >= startTime && now <= endTime) return 'LIVE';
    return 'ENDED';
  };

  const fetchAuctions = async () => {
    // Prevent setting loading true on background refreshes, only on initial load
    if (!auctions.length) {
      setLoadingAuctions(true);
    }
    try {
      const response = await fetch('/api/auctions');
      if (!response.ok) throw new Error('Failed to fetch auctions');
      
      const data: any[] = await response.json();
      const auctionsWithCorrectDates = data.map(auc => {
        // CRITICAL FIX: Convert date strings from API into number timestamps for client-side logic
        const startTime = new Date(auc.startTime).getTime();
        const endTime = new Date(auc.endTime).getTime();
        return {
          ...auc,
          id: auc._id.toString(),
          status: getAuctionStatus(startTime, endTime),
          startTime: startTime,
          endTime: endTime,
        }
      });
      setAuctions(auctionsWithCorrectDates);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoadingAuctions(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  const handleAuctionEnd = (auctionId: string) => {
    setAuctions(prevAuctions =>
      prevAuctions.map(auc =>
        auc.id === auctionId ? { ...auc, status: 'ENDED' } : auc
      )
    );
  };
  
  const handleDeleteAuction = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this auction?')) {
      try {
        const response = await fetch(`/api/auctions?id=${id}`, { method: 'DELETE' });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete auction');
        }
        alert('Auction deleted successfully!');
        fetchAuctions();
      } catch (error: any) {
        console.error('Error deleting auction:', error);
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Live Auctions</h2>
        <button
          onClick={() => setShowAddAuctionModal(true)}
          className="bg-emerald-600 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-emerald-500"
        >
          + Create Auction
        </button>
      </div>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loadingAuctions ? (
          <div className="p-6 text-center text-zinc-500">Loading auctions...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {auctions.length > 0 ? (
              auctions.map(auc => (
                <React.Fragment key={auc.id}>
                  <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-6 flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-white flex-1">{auc.name} {auc.status === 'LIVE' && (
                        <span className="ml-2 px-2 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-emerald-500 text-zinc-950 align-middle">LIVE</span>
                      )}</h3>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded text-[10px] font-bold ${auc.status === 'ENDED' ? 'bg-zinc-700 text-zinc-400' : (auc.status === 'LIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500')}`}>
                        {auc.status === 'LIVE' ? 'ACTIVE' : auc.status}
                      </span>
                    </div>
                    {auc.image && <img src={auc.image} alt={auc.name} className="w-full h-48 object-cover rounded-lg mb-4" />}
                    <p className="text-zinc-400 text-sm mb-4 flex-grow">{auc.description}</p>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <span className="block text-[10px] text-zinc-500 uppercase font-bold">Current Bid</span>
                        <span className="text-xl font-black text-emerald-500">${auc.currentBid}</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-[10px] text-zinc-500 uppercase font-bold">Bids</span>
                        <span className="text-xl font-black text-white">{auc.bidHistory ? auc.bidHistory.length : 0}</span>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 mb-4">
                      Starts: {formatTimestamp(auc.startTime)}<br />
                      Ends: {formatTimestamp(auc.endTime)}
                    </div>
                    {auc.status === 'LIVE' && (
                      <div className="mb-4 text-center p-3 rounded-lg bg-zinc-900">
                        <span className="block text-[10px] text-zinc-500 uppercase font-bold mb-1">Time Remaining</span>
                        <AuctionCountdown endTime={auc.endTime} onEnd={() => handleAuctionEnd(auc.id)} />
                      </div>
                    )}
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => {
                          setEditingAuction(auc);
                          setShowEditAuctionModal(true);
                        }}
                        className="flex-grow py-2 bg-zinc-700 hover:bg-zinc-600 text-white rounded text-xs font-bold uppercase tracking-widest"
                      >
                        Edit Listing
                      </button>
                      <button
                        onClick={() => handleDeleteAuction(auc.id)}
                        className="flex-grow py-2 border border-red-500/50 hover:border-red-500 text-red-500/80 rounded text-xs font-bold uppercase tracking-widest"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </React.Fragment>
              ))
            ) : (
              <div className="p-6 text-center text-zinc-500 col-span-full">No auctions found. Create a new auction!</div>
            )}
          </div>
        )}
      </div>

      {showAddAuctionModal && <AddAuctionForm onClose={() => setShowAddAuctionModal(false)} onAuctionAdded={() => { setShowAddAuctionModal(false); fetchAuctions(); }} />}
      {showEditAuctionModal && editingAuction && <EditAuctionForm onClose={() => { setShowEditAuctionModal(false); setEditingAuction(null); }} onAuctionUpdated={() => { setShowEditAuctionModal(false); setEditingAuction(null); fetchAuctions(); }} initialAuction={editingAuction} />}
    </div>
  );
};

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      // Optionally set an error state here
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []); // Fetch users on component mount

  const handleToggleUserAuctionApproval = async (userId: string, status: boolean) => {
    const confirmMessage = status
      ? 'Are you sure you want to approve this user for auctions?'
      : 'Are you sure you want to unapprove this user for auctions? This will disable their bidding ability.';

    if (window.confirm(confirmMessage)) {
      try {
        const response = await fetch(`/api/user/${userId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ isApprovedForAuction: status }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update user approval status');
        }

        alert(`User ${status ? 'approved' : 'unapproved'} for auction successfully!`);
        fetchUsers(); // Refresh the list
      } catch (error: any) {
        console.error('Error updating user approval:', error);
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <div className="mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Customer Directory</h2>
      </div>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loadingUsers ? (
          <div className="p-6 text-center text-zinc-500">Loading users...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Customer</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Role</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Auction Status</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest text-right">Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {users.length > 0 ? (
                users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{user.name}</div>
                      <div className="text-xs text-zinc-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">{user.role}</span>
                    </td>
                    <td className="px-6 py-4">
                      {user.isApprovedForAuction ? (
                        <span className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Approved
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-yellow-500 text-xs font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span> Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {user.role !== 'TEAM_ADMIN' && (
                        user.isApprovedForAuction ? (
                          <button
                            onClick={() => handleToggleUserAuctionApproval(user.id, false)} // Unapprove
                            className="bg-red-600/10 text-red-500 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-red-600 hover:text-zinc-950 transition-all"
                          >
                            Unapprove
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleUserAuctionApproval(user.id, true)} // Approve
                            className="bg-emerald-600/10 text-emerald-500 px-3 py-1 rounded text-[10px] font-bold uppercase hover:bg-emerald-600 hover:text-zinc-950 transition-all"
                          >
                            Approve for Auction
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-zinc-500">No customers found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

const NewsManagement = () => (
  <div>
    <div className="flex justify-between items-center mb-10">
      <h2 className="2xl font-black uppercase tracking-tighter">Blog & News Management</h2>
      <button className="bg-emerald-600 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-emerald-500">
        + Write New Post
      </button>
    </div>
    <div className="space-y-4">
      {MOCK_NEWS.map(post => (
        <div key={post.id} className="bg-zinc-900 p-6 rounded-2xl border border-zinc-800 flex items-center gap-6">
          <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0">
            <img src={post.image} className="w-full h-full object-cover" />
          </div>
          <div className="flex-grow">
            <h3 className="font-bold">{post.title}</h3>
            <span className="text-xs text-zinc-500">{post.date} • By {post.author}</span>
          </div>
          <div className="flex gap-2">
            <button className="p-2 hover:text-emerald-500 transition-colors">Edit</button>
            <button className="p-2 hover:text-red-500 transition-colors">Remove</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const TeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loadingTeamMembers, setLoadingTeamMembers] = useState(true);
  const [showAddTeamMemberModal, setShowAddTeamMemberModal] = useState(false); // New state for add modal
  const [showEditTeamMemberModal, setShowEditTeamMemberModal] = useState(false); // New state for edit modal
  const [editingTeamMember, setEditingTeamMember] = useState<TeamMember | null>(null); // New state for editing team member

  const fetchTeamMembers = async () => {
    setLoadingTeamMembers(true);
    try {
      const response = await fetch('/api/team'); // New API endpoint for team members
      if (!response.ok) {
        throw new Error('Failed to fetch team members');
      }
      const data = await response.json();
      setTeamMembers(data);
    } catch (error) {
      console.error('Error fetching team members:', error);
      // Optionally set an error state here
    } finally {
      setLoadingTeamMembers(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []); // Fetch team members on component mount

  const handleDeleteTeamMember = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this team member?')) {
      try {
        const response = await fetch(`/api/team?id=${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to delete team member');
        }

        alert('Team member deleted successfully!');
        fetchTeamMembers(); // Refresh the list
      } catch (error: any) {
        console.error('Error deleting team member:', error);
        alert(error.message);
      }
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-10">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Team Members Directory</h2>
        <button
          onClick={() => setShowAddTeamMemberModal(true)}
          className="bg-emerald-600 text-zinc-950 px-6 py-2 rounded-lg font-bold text-sm uppercase tracking-widest hover:bg-emerald-500"
        >
          + Create Team Member
        </button>
      </div>
      <div className="bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden">
        {loadingTeamMembers ? (
          <div className="p-6 text-center text-zinc-500">Loading team members...</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50">
              <tr><th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Image</th><th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Name</th><th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Email</th><th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest">Role</th><th className="px-6 py-4 text-xs font-bold uppercase text-zinc-500 tracking-widest text-right">Actions</th></tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {teamMembers.length > 0 ? (
                teamMembers.map(member => (
                  <tr key={member.id}>
                    <td className="px-6 py-4">
                      {member.image && (
                        <img src={member.image} alt={member.name} className="w-10 h-10 object-cover rounded-full" />
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{member.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs text-zinc-500">{member.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-bold uppercase text-zinc-400">{member.role}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditingTeamMember(member);
                          setShowEditTeamMemberModal(true);
                        }}
                        className="text-zinc-500 hover:text-white mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTeamMember(member.id)}
                        className="text-red-500/60 hover:text-red-500"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-zinc-500">No team members found.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {showAddTeamMemberModal && (
        <AddTeamMemberForm
          onClose={() => setShowAddTeamMemberModal(false)}
          onTeamMemberAdded={() => {
            setShowAddTeamMemberModal(false);
            fetchTeamMembers(); // Refresh team members after adding a new one
          }}
        />
      )}

      {showEditTeamMemberModal && editingTeamMember && (
        <EditTeamMemberForm
          onClose={() => {
            setShowEditTeamMemberModal(false);
            setEditingTeamMember(null);
          }}
          onTeamMemberUpdated={() => {
            setShowEditTeamMemberModal(false);
            setEditingTeamMember(null);
            fetchTeamMembers(); // Refresh team members after updating
          }}
          initialTeamMember={editingTeamMember}
        />
      )}
    </div>
  );
};