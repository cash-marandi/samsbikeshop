'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface TeamMember {
  _id: string;
  name: string;
  email: string;
  role: string;
  image: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditTeamMemberPage() {
  const router = useRouter();
  const [member, setMember] = useState<TeamMember | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const fetchMember = async () => {
      try {
        const { searchParams } = new URL(window.location.href);
        const memberId = searchParams.get('id');
        
        if (!memberId) {
          setError('Team Member ID is required');
          setLoading(false);
          return;
        }

        const response = await fetch('/api/team-members');
        if (response.ok) {
          const data = await response.json();
          const foundMember = data.teamMembers?.find((m: TeamMember) => m._id === memberId);
          
          if (foundMember) {
            setMember(foundMember);
          } else {
            setError('Team member not found');
          }
        } else {
          setError('Failed to fetch team member');
        }
      } catch (error) {
        setError('Error fetching team member from database');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!member) return;

    setSaving(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/team-members/${member._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: member.name,
          email: member.email,
          role: member.role,
          image: member.image,
        }),
      });

      if (response.ok) {
        setSuccess('Team member updated successfully!');
        setTimeout(() => {
          router.push('/admin-dashboard');
        }, 2000);
      } else {
        setError('Failed to update team member');
      }
    } catch (error) {
      setError('Error updating team member');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && member) {
      // For now, just set a placeholder
      // In a real implementation, you'd upload this to Cloudinary
      setMember({ ...member, image: URL.createObjectURL(file) });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error && !member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => router.push('/admin-dashboard')}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Loading team member...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-8">
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">Edit Team Member</h1>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-green-600">{success}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={member.name}
                  onChange={(e) => setMember({ ...member, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={member.email}
                  onChange={(e) => setMember({ ...member, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-2">
                  Role
                </label>
                <select
                  id="role"
                  value={member.role}
                  onChange={(e) => setMember({ ...member, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-gray-900"
                  required
                >
                  <option value="TEAM_ADMIN">Admin</option>
                  <option value="MANAGER">Manager</option>
                  <option value="SALES">Sales</option>
                  <option value="MECHANIC">Mechanic</option>
                  <option value="MARKETING">Marketing</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Picture
                </label>
                <div className="space-y-2">
                  {member.image && (
                    <div className="mb-4">
                      <img 
                        src={member.image} 
                        alt={member.name} 
                        className="h-32 w-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  <input
                    type="file"
                    id="image"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Team Member Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Member Since:</span>
                  <p>{new Date(member.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <p>Active</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.push('/admin-dashboard')}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg disabled:opacity-50"
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}