'use client';

import React, { useState, useEffect } from 'react';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export function TeamManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTeamMembers = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/team-members');
        if (response.ok) {
          const data = await response.json();
          setTeamMembers(data.teamMembers || []);
        } else {
          setError('Failed to fetch team members');
        }
      } catch (error) {
        setError('Error fetching team members from database');
      } finally {
        setLoading(false);
      }
    };

    fetchTeamMembers();
  }, []);

  const filteredMembers = teamMembers.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.role.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  };

  const handleEdit = (memberId: string) => {
    // Navigate to edit form with team member ID
    window.location.href = `/admin-dashboard/edit-team?id=${memberId}`;
  };

  const handleDelete = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;
    
    // TODO: Implement delete functionality via API
    console.log('Delete team member:', memberId);
    // Would need to implement API endpoint
    // const response = await fetch(`/api/team-members/${memberId}`, {
    //   method: 'DELETE',
    // });
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
        <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium">
          Add Team Member
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search team members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
              <option value="all">All Roles</option>
              <option value="TEAM_ADMIN">Admin</option>
              <option value="MANAGER">Manager</option>
              <option value="SALES">Sales</option>
              <option value="MECHANIC">Mechanic</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMembers.map((member) => (
          <div key={member._id} className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center mb-4">
              {member.image ? (
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-12 h-12 object-cover rounded-full mr-4"
                />
              ) : (
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-xl font-semibold text-orange-600">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">{member.role}</p>
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Email:</span>
                <span className="text-gray-900 text-xs">{member.email}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Role:</span>
                <span className="text-gray-900">{member.role}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Join Date:</span>
                <span className="text-gray-900">{formatDate(member.createdAt)}</span>
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800`}>
                Active
              </span>
            </div>

            <div className="flex gap-2">
              <button className="flex-1 px-3 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium text-sm">
                View Profile
              </button>
              <button 
                onClick={() => handleEdit(member._id)}
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium text-sm"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredMembers.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No team members found matching your criteria.</p>
        </div>
      )}
    </div>
  );
}