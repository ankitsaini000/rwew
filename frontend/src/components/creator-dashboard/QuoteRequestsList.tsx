import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { MessageSquare, DollarSign, Calendar, User, Loader2, Check, X, FileText, MapPin, Users, Eye } from 'lucide-react';
import { sendMessageToCreator } from '@/services/api';
import toast from 'react-hot-toast';
import { getCreatorByUsername } from '@/services/creatorApi';

// 1. Update QuoteRequest interface to match brand dashboard
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
  audienceTargeting?: {
    demographics?: string;
    interests?: string;
    geography?: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
    deliveryDeadlines?: string;
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
    specialRequirements?: string;
  };
  demographics?: string;
  interests?: string;
  geography?: string;
}

interface QuoteRequestsListProps {
  title?: string;
  showAllLink?: boolean;
  limit?: number;
}

export default function QuoteRequestsList({ 
  title = "Quote Requests", 
  showAllLink = false,
  limit
}: QuoteRequestsListProps) {
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'date' | 'budget'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  // 2. Add modal state
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  // Fetch quote requests
  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/custom-quotes/creator`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch quote requests');
      }

      const data = await response.json();
      if (data.success && data.data) {
        setQuoteRequests(data.data);
      } else {
        setQuoteRequests([]);
      }
    } catch (error) {
      console.error('Error fetching quote requests:', error);
      setError(error instanceof Error ? error.message : 'Failed to fetch quote requests');
      // For now, use mock data
      setQuoteRequests(generateMockQuoteRequests());
    } finally {
      setLoading(false);
    }
  };

  // Generate mock quote requests for development
  const generateMockQuoteRequests = (): QuoteRequest[] => {
    return [
      {
        _id: '1',
        requesterId: { fullName: 'TechStart Inc.', username: 'techstart', avatar: '/images/techstart.png' },
        promotionType: 'Social Media Campaign',
        campaignObjective: 'Launch new mobile app',
        platformPreference: ['Instagram', 'TikTok', 'YouTube'],
        contentFormat: ['Post', 'Story', 'Video'],
        contentGuidelines: 'Must be tech-savvy, engaging, and relevant to the audience.',
        attachments: ['https://example.com/attachment1.pdf', 'https://example.com/attachment2.jpg'],
        timeline: {
          startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryDeadlines: '1 week after campaign start'
        },
        budget: { min: 500, max: 2000, currency: 'USD' },
        status: 'pending',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        isPrivateEvent: false,
        eventDetails: undefined,
        demographics: 'Tech-savvy audience, 18-35 years',
        interests: 'Technology, Mobile Apps, Social Media',
        geography: 'Global'
      },
      {
        _id: '2',
        requesterId: { fullName: 'Fashion Forward', username: 'fashionforward', avatar: '/images/fashionforward.png' },
        promotionType: 'Fashion Collaboration',
        campaignObjective: 'Promote summer clothing line',
        platformPreference: ['Instagram', 'YouTube'],
        contentFormat: ['Post', 'Story', 'Video'],
        contentGuidelines: 'Must be fashion-focused, high-quality, and engaging.',
        attachments: ['https://example.com/attachment3.jpg'],
        timeline: {
          startDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryDeadlines: '2 days after campaign start'
        },
        budget: { min: 800, max: 3000, currency: 'USD' },
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        isPrivateEvent: false,
        eventDetails: undefined,
        demographics: 'Fashion-focused, 20-45 years',
        interests: 'Fashion, Lifestyle, Shopping',
        geography: 'US, UK'
      },
      {
        _id: '3',
        requesterId: { fullName: 'HealthPlus', username: 'healthplus', avatar: '/images/healthplus.png' },
        promotionType: 'Wellness Product Review',
        campaignObjective: 'Review new protein powder and supplements',
        platformPreference: ['YouTube', 'Instagram'],
        contentFormat: ['Review', 'Story'],
        contentGuidelines: 'Must be authentic, informative, and highlight benefits.',
        attachments: [],
        timeline: {
          startDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          deliveryDeadlines: '1 week after review'
        },
        budget: { min: 300, max: 1500, currency: 'USD' },
        status: 'accepted',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        isPrivateEvent: false,
        eventDetails: undefined,
        demographics: 'Health/fitness audience, 30-65 years',
        interests: 'Health, Fitness, Nutrition',
        geography: 'Global'
      }
    ];
  };

  useEffect(() => {
    fetchQuoteRequests();
  }, []);

  const sortedAndFilteredRequests = quoteRequests
    .filter(request => filterStatus === 'all' || request.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return b.budget.max - a.budget.max;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'Technology': 'bg-blue-100 text-blue-800',
      'Fashion': 'bg-pink-100 text-pink-800',
      'Health & Wellness': 'bg-green-100 text-green-800',
      'Food & Beverage': 'bg-orange-100 text-orange-800',
      'Travel': 'bg-purple-100 text-purple-800',
      'Lifestyle': 'bg-indigo-100 text-indigo-800'
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const handleRespond = async (requestId: string, response: 'accept' | 'reject') => {
    try {
      setRespondingTo(requestId);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const responseData = await fetch(`${API_BASE_URL}/custom-quotes/${requestId}/${response}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!responseData.ok) {
        throw new Error(`Failed to ${response} quote request`);
      }

      // Update local state
      setQuoteRequests(prev => 
        prev.map(req => 
          req._id === requestId 
            ? { ...req, status: response === 'accept' ? 'accepted' : 'rejected' }
            : req
        )
      );

      // Close modal and refresh page
      setSelectedRequest(null);
      window.location.reload();

    } catch (error) {
      console.error(`Error ${response}ing quote request:`, error);
      setError(error instanceof Error ? error.message : `Failed to ${response} quote request`);
    } finally {
      setRespondingTo(null);
    }
  };

  const formatBudget = (budget: { min: number; max: number }) => {
    return `$${budget.min.toLocaleString()} - $${budget.max.toLocaleString()}`;
  };

  const isExpired = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  // Helper to fetch brand userId by username
  async function getBrandUserIdByUsername(username: string): Promise<string> {
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const res = await fetch(`${API_BASE_URL}/brand-profiles/${username}`);
    if (!res.ok) throw new Error('Brand profile not found');
    const data = await res.json();
    // userId may be an object or string
    const userId = data?.data?.userId?._id || data?.data?.userId;
    if (!userId) throw new Error('Brand user ID not found in profile');
    return userId;
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="animate-spin h-8 w-8 text-blue-600" />
          <span className="ml-2 text-gray-600">Loading quote requests...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {showAllLink && (
          <a href="/quote-requests" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </a>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'budget')}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="budget">Sort by Budget</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 p-4 rounded-md bg-red-50 text-red-800">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {(limit ? sortedAndFilteredRequests.slice(0, limit) : sortedAndFilteredRequests).map((request) => (
          <div
            key={request._id}
            className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedRequest(request)}
          >
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-3">
                <img
                  src={request.requesterId?.avatar || '/images/default-avatar.png'}
                  alt={request.requesterId?.fullName || 'Brand User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{request.promotionType}</h3>
                  <p className="text-sm text-gray-500">@{request.requesterId?.username || 'unknown_brand'}</p>
                </div>
              </div>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
              <span>{request.campaignObjective || 'Not provided'}</span>
              <span>
                {typeof request.budget?.min === 'number' && typeof request.budget?.max === 'number'
                  ? `${request.budget.min} - ${request.budget.max} ${request.budget.currency || ''}`
                  : 'Budget not provided'}
              </span>
              <span>
                Due: {request.timeline && request.timeline.endDate ? format(new Date(request.timeline.endDate), 'MMM d, yyyy') : 'Not provided'}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              {(request.platformPreference && request.platformPreference.length > 0)
                ? request.platformPreference.map((platform) => (
                    <span key={platform} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{platform}</span>
                  ))
                : <span className="text-xs text-gray-400">Platforms not provided</span>
              }
              {(request.contentFormat && request.contentFormat.length > 0)
                ? request.contentFormat.map((format) => (
                    <span key={format} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{format}</span>
                  ))
                : <span className="text-xs text-gray-400">Formats not provided</span>
              }
            </div>
          </div>
        ))}

        {sortedAndFilteredRequests.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No quote requests found</h3>
            <p className="text-gray-500">
              {filterStatus === 'all' 
                ? "You don't have any quote requests yet. They will appear here when brands send you requests."
                : `No ${filterStatus} quote requests found.`
              }
            </p>
          </div>
        )}
      </div>
      {/* Modal for details */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="p-0 sm:p-0">
              {/* Header: Brand Info & Status */}
              <div className="flex items-center gap-4 p-6 border-b border-gray-100 bg-white rounded-t-2xl">
                <img
                  src={selectedRequest.requesterId?.avatar || '/images/default-avatar.png'}
                  alt={selectedRequest.requesterId?.fullName || 'Brand User'}
                  className="w-16 h-16 rounded-full object-cover border-2 border-white shadow"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h2 className="text-2xl font-bold text-gray-900 truncate">{selectedRequest.requesterId?.fullName || 'Brand info not available'}</h2>
                    {/* Status badge */}
                    <span className={`ml-2 px-3 py-1 rounded-full text-xs font-semibold ${selectedRequest.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : selectedRequest.status === 'accepted' ? 'bg-green-100 text-green-800' : selectedRequest.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}`}>{selectedRequest.status ? selectedRequest.status.charAt(0).toUpperCase() + selectedRequest.status.slice(1) : 'Status'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>
                      {selectedRequest.timeline && selectedRequest.timeline.startDate && selectedRequest.timeline.endDate
                        ? `${format(new Date(selectedRequest.timeline.startDate), 'MMM d, yyyy')} - ${format(new Date(selectedRequest.timeline.endDate), 'MMM d, yyyy')}`
                        : 'Date not provided'}
                    </span>
                    <DollarSign className="w-4 h-4 ml-4 mr-1" />
                    <span>
                      {typeof selectedRequest.budget?.min === 'number' && typeof selectedRequest.budget?.max === 'number'
                        ? `${selectedRequest.budget.min} - ${selectedRequest.budget.max} ${selectedRequest.budget.currency || ''}`
                        : 'Budget not provided'}
                    </span>
                    <MessageSquare className="w-4 h-4 ml-4 mr-1" />
                    <span>{selectedRequest.promotionType || 'Promotion'}</span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="ml-auto text-gray-400 hover:text-gray-600"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Accept/Deny Buttons for Pending Requests */}
              {selectedRequest.status === 'pending' && (
                <div className="flex justify-end gap-3 mx-6 mb-4">
                  <button
                    className={`px-5 py-2 rounded-lg font-semibold shadow transition text-base bg-green-600 text-white hover:bg-green-700 disabled:opacity-50`}
                    disabled={respondingTo === selectedRequest._id}
                    onClick={() => handleRespond(selectedRequest._id, 'accept')}
                  >
                    {respondingTo === selectedRequest._id ? 'Accepting...' : 'Accept'}
                  </button>
                  <button
                    className={`px-5 py-2 rounded-lg font-semibold shadow transition text-base bg-red-600 text-white hover:bg-red-700 disabled:opacity-50`}
                    disabled={respondingTo === selectedRequest._id}
                    onClick={() => handleRespond(selectedRequest._id, 'reject')}
                  >
                    {respondingTo === selectedRequest._id ? 'Denying...' : 'Deny'}
                  </button>
                </div>
              )}

              {/* Contact Brand Button */}
              <div className="px-6 pt-4 pb-2">
                <button
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-base font-semibold"
                  onClick={() => { setShowContactModal(true); setContactMessage(''); setContactSuccess(false); }}
                >
                  Contact Brand
                </button>
              </div>

              {/* Campaign Details Card */}
              <div className="mx-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h4 className="font-semibold text-gray-900 mb-3">Campaign Details</h4>
                <div className="space-y-2">
                  <p className="text-sm"><span className="font-medium">Objective:</span> {selectedRequest.campaignObjective || 'Not provided'}</p>
                  {(selectedRequest.platformPreference && selectedRequest.platformPreference.length > 0) ? (
                    <p className="text-sm"><span className="font-medium">Platforms:</span> {selectedRequest.platformPreference.join(', ')}</p>
                  ) : (
                    <p className="text-sm"><span className="font-medium">Platforms:</span> Not provided</p>
                  )}
                  {(selectedRequest.contentFormat && selectedRequest.contentFormat.length > 0) ? (
                    <p className="text-sm"><span className="font-medium">Content Format:</span> {selectedRequest.contentFormat.join(', ')}</p>
                  ) : (
                    <p className="text-sm"><span className="font-medium">Content Format:</span> Not provided</p>
                  )}
                  <p className="text-sm"><span className="font-medium">Guidelines:</span> {selectedRequest.contentGuidelines || 'Not provided'}</p>
                  <p className="text-sm"><span className="font-medium">Demographics:</span> {selectedRequest.audienceTargeting?.demographics || 'Not provided'}</p>
                  <p className="text-sm"><span className="font-medium">Interests:</span> {selectedRequest.audienceTargeting?.interests || 'Not provided'}</p>
                  <p className="text-sm"><span className="font-medium">Geography:</span> {selectedRequest.audienceTargeting?.geography || 'Not provided'}</p>
                </div>
              </div>

              {/* Attachments Section */}
              {selectedRequest.attachments && selectedRequest.attachments.length > 0 && (
                <div className="mx-6 mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <FileText className="w-5 h-5" /> Attachments
                  </h4>
                  <div className="space-y-2">
                    {selectedRequest.attachments.map((url, idx) => {
                      const filename = url.split('/').pop() || `Attachment ${idx + 1}`;
                      const fileType = url.toLowerCase().includes('.pdf') ? 'PDF' :
                        url.toLowerCase().includes('.doc') ? 'DOC' :
                        url.toLowerCase().includes('.jpg') || url.toLowerCase().includes('.png') ? 'IMG' :
                        'FILE';
                      return (
                        <a
                          key={idx}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            fileType === 'PDF' ? 'bg-red-100 text-red-600' :
                            fileType === 'DOC' ? 'bg-blue-100 text-blue-600' :
                            fileType === 'IMG' ? 'bg-green-100 text-green-600' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {fileType}
                          </div>
                          <span className="text-sm text-gray-700 truncate max-w-[200px] ml-3">{filename}</span>
                          <Eye className="w-5 h-5 text-gray-400 ml-3" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Private Event Details Card */}
              {selectedRequest.isPrivateEvent && selectedRequest.eventDetails && (
                <div className="mx-6 mb-4 p-4 bg-purple-50 rounded-lg border border-purple-100">
                  <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5" /> Private Event Details
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Event Name</p>
                      <p className="text-gray-700">{selectedRequest.eventDetails.eventName || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Event Type</p>
                      <p className="text-gray-700">{selectedRequest.eventDetails.eventType || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Event Date</p>
                      <p className="text-gray-700">{selectedRequest.eventDetails.eventDate ? format(new Date(selectedRequest.eventDetails.eventDate), 'MMM d, yyyy') : 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Location</p>
                      <p className="text-gray-700 flex items-center gap-1"><MapPin className="w-4 h-4" />{selectedRequest.eventDetails.eventLocation || 'Not provided'}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-purple-800">Expected Attendance</p>
                      <p className="text-gray-700 flex items-center gap-1"><Users className="w-4 h-4" />{selectedRequest.eventDetails.expectedAttendance ? `${selectedRequest.eventDetails.expectedAttendance} people` : 'Not provided'}</p>
                    </div>
                  </div>
                  {selectedRequest.eventDetails.eventDescription && (
                    <div className="mt-4">
                      <span className="font-medium text-purple-800 text-sm">Event Description</span>
                      <div className="text-base font-medium text-gray-700 mt-1">{selectedRequest.eventDetails.eventDescription}</div>
                    </div>
                  )}
                  {selectedRequest.eventDetails.specialRequirements && (
                    <div className="mt-4">
                      <span className="font-medium text-purple-800 text-sm">Special Requirements</span>
                      <div className="text-base font-medium text-gray-700 mt-1">{selectedRequest.eventDetails.specialRequirements}</div>
                    </div>
                  )}
                </div>
              )}
            </div>
            {/* Contact Brand Pop-up Modal (unchanged) */}
            {showContactModal && (
              <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                  <button
                    className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowContactModal(false)}
                  >
                    <X className="w-6 h-6" />
                  </button>
                  <h3 className="text-xl font-bold mb-4 text-gray-900">Contact Brand</h3>
                  {contactSuccess ? (
                    <div className="text-green-600 font-medium text-center py-8">Message sent successfully!</div>
                  ) : (
                    <>
                      <textarea
                        className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your message to the brand..."
                        value={contactMessage}
                        onChange={e => setContactMessage(e.target.value)}
                        disabled={contactSuccess || sendingMessage}
                      />
                      <button
                        className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                        disabled={!contactMessage.trim() || sendingMessage}
                        onClick={async () => {
                          if (!contactMessage.trim()) return;
                          setSendingMessage(true);
                          try {
                            // Fetch the brand's user ObjectId by username (brand endpoint)
                            const username = selectedRequest?.requesterId?.username;
                            let receiverId = null;
                            if (username) {
                              receiverId = await getBrandUserIdByUsername(username);
                            } else {
                              throw new Error('Brand username not found.');
                            }
                            await sendMessageToCreator({
                              receiverId,
                              content: contactMessage,
                            });
                            setContactSuccess(true);
                            toast.success('Message sent successfully!');
                            setTimeout(() => {
                              setShowContactModal(false);
                              setContactSuccess(false);
                              setContactMessage('');
                            }, 1200);
                          } catch (err: any) {
                            toast.error(err?.message || 'Failed to send message');
                          } finally {
                            setSendingMessage(false);
                          }
                        }}
                      >
                        {sendingMessage ? 'Sending...' : 'Send'}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 