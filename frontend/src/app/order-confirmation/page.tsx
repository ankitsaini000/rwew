'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, 
  CheckCircle, 
  Calendar, 
  Clock, 
  FileText, 
  MessageSquare,
  Shield,
  Download,
  AlertCircle,
  Copy,
  Check
} from 'lucide-react';
import dayjs from 'dayjs';
import { getOrderWithCreatorDetails, getPaymentByOrderId } from '@/services/api';
import Image from 'next/image';

// Define types for our order data
interface OrderData {
  id: string;
  creatorId: string;
  creatorName: string;
  creatorFirstName?: string;
  creatorLastName?: string;
  creatorUsername: string;
  creatorImage: string;
  creatorCategory: string;
  creatorRating: number;
  creatorReviewCount: number;
  packageName: string;
  packageType?: string;
  packagePrice: string | number;
  packageDetails: string;
  packageDeliveryDays: number;
  packageRevisions: number;
  platformFee: string | number;
  totalAmount: string | number;
  orderDate: string;
  deliveryDate: string;
  status: string;
  packageInfo: {
    deliveryDays: number;
    revisions: number;
    currency: string;
  }
  deliverables?: string[];
  paymentMethod?: string;
  specialInstructions?: string;
  message?: string;
  files?: string[];
  // Payment information
  payment?: {
    transactionId?: string;
    paymentDate?: string;
    cardLast4?: string;
    cardBrand?: string;
    status?: string;
  };
}

const OrderConfirmationContent = () => {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId') || 'unknown';
  const packageType = searchParams?.get('packageType') || 'basic';
  // Get the creatorId from the URL if available
  const creatorId = searchParams?.get('creatorId') || 'creator';
  // Get payment status from URL
  const paymentStatus = searchParams?.get('status') || 'success';
  
  const [isLoading, setIsLoading] = useState(true);
  const [orderData, setOrderData] = useState<OrderData | null>(null);
  const [errorFetching, setErrorFetching] = useState(false);
  const [isMockData, setIsMockData] = useState(false);
  const [copyingId, setCopyingId] = useState(false);

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        // Attempt to fetch real order data from the backend with creator details
        if (orderId !== 'unknown') {
          console.log(`[OrderConfirmation] Attempting to fetch order data for ID: ${orderId}`);
          const response = await getOrderWithCreatorDetails(orderId);
          
          if (response.success && response.data) {
            // Check if this is mock data from development environment
            const isMockDataResponse = response.devMock === true;
            if (isMockDataResponse) {
              console.log('[OrderConfirmation] Using development mock data returned by API');
              setIsMockData(true);
              // Still proceed to process the mock data
            } else {
              console.log('[OrderConfirmation] Successfully fetched REAL order data from API');
              setErrorFetching(false); // Clear any error flags since we got real data
              setIsMockData(false);
            }
            
            // Transform the API response to match our OrderData interface
            const data = response.data;
            
            // Extract creator info from the populated creator field
            const creator = data.creator || {};
            console.log('[OrderConfirmation] Creator data from backend:', creator);
            
            // Ensure status is one of the expected values for the dashboard
            const mapStatus = (status: string) => {
              const statusMap: { [key: string]: string } = {
                'paid': 'pending',
                'confirmed': 'in_progress',
                'completed': 'completed',
                'cancelled': 'cancelled',
                'refunded': 'refunded',
                'pending': 'pending',
                'in_progress': 'in_progress'
              };
              
              return statusMap[status.toLowerCase()] || 'pending';
            };
            
            // Format package price to add currency symbol if it's a number
            const formatPrice = (price: string | number) => {
              if (typeof price === 'number') {
                return `₹${price.toLocaleString('en-IN')}`;
              }
              return price.includes('₹') ? price : `₹${price}`;
            };
            
            console.log('[OrderConfirmation] Processing order data:', data);
            
            // Format dates consistently
            const formattedOrder: OrderData = {
              id: data._id || data.id || orderId,
              creatorId: data.creatorId || data.creator?._id || data.creator || 'unknown',
              creatorName: creator.fullName || creator.name || 'Creator',
              creatorFirstName: creator.fullName ? creator.fullName.split(' ')[0] : creator.name ? creator.name.split(' ')[0] : 'Creator',
              creatorLastName: creator.fullName ? creator.fullName.split(' ').slice(1).join(' ') : creator.name ? creator.name.split(' ').slice(1).join(' ') : '',
              creatorUsername: creator.username || 'creator',
              creatorImage: creator.avatar || 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
              creatorCategory: data.creatorCategory || 'Digital Content',
              creatorRating: data.creatorRating || 4.9,
              creatorReviewCount: data.creatorReviewCount || 217,
              packageType: data.packageType || packageType,
              packageName: data.packageName || `${packageType.toUpperCase()} PACKAGE`,
              packagePrice: formatPrice(data.packagePrice || data.amount || 999),
              packageDetails: data.packageDetails || data.service || 'Package details',
              packageDeliveryDays: data.packageDeliveryDays || 7,
              packageRevisions: data.packageRevisions || 1,
              platformFee: formatPrice(data.platformFee || 50),
              totalAmount: formatPrice(data.totalAmount || 1049),
              orderDate: data.orderDate || data.createdAt || new Date().toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              }),
              deliveryDate: data.deliveryDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
              }),
              status: mapStatus(data.status || 'paid'),
              packageInfo: data.packageInfo || {
                deliveryDays: data.packageDeliveryDays || 7,
                revisions: data.packageRevisions || 1,
                currency: '₹'
              },
              deliverables: data.deliverables || [],
              paymentMethod: data.paymentMethod,
              specialInstructions: data.specialInstructions,
              message: data.message,
              files: data.files
            };
            
            console.log('[OrderConfirmation] Order data processed successfully:', formattedOrder);
            setOrderData(formattedOrder);
            
            // Fetch payment data for the order
            try {
              const paymentResponse = await getPaymentByOrderId(orderId);
              if (paymentResponse.success && paymentResponse.data) {
                const paymentData = paymentResponse.data;
                console.log('[OrderConfirmation] Payment data retrieved:', paymentData);
                
                // Update order data with payment information
                setOrderData(prevData => {
                  if (!prevData) return formattedOrder;
                  
                  return {
                    ...prevData,
                    payment: {
                      transactionId: paymentData.transactionId,
                      paymentDate: new Date(paymentData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric'
                      }),
                      cardLast4: paymentData.cardLast4,
                      cardBrand: paymentData.cardBrand,
                      status: paymentData.status
                    }
                  };
                });
              } else {
                console.log('[OrderConfirmation] No payment data found or error fetching payment:', paymentResponse.error);
              }
            } catch (paymentError) {
              console.error('[OrderConfirmation] Error fetching payment data:', paymentError);
            }
            
            setIsLoading(false);
            return;
          } else if (response.error) {
            // Handle specific error from the API
            console.error(`[OrderConfirmation] API error fetching order: ${response.error}`);
            setErrorFetching(true);
          } else {
            // Generic failure without specific error
            console.error('[OrderConfirmation] API call was successful but returned invalid data');
            setErrorFetching(true);
          }
        } else {
          // orderId is 'unknown'
          console.log('[OrderConfirmation] Using mock data because orderId is unknown');
          setErrorFetching(true);
        }
        
        // Fallback to mock data if any condition above failed
        console.log('Using mock order data as fallback');
        createMockOrderData();
      } catch (error) {
        console.error('Error fetching order data:', error);
        setErrorFetching(true);
        createMockOrderData();
      }
    };
    
    // Function to create mock order data as fallback
    const createMockOrderData = () => {
      // Set mock data flag
      setIsMockData(true);
      
      // Packages configurations
      const packages = {
        basic: {
          name: 'BASIC PROMO',
          price: '₹868',
          description: 'Basic Package Only Laptop-scenes includes Background Music, Logo, and 720HD Video',
          deliveryDays: 14,
          revisions: 1,
          currency: '₹',
          deliverables: [
            "Sponsored Content",
            "Targeted Reach",
            "Dynamic transitions",
            "Background Music",
            "720HD Video",
            "Logo Integration"
          ]
        },
        standard: {
          name: 'STANDARD PROMO',
          price: '₹1,499',
          description: 'Standard Package Laptop and Mobile-scenes includes Background Music, Logo, Basic effects, and 1080 FULL HD',
          deliveryDays: 10,
          revisions: 2,
          currency: '₹',
          deliverables: [
            "Everything in Basic",
            "Laptop & Mobile Scenes",
            "1080 FULL HD Video",
            "Basic Effects",
            "Priority Support",
            "Enhanced Marketing"
          ]
        },
        premium: {
          name: 'PREMIUM PROMO',
          price: '₹2,999',
          description: 'Premium Package Laptop and Mobile-scenes includes Background Music, Logo, Advanced effects, and 4K ULTRA HD',
          deliveryDays: 7,
          revisions: 3,
          currency: '₹',
          deliverables: [
            "Everything in Standard",
            "4K ULTRA HD Video",
            "Advanced Effects",
            "Dedicated Support",
            "Source Files Included",
            "Premium Marketing Strategy"
          ]
        }
      };
      
      const selectedPackage = packages[packageType as keyof typeof packages] || packages.basic;
      
      // Calculate fees based on the package
      const calculateFees = (price: string) => {
        // Remove currency symbol and commas, then parse to number
        const numericPrice = Number(price.replace(/[^0-9.-]+/g, ""));
        return {
          platformFee: Math.round(numericPrice * 0.05).toLocaleString('en-IN'),
          totalAmount: Math.round(numericPrice * 1.05).toLocaleString('en-IN')
        };
      };
      
      const { platformFee, totalAmount } = calculateFees(selectedPackage.price);
      
      // Get creator details - in production this would come from server or API
      // For now, use preset sample data that looks good
      const creatorDetails = {
        id: creatorId,
        name: 'Professional Creator',
        firstName: 'Professional',
        lastName: 'Creator',
        username: creatorId,
        image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80',
        category: 'Digital Content / Marketing',
        rating: 4.9,
        reviewCount: 217,
        location: 'Mumbai, India',
        languages: ['English', 'Hindi'],
        expertise: ['Social Media Content', 'Brand Promotions', 'Video Production'],
        followers: '125K+',
        responseTime: '~2 hours'
      };
      
      // Ensure status is one of the expected values for the dashboard
      const mapStatus = (status: string) => {
        const statusMap: { [key: string]: string } = {
          'paid': 'pending',
          'confirmed': 'in_progress',
          'completed': 'completed',
          'cancelled': 'cancelled',
          'refunded': 'refunded'
        };
        
        return statusMap[status.toLowerCase()] || 'pending';
      };
      
      // Create order confirmation data
      const orderConfirmation: OrderData = {
        id: orderId,
        creatorId: creatorDetails.id,
        creatorName: creatorDetails.name,
        creatorFirstName: creatorDetails.firstName,
        creatorLastName: creatorDetails.lastName,
        creatorUsername: creatorDetails.username,
        creatorImage: creatorDetails.image,
        creatorCategory: creatorDetails.category,
        creatorRating: creatorDetails.rating,
        creatorReviewCount: creatorDetails.reviewCount,
        packageName: selectedPackage.name,
        packagePrice: selectedPackage.price,
        packageDetails: selectedPackage.description,
        packageDeliveryDays: selectedPackage.deliveryDays,
        packageRevisions: selectedPackage.revisions,
        platformFee: `₹${platformFee}`,
        totalAmount: `₹${totalAmount}`,
        orderDate: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        deliveryDate: new Date(Date.now() + selectedPackage.deliveryDays * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        }),
        status: mapStatus('paid'),
        packageInfo: {
          deliveryDays: selectedPackage.deliveryDays,
          revisions: selectedPackage.revisions,
          currency: selectedPackage.currency
        }
      };
      
      setTimeout(() => {
        setOrderData(orderConfirmation);
        setIsLoading(false);
      }, 800);
    };
    
    fetchOrderData();
  }, [orderId, packageType, creatorId]);

  // Function to copy order ID to clipboard
  const copyOrderId = () => {
    if (orderData?.id) {
      navigator.clipboard.writeText(orderData.id).then(() => {
        setCopyingId(true);
        setTimeout(() => setCopyingId(false), 2000);
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-sm">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">Unable to load order details</p>
          <Link href="/">
            <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg">
              Return Home
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // If payment failed, display failure page
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen bg-gray-50 py-10">
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm">Back to Home</span>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-700 p-8 text-white text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                <AlertCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Payment Failed</h1>
              <p className="text-red-100 mb-4">Your payment could not be processed.</p>
            </div>
            
            {/* Error Details */}
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
              
              <div className="bg-red-50 p-4 rounded-lg mb-6">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800 mb-1">Payment Error</h3>
                    <p className="text-sm text-red-700">
                      We couldn&apos;t process your payment. This could be due to insufficient funds, 
                      expired card, or a temporary issue with our payment provider.
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Actions */}
              <div className="space-y-4">
                <p className="text-gray-700">What would you like to do next?</p>
                <div className="flex flex-wrap gap-3">
                  <Link href={`/checkout?packageType=${packageType}&creatorId=${creatorId}`}>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Try Again
                    </button>
                  </Link>
                  <Link href="/dashboard">
                    <button className="bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg">
                      Return to Home
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          
          {/* Need Help Section */}
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our support team is always ready to assist you with any payment issues.
            </p>
            <Link href="/support" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Development mode indicator */}
      {isMockData && process.env.NODE_ENV === 'development' && (
        <div className="bg-red-600 text-white font-bold text-sm text-center py-2 px-4 sticky top-0 z-50">
          <p>⚠️ DEVELOPMENT MODE: Using mock order data instead of real data from the backend</p>
          <p className="text-xs">This is only for development purposes. In production, real data would be displayed.</p>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6 max-w-3xl mx-auto">
          <div className="flex items-start">
            <AlertCircle className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-blue-800 font-medium">
                {errorFetching ? 'Demo Mode' : 'Order Information'}
              </p>
              <p className="text-xs text-blue-700 mt-1">
                {errorFetching 
                  ? 'This is a demonstration page showing mock data. In production, this would show real order details from the database.'
                  : 'Your order details have been successfully retrieved from our system. Thank you for your business!'}
              </p>
            </div>
          </div>
        </div>
        
        <div className="max-w-3xl mx-auto px-4">
          <Link href="/" className="inline-flex items-center text-gray-600 hover:text-purple-600 mb-6 group">
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="text-sm">Back to Home</span>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden mb-8">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-purple-800 p-8 text-white text-center">
              <div className="flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Order Confirmed!</h1>
              <p className="text-purple-100 mb-4">Your order has been placed successfully.</p>
              <div className="inline-block bg-white/20 rounded-full px-4 py-1.5">
                <div className="flex items-center">
                  <p className="text-sm font-medium font-mono text-white">Order ID: {orderData.id}</p>
                  <button 
                    onClick={copyOrderId}
                    className="ml-2 text-white/70 hover:text-white transition-colors"
                    title="Copy Order ID"
                  >
                    {copyingId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Order Details */}
            <div className="p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Details</h2>
              
              {/* Creator Info */}
              <div className="flex items-start sm:items-center flex-col sm:flex-row border-b border-gray-100 pb-6 mb-6">
                <div className="h-16 w-16 rounded-full overflow-hidden mr-4 bg-gray-100 flex-shrink-0">
                  <Image 
                    src={orderData.creatorImage}
                    alt={orderData.creatorName}
                    width={64}
                    height={64}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="mt-4 sm:mt-0">
                  <p className="text-gray-500 text-sm">Creator</p>
                  <h3 className="font-semibold text-gray-900">
                    {orderData.creatorFirstName && orderData.creatorLastName 
                      ? `${orderData.creatorFirstName} ${orderData.creatorLastName}`
                      : orderData.creatorName || `Creator #${orderData.creatorId}`}
                  </h3>
                  <p className="text-sm text-gray-600">@{orderData.creatorUsername}</p>
                  
                  <div className="mt-2">
                    {orderData.creatorCategory && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                        {orderData.creatorCategory}
                      </span>
                    )}
                    
                    <div className="flex items-center mt-2">
                      <div className="flex items-center bg-yellow-50 px-2 py-1 rounded-md mr-2">
                        <span className="text-yellow-500 font-bold mr-1">★ {orderData.creatorRating.toFixed(1)}</span>
                        <span className="text-gray-600 text-sm">Rating</span>
                      </div>
                      <div className="flex items-center bg-gray-50 px-2 py-1 rounded-md">
                        <span className="text-gray-700 font-medium mr-1">{orderData.creatorReviewCount}</span>
                        <span className="text-gray-600 text-sm">Reviews</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Package Info */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <p className="text-gray-500 text-sm mb-1">Service</p>
                <h3 className="font-semibold text-gray-900">{orderData.packageName}</h3>
                <p className="text-sm text-gray-600 mt-1">{orderData.packageDetails}</p>
                
                {/* Package Details */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center bg-gray-50 rounded-md p-2">
                    <Clock className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{orderData.packageDeliveryDays}</span> days delivery
                    </span>
                  </div>
                  <div className="flex items-center bg-gray-50 rounded-md p-2">
                    <CheckCircle className="h-4 w-4 text-purple-600 mr-2" />
                    <span className="text-sm text-gray-700">
                      <span className="font-medium">{orderData.packageRevisions}</span> revision{orderData.packageRevisions > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                
                {/* Display Deliverables if available */}
                {orderData.deliverables && orderData.deliverables.length > 0 && (
                  <div className="mt-4">
                    <p className="text-gray-700 text-sm font-medium mb-2">What&apos;s Included:</p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {orderData.deliverables.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-600">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {/* Display Special Instructions if available */}
                {orderData.specialInstructions && (
                  <div className="mt-4 bg-blue-50 p-3 rounded-md">
                    <p className="text-gray-700 text-sm font-medium mb-1">Special Instructions:</p>
                    <p className="text-sm text-gray-600">{orderData.specialInstructions}</p>
                  </div>
                )}
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <Calendar className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Order Date</p>
                    <p className="font-medium text-gray-900">{orderData.orderDate}</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center mr-3 flex-shrink-0">
                    <Clock className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm">Expected Delivery</p>
                    <p className="font-medium text-gray-900">
                      {(() => {
                        // Calculate estimated delivery date
                        const today = dayjs();
                        const deliveryDate = today.add(orderData.packageDeliveryDays, 'day');
                        return deliveryDate.format('MMMM D, YYYY');
                      })()}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Payment Summary */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <p className="text-gray-500 text-sm mb-4">Payment Summary</p>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="text-gray-900">{orderData.packagePrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform Fee</span>
                    <span className="text-gray-900">{orderData.platformFee}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-100 font-medium">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">{orderData.totalAmount}</span>
                  </div>
                  
                  {/* Payment Method */}
                  <div className="flex justify-between mt-3 pt-2 border-t border-gray-100">
                    <span className="text-gray-600">Payment Method</span>
                    <span className="text-gray-900 capitalize">
                      {orderData.paymentMethod 
                        ? (orderData.paymentMethod === 'bankTransfer' 
                            ? 'Bank Transfer' 
                            : orderData.paymentMethod.charAt(0).toUpperCase() + orderData.paymentMethod.slice(1))
                        : 'Card'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Payment Status */}
              <div className="border-b border-gray-100 pb-6 mb-6">
                <div className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center mr-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Successful</p>
                    <p className="text-sm text-gray-600">
                      Your payment via <span className="font-medium capitalize">
                        {orderData.paymentMethod
                          ? (orderData.paymentMethod === 'bankTransfer'
                              ? 'Bank Transfer'
                              : orderData.paymentMethod.charAt(0).toUpperCase() + orderData.paymentMethod.slice(1))
                          : 'Card'}
                      </span> is secure in escrow and will be released upon completion
                    </p>
                  </div>
                </div>
                
                {/* Payment Transaction Details */}
                {orderData.payment && (
                  <div className="mt-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <h4 className="font-medium text-gray-900 mb-3">Payment Details</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {orderData.payment.transactionId && (
                        <div className="flex items-start">
                          <div className="text-sm">
                            <p className="text-gray-500">Transaction ID</p>
                            <p className="font-medium text-gray-900">{orderData.payment.transactionId}</p>
                          </div>
                        </div>
                      )}
                      
                      {orderData.payment.paymentDate && (
                        <div className="flex items-start">
                          <div className="text-sm">
                            <p className="text-gray-500">Payment Date</p>
                            <p className="font-medium text-gray-900">{orderData.payment.paymentDate}</p>
                          </div>
                        </div>
                      )}
                      
                      {(orderData.payment.cardBrand && orderData.payment.cardLast4) && (
                        <div className="flex items-start">
                          <div className="text-sm">
                            <p className="text-gray-500">Payment Method</p>
                            <p className="font-medium text-gray-900">
                              {orderData.payment.cardBrand} •••• {orderData.payment.cardLast4}
                            </p>
                          </div>
                        </div>
                      )}
                      
                      {orderData.payment.status && (
                        <div className="flex items-start">
                          <div className="text-sm">
                            <p className="text-gray-500">Status</p>
                            <p className="font-medium text-green-600 capitalize">{orderData.payment.status}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Attached Files */}
                {orderData.files && orderData.files.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="font-medium text-gray-900 mb-2">Attached Files</p>
                    <div className="space-y-2">
                      {orderData.files.map((file, index) => (
                        <div key={index} className="flex items-center bg-gray-50 p-2 rounded">
                          <FileText className="h-4 w-4 text-gray-500 mr-2" />
                          <span className="text-sm text-gray-700 truncate flex-1">
                            {typeof file === 'string' ? file.split('/').pop() : 'File ' + (index + 1)}
                          </span>
                          <button className="text-purple-600 hover:text-purple-800" title="Download">
                            <Download className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Message to Creator */}
                {orderData.message && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <p className="font-medium text-gray-900 mb-2">Message to Creator</p>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-600">{orderData.message}</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* What's Next */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
                <div className="space-y-6">
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-4 mt-0.5">
                      1
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Creator Review</p>
                      <p className="text-sm text-gray-600">
                        The creator will review your order details and requirements. You&apos;ll be notified once they begin working on your project.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-4 mt-0.5">
                      2
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">In Progress</p>
                      <p className="text-sm text-gray-600">
                        The creator will work on your promotion content based on your requirements. You can check on progress or send messages anytime.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-600 mr-4 mt-0.5">
                      3
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 mb-1">Delivery & Approval</p>
                      <p className="text-sm text-gray-600">
                        Once completed, the creator will deliver the promotional content for your review. When you&apos;re satisfied, approve to release the payment.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Actions Footer */}
            <div className="bg-gray-50 p-6 flex flex-col sm:flex-row gap-3">
              <Link href="/brand-dashboard?tab=orders" className="w-full sm:w-auto">
                <button className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg flex items-center justify-center">
                  View Order Details
                </button>
              </Link>
              <Link href="/messages" className="w-full sm:w-auto">
                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message Creator
                </button>
              </Link>
              <Link href="/dashboard" className="w-full sm:w-auto">
                <button className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-6 rounded-lg flex items-center justify-center">
                  <FileText className="h-4 w-4 mr-2" />
                  View All Orders
                </button>
              </Link>
            </div>
          </div>
          
          {/* Need Help Section */}
          <div className="bg-white rounded-xl p-5 shadow-sm text-center">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-4">
              <AlertCircle className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Need Help?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our support team is always ready to assist you with any questions about your order.
            </p>
            <Link href="/support" className="text-purple-600 hover:text-purple-800 font-medium text-sm">
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

const OrderConfirmationPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div></div>}>
      <OrderConfirmationContent />
    </Suspense>
  );
};

export default OrderConfirmationPage; 