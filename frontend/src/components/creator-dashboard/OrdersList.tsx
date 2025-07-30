import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Check, X, Loader2 } from 'lucide-react';
import CancelOrderModal from './CancelOrderModal';
import BrandExperienceReviewModal from '../modals/BrandExperienceReviewModal';
import InvoiceModal from '../invoice/InvoiceModal';
import InvoiceButton from '../invoice/InvoiceButton';
import API from '../../services/api';
import { Order } from '@/types/order';

interface OrdersListProps {
  orders: Order[];
  title: string;
  showAllLink?: boolean;
  limit?: number;
  onViewDetails: (order: Order) => void;
  onAcceptOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  onSubmitWorkClick: (order: Order) => void;
  acceptingOrder: string | null;
  cancellingOrder: string | null;
  orderMessage: { id: string; type: 'success' | 'error'; message: string } | null;
}

export default function OrdersList({
  orders,
  title,
  showAllLink = false,
  limit,
  onViewDetails,
  onAcceptOrder,
  onCancelOrder,
  onSubmitWorkClick,
  acceptingOrder,
  cancellingOrder,
  orderMessage
}: OrdersListProps) {
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<{ [orderId: string]: boolean }>({});
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewOrderId, setReviewOrderId] = useState<string | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);

  const sortedAndFilteredOrders = orders
    .filter(order => filterStatus === 'all' || order.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return (b.totalAmount || 0) - (a.totalAmount || 0);
    });

  // Check if completed orders have already been reviewed
  useEffect(() => {
    const checkReviews = async () => {
      const completedOrders = orders.filter(order => order.status === 'completed');
      const results: { [orderId: string]: boolean } = {};
      await Promise.all(completedOrders.map(async (order) => {
        try {
          await API.get(`/brand-experience-reviews/order/${order._id}`);
          results[order._id] = true;
        } catch (err: any) {
          // Silently handle 404 errors for brand experience reviews
          // These are expected when reviews don't exist yet
          if (err?.response?.status !== 404) {
            console.error('Error checking review for order:', order._id, err);
          }
          results[order._id] = false;
        }
      }));
      setReviewedOrders(results);
    };
    checkReviews();
  }, [orders]);

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
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'refunded':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCancelClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedOrder(order);
    setShowCancelModal(true);
  };

  const handleAcceptClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    onAcceptOrder(order._id);
  };

  const handleSubmitWorkClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    onSubmitWorkClick(order);
  };

  const handleOpenReviewModal = (orderId: string) => {
    setReviewOrderId(orderId);
    setShowReviewModal(true);
  };
  const handleCloseReviewModal = () => {
    setShowReviewModal(false);
    setReviewOrderId(null);
  };
  const handleReviewSubmitted = () => {
    if (reviewOrderId) {
      setReviewedOrders(prev => ({ ...prev, [reviewOrderId]: true }));
    }
    handleCloseReviewModal();
  };

  const handleInvoiceClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        {showAllLink && (
          <a href="/orders" className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            View All
          </a>
        )}
      </div>

      <div className="flex gap-4 mb-4">
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="date">Sort by Date</option>
          <option value="amount">Sort by Amount</option>
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="rounded-md border-gray-300 text-sm"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="delivered">Delivered</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orderMessage && (
        <div
          className={`mb-4 p-4 rounded-md ${
            orderMessage.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {orderMessage.message}
        </div>
      )}

      <div className="space-y-4">
        {(limit ? sortedAndFilteredOrders.slice(0, limit) : sortedAndFilteredOrders).map((order) => (
          <div
            key={order._id}
            onClick={() => onViewDetails(order)}
            className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900 text-base sm:text-lg">{order.orderID} - {order.brandId?.brandName}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{order.service}</p>
                {order.promotionType && (
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-1">{order.promotionType}</span>
                )}
                {order.deliveryDate && (
                  <p className="text-xs text-gray-500 mt-1">Deliver by: {format(new Date(order.deliveryDate), 'MMM d, yyyy')}</p>
                )}
                {order.description && (
                  <p className="text-xs text-gray-500 mt-1 truncate max-w-xs">Description: {order.description}</p>
                )}
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900 text-base sm:text-lg">${(order.totalAmount || 0).toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-gray-500">{format(new Date(order.createdAt), 'MMM d, yyyy')}</p>
              </div>
            </div>

            <div className="mt-3 flex flex-wrap gap-2 items-center">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{order.status.replace('_', ' ')}</span>
              {order.submittedWork && (
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getSubmissionStatusColor(order.submittedWork.status)}`}>
                  {order.submittedWork.status === 'approved' ? 'Submission approved' : order.submittedWork.status === 'rejected' ? 'Submission rejected' : `Submission ${order.submittedWork.status}`}
                </span>
              )}
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus || 'pending')}`}>{order.paymentStatus || 'pending'}</span>
            </div>

            {(order.status === 'pending' || order.status === 'in_progress') && (
              <div className="mt-3 flex flex-col sm:flex-row gap-2 w-full">
                {order.status === 'pending' && (
                  <button
                    onClick={(e) => handleAcceptClick(order, e)}
                    disabled={acceptingOrder === order._id}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    {acceptingOrder === order._id ? (
                      <>
                        <Loader2 className="animate-spin w-4 h-4 mr-2" />
                        Accepting...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Accept
                      </>
                    )}
                  </button>
                )}
                {order.status === 'in_progress' && !order.submittedWork && (
                  <button
                    onClick={(e) => handleSubmitWorkClick(order, e)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Submit Work for Approval
                  </button>
                )}
                {order.submittedWork && order.submittedWork.status === 'rejected' && (
                  <button
                    onClick={(e) => handleSubmitWorkClick(order, e)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Resubmit Work
                  </button>
                )}
                <button
                  onClick={(e) => handleCancelClick(order, e)}
                  disabled={cancellingOrder === order._id}
                  className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:py-1 border border-transparent text-xs sm:text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  {cancellingOrder === order._id ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4 mr-2" />
                      Cancelling...
                    </>
                  ) : (
                    <>
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </>
                  )}
                </button>
              </div>
            )}
            {order.submittedWork && order.submittedWork.submittedAt && (
              <div className="mt-3 text-xs sm:text-sm text-gray-600">
                <p>Submitted: {format(new Date(order.submittedWork.submittedAt), 'MMM d, yyyy')}</p>
                {order.submittedWork.status === 'rejected' && order.submittedWork.rejectionReason && (
                  <p className="text-red-600 mt-1">Rejection reason: {order.submittedWork.rejectionReason}</p>
                )}
              </div>
            )}
            <div className="mt-3 flex justify-between items-center gap-3">
              {order.status === 'completed' && !reviewedOrders[order._id] && (
                <button
                  className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium transition-colors"
                  onClick={e => { e.stopPropagation(); handleOpenReviewModal(order._id); }}
                >
                  Rate Brand Experience
                </button>
              )}
              {order.status === 'completed' && (
                <div className="ml-auto">
                  <InvoiceButton
                    onClick={(e) => e && handleInvoiceClick(order, e)}
                    size="sm"
                    className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {sortedAndFilteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No orders found</p>
          </div>
        )}
      </div>

      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancel={(reason) => {
            onCancelOrder(selectedOrder._id, reason);
            setShowCancelModal(false);
          }}
          orderId={selectedOrder._id}
          isCancelling={cancellingOrder === selectedOrder._id}
        />
      )}
      <BrandExperienceReviewModal
        isOpen={showReviewModal}
        onClose={handleCloseReviewModal}
        orderId={reviewOrderId || ''}
        onSubmitted={handleReviewSubmitted}
      />
      <InvoiceModal
        isOpen={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedInvoiceOrder(null);
        }}
        order={selectedInvoiceOrder}
      />
    </div>
  );
} 