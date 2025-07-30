"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { LayoutDashboard, Users, FileText, Settings, MessageSquare, Bell, Check, X, DollarSign, Star, Loader2, MessageCircle } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from 'next/navigation';
import api from '../../services/api';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ErrorPopup } from '../../components/ui/ErrorPopup';
import RatingMessage from '../../components/ui/RatingMessage';

// Import components from new locations
import DashboardMetrics from "../../components/DashboardMetrics";
import PerformanceStats from "../../components/creator-dashboard/PerformanceStats";
import OrdersList from "../../components/creator-dashboard/OrdersList";
import RevenueBreakdown from "../../components/creator-dashboard/RevenueBreakdown";
import AccountSettings from "../../components/creator-dashboard/AccountSettings";
import CancelOrderModal from '../../components/creator-dashboard/CancelOrderModal';
import SubmitWorkModal from '../../components/creator-dashboard/SubmitWorkModal';
import QuoteRequestsList from '../../components/creator-dashboard/QuoteRequestsList';
import OrderDetailModal from '../../components/creator-dashboard/OrderDetailModal';
import CreatorReviews from '../../components/creator-dashboard/CreatorReviews';
import CreatorVerifications from '../../components/creator-dashboard/CreatorVerifications';
import ProfileCompletionButton from '../../components/creator-dashboard/ProfileCompletionButton';
import { Order } from '@/types/order';

// Order status type for TypeScript
type OrderStatus = 'pending' | 'in_progress' | 'delivered' | 'completed' | 'cancelled';

// CreatorMetrics interface
interface CreatorMetrics {
  followers: number;
  totalEarnings: number;
  completedProjects: number;
  responseRate: number;
  tierProgress: number;
  dashboardImpressions: number;
  monthlyGrowth: {
    followers: number;
    earnings: number;
    projects: number;
  };
}

// PerformanceData interface
interface PerformanceData {
  views: number[];
  likes: number[];
  messages: number[];
  earnings: number[];
  dates: string[];
}

export default function CreatorDashboardPage() {
  const [username, setUsername] = useState<string | null>(null);
  const [creatorId, setCreatorId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  // Get initial tab from URL or default to 'overview'
  const initialTab = searchParams?.get('tab') || 'overview';
  const [activeTab, setActiveTab] = useState(initialTab);
  
  // Error handling
  const { 
    showErrorPopup, 
    errorMessage, 
    errorTitle, 
    handleError, 
    closeErrorPopup 
  } = useErrorHandler({ showPopup: true });
  
  // State for data
  const [creatorMetrics, setCreatorMetrics] = useState<CreatorMetrics | null>(null);
  
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    views: [],
    likes: [],
    messages: [],
    earnings: [],
    dates: []
  });
  
  const [bankAccounts, setBankAccounts] = useState<any[]>([
    { id: 1, type: 'bank', name: 'Primary Account', bank: 'Chase Bank', number: '****3456', isDefault: false },
  ]);
  
  const [messages, setMessages] = useState<Array<{
    id: string;
    senderName: string;
    senderImg: string | null;
    date: string;
    preview: string;
    unread: boolean;
    conversationId: string;
  }>>([]);

  const [orders, setOrders] = useState<Order[]>([]);
  
  // Rating state
  const [creatorRating, setCreatorRating] = useState<number>(0);
  const [reviewCount, setReviewCount] = useState<number>(0);
  
  const [promotionRevenueData, setPromotionRevenueData] = useState([
    { type: 'Product Launch', amount: 8550, color: '#8B5CF6', transactions: 12 },
    { type: 'Brand Awareness', amount: 6720, color: '#6366F1', transactions: 8 },
    { type: 'Product Review', amount: 12480, color: '#3B82F6', transactions: 15 },
    { type: 'Seasonal Campaign', amount: 4250, color: '#EC4899', transactions: 5 },
    { type: 'Influencer Takeover', amount: 3800, color: '#F59E0B', transactions: 3 }
  ]);
  
  const [monthlyRevenueData, setMonthlyRevenueData] = useState([
    { month: 'Jan', revenue: 2850 },
    { month: 'Feb', revenue: 3200 },
    { month: 'Mar', revenue: 4100 },
    { month: 'Apr', revenue: 3600 },
    { month: 'May', revenue: 5200 },
    { month: 'Jun', revenue: 4800 }
  ]);
  
  // For analytics display
  const completedOrdersCount = orders.filter(order => order.status === 'completed').length;

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [acceptingOrder, setAcceptingOrder] = useState<string | null>(null);
  const [rejectingOrder, setRejectingOrder] = useState<string | null>(null);
  const [orderMessage, setOrderMessage] = useState<{id: string, type: 'success' | 'error', message: string} | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellingOrder, setCancellingOrder] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  // State for Submit Work Modal
  const [showSubmitWorkModal, setShowSubmitWorkModal] = useState(false);
  const [submittingOrder, setSubmittingOrder] = useState<Order | null>(null);
  const [isSubmittingWork, setIsSubmittingWork] = useState(false);

  // Update tab in URL when activeTab changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (activeTab === 'overview') {
        params.delete('tab');
      } else {
        params.set('tab', activeTab);
      }
      const newUrl = `${window.location.pathname}${params.toString() ? `?${params.toString()}` : ''}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, [activeTab]);

  // Fetch bank accounts from backend
  const fetchBankAccounts = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    const response = await fetch(`${API_BASE_URL}/creator-bank-accounts`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (response.ok) {
      const data = await response.json();
      setBankAccounts(data.data || []);
    }
  };

  useEffect(() => {
    fetchBankAccounts();
  }, []);

  // Function to handle adding a bank account
  const handleAddBankAccount = async (accountData: any) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('You must be logged in to add a bank account.');
      return;
    }

    const payload = {
      accountHolderName: accountData.accountHolderName,
      bankName: accountData.bankName,
      accountNumber: accountData.accountNumber,
      ifscOrSwift: accountData.ifscOrSwift,
      branch: accountData.branch,
      accountType: accountData.accountType,
      isDefault: accountData.isDefault
    };

    // Check for missing fields before sending
    const keys = Object.keys(payload) as (keyof typeof payload)[];
    for (const key of keys) {
      if (payload[key] === '' || payload[key] === undefined) {
        alert(`Please fill out the ${key} field.`);
        return;
      }
    }

    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/creator-bank-accounts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add bank account');
      }

      alert('Bank account added successfully!');
      await fetchBankAccounts();
    } catch (error: any) {
      alert(error.message || 'Failed to add bank account');
    }
  };
  
  // Handle API response errors with appropriate messages
  const handleApiError = (status: number, message: string) => {
    let errorMsg = '';
    
    switch (status) {
      case 401:
        errorMsg = 'Authentication failed. Please log in again.';
        // Optionally redirect to login page
        break;
      case 403:
        errorMsg = 'You do not have permission to access this data.';
        break;
      case 404:
        errorMsg = 'Dashboard data not found. You may need to complete your profile first.';
        break;
      case 500:
        errorMsg = 'Server error. Please try again later.';
        break;
      default:
        errorMsg = message || 'An error occurred while fetching data.';
    }
    
    setError(errorMsg);
    console.error(`API Error (${status}): ${errorMsg}`);
    return errorMsg;
  };

  // Function to fetch dashboard data
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

      // First sync metrics from creator profile to CreatorMetrics collection
      console.log('Syncing creator metrics...');
      const syncResponse = await fetch(`${API_BASE_URL}/creators/sync-metrics`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (!syncResponse.ok) {
        const errorData = await syncResponse.json().catch(() => null);
        console.error('Failed to sync metrics:', errorData);
        throw new Error(errorData?.message || 'Failed to sync metrics');
      }

      const syncData = await syncResponse.json();
      console.log('Sync metrics response:', syncData);

      // Fetch orders with work submissions
      console.log('Fetching orders...');
      const ordersResponse = await fetch(`${API_BASE_URL}/orders`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Orders response status:', ordersResponse.status);
      const ordersData = await ordersResponse.json();
      console.log('Raw orders data:', ordersData);

      if (!ordersResponse.ok) {
        throw new Error(ordersData.message || 'Failed to fetch orders');
      }

      if (ordersData.success && ordersData.data) {
        const formattedOrders = ordersData.data.map((order: any) => ({
          _id: order._id,
          orderID: order.orderID,
          brandId: order.brandId,
          creatorId: order.creatorId,
          creatorName: order.creatorName,
          creatorUsername: order.creatorUsername,
          creatorImage: order.creatorImage,
          service: order.service,
          platform: order.platform,
          packageType: order.packageType,
          packageName: order.packageName,
          packagePrice: order.packagePrice,
          totalAmount: order.totalAmount ?? order.amount ?? 0,
          platformFee: order.platformFee,
          currency: order.currency,
          status: order.status,
          paymentStatus: order.paymentStatus,
          paymentMethod: order.paymentMethod,
          transactionId: order.transactionId,
          paymentDate: order.paymentDate,
          createdAt: order.createdAt ?? order.date ?? new Date().toISOString(),
          updatedAt: order.updatedAt,
          deliveryDate: order.deliveryDate,
          description: order.description,
          deliverables: order.deliverables,
          submittedWork: order.submittedWork,
          clientFeedback: order.clientFeedback,
          promotionType: order.promotionType,
          statusHistory: order.statusHistory,
          specialInstructions: order.specialInstructions,
          message: order.message,
          files: order.files,
        }));
        setOrders(formattedOrders);
      } else {
        console.error('Invalid orders data format:', ordersData);
        setOrders([]);
      }

      // Fetch dashboard data
      console.log('Fetching dashboard data...');
      const dashboardResponse = await fetch(`${API_BASE_URL}/creators/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      console.log('Dashboard response status:', dashboardResponse.status);
      const dashboardData = await dashboardResponse.json();
      console.log('Dashboard data:', dashboardData);

      if (!dashboardResponse.ok) {
        throw new Error(dashboardData.message || 'Failed to fetch dashboard data');
      }

      if (dashboardData.success && dashboardData.data) {
        const { metrics, revenueByPromotion } = dashboardData.data;

        // Update metrics
        if (metrics) {
          setCreatorMetrics(metrics);
          
          // Handle performance data from metrics
          if (metrics.performanceData) {
            const performanceData = {
              views: metrics.performanceData.views || [],
              likes: metrics.performanceData.likes || [],
              messages: metrics.performanceData.messages || [],
              earnings: metrics.performanceData.earnings || [],
              dates: metrics.performanceData.dates || []
            };
            console.log('Setting performance data:', performanceData);
            setPerformanceData(performanceData);
          }
        }
        
        if (revenueByPromotion) {
          setPromotionRevenueData(revenueByPromotion);
        }
        
        if (dashboardData.data.revenueByMonth) {
          setMonthlyRevenueData(dashboardData.data.revenueByMonth);
        }
        
        // Try to extract creatorId from dashboard response if not already set
        if (!creatorId && dashboardData.data.userId) {
          console.log('[CreatorDashboard] Setting creatorId from dashboard response:', dashboardData.data.userId);
          setCreatorId(dashboardData.data.userId);
        }
      }

      setError(null);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      // Use the custom error handler for resource not found errors
      handleError(error, 'Dashboard Connection Issue', 'Some dashboard resources couldn\'t be loaded. This won\'t affect your main functionality.');
      setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Add fetchMessages function
  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch messages');
      }

      const data = await response.json();
      
      // Transform the conversations data into the format we need
      const formattedMessages = data.map((conversation: any) => ({
        id: conversation._id,
        senderName: conversation.otherUser.fullName,
        senderImg: conversation.otherUser.avatar || null,
        date: conversation.lastMessage?.createdAt || conversation.updatedAt,
        preview: conversation.lastMessage?.content || 'No messages yet',
        unread: conversation.unreadCount > 0,
        conversationId: conversation._id
      }));

      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use the custom error handler for resource not found errors
      handleError(error, 'Messages Connection Issue', 'Some message data couldn\'t be loaded. This won\'t affect your main dashboard functionality.');
    }
  };

  // Function to fetch creator rating data
  const fetchRatingData = async () => {
    if (!creatorId) return;
    
    try {
      const { getCreatorReviewsDirect } = await import('../../services/api');
      const data = await getCreatorReviewsDirect(creatorId, 1);
      
      setCreatorRating(data.averageRating || 0);
      setReviewCount(data.totalReviews || 0);
    } catch (error) {
      console.error('Error fetching rating data:', error);
      // Use the custom error handler for resource not found errors
      handleError(error, 'Rating Data Connection Issue', 'Some rating data couldn\'t be loaded. This won\'t affect your main dashboard functionality.');
    }
  };

  // Function to get current user ID from backend
  const getCurrentUserId = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/users/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });

      if (response.ok) {
        const userData = await response.json();
        console.log('[CreatorDashboard] Current user data from backend:', userData);
        if (userData.data && userData.data._id) {
          console.log('[CreatorDashboard] Setting creatorId from backend:', userData.data._id);
          setCreatorId(userData.data._id);
          return userData.data._id;
        } else if (userData._id) {
          console.log('[CreatorDashboard] Setting creatorId from backend (direct):', userData._id);
          setCreatorId(userData._id);
          return userData._id;
        }
      }
    } catch (error) {
      console.error('[CreatorDashboard] Error getting current user ID:', error);
      // Use the custom error handler for resource not found errors
      handleError(error, 'User Data Connection Issue', 'Some user data couldn\'t be loaded. This won\'t affect your main dashboard functionality.');
    }
    return null;
  };

  // Add fetchMessages to the useEffect
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Get username from localStorage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          // Try to extract username from user object
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              console.log('[CreatorDashboard] ===== USER DATA DEBUG =====');
              console.log('[CreatorDashboard] Raw user data:', userData);
              console.log('[CreatorDashboard] Parsed user object:', user);
              console.log('[CreatorDashboard] User keys:', Object.keys(user));
              console.log('[CreatorDashboard] User _id:', user._id);
              console.log('[CreatorDashboard] User id:', user.id);
              console.log('[CreatorDashboard] User userId:', user.userId);
              console.log('[CreatorDashboard] ===== USER DATA DEBUG END =====');
              
              const name = user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : null);
              if (name) {
                setUsername(name);
                try {
                  localStorage.setItem('username', name);
                } catch (storageError) {
                  console.warn('Could not store username in localStorage:', storageError);
                }
              }
              
              // Extract creator ID from user data - try multiple possible fields
              const possibleIdFields = ['_id', 'id', 'userId'];
              let foundId = null;
              
              for (const field of possibleIdFields) {
                if (user[field]) {
                  foundId = user[field];
                  console.log(`[CreatorDashboard] Found ID in field '${field}':`, foundId);
                  break;
                }
              }
              
              if (foundId) {
                console.log('[CreatorDashboard] Setting creatorId:', foundId);
                setCreatorId(foundId);
              } else {
                console.log('[CreatorDashboard] No ID found in user data. Available fields:', Object.keys(user));
              }
            }
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
        
        // Fetch dashboard data and messages
        fetchDashboardData();
        fetchMessages();
        
        // If creatorId is still not set, try to get it from backend
        if (!creatorId) {
          console.log('[CreatorDashboard] CreatorId not found in localStorage, trying backend...');
          getCurrentUserId();
        }
      } catch (browserStorageError) {
        console.error('Error accessing localStorage:', browserStorageError);
        // Still try to fetch dashboard data even if localStorage access fails
        fetchDashboardData();
        fetchMessages();
      }
    }
  }, []);

  // Additional useEffect to handle creatorId changes
  useEffect(() => {
    if (!creatorId) {
      console.log('[CreatorDashboard] CreatorId is null, trying to get from backend...');
      getCurrentUserId();
    } else {
      console.log('[CreatorDashboard] CreatorId is set:', creatorId);
      // Fetch rating data when creatorId is available
      fetchRatingData();
    }
  }, [creatorId]);

  // Handle accepting an order
  const handleAcceptOrder = async (orderId: string) => {
    setAcceptingOrder(orderId);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/creators/orders/${orderId}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept order');
      }

      const result = await response.json();
      console.log('Order acceptance response:', result);
      
      // Update the order status in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'in_progress' } 
            : order
        )
      );

      setOrderMessage({
        id: orderId,
        type: 'success',
        message: 'Order accepted successfully! It has been moved to "In Progress".'
      });

      // Close the order detail modal if open
      setShowOrderDetail(false);
      setSelectedOrder(null);

      // Refresh orders after accepting
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Error accepting order:', error);
      setOrderMessage({
        id: orderId,
        type: 'error',
        message: error.message || 'Failed to accept order. Please try again.'
      });
    } finally {
      setAcceptingOrder(null);
      // Auto-dismiss the message after 5 seconds
      setTimeout(() => setOrderMessage(null), 5000);
    }
  };

  // Handle rejecting an order with reason
  const handleRejectOrder = async (orderId: string, reason: string) => {
    setCancellingOrder(orderId);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
      const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reject order');
      }

      const result = await response.json();
      console.log('Order rejection response:', result);
      
      // Update the order status in the local state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order._id === orderId 
            ? { ...order, status: 'cancelled' } 
            : order
        )
      );

      setOrderMessage({
        id: orderId,
        type: 'success',
        message: 'Order cancelled successfully.'
      });

      // Close the modals
      setShowCancelModal(false);
      setShowOrderDetail(false);
      setSelectedOrder(null);

      // Refresh orders after rejecting
      await fetchDashboardData();
    } catch (error: any) {
      console.error('Error rejecting order:', error);
      setOrderMessage({
        id: orderId,
        type: 'error',
        message: error.message || 'Failed to cancel order. Please try again.'
      });
    } finally {
      setCancellingOrder(null);
      // Auto-dismiss the message after 5 seconds
      setTimeout(() => setOrderMessage(null), 5000);
    }
  };

  // Handle viewing order details
  const handleViewOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowOrderDetail(true);
  };

  // Handle closing order details
  const handleCloseOrderDetails = () => {
    setShowOrderDetail(false);
    setSelectedOrder(null);
  };

  // Load user data and fetch dashboard data on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        // Get username from localStorage
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
          setUsername(storedUsername);
        } else {
          // Try to extract username from user object
          try {
            const userData = localStorage.getItem('user');
            if (userData) {
              const user = JSON.parse(userData);
              console.log('[CreatorDashboard] ===== USER DATA DEBUG =====');
              console.log('[CreatorDashboard] Raw user data:', userData);
              console.log('[CreatorDashboard] Parsed user object:', user);
              console.log('[CreatorDashboard] User keys:', Object.keys(user));
              console.log('[CreatorDashboard] User _id:', user._id);
              console.log('[CreatorDashboard] User id:', user.id);
              console.log('[CreatorDashboard] User userId:', user.userId);
              console.log('[CreatorDashboard] ===== USER DATA DEBUG END =====');
              
              const name = user.username || (user.name ? user.name.toLowerCase().replace(/\s+/g, '_') : null);
              if (name) {
                setUsername(name);
                try {
                  localStorage.setItem('username', name);
                } catch (storageError) {
                  console.warn('Could not store username in localStorage:', storageError);
                }
              }
              
              // Extract creator ID from user data - try multiple possible fields
              const possibleIdFields = ['_id', 'id', 'userId'];
              let foundId = null;
              
              for (const field of possibleIdFields) {
                if (user[field]) {
                  foundId = user[field];
                  console.log(`[CreatorDashboard] Found ID in field '${field}':`, foundId);
                  break;
                }
              }
              
              if (foundId) {
                console.log('[CreatorDashboard] Setting creatorId:', foundId);
                setCreatorId(foundId);
              } else {
                console.log('[CreatorDashboard] No ID found in user data. Available fields:', Object.keys(user));
              }
            }
          } catch (err) {
            console.error('Error parsing user data:', err);
          }
        }
        
        // Fetch dashboard data
        fetchDashboardData();
      } catch (browserStorageError) {
        console.error('Error accessing localStorage:', browserStorageError);
        // Still try to fetch dashboard data even if localStorage access fails
        fetchDashboardData();
      }
    }
  }, []);

  // Add handleMessageClick function
  const handleMessageClick = (conversationId: string) => {
    router.push(`/messages?conversation=${conversationId}`);
  };

  // Function to render tab content
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
            <DashboardMetrics />
            {creatorId && creatorRating > 0 && (
              <RatingMessage
                rating={creatorRating}
                reviewCount={reviewCount}
                title="Your Creator Rating"
                variant="creator"
                className="mb-6"
              />
            )}
            <PerformanceStats performanceData={performanceData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <QuoteRequestsList title="Recent Quote Requests" showAllLink={true} limit={1} />
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
                    <Link
                      href="/messages"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View All
                    </Link>
                  </div>
                  {messages.length === 0 ? (
                    <div className="text-center py-8">
                      <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No messages yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.slice(0, 5).map((message) => (
                        <div
                          key={message.id}
                          onClick={() => handleMessageClick(message.conversationId)}
                          className="flex items-start space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {message.senderImg ? (
                                <img
                                  src={message.senderImg}
                                  alt={message.senderName}
                                  className="w-10 h-10 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-500 text-lg">
                                  {message.senderName.charAt(0)}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-gray-900">
                                {message.senderName}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(message.date).toLocaleDateString()}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500 truncate">{message.preview}</p>
                          </div>
                          {message.unread && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center justify-center w-2 h-2 rounded-full bg-blue-600"></span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <OrdersList 
              orders={orders} 
              title="Recent Orders" 
              showAllLink={true}
              limit={4}
              onViewDetails={handleViewOrderDetails}
              onAcceptOrder={handleAcceptOrder}
              onCancelOrder={handleRejectOrder}
              onSubmitWorkClick={handleOpenSubmitWorkModal}
              acceptingOrder={acceptingOrder}
              cancellingOrder={cancellingOrder}
              orderMessage={orderMessage}
            />
            {creatorId && (
              <CreatorReviews 
                creatorId={creatorId} 
                title="Recent Reviews"
                showAllLink={true}
                limit={3}
              />
            )}
            {!creatorId && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
                </div>
                <div className="text-center py-8">
                  <p className="text-gray-500">Debug: Creator ID not available</p>
                  <p className="text-sm text-gray-400 mt-1">creatorId: {creatorId}</p>
                  <p className="text-sm text-gray-400 mt-1">Please check if you are logged in as a creator</p>
                  <div className="mt-4 p-3 bg-gray-50 rounded text-left">
                    <p className="text-xs text-gray-600">Debug Info:</p>
                    <p className="text-xs text-gray-600">Token exists: {typeof window !== 'undefined' ? !!localStorage.getItem('token') : 'N/A'}</p>
                    <p className="text-xs text-gray-600">User exists: {typeof window !== 'undefined' ? !!localStorage.getItem('user') : 'N/A'}</p>
                    <p className="text-xs text-gray-600">Username: {username}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      case 'orders':
        console.log('Orders data passed to OrdersList:', orders.map(order => ({ _id: order._id, orderID: order.orderID, status: order.status })));
        return (
          <OrdersList
            orders={orders}
            title="All Orders"
            showAllLink={false}
            onViewDetails={handleViewOrderDetails}
            onAcceptOrder={handleAcceptOrder}
            onCancelOrder={handleRejectOrder}
            onSubmitWorkClick={handleOpenSubmitWorkModal}
            acceptingOrder={acceptingOrder}
            cancellingOrder={cancellingOrder}
            orderMessage={orderMessage}
          />
        );
      case 'quote-requests':
        return <QuoteRequestsList />;
      case 'reviews':
        return (
          <div className="space-y-6">
            {creatorId ? (
              <CreatorReviews 
                creatorId={creatorId} 
                title="All Reviews"
                showAllLink={true}
                limit={10}
              />
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <div className="text-center py-8">
                  <Star className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">Loading creator information...</p>
                </div>
              </div>
            )}
          </div>
        );
      case 'analytics':
        return (
          <div className="space-y-6">
            <PerformanceStats performanceData={performanceData} />
            <RevenueBreakdown 
              promotionRevenueData={promotionRevenueData}
              monthlyRevenueData={monthlyRevenueData}
              totalLastMonth={4500}
            />
            
            {/* Additional analytics content */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Key Metrics Summary</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <Users className="w-4 h-4 text-blue-600 mr-1" />
                    <h4 className="text-sm font-medium text-gray-700">Audience Growth</h4>
                  </div>
                  <p className="text-xl font-bold text-gray-900">+{creatorMetrics?.monthlyGrowth?.followers || 0}%</p>
                  <p className="text-xs text-gray-500 mt-1">vs. last month</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                    <h4 className="text-sm font-medium text-gray-700">Revenue Growth</h4>
                  </div>
                  <p className="text-xl font-bold text-gray-900">+{creatorMetrics?.monthlyGrowth?.earnings || 0}%</p>
                  <p className="text-xs text-gray-500 mt-1">vs. last month</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <Check className="w-4 h-4 text-purple-600 mr-1" />
                    <h4 className="text-sm font-medium text-gray-700">Completion Rate</h4>
                  </div>
                  <p className="text-xl font-bold text-gray-900">98.2%</p>
                  <p className="text-xs text-gray-500 mt-1">of projects delivered on time</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-1">
                    <Star className="w-4 h-4 text-yellow-500 mr-1" />
                    <h4 className="text-sm font-medium text-gray-700">Average Rating</h4>
                  </div>
                  <p className="text-xl font-bold text-gray-900">4.9</p>
                  <p className="text-xs text-gray-500 mt-1">from {completedOrdersCount} reviews</p>
                </div>
              </div>
            </div>
          </div>
        );
      case 'verifications':
        return (
          <CreatorVerifications />
        );
      case 'settings':
        return <AccountSettings bankAccounts={bankAccounts} onAddBankAccount={handleAddBankAccount} onDeleteBankAccount={handleDeleteBankAccount} onEditBankAccount={handleEditBankAccount} />;
      default:
        return <div>Unknown tab</div>;
    }
  };

  // Navigation items
  const navItems = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'orders', label: 'Orders', icon: <FileText className="w-5 h-5" /> },
    { id: 'quote-requests', label: 'Quote Requests', icon: <MessageCircle className="w-5 h-5" /> },
    { id: 'reviews', label: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <Users className="w-5 h-5" /> },
    { id: 'verifications', label: 'Verifications', icon: <Check className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  // Handle submitting work for approval
  const handleSubmitWork = async (orderId: string, description: string, files: File[]) => {
    try {
      setIsSubmittingWork(true);
      const formData = new FormData();
      formData.append('description', description);
      files.forEach(file => {
        formData.append('files', file);
      });

      const response = await api.put(
        `/orders/${orderId}/submit-work`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      if (response.data) {
        // Update the orders list with the new submission
        setOrders(prevOrders => 
          prevOrders.map(order => 
            order._id === orderId 
              ? { 
                  ...order, 
                  status: 'delivered',
                  submittedWork: {
                    _id: response.data.submittedWork?._id || '', // <-- add this line
                    description: description,
                    files: response.data.files,
                    status: 'pending',
                    submittedAt: new Date().toISOString()
                  }
                }
              : order
          )
        );
        setSubmittingOrder(null);
        setShowSubmitWorkModal(false);

        // Show success message
        setOrderMessage({
          id: orderId,
          type: 'success',
          message: 'Work submitted successfully! Waiting for client approval.'
        });
      }
    } catch (error) {
      console.error('Error submitting work:', error);
      setOrderMessage({
        id: orderId,
        type: 'error',
        message: 'Failed to submit work. Please try again.'
      });
    } finally {
      setIsSubmittingWork(false);
      // Auto-dismiss the message after 5 seconds
      setTimeout(() => setOrderMessage(null), 5000);
    }
  };

  // Handle opening the submit work modal
  const handleOpenSubmitWorkModal = (order: Order) => {
    setSubmittingOrder(order);
    setShowSubmitWorkModal(true);
  };

  // Handle closing the submit work modal
  const handleCloseSubmitWorkModal = () => {
    setShowSubmitWorkModal(false);
    setSubmittingOrder(null);
  };

  // Add a function to handle work submission status updates
  const handleWorkSubmissionStatusUpdate = (orderId: string, status: 'approved' | 'rejected', rejectionReason?: string) => {
    setOrders(prevOrders => 
      prevOrders.map(order => 
        order._id === orderId 
          ? { 
              ...order, 
              status: status === 'approved' ? 'completed' : 'in_progress',
              submittedWork: order.submittedWork ? {
                ...order.submittedWork,
                status,
                rejectionReason
              } : undefined
            }
          : order
      )
    );

    // Show appropriate message
    setOrderMessage({
      id: orderId,
      type: status === 'approved' ? 'success' : 'error',
      message: status === 'approved' 
        ? 'Work approved! Payment has been processed.'
        : `Work rejected: ${rejectionReason || 'No reason provided'}`
    });

    // Auto-dismiss the message after 5 seconds
    setTimeout(() => setOrderMessage(null), 5000);
  };

  // Impression tracking: send impression when dashboard loads
  useEffect(() => {
    if (creatorId && typeof window !== 'undefined' && !sessionStorage.getItem('dashboardImpressionSent')) {
      fetch(process.env.NEXT_PUBLIC_API_URL + '/creators/dashboard-impression', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ creatorId })
      }).then(() => {
        sessionStorage.setItem('dashboardImpressionSent', 'true');
      }).catch((err) => {
        console.error('Failed to record dashboard impression:', err);
      });
    }
  }, [creatorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const handleDeleteBankAccount = async (id: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    await fetch(`${API_BASE_URL}/creator-bank-accounts/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    await fetchBankAccounts();
  };

  const handleEditBankAccount = async (account: any) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';
    await fetch(`${API_BASE_URL}/creator-bank-accounts/${account._id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(account)
    });
    await fetchBankAccounts();
  };

  return (
    <DashboardLayout>
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 md:mb-8">
          <div>
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Creator Dashboard</h1>
            <p className="text-gray-500 mt-1 text-sm md:text-base">Welcome back, {username || 'Creator'}</p>
          </div>
          <div className="mt-3 md:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 w-full md:w-auto">
            <Link
              href="/messages"
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Messages
            </Link>
            <Link
              href="/creator-profile-edit"
              className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Edit Profile
            </Link>
          </div>
        </div>
        {/* Error message display */}
        {error && (
          <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 text-red-800 px-2 sm:px-4 py-2 sm:py-3 rounded-md flex items-start">
            <div className="text-red-600 mr-3 flex-shrink-0 pt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div>
              <p className="font-medium">{error}</p>
              <button 
                onClick={() => {setError(null); fetchDashboardData();}}
                className="text-sm text-red-600 hover:text-red-800 mt-1 font-medium"
              >
                Try again
              </button>
            </div>
          </div>
        )}
        
        {/* Profile Completion Button */}
        <ProfileCompletionButton />
        
        {/* Navigation Tabs */}
        <div className="border-b border-gray-200 mb-4 sm:mb-6">
          <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`$ {
                  activeTab === item.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } flex items-center py-2 sm:py-4 px-1 border-b-2 font-medium text-sm`}
              >
                <span className="mr-2">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>
        {/* Tab Content */}
        <div className="space-y-4 sm:space-y-6">
          {renderTabContent()}
        </div>
      </div>
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal
          open={showOrderDetail}
          order={selectedOrder}
          onClose={handleCloseOrderDetails}
          onAcceptOrder={handleAcceptOrder}
          onCancelOrder={handleRejectOrder}
          acceptingOrder={acceptingOrder}
          cancellingOrder={cancellingOrder}
        />
      )}

      {showCancelModal && selectedOrder && (
        <CancelOrderModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onCancel={(reason) => handleRejectOrder(selectedOrder._id, reason)}
          orderId={selectedOrder._id}
          isCancelling={cancellingOrder === selectedOrder._id}
        />
      )}

      {showSubmitWorkModal && submittingOrder && (
        <SubmitWorkModal
          isOpen={showSubmitWorkModal}
          onClose={handleCloseSubmitWorkModal}
          onSubmit={async (orderId, description, files) => {
            setIsSubmittingWork(true);
            try {
              await handleSubmitWork(orderId, description, files);
            } finally {
              setIsSubmittingWork(false);
            }
          }}
          orderId={submittingOrder._id}
          isSubmitting={isSubmittingWork}
          onSuccess={(data) => {
            setOrders(prevOrders => 
              prevOrders.map(order => 
                order._id === submittingOrder._id 
                  ? { ...order, status: 'delivered', submittedWork: data }
                  : order
              )
            );
            setSubmittingOrder(null);
          }}
        />
      )}

      {/* Error Popup */}
      <ErrorPopup
        isOpen={showErrorPopup}
        onClose={closeErrorPopup}
        title={errorTitle}
        message={errorMessage}
        showRetry={false}
      />
    </DashboardLayout>
  );
} 