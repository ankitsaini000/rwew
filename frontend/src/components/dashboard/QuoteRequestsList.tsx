import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';
import { Calendar, DollarSign, MessageSquare, CheckCircle, XCircle, Clock, MapPin, Users, FileText } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import 'react-toastify/dist/ReactToastify.css';

interface QuoteRequest {
  _id: string;
  requesterId: {
    fullName: string;
    username: string;
    avatar?: string;
  };
  promotionType: string;
  campaignObjective: string;
  platformPreference: string[];
  contentFormat: string[];
  contentGuidelines: string;
  attachments: string[];
  timeline: {
    startDate: string;
    endDate: string;
    deliveryDeadlines: string;
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: string;
  isPrivateEvent: boolean;
  eventDetails?: {
    eventName: string;
    eventType: string;
    eventDate: string;
    eventLocation: string;
    expectedAttendance: number;
    eventDescription: string;
    specialRequirements: string;
  };
}

export default function QuoteRequestsList() {
  const { user } = useAuth();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);

  useEffect(() => {
    if (user?._id) {
      fetchQuoteRequests();
    } else {
      setLoading(false);
      setError('User not authenticated or ID not available.');
      console.error('User ID not available for fetching quote requests.');
    }
  }, [user?._id]);

  const fetchQuoteRequests = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      if (!user?._id) {
        throw new Error('User ID is missing for API request');
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/custom-quotes/creator/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setQuoteRequests(response.data.data);
      console.log('Successfully fetched quote requests:', response.data.data);
    } catch (err: any) {
      console.error('Error fetching quote requests:', err);
      setError(err.response?.data?.message || err.message || 'Failed to fetch quote requests');
      toast.error('Failed to fetch quote requests');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (requestId: string, status: 'accepted' | 'rejected', response?: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.patch(
        `${process.env.NEXT_PUBLIC_API_URL}/custom-quotes/${requestId}/status`,
        { status, response },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(`Quote request ${status}`);
      fetchQuoteRequests();
      setSelectedRequest(null);
    } catch (err: any) {
      console.error('Error updating quote request:', err);
      toast.error('Failed to update quote request');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5" />;
      case 'rejected':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Quote Requests</h2>
      
      {quoteRequests.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No quote requests yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {quoteRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => setSelectedRequest(request)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={request.requesterId?.avatar || '/images/default-avatar.png'}
                    alt={request.requesterId?.fullName || 'Brand User'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{request.requesterId?.fullName || 'Unknown Brand'}</h3>
                    <p className="text-sm text-gray-500">@{request.requesterId?.username || 'unknown_brand'}</p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                  {getStatusIcon(request.status)}
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center text-gray-600">
                  <Calendar className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    {formatDate(request.timeline.startDate)} - {formatDate(request.timeline.endDate)}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <DollarSign className="w-5 h-5 mr-2" />
                  <span className="text-sm">
                    {request.budget.min} - {request.budget.max} {request.budget.currency}
                  </span>
                </div>
                <div className="flex items-center text-gray-600">
                  <MessageSquare className="w-5 h-5 mr-2" />
                  <span className="text-sm">{request.promotionType}</span>
                </div>
              </div>

              {/* Attachments Section */}
              {request.attachments && request.attachments.length > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Attachments
                  </h4>
                  <div className="space-y-2">
                    {request.attachments.map((url, index) => {
                      // Extract filename from URL
                      const filename = url.split('/').pop() || `Attachment ${index + 1}`;
                      // Determine file type icon
                      const fileType = url.toLowerCase().includes('.pdf') ? 'PDF' :
                                     url.toLowerCase().includes('.doc') ? 'DOC' :
                                     url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.png') ? 'IMG' :
                                     'FILE';
                      
                      return (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              fileType === 'PDF' ? 'bg-red-100 text-red-600' :
                              fileType === 'DOC' ? 'bg-blue-100 text-blue-600' :
                              fileType === 'IMG' ? 'bg-green-100 text-green-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {fileType}
                            </div>
                            <span className="text-sm text-gray-700 truncate max-w-[200px]">
                              {filename}
                            </span>
                          </div>
                          <svg
                            className="w-5 h-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {request.isPrivateEvent && request.eventDetails && (
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Private Event Details
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Event Name</p>
                      <p className="text-gray-700">{request.eventDetails.eventName}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Event Type</p>
                      <p className="text-gray-700">{request.eventDetails.eventType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Event Date</p>
                      <p className="text-gray-700">{formatDate(request.eventDetails.eventDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Location</p>
                      <p className="text-gray-700 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {request.eventDetails.eventLocation}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Expected Attendance</p>
                      <p className="text-gray-700 flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {request.eventDetails.expectedAttendance} people
                      </p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-medium text-purple-800">Event Description</p>
                    <p className="text-gray-700 mt-1">{request.eventDetails.eventDescription}</p>
                  </div>
                  {request.eventDetails.specialRequirements && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-purple-800">Special Requirements</p>
                      <p className="text-gray-700 mt-1">{request.eventDetails.specialRequirements}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal for viewing request details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={selectedRequest.requesterId?.avatar || '/images/default-avatar.png'}
                    alt={selectedRequest.requesterId?.fullName || 'Brand User'}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedRequest.requesterId?.fullName || 'Unknown Brand'}</h3>
                    <p className="text-gray-500">@{selectedRequest.requesterId?.username || 'unknown_brand'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Campaign Details</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Promotion Type</p>
                      <p className="font-medium">{selectedRequest.promotionType}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Campaign Objective</p>
                      <p className="font-medium">{selectedRequest.campaignObjective}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Platforms & Formats</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Platforms</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRequest.platformPreference.map((platform) => (
                          <span
                            key={platform}
                            className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                          >
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Content Formats</p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {selectedRequest.contentFormat.map((format) => (
                          <span
                            key={format}
                            className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                          >
                            {format}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Timeline</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Start Date</p>
                      <p className="font-medium">{formatDate(selectedRequest.timeline.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">End Date</p>
                      <p className="font-medium">{formatDate(selectedRequest.timeline.endDate)}</p>
                    </div>
                  </div>
                  {selectedRequest.timeline.deliveryDeadlines && (
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">Delivery Deadlines</p>
                      <p className="font-medium">{selectedRequest.timeline.deliveryDeadlines}</p>
                    </div>
                  )}
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Budget</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Range</p>
                      <p className="font-medium">
                        {selectedRequest.budget.min} - {selectedRequest.budget.max} {selectedRequest.budget.currency}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Content Guidelines</h4>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.contentGuidelines}</p>
                </div>

                {selectedRequest.status === 'pending' && (
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'rejected')}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg font-medium"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(selectedRequest._id, 'accepted')}
                      className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 rounded-lg font-medium"
                    >
                      Accept
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 