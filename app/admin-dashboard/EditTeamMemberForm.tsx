'use client';
import React, { useState, useEffect } from 'react';
import { UserRole, TeamMember } from '@/app/types'; // Assuming TeamMember type

interface EditTeamMemberFormProps {
  onClose: () => void;
  onTeamMemberUpdated: () => void;
  initialTeamMember: TeamMember;
}

const EditTeamMemberForm: React.FC<EditTeamMemberFormProps> = ({ onClose, onTeamMemberUpdated, initialTeamMember }) => {
  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    role: UserRole;
    password: string; // Optional: user might not change password
    image: File | string | null; // Can be File, URL string, or null
  }>({
    name: initialTeamMember.name,
    email: initialTeamMember.email,
    role: initialTeamMember.role,
    password: '', // Password will not be pre-filled for security
    image: initialTeamMember.image || null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialTeamMember.image || null);

  useEffect(() => {
    if (formData.image instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(formData.image);
    } else if (typeof formData.image === 'string') {
      setImagePreview(formData.image);
    } else {
      setImagePreview(null);
    }
  }, [formData.image]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'file' && e.target instanceof HTMLInputElement) {
      const fileInput = e.target as HTMLInputElement; // Explicitly cast to HTMLInputElement
      setFormData(prev => ({ ...prev, [name]: fileInput.files ? fileInput.files[0] : null }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('email', formData.email);
      data.append('role', formData.role);
      
      // Only append password if it's not empty
      if (formData.password.trim() !== '') {
        data.append('password', formData.password);
      }

      if (formData.image instanceof File) {
        data.append('image', formData.image);
      } else if (formData.image === null) {
        data.append('image', ''); // User explicitly cleared image, send empty string
      }
      // If formData.image is a string (existing URL), we don't append it.
      // The backend will keep the existing image if no new file or empty string is sent.


      const response = await fetch(`/api/team?id=${initialTeamMember._id}`, {
        method: 'PATCH',
        body: data,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update team member');
      }

      setSuccess('Team member updated successfully!');
      onTeamMemberUpdated(); // Notify parent to refresh team member list
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-zinc-950 bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-zinc-900 p-8 rounded-lg shadow-xl w-full max-w-lg border border-zinc-800 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-white mb-6">Edit Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-zinc-400">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-zinc-400">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-zinc-400">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {Object.values(UserRole).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-zinc-400">New Password (optional)</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md bg-zinc-800 border-zinc-700 text-white shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Leave blank to keep current password"
            />
          </div>
          <div>
            <label htmlFor="image" className="block text-sm font-medium text-zinc-400">Team Member Image</label>
            {imagePreview && (
              <div className="mb-2">
                <img src={imagePreview} alt="Team Member Preview" className="w-32 h-32 object-cover rounded-md" />
              </div>
            )}
            <input
              type="file"
              id="image"
              name="image"
              onChange={handleChange}
              className="mt-1 block w-full text-white
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-500 file:text-white
                hover:file:bg-blue-600"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-zinc-400 hover:text-white bg-zinc-700 hover:bg-zinc-600 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              {loading ? 'Updating...' : 'Update Team Member'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditTeamMemberForm;
