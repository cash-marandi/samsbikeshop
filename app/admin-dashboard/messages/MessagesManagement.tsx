'use client';

import React, { useState, useEffect } from 'react';

interface BikeRequest {
  _id: string;
  userId: string;
  userName: string;
  userEmail: string;
  requestType: string;
  details: string;
  budget?: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
}

interface ContactSubmission {
  _id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  appointmentDate?: string;
  createdAt: string;
}

type MessageType = 'all' | 'requests' | 'contact';

export function MessagesManagement() {
  const [selectedType, setSelectedType] = useState<MessageType>('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [bikeRequests, setBikeRequests] = useState<BikeRequest[]>([]);
  const [contactSubmissions, setContactSubmissions] = useState<ContactSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch bike requests
        const requestsResponse = await fetch('/api/bike-requests');
        let requestsData: BikeRequest[] = [];
        if (requestsResponse.ok) {
          requestsData = await requestsResponse.json();
        }

        // Fetch contact submissions
        const contactResponse = await fetch('/api/contact');
        let contactData: any = {};
        if (contactResponse.ok) {
          contactData = await contactResponse.json();
        }

        setBikeRequests(Array.isArray(requestsData) ? requestsData : []);
        setContactSubmissions(Array.isArray(contactData.submissions) ? contactData.submissions : []);
      } catch (error) {
        setError('Error fetching messages from database');
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, []);

  const filteredRequests = bikeRequests.filter(request => {
    const matchesStatus = selectedStatus === 'all' || request.status.toLowerCase() === selectedStatus.toLowerCase();
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         request.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.details.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredContact = contactSubmissions.filter(submission => {
    const matchesSearch = submission.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         submission.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         submission.message.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleRequestStatusChange = async (requestId: string, newStatus: string) => {
    try {
      // For now, just log - would need to implement API endpoint
      console.log(`Update request ${requestId} to status: ${newStatus}`);
      // TODO: Implement API call to update request status
      // const response = await fetch('/api/bike-requests', {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ id: requestId, status: newStatus })
      // });
      
      if (true) { // Mock success for now
        setBikeRequests(prev => 
          prev.map(req => 
            req._id === requestId 
              ? { ...req, status: newStatus as any }
              : req
          )
        );
      }
    } catch (error) {
      setError('Error updating request status');
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this contact submission?')) return;
    
    try {
      console.log(`Delete contact: ${contactId}`);
      // TODO: Implement API call to delete contact submission
      // const response = await fetch(`/api/contact?id=${contactId}`, {
      //   method: 'DELETE'
      // });
      
      if (true) { // Mock success for now
        setContactSubmissions(prev => prev.filter(sub => sub._id !== contactId));
      }
    } catch (error) {
      setError('Error deleting contact submission');
    }
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
        <h1 className="text-3xl font-bold text-gray-900">Messages & Requests</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as MessageType)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Messages</option>
              <option value="requests">Bike Requests</option>
              <option value="contact">Contact Messages</option>
            </select>
          </div>
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          <div>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-semibold text-gray-900 mr-2">{bikeRequests.length}</span>
            Bike Requests
          </div>
          <div className="flex items-center">
            <span className="font-semibold text-gray-900 mr-2">{contactSubmissions.length}</span>
            Contact Submissions
          </div>
        </div>
      </div>

      {/* Bike Requests */}
      {(selectedType === 'all' || selectedType === 'requests') && (
        <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Bike Requests</h2>
          </div>
          {filteredRequests.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No bike requests found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredRequests.map((request) => (
                <div key={request._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{request.userName}</h3>
                        <span className="ml-3 text-sm text-gray-600">{request.userEmail}</span>
                      </div>
                      <div className="mb-2">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className="ml-2 text-sm text-gray-600">Type: {request.requestType}</span>
                      </div>
                      <p className="text-gray-700 mb-2">{request.details}</p>
                      {request.budget && (
                        <p className="text-sm text-gray-600">Budget: R{request.budget.toLocaleString()}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-2">{formatDate(request.createdAt)}</p>
                      <div className="flex gap-2">
                        <select
                          value={request.status}
                          onChange={(e) => handleRequestStatusChange(request._id, e.target.value)}
                          className="text-xs px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                        >
                          <option value="PENDING">Pending</option>
                          <option value="APPROVED">Approved</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Contact Submissions */}
      {(selectedType === 'all' || selectedType === 'contact') && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Contact Messages & Appointments</h2>
          </div>
          {filteredContact.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No contact submissions found matching your criteria.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredContact.map((submission) => (
                <div key={submission._id} className="p-6 hover:bg-gray-50">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{submission.name}</h3>
                        <span className="ml-3 text-sm text-gray-600">{submission.email}</span>
                      </div>
                      <p className="font-medium text-gray-900 mb-2">{submission.subject}</p>
                      <p className="text-gray-700 mb-2">{submission.message}</p>
                      {submission.appointmentDate && (
                        <p className="text-sm text-blue-600">
                          📅 Appointment: {formatDate(submission.appointmentDate)}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 mb-2">{formatDate(submission.createdAt)}</p>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded">
                          Reply
                        </button>
                        <button 
                          onClick={() => handleDeleteContact(submission._id)}
                          className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-medium rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}