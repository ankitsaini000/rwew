import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import API from '@/services/api';
import { toast } from 'react-toastify';
import { Calendar, DollarSign, MessageSquare, CheckCircle, XCircle, Clock, MapPin, Users, FileText, Eye, X } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { Dialog } from '@headlessui/react';
import { sendMessageToCreator } from '@/services/api';
import { useRouter } from 'next/navigation';

interface QuoteRequest {
  _id: string;
  creatorId: {
    _id: string;
    fullName: string;
    username: string;
    avatar?: string;
  };
  requesterId: string;
  promotionType: string;
  campaignObjective: string;
  platformPreference: string[];
  contentFormat: string[];
  contentGuidelines: string;
  audienceTargeting: {
    demographics: string;
    interests: string;
    geography: string;
  };
  timeline: {
    startDate: string;
    endDate: string;
  };
  budget: {
    min: number;
    max: number;
    currency: string;
  };
  status: string;
  attachments?: string[];
  isPrivateEvent?: boolean;
  eventDetails?: {
    eventName: string;
    eventType: string;
    eventDate: string;
    eventLocation: string;
    expectedAttendance: number;
    eventDescription: string;
    specialRequirements?: string;
  };
}

interface BrandQuoteRequestsProps {
  limit?: number;
  statusFilter?: string;
  hideHeader?: boolean;
}

export default function BrandQuoteRequests({ limit, statusFilter, hideHeader }: BrandQuoteRequestsProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [quoteRequests, setQuoteRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRequest, setSelectedRequest] = useState<QuoteRequest | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRequest, setModalRequest] = useState<QuoteRequest | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');
  const [contactSuccess, setContactSuccess] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      console.log('BrandQuoteRequests: user', user);
      fetchQuoteRequests();
    }
  }, [user, user?._id]);

  const fetchQuoteRequests = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?._id) {
        setError('User not authenticated');
        return;
      }

      const response = await API.get(`/custom-quotes/brand/${user._id}`);
      console.log('Quote requests response:', response.data);
      
      if (response.data.message === 'Custom quote requests fetched successfully.') {
        const requests = Array.isArray(response.data.data) ? response.data.data : [];
        console.log('Processed quote requests:', requests);
        setQuoteRequests(requests);
      } else {
        const errorMessage = response.data.message || 'Failed to fetch quote requests';
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err: any) {
      console.error('Error fetching quote requests:', err);
      const errorMessage = err.response?.data?.message || 'Failed to fetch quote requests';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to log state changes
  useEffect(() => {
    console.log('Current quote requests:', quoteRequests);
  }, [quoteRequests]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
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

  // Filter and limit quote requests
  let displayedRequests = quoteRequests;
  if (statusFilter) {
    displayedRequests = displayedRequests.filter(q => q.status === statusFilter);
  }
  if (typeof limit === 'number') {
    displayedRequests = displayedRequests.slice(0, limit);
  }

  if (!user || !user._id) {
    return (
      <div className="flex justify-center items-center h-32">
        <LoadingSpinner size="large" />
      </div>
    );
  }

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

  if (displayedRequests.length === 0 && user && user._id && !loading && !error) {
    return (
      <div className="text-center text-yellow-600 p-4">
        <p>No orders yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {!hideHeader && (
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-900">Quote Requests</h2>
        </div>
      )}
      
      {displayedRequests.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>No quote requests yet</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {displayedRequests.map((request) => (
            <div
              key={request._id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => { setModalRequest(request); setModalOpen(true); }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-4">
                  <img
                    src={request.creatorId?.avatar || '/images/default-avatar.png'}
                    alt={request.creatorId?.fullName || 'Creator'}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {request.creatorId?.fullName || 'Unknown Creator'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{request.creatorId?.username || 'unknown_creator'}
                    </p>
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
            </div>
          ))}
        </div>
      )}
      {/* Modal for full quote request info */}
      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} className="fixed z-50 inset-0 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4">
          <div className="fixed inset-0 bg-black opacity-30" aria-hidden="true"></div>
          <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-auto p-6 z-10">
            <button className="absolute top-4 right-4 text-gray-400 hover:text-gray-600" onClick={() => setModalOpen(false)}>
              <X className="w-6 h-6" />
            </button>
            {modalRequest && (
              <div>
                <div className="flex items-center space-x-4 mb-4">
                  <img
                    src={modalRequest.creatorId?.avatar || '/images/default-avatar.png'}
                    alt={modalRequest.creatorId?.fullName || 'Creator'}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900 text-lg">
                      {modalRequest.creatorId?.fullName || 'Unknown Creator'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      @{modalRequest.creatorId?.username || 'unknown_creator'}
                    </p>
                  </div>
                  <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(modalRequest.status)}`}>
                    {getStatusIcon(modalRequest.status)}
                    {modalRequest.status.charAt(0).toUpperCase() + modalRequest.status.slice(1)}
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center text-gray-600">
                    <Calendar className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {formatDate(modalRequest.timeline.startDate)} - {formatDate(modalRequest.timeline.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <DollarSign className="w-5 h-5 mr-2" />
                    <span className="text-sm">
                      {modalRequest.budget.min} - {modalRequest.budget.max} {modalRequest.budget.currency}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <MessageSquare className="w-5 h-5 mr-2" />
                    <span className="text-sm">{modalRequest.promotionType}</span>
                  </div>
                </div>
                {/* Campaign Details */}
                <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-3">Campaign Details</h4>
                  <div className="space-y-2">
                    <p className="text-sm">
                      <span className="font-medium">Objective:</span> {modalRequest.campaignObjective}
                    </p>
                    {modalRequest.platformPreference && modalRequest.platformPreference.length > 0 && (
                      <p className="text-sm">
                        <span className="font-medium">Platforms:</span> {modalRequest.platformPreference.join(', ')}
                      </p>
                    )}
                    {modalRequest.contentFormat && modalRequest.contentFormat.length > 0 && (
                      <p className="text-sm">
                        <span className="font-medium">Content Format:</span> {modalRequest.contentFormat.join(', ')}
                      </p>
                    )}
                    {modalRequest.contentGuidelines && (
                      <p className="text-sm">
                        <span className="font-medium">Guidelines:</span> {modalRequest.contentGuidelines}
                      </p>
                    )}
                    {modalRequest.audienceTargeting && (
                      <>
                        <p className="text-sm">
                          <span className="font-medium">Demographics:</span> {modalRequest.audienceTargeting.demographics}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Interests:</span> {modalRequest.audienceTargeting.interests}
                        </p>
                        <p className="text-sm">
                          <span className="font-medium">Geography:</span> {modalRequest.audienceTargeting.geography}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                {/* Attachments Section */}
                {modalRequest.attachments && modalRequest.attachments.length > 0 && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <FileText className="w-5 h-5" /> Attachments
                    </h4>
                    <div className="space-y-2">
                      {modalRequest.attachments.map((url, index) => {
                        const filename = url.split('/').pop() || `Attachment ${index + 1}`;
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
                            <Eye className="w-5 h-5 text-gray-400" />
                          </a>
                        );
                      })}
                    </div>
                  </div>
                )}
                {modalRequest.isPrivateEvent && modalRequest.eventDetails && (
                  <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" /> Private Event Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium text-purple-800">Event Name</p>
                        <p className="text-gray-700">{modalRequest.eventDetails.eventName}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Event Type</p>
                        <p className="text-gray-700">{modalRequest.eventDetails.eventType}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Event Date</p>
                        <p className="text-gray-700">{formatDate(modalRequest.eventDetails.eventDate)}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Location</p>
                        <p className="text-gray-700 flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {modalRequest.eventDetails.eventLocation}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-purple-800">Expected Attendance</p>
                        <p className="text-gray-700 flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {modalRequest.eventDetails.expectedAttendance} people
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                {/* Pay Now Button for Accepted Quotes */}
                {modalRequest.status === 'accepted' && (
                  <div className="mt-6 flex justify-end">
                    <button
                      className="px-5 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition text-base font-semibold"
                      onClick={() => {
                        // Redirect to checkout with quote request details
                        const params = new URLSearchParams({
                          quoteRequestId: modalRequest._id,
                          creatorId: modalRequest.creatorId.username, // <-- use username instead of _id
                          amount: String(modalRequest.budget.max || modalRequest.budget.min),
                          promotionType: modalRequest.promotionType || '',
                        });
                        router.push(`/checkout?${params.toString()}`);
                      }}
                    >
                      Pay Now
                    </button>
                  </div>
                )}
                {/* Contact Creator Button */}
                <div className="mt-6 flex justify-end">
                  <button
                    className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition text-base font-semibold"
                    onClick={() => { setShowContactModal(true); setContactMessage(''); setContactSuccess(false); }}
                  >
                    Contact Creator
                  </button>
                </div>
                {/* Contact Creator Modal */}
                {showContactModal && (
                  <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
                      <button
                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600"
                        onClick={() => setShowContactModal(false)}
                      >
                        <X className="w-6 h-6" />
                      </button>
                      <h3 className="text-xl font-bold mb-4 text-gray-900">Contact Creator</h3>
                      {contactSuccess ? (
                        <div className="text-green-600 font-medium text-center py-8">Message sent successfully!</div>
                      ) : (
                        <>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg p-3 mb-4 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Type your message to the creator..."
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
                                await sendMessageToCreator({
                                  receiverId: modalRequest?.creatorId?._id,
                                  content: contactMessage,
                                });
                                setContactSuccess(true);
                                toast.success('Message sent successfully!');
                                setTimeout(() => {
                                  setShowContactModal(false);
                                  setContactSuccess(false);
                                  setContactMessage('');
                                }, 1200);
                              } catch (err) {
                                toast.error('Failed to send message');
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
            )}
          </div>
        </div>
      </Dialog>
    </div>
  );
} 