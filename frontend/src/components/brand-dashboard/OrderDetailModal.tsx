"use client";

import { FileText, Star, X, MessageSquare, ImageIcon, Download, ChevronLeft, CheckCheck, Clock, CalendarIcon, Copy, Check, Info, Users, DollarSign } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { useState, useEffect } from 'react';
import { Order } from '@/types/order'; // Import the shared Order interface
import { getUserById, getReviewByOrderId } from '../../services/api';
import BrandReviewUpdateModal from './BrandReviewUpdateModal';
import ReviewReplyDisplay from './ReviewReplyDisplay';

interface OrderDetailModalProps {
  showOrderDetail: boolean;
  setShowOrderDetail: (show: boolean) => void;
  selectedOrder: Order; // Use the correct Order interface
}

export default function OrderDetailModal({
  showOrderDetail,
  setShowOrderDetail,
  selectedOrder
}: OrderDetailModalProps) {
  if (!showOrderDetail || !selectedOrder) return null;

  // State for copy button
  const [copied, setCopied] = useState(false);
  const [creatorInfo, setCreatorInfo] = useState<any>(null);
  const [orderReview, setOrderReview] = useState<any>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showReviewUpdateModal, setShowReviewUpdateModal] = useState(false);

  // Copy order ID to clipboard
  const copyOrderId = () => {
    const orderIdToCopy = selectedOrder._id; // Use _id as orderID
    if (orderIdToCopy) {
      navigator.clipboard.writeText(orderIdToCopy).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  // Format dates
  const orderDate = selectedOrder.createdAt ? new Date(selectedOrder.createdAt) : new Date();
  const formattedOrderDate = format(orderDate, 'MMM d, yyyy');

  const deliveryDate = selectedOrder.deliveryDate ? new Date(selectedOrder.deliveryDate) : null;
  const formattedDeliveryDate = deliveryDate ? format(deliveryDate, 'MMM d, yyyy') : 'N/A';

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'delivered':
        return 'bg-purple-100 text-purple-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  useEffect(() => {
    if (showOrderDetail && selectedOrder && selectedOrder.creatorId) {
      // Try to get the creator's user ID (could be an object or string)
      const creatorUserId = typeof selectedOrder.creatorId === 'object' ? selectedOrder.creatorId._id : selectedOrder.creatorId;
      if (creatorUserId) {
        getUserById(creatorUserId).then(res => {
          if (res.success) setCreatorInfo(res.data);
          else setCreatorInfo(null);
        });
      }
    } else {
      setCreatorInfo(null);
    }
  }, [showOrderDetail, selectedOrder]);

  useEffect(() => {
    if (selectedOrder.status === 'completed') {
      setReviewLoading(true);
      getReviewByOrderId(selectedOrder._id)
        .then(review => {
          setOrderReview(review);
        })
        .catch(error => {
          // Silently handle errors for review fetching
          // These are expected when reviews don't exist yet
          console.log('No review found for order:', selectedOrder._id);
          setOrderReview(null);
        })
        .finally(() => {
          setReviewLoading(false);
        });
    } else {
      setOrderReview(null);
    }
  }, [selectedOrder._id, selectedOrder.status]);

  // Handle review update
  const handleReviewUpdate = () => {
    // Refresh the review data after update
    if (selectedOrder.status === 'completed') {
      setReviewLoading(true);
      getReviewByOrderId(selectedOrder._id)
        .then(review => {
          setOrderReview(review);
        })
        .catch(error => {
          // Silently handle errors for review fetching
          // These are expected when reviews don't exist yet
          console.log('No review found for order:', selectedOrder._id);
          setOrderReview(null);
        })
        .finally(() => {
          setReviewLoading(false);
        });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-md sm:max-w-3xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-2 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
            <div className="flex items-center">
              <button 
                onClick={() => setShowOrderDetail(false)}
                className="mr-2 sm:mr-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Order Details
              </h3>
            </div>
            <button 
              onClick={() => setShowOrderDetail(false)}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          
          {/* Order ID Section */}
          <div className="mb-4 sm:mb-8 bg-gray-50 p-2 sm:p-4 rounded-md sm:rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Order ID</p>
            <div className="flex items-center flex-wrap gap-2">
              <p className="font-mono text-gray-900 text-base sm:text-lg select-all">
                {selectedOrder._id}
              </p>
              <button 
                onClick={copyOrderId}
                className="text-gray-500 hover:text-purple-600 transition-colors"
                title="Copy Order ID"
              >
                {copied ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            {selectedOrder.orderID && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Reference ID</p>
                <p className="font-mono text-gray-700 text-xs sm:text-sm">{selectedOrder.orderID}</p>
              </div>
            )}
          </div>

          {/* Order Summary Section */}
          <div className="mb-4 sm:mb-8 bg-gradient-to-r from-purple-50 to-blue-50 p-3 sm:p-6 rounded-md sm:rounded-lg border border-purple-200">
            <h4 className="text-lg sm:text-xl font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b border-purple-200 pb-1 sm:pb-2">
              <Info className="w-5 h-5 mr-2 text-purple-600" /> 
              Order Summary
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Total Value</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Service Type</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 capitalize">{selectedOrder.service}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Order Status</p>
                <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${getStatusColor(selectedOrder.status)}`}>{formatStatus(selectedOrder.status)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-8 h-full">
              {/* Creator Information */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Users className="w-5 h-5 mr-2 text-gray-500" /> Creator Information</h4>
                {creatorInfo ? (
                  <div className="flex items-center gap-4 mb-2">
                    <img 
                      className="h-14 w-14 rounded-full border border-gray-200"
                      src={creatorInfo.avatar || creatorInfo.profileImage || '/avatars/placeholder.svg'}
                      alt={creatorInfo.fullName || creatorInfo.username || 'Creator'} 
                    />
                    <dl className="space-y-1">
                      <div><dt className="text-xs text-gray-500">Name</dt><dd className="text-base font-medium text-gray-900">{creatorInfo.fullName || 'N/A'}</dd></div>
                      <div><dt className="text-xs text-gray-500">Username</dt><dd className="text-sm text-gray-700">@{creatorInfo.username || 'N/A'}</dd></div>
                      <div><dt className="text-xs text-gray-500">Role</dt><dd className="text-sm text-gray-700 capitalize">{creatorInfo.role}</dd></div>
                    </dl>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 mb-2">
                    <img 
                      className="h-14 w-14 rounded-full border border-gray-200"
                      src={selectedOrder.creatorId?.creatorImage || '/avatars/placeholder.svg'}
                      alt={selectedOrder.creatorId?.creatorName || 'Creator'} 
                    />
                    <dl className="space-y-1">
                      <div><dt className="text-xs text-gray-500">Name</dt><dd className="text-base font-medium text-gray-900">{selectedOrder.creatorId?.creatorName || 'N/A'}</dd></div>
                      <div><dt className="text-xs text-gray-500">Username</dt><dd className="text-sm text-gray-700">@{selectedOrder.creatorId?.creatorUsername || 'N/A'}</dd></div>
                    </dl>
                  </div>
                )}
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Star className="w-5 h-5 mr-2 text-gray-500" /> Service Details</h4>
                <dl className="space-y-2">
                  <div><dt className="text-xs text-gray-500">Service</dt><dd className="text-base font-medium text-gray-900">{selectedOrder.service}</dd></div>
                  <div><dt className="text-xs text-gray-500">Package</dt><dd className="text-base text-gray-900 capitalize">{selectedOrder.packageName} ({selectedOrder.packageType})</dd></div>
                  {selectedOrder.promotionType && (
                    <div><dt className="text-xs text-gray-500">Promotion Type</dt><dd className="text-base text-gray-900 capitalize">{selectedOrder.promotionType}</dd></div>
                  )}
                  {selectedOrder.platform && (
                    <div><dt className="text-xs text-gray-500">Platform</dt><dd className="text-base text-gray-900 capitalize">{selectedOrder.platform}</dd></div>
                  )}
                  {selectedOrder.description && (
                    <div><dt className="text-xs text-gray-500">Description</dt><dd className="text-gray-700 text-sm leading-relaxed">{selectedOrder.description}</dd></div>
                  )}
                  {selectedOrder.deliverables && selectedOrder.deliverables.length > 0 && (
                    <div><dt className="text-xs text-gray-500">Deliverables</dt><dd><ul className="list-disc list-inside text-gray-700 text-sm">{selectedOrder.deliverables.map((item: string, index: number) => (<li key={index}>{item}</li>))}</ul></dd></div>
                  )}
                </dl>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><DollarSign className="w-5 h-5 mr-2 text-gray-500" /> Financial Breakdown</h4>
                <dl className="space-y-3">
                  {selectedOrder.packagePrice && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-600">Package Price</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.packagePrice)}</dd>
                    </div>
                  )}
                  {selectedOrder.platformFee && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-600">Platform Fee</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(selectedOrder.platformFee)}</dd>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <dt className="text-base font-semibold text-gray-800">Total Amount</dt>
                    <dd className="text-lg font-bold text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</dd>
                  </div>
                  {selectedOrder.currency && selectedOrder.currency !== 'INR' && (
                    <div className="text-xs text-gray-500 text-center">
                      Currency: {selectedOrder.currency}
                    </div>
                  )}
                </dl>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-8 h-full">
              {/* Order Status & Dates */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Info className="w-5 h-5 mr-2 text-gray-500" /> Order Status & Dates</h4>
                <dl className="space-y-2">
                  <div><dt className="text-xs text-gray-500">Current Status</dt><dd><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>{formatStatus(selectedOrder.status)}</span></dd></div>
                  <div><dt className="text-xs text-gray-500">Order Date</dt><dd className="text-base text-gray-900">{formattedOrderDate}</dd></div>
                  <div><dt className="text-xs text-gray-500">Delivery Due Date</dt><dd className="text-base text-gray-900">{formattedDeliveryDate}</dd></div>
                  {selectedOrder.updatedAt && (
                    <div><dt className="text-xs text-gray-500">Last Updated</dt><dd className="text-base text-gray-900">{format(new Date(selectedOrder.updatedAt), 'MMM d, yyyy HH:mm')}</dd></div>
                  )}
                </dl>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><DollarSign className="w-5 h-5 mr-2 text-gray-500" /> Payment Information</h4>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div><dt className="text-xs text-gray-500">Total Amount</dt><dd className="text-base font-medium text-gray-900">{formatCurrency(selectedOrder.totalAmount)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Payment Status</dt><dd><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.paymentStatus || 'pending')}`}>{formatStatus(selectedOrder.paymentStatus || 'pending')}</span></dd></div>
                  {selectedOrder.paymentMethod && (
                    <div><dt className="text-xs text-gray-500">Payment Method</dt><dd className="text-base text-gray-900 capitalize">{selectedOrder.paymentMethod}</dd></div>
                  )}
                  {selectedOrder.transactionId && (
                    <div><dt className="text-xs text-gray-500">Transaction ID</dt><dd className="text-base text-gray-900 break-all">{selectedOrder.transactionId}</dd></div>
                  )}
                  {selectedOrder.paymentDate && (
                    <div><dt className="text-xs text-gray-500">Payment Date</dt><dd className="text-base text-gray-900">{format(new Date(selectedOrder.paymentDate), 'MMM d, yyyy')}</dd></div>
                  )}
                </dl>
              </div>

              {/* Timeline & Progress */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Clock className="w-5 h-5 mr-2 text-gray-500" /> Timeline & Progress</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Order Placed</p>
                      <p className="text-xs text-gray-500">{formattedOrderDate}</p>
                    </div>
                  </div>
                  {selectedOrder.status !== 'pending' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Work Started</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                    </div>
                  )}
                  {(selectedOrder.status === 'delivered' || selectedOrder.status === 'completed') && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Work Delivered</p>
                        <p className="text-xs text-gray-500">Ready for Review</p>
                      </div>
                    </div>
                  )}
                  {selectedOrder.status === 'completed' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Order Completed</p>
                        <p className="text-xs text-gray-500">Successfully Finished</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Submitted Work */}
              {selectedOrder.submittedWork && (
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                  <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><FileText className="w-5 h-5 mr-2 text-gray-500" /> Submitted Work</h4>
                  <dl className="space-y-2">
                    <div><dt className="text-xs text-gray-500">Submission Status</dt><dd><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.submittedWork.status)}`}>{formatStatus(selectedOrder.submittedWork.status)}</span></dd></div>
                    {selectedOrder.submittedWork.submittedAt && (
                      <div><dt className="text-xs text-gray-500">Submitted On</dt><dd className="text-sm text-gray-900">{format(new Date(selectedOrder.submittedWork.submittedAt), 'MMM d, yyyy HH:mm')}</dd></div>
                    )}
                    {selectedOrder.submittedWork.description && (
                      <div><dt className="text-xs text-gray-500">Description</dt><dd className="text-gray-700 text-sm leading-relaxed">{selectedOrder.submittedWork.description}</dd></div>
                    )}
                    {selectedOrder.submittedWork.files && selectedOrder.submittedWork.files.length > 0 && (
                      <div><dt className="text-xs text-gray-500">Files ({selectedOrder.submittedWork.files.length})</dt><dd><div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">{selectedOrder.submittedWork.files.map((file, index) => (<a key={index} href={file.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"><ImageIcon className="mr-2 h-4 w-4" />{file.filename}<Download className="ml-auto h-4 w-4 text-gray-500" /></a>))}</div></dd></div>
                    )}
                    {selectedOrder.submittedWork.status === 'rejected' && selectedOrder.submittedWork.rejectionReason && (
                      <div><dt className="text-xs text-red-500">Rejection Reason</dt><dd className="text-red-700 text-sm leading-relaxed">{selectedOrder.submittedWork.rejectionReason}</dd></div>
                    )}
                  </dl>
                </div>
              )}

              {/* Client Feedback */}
              {selectedOrder.clientFeedback && (
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                  <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><MessageSquare className="w-5 h-5 mr-2 text-gray-500" /> Client Feedback</h4>
                  <dl className="space-y-2">
                    <div><dt className="text-xs text-gray-500">Rating</dt><dd><div className="flex items-center">{[...Array(5)].map((_, i) => (<Star key={i} className={`w-5 h-5 ${i < selectedOrder.clientFeedback!.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />))}</div></dd></div>
                    {selectedOrder.clientFeedback.comment && (
                      <div><dt className="text-xs text-gray-500">Comment</dt><dd className="text-gray-700 text-sm leading-relaxed">{selectedOrder.clientFeedback.comment}</dd></div>
                    )}
                    {selectedOrder.clientFeedback.submittedAt && (
                      <div><dt className="text-xs text-gray-500">Submitted On</dt><dd className="text-sm text-gray-900">{format(new Date(selectedOrder.clientFeedback.submittedAt), 'MMM d, yyyy HH:mm')}</dd></div>
                    )}
                  </dl>
                </div>
              )}

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                  <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Clock className="w-5 h-5 mr-2 text-gray-500" /> Status History</h4>
                  <ul className="space-y-2">
                    {selectedOrder.statusHistory
                      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                      .map((history, index) => (
                        <li key={index} className="flex items-center text-sm">
                          <CalendarIcon className="w-4 h-4 mr-2 text-gray-400" />
                          <span>
                            <span className="font-medium text-gray-900 capitalize">{formatStatus(history.status)}</span>
                            <span className="text-gray-500 ml-2">{format(new Date(history.date), 'MMM d, yyyy HH:mm')}</span>
                            <span className="text-gray-400 ml-2">({formatDistanceToNow(new Date(history.date), { addSuffix: true })})</span>
                          </span>
                        </li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Review Section at the bottom */}
          {reviewLoading ? (
            <div className="mt-8 text-center text-gray-400">Loading review...</div>
          ) : orderReview ? (
            <div className="mt-8 bg-yellow-50 p-6 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-lg font-bold text-yellow-800 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Brand Review
                </h4>
                <button
                  onClick={() => setShowReviewUpdateModal(true)}
                  className="px-3 py-1 bg-yellow-600 text-white text-sm rounded-md hover:bg-yellow-700 transition-colors"
                >
                  Edit Review
                </button>
              </div>
              <div className="flex items-center mb-2">
                {[1,2,3,4,5].map(star => (
                  <Star key={star} className={`w-5 h-5 ${orderReview.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                ))}
                <span className="ml-3 text-base text-gray-700 font-semibold">{orderReview.rating}/5</span>
              </div>
              <div className="text-gray-800 text-base italic">{orderReview.comment}</div>
              
              {/* Review Reply Display */}
              {orderReview.reply && (
                <ReviewReplyDisplay
                  reply={orderReview.reply}
                  creatorName={selectedOrder.creatorName}
                  creatorAvatar={selectedOrder.creatorImage}
                />
              )}
            </div>
          ) : null}

          <div className="flex justify-end space-x-3 mt-8 border-t pt-6">
            <button 
              onClick={() => setShowOrderDetail(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center transition-colors">
              <MessageSquare className="w-4 h-4 mr-2" />
              Contact Client
            </button>
          </div>
        </div>
      </div>

      {/* Review Update Modal */}
      {showReviewUpdateModal && orderReview && (
        <BrandReviewUpdateModal
          open={showReviewUpdateModal}
          onClose={() => setShowReviewUpdateModal(false)}
          order={selectedOrder}
          existingReview={orderReview}
          onReviewUpdated={handleReviewUpdate}
        />
      )}
    </div>
  );
} 