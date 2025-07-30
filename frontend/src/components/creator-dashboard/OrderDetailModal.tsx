import { FileText, Star, X, MessageSquare, ImageIcon, Download, ChevronLeft, Check, Info, Users, DollarSign, Clock, CalendarIcon } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Order } from '@/types/order';
import React from 'react';

interface OrderDetailModalProps {
  open: boolean;
  order: Order | null;
  onClose: () => void;
  onAcceptOrder: (orderId: string) => void;
  onCancelOrder: (orderId: string, reason: string) => void;
  acceptingOrder: string | null;
  cancellingOrder: string | null;
}

export default function OrderDetailModal({
  open,
  order,
  onClose,
  onAcceptOrder,
  onCancelOrder,
  acceptingOrder,
  cancellingOrder,
}: OrderDetailModalProps) {
  if (!open || !order) return null;

  const formattedOrderDate = order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : '';
  const formattedDeliveryDate = order.deliveryDate ? format(new Date(order.deliveryDate), 'MMM d, yyyy') : 'N/A';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

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

  const formatStatus = (status: string) => {
    return status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-lg sm:rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-lg">
        <div className="p-2 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-2">
            <div className="flex items-center">
              <button onClick={onClose} className="mr-2 sm:mr-3 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h3 className="text-xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Order Details</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Order ID Section */}
          <div className="mb-4 sm:mb-8 bg-gray-50 p-2 sm:p-4 rounded-md sm:rounded-lg border border-gray-200">
            <p className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Order ID</p>
            <p className="font-mono text-gray-900 text-base sm:text-lg select-all">{order._id}</p>
            {order.orderID && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Reference ID</p>
                <p className="font-mono text-gray-700 text-xs sm:text-sm">{order.orderID}</p>
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
                <p className="text-lg sm:text-2xl font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Service Type</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 capitalize">{order.service}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500 font-semibold uppercase tracking-wide">Order Status</p>
                <span className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-xs sm:text-sm font-bold ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 items-start">
            {/* Left Column */}
            <div className="space-y-4 sm:space-y-8 h-full">
              {/* Client Information */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Users className="w-5 h-5 mr-2 text-gray-500" /> Client Information</h4>
                <div className="flex items-center gap-4 mb-3">
                  <img
                    src={order.brandId?.brandImage || '/avatars/placeholder-1.svg'}
                    alt={order.brandId?.brandName || 'Client Avatar'}
                    className="w-12 h-12 rounded-full border border-gray-200 object-cover"
                  />
                  <div>
                    <div className="text-base font-medium text-gray-900">{order.brandId?.brandName || 'N/A'}</div>
                    <div className="text-xs text-gray-500">@{order.brandId?.brandUsername || 'N/A'}</div>
                  </div>
                </div>
                <dl className="space-y-1">
                  {/* Name and Username are now above with avatar */}
                  <div><dt className="text-xs text-gray-500">Platform</dt><dd className="text-sm text-gray-700">{order.platform || 'N/A'}</dd></div>
                </dl>
              </div>

              {/* Service Details */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Star className="w-5 h-5 mr-2 text-gray-500" /> Service Details</h4>
                <dl className="space-y-2">
                  <div><dt className="text-xs text-gray-500">Service</dt><dd className="text-base font-medium text-gray-900">{order.service}</dd></div>
                  {order.promotionType && (
                    <div><dt className="text-xs text-gray-500">Promotion Type</dt><dd className="text-base text-gray-900 capitalize">{order.promotionType}</dd></div>
                  )}
                  {order.description && (
                    <div><dt className="text-xs text-gray-500">Description</dt><dd className="text-gray-700 text-sm leading-relaxed">{order.description}</dd></div>
                  )}
                  {order.deliverables && order.deliverables.length > 0 && (
                    <div><dt className="text-xs text-gray-500">Deliverables</dt><dd><ul className="list-disc list-inside text-gray-700 text-sm">{order.deliverables.map((item: string, index: number) => (<li key={index}>{item}</li>))}</ul></dd></div>
                  )}
                </dl>
              </div>

              {/* Financial Breakdown */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><DollarSign className="w-5 h-5 mr-2 text-gray-500" /> Financial Breakdown</h4>
                <dl className="space-y-3">
                  {order.packagePrice !== undefined && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-600">Package Price</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(order.packagePrice)}</dd>
                    </div>
                  )}
                  {order.platformFee !== undefined && (
                    <div className="flex justify-between items-center">
                      <dt className="text-sm text-gray-600">Platform Fee</dt>
                      <dd className="text-sm font-medium text-gray-900">{formatCurrency(order.platformFee)}</dd>
                    </div>
                  )}
                  <div className="border-t pt-2 flex justify-between items-center">
                    <dt className="text-base font-semibold text-gray-800">Total Amount</dt>
                    <dd className="text-lg font-bold text-gray-900">{formatCurrency(order.totalAmount)}</dd>
                  </div>
                </dl>
              </div>

              {/* Requirements Section */}
              {(order as any).specialInstructions || (order as any).message || (order as any).files ? (
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                  <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><FileText className="w-5 h-5 mr-2 text-gray-500" /> Project Requirements</h4>
                  <dl className="space-y-2">
                    {(order as any).specialInstructions && (
                      <div><dt className="text-xs text-gray-500">Special Instructions</dt><dd className="text-gray-700 text-sm leading-relaxed">{(order as any).specialInstructions}</dd></div>
                    )}
                    {(order as any).message && (
                      <div><dt className="text-xs text-gray-500">Message to Creator</dt><dd className="text-gray-700 text-sm leading-relaxed">{(order as any).message}</dd></div>
                    )}
                    {(order as any).files && Array.isArray((order as any).files) && (order as any).files.length > 0 && (
                      <div><dt className="text-xs text-gray-500">Uploaded Files</dt><dd><ul className="space-y-1 mt-2">{(order as any).files.map((file: string, idx: number) => (
                        <li key={idx} className="flex items-center text-sm">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <a href={file} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">File {idx + 1}</a>
                        </li>
                      ))}</ul></dd></div>
                    )}
                  </dl>
                </div>
              ) : null}
            </div>

            {/* Right Column */}
            <div className="space-y-4 sm:space-y-8 h-full">
              {/* Order Status & Dates */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Info className="w-5 h-5 mr-2 text-gray-500" /> Order Status & Dates</h4>
                <dl className="space-y-2">
                  <div><dt className="text-xs text-gray-500">Current Status</dt><dd><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>{formatStatus(order.status)}</span></dd></div>
                  <div><dt className="text-xs text-gray-500">Order Date</dt><dd className="text-base text-gray-900">{formattedOrderDate}</dd></div>
                  <div><dt className="text-xs text-gray-500">Delivery Due Date</dt><dd className="text-base text-gray-900">{formattedDeliveryDate}</dd></div>
                  {order.updatedAt && (
                    <div><dt className="text-xs text-gray-500">Last Updated</dt><dd className="text-base text-gray-900">{format(new Date(order.updatedAt), 'MMM d, yyyy HH:mm')}</dd></div>
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
                  {order.status !== 'pending' && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Work Started</p>
                        <p className="text-xs text-gray-500">In Progress</p>
                      </div>
                    </div>
                  )}
                  {(order.status === 'delivered' || order.status === 'completed') && (
                    <div className="flex items-center">
                      <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">Work Delivered</p>
                        <p className="text-xs text-gray-500">Ready for Review</p>
                      </div>
                    </div>
                  )}
                  {order.status === 'completed' && (
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

              {/* Payment Information */}
              <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><DollarSign className="w-5 h-5 mr-2 text-gray-500" /> Payment Information</h4>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2">
                  <div><dt className="text-xs text-gray-500">Total Amount</dt><dd className="text-base font-medium text-gray-900">{formatCurrency(order.totalAmount)}</dd></div>
                  <div><dt className="text-xs text-gray-500">Payment Status</dt><dd><span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus || 'pending')}`}>{formatStatus(order.paymentStatus || 'pending')}</span></dd></div>
                  {order.paymentMethod && (
                    <div><dt className="text-xs text-gray-500">Payment Method</dt><dd className="text-base text-gray-900 capitalize">{order.paymentMethod}</dd></div>
                  )}
                  {order.transactionId && (
                    <div><dt className="text-xs text-gray-500">Transaction ID</dt><dd className="text-base text-gray-900 break-all">{order.transactionId}</dd></div>
                  )}
                  {order.paymentDate && (
                    <div><dt className="text-xs text-gray-500">Payment Date</dt><dd className="text-base text-gray-900">{format(new Date(order.paymentDate), 'MMM d, yyyy')}</dd></div>
                  )}
                </dl>
              </div>

              {/* Status History */}
              {order.statusHistory && order.statusHistory.length > 0 && (
                <div className="bg-gray-50 rounded-md sm:rounded-lg p-3 sm:p-6 shadow-sm border border-gray-100 h-fit">
                  <h4 className="text-base sm:text-lg font-bold mb-2 sm:mb-4 text-gray-800 flex items-center border-b pb-1 sm:pb-2"><Clock className="w-5 h-5 mr-2 text-gray-500" /> Status History</h4>
                  <ul className="space-y-2">
                    {order.statusHistory
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

          {/* Action Buttons for Pending Orders */}
          {order.status === 'pending' && (
            <div className="flex justify-end space-x-3 mt-8 border-t pt-6">
              <button
                onClick={() => onCancelOrder(order._id, '')}
                disabled={cancellingOrder === order._id}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {cancellingOrder === order._id ? (
                  <>
                    <span className="animate-spin w-4 h-4 mr-2 border-b-2 border-white rounded-full inline-block"></span>
                    Cancelling...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Cancel Order
                  </>
                )}
              </button>
              <button
                onClick={() => onAcceptOrder(order._id)}
                disabled={acceptingOrder === order._id}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {acceptingOrder === order._id ? (
                  <>
                    <span className="animate-spin w-4 h-4 mr-2 border-b-2 border-white rounded-full inline-block"></span>
                    Accepting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Accept Order
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 