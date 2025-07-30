"use client";

import { useState, useEffect } from 'react';
import { 
  ShoppingBag, 
  Clock, 
  FileText, 
  Filter, 
  ArrowDown, 
  ArrowUp, 
  Copy, 
  Check,
  Search,
  Download,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  ChevronDown,
  Star
} from 'lucide-react';
import { getBrandOrders } from '../../services/api';
import { Order } from '@/types/order';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import BrandReviewModal from './BrandReviewModal';
import InvoiceModal from '../invoice/InvoiceModal';
import InvoiceButton from '../invoice/InvoiceButton';

interface BrandOrdersProps {
  setSelectedOrder: (order: Order | null) => void;
  setShowOrderDetail: (show: boolean) => void;
}

export default function BrandOrders({ setSelectedOrder, setShowOrderDetail }: BrandOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [copying, setCopying] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [exportLoading, setExportLoading] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<Order | null>(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<Order | null>(null);
  const ITEMS_PER_PAGE = 10;

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        // Debug: Check authentication token
        const token = localStorage.getItem('token');
        console.log('Auth token available:', !!token);
        console.log('Token value:', token ? token.substring(0, 20) + '...' : 'No token');
        
        const response = await getBrandOrders(50, filterStatus || undefined);
        console.log('Brand orders response:', response);
        
        let orders: Order[] = [];
        const data: any = response.data;
        if (Array.isArray(data)) {
          orders = data;
        } else if (data && Array.isArray(data.orders)) {
          orders = data.orders;
        }
        console.log('Extracted orders:', orders);
        setOrders(orders);
        setTotalPages(Math.ceil(orders.length / ITEMS_PER_PAGE));
        setError(null);
      } catch (err) {
        setError('An unexpected error occurred');
        console.error('Error fetching orders:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [filterStatus]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
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
    return status.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  const sortedOrders: Order[] = Array.from(orders).sort((a, b) => {
    if (sortBy === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortBy === 'totalAmount') {
      return sortOrder === 'asc' 
        ? a.totalAmount - b.totalAmount 
        : b.totalAmount - a.totalAmount;
    } else if (sortBy === 'creator') {
      const creatorA = a.creatorName?.toLowerCase() || '';
      const creatorB = b.creatorName?.toLowerCase() || '';
      return sortOrder === 'asc'
        ? creatorA.localeCompare(creatorB)
        : creatorB.localeCompare(creatorA);
    } else if (sortBy === '_id') {
      const idA = a._id?.toLowerCase() || '';
      const idB = b._id?.toLowerCase() || '';
      return sortOrder === 'asc'
        ? idA.localeCompare(idB)
        : idB.localeCompare(idA);
    }
    return sortOrder === 'asc' 
      ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime() 
      : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const filteredOrders = sortedOrders.filter(order => {
    if (filterStatus && order.status !== filterStatus) {
      return false;
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        (order._id && order._id.toLowerCase().includes(query)) ||
        (order.creatorName && order.creatorName.toLowerCase().includes(query)) ||
        (order.packageName && order.packageName.toLowerCase().includes(query))
      );
    }
    
    return true;
  });

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  const copyOrderId = (event: React.MouseEvent, orderId: string) => {
    event.stopPropagation();
    navigator.clipboard.writeText(orderId).then(() => {
      setCopying(orderId);
      setTimeout(() => setCopying(null), 2000);
      toast.success('Order ID copied to clipboard!');
    });
  };

  const exportOrdersCSV = () => {
    setExportLoading(true);
    
    try {
      const headers = ['Order ID', 'Creator', 'Package', 'Order Date', 'Delivery Date', 'Amount', 'Status', 'Payment Status', 'Service', 'Platform'];
      
      const csvContent = [
        headers.join(','),
        ...orders.map(order => [
          order._id,
          order.creatorName,
          order.packageName,
          order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : '',
          order.deliveryDate ? format(new Date(order.deliveryDate), 'MMM d, yyyy') : 'N/A',
          formatCurrency(order.totalAmount),
          formatStatus(order.status),
          formatStatus(order.paymentStatus),
          order.service,
          order.platform,
        ].map(item => {
          const value = String(item);
          return value.includes(',') || value.includes('\n') ? `"${value.replace(/"/g, '""')}"` : value;
        })).join('\n')
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'brand_orders.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      toast.success('Orders exported successfully!');
    } catch (error) {
      console.error('Error exporting orders:', error);
      toast.error('Failed to export orders.');
    } finally {
      setExportLoading(false);
    }
  };

  // Helper to check if a review exists for an order (to be implemented, or assume orders have a 'reviewed' flag)
  const hasReview = (order: Order) => {
    // Placeholder: implement actual check if review exists for this order
    return !!order.clientFeedback;
  };

  const handleInvoiceClick = (order: Order, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedInvoiceOrder(order);
    setInvoiceModalOpen(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-3 md:mb-0">Your Orders</h2>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="relative">
            <select
              value={filterStatus || 'all'}
              onChange={(e) => setFilterStatus(e.target.value === 'all' ? null : e.target.value)}
              className="appearance-none bg-white border border-gray-300 text-gray-700 py-2 pl-3 pr-8 rounded-md leading-tight focus:outline-none focus:bg-white focus:border-purple-500 text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="delivered">Delivered</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <ChevronDown className="h-4 w-4" />
            </div>
          </div>
          <button
            onClick={exportOrdersCSV}
            disabled={exportLoading}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          >
            {exportLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Export CSV
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
          <p className="ml-3 text-gray-600">Loading orders...</p>
        </div>
      ) : error ? (
        <div className="text-center py-10 text-red-500">
          <AlertCircle className="h-10 w-10 mx-auto mb-3" />
          <p>Error: {error}</p>
        </div>
      ) : paginatedOrders.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <ShoppingBag className="h-10 w-10 mx-auto mb-3" />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('_id')}
                >
                  <div className="flex items-center">
                    Order ID
                    {sortBy === '_id' && (
                      sortOrder === 'asc' ? <ArrowUp className="ml-1 w-3 h-3" /> : <ArrowDown className="ml-1 w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('creator')}
                >
                  <div className="flex items-center">
                    Creator
                    {sortBy === 'creator' && (
                      sortOrder === 'asc' ? <ArrowUp className="ml-1 w-3 h-3" /> : <ArrowDown className="ml-1 w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Package
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('createdAt')} 
                >
                  <div className="flex items-center">
                    Order Date
                    {sortBy === 'createdAt' && (
                      sortOrder === 'asc' ? <ArrowUp className="ml-1 w-3 h-3" /> : <ArrowDown className="ml-1 w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Delivery Date
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('totalAmount')} 
                >
                  <div className="flex items-center">
                    Amount
                    {sortBy === 'totalAmount' && (
                      sortOrder === 'asc' ? <ArrowUp className="ml-1 w-3 h-3" /> : <ArrowDown className="ml-1 w-3 h-3" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Payment Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedOrders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewOrderDetails(order)}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div className="flex items-center">
                      <span className="font-mono text-xs mr-2">{order._id}</span>
                      <button 
                        onClick={(event) => copyOrderId(event, order._id)}
                        className="ml-2 text-gray-400 hover:text-purple-600 transition-colors"
                        title="Copy Order ID"
                      >
                        {copying === order._id ? <Check className="w-3 h-3 text-green-600" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img 
                        className="h-8 w-8 rounded-full mr-2"
                        src={order.creatorImage || '/avatars/placeholder.svg'}
                        alt={order.creatorName || 'Creator'} 
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{order.creatorName || 'N/A'}</p>
                        <p className="text-xs text-gray-500">@{order.creatorUsername || 'N/A'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="capitalize">{order.packageName} ({order.packageType})</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.createdAt ? format(new Date(order.createdAt), 'MMM d, yyyy') : 'N/A'} 
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.deliveryDate ? format(new Date(order.deliveryDate), 'MMM d, yyyy') : 'N/A'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(order.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                      {formatStatus(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                      {order.paymentStatus}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex flex-col space-y-2">
                      <button 
                        onClick={() => handleViewOrderDetails(order)}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        View Details
                      </button>
                      {order.status === 'completed' && (
                        <InvoiceButton
                          onClick={(e) => e && handleInvoiceClick(order, e)}
                          size="sm"
                          className="w-full"
                        />
                      )}
                      {order.status === 'completed' && !hasReview(order) && (
                        <button
                          className="ml-2 px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                          onClick={(e) => {
                            e.stopPropagation();
                            setReviewOrder(order);
                            setReviewModalOpen(true);
                          }}
                        >
                          Leave a Review
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <nav
            className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6"
            aria-label="Pagination"
          >
            <div className="flex-1 flex justify-between sm:justify-end">
              <button
                onClick={() => setPage(prev => Math.max(prev - 1, 1))}
                disabled={page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" /> Previous
              </button>
              <button
                onClick={() => setPage(prev => Math.min(prev + 1, totalPages))}
                disabled={page === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Next <ChevronRight className="w-4 h-4 ml-2" />
              </button>
            </div>
          </nav>
        </div>
      )}
      <BrandReviewModal
        open={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        order={reviewOrder as Order}
        onReviewSubmitted={() => {
          setReviewModalOpen(false);
          setReviewOrder(null);
          // Optionally, refresh orders list here
        }}
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