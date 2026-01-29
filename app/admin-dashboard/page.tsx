'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StatsOverview } from './stats/StatsOverview';
import { InventoryManagement } from './inventory/InventoryManagement';
import { AuctionManagement } from './auctions/AuctionManagement';
import { UserManagement } from './users/UserManagement';
import { NewsManagement } from './news/NewsManagement';
import { TeamManagement } from './team/TeamManagement';
import { RentalsManagement } from './rentals/RentalsManagement';
import { MessagesManagement } from './messages/MessagesManagement';

type TabType = 'analytics' | 'inventory' | 'auctions' | 'users' | 'news' | 'team' | 'rentals' | 'messages';

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<TabType>('analytics');
  const router = useRouter();

  const tabs = [
    {
      id: 'analytics' as TabType,
      label: 'Dashboard',
      icon: '📊',
      description: 'Overview of key metrics and analytics'
    },
    {
      id: 'inventory' as TabType,
      label: 'Inventory',
      icon: '🚲',
      description: 'Manage products, parts, and accessories'
    },
    {
      id: 'auctions' as TabType,
      label: 'Auctions',
      icon: '⏱️',
      description: 'Manage live and upcoming auctions'
    },
    {
      id: 'users' as TabType,
      label: 'Customers',
      icon: '👥',
      description: 'Manage user accounts and permissions'
    },
    {
      id: 'news' as TabType,
      label: 'Blog & News',
      icon: '📰',
      description: 'Create and manage blog posts'
    },
    {
      id: 'team' as TabType,
      label: 'Team Members',
      icon: '🧑‍💻',
      description: 'Manage team member accounts'
    },
    {
      id: 'rentals' as TabType,
      label: 'Rentals',
      icon: '📅',
      description: 'Manage rental fleet and reservations'
    },
    {
      id: 'messages' as TabType,
      label: 'Messages',
      icon: '💬',
      description: 'View customer requests and contact messages'
    }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'analytics': return <StatsOverview />;
      case 'inventory': return <InventoryManagement />;
      case 'auctions': return <AuctionManagement />;
      case 'users': return <UserManagement />;
      case 'news': return <NewsManagement />;
      case 'team': return <TeamManagement />;
      case 'rentals': return <RentalsManagement />;
      case 'messages': return <MessagesManagement />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex-shrink-0">
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center px-6 py-4 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="ml-3 text-xl font-bold text-gray-900">Sams Bike Shop</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4">Management</div>
            
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full text-left px-4 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center group ${
                  activeTab === tab.id
                    ? 'bg-orange-500 text-white shadow-md'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <span className="text-xl mr-3 mb-1">{tab.icon}</span>
                <div>
                  <div className="font-medium">{tab.label}</div>
                  <div className="text-xs text-gray-500">{tab.description}</div>
                </div>
              </button>
            ))}
          </nav>

          {/* Bottom Actions */}
          <div className="mt-auto p-4 border-t border-gray-200 space-y-3">
            <button
              onClick={() => router.push('/')}
              className="w-full flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7 7m0 0l-7 7m0 0l7 7M15 13a3 3 0 1 0-3 0 6 0 0 6 6 0 0 3-3 0-3 3 0-6m-6 6v6a3 3 0 1 0 3 3 0 0 3 3 0 0 6 6 6 0 0 6 3 0 0 3 6" />
              </svg>
              <span>View Site</span>
            </button>
            <button
              onClick={() => router.push('/logout')}
              className="w-full flex items-center px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <svg className="w-5 h-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4 4m0 0l-4 4m0 0h16M4 7h16M4 7v1m0 0h16v1M4 7v4" />
              </svg>
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}