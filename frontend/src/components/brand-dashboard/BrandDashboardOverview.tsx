"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard, Users, FileText, Mail, Settings, 
  CreditCard, Calendar, CheckCircle, DollarSign, MapPin,
  Phone, Star, ShoppingBag, Clock, Award, TrendingUp,
  Shield, Zap, Bell, ChevronRight, ChevronDown, Briefcase,
  MessageSquare, BadgeCheck, Globe, UserCheck, Gift,
  Image as ImageIcon, Activity, Eye, Heart, ThumbsUp, AlertCircle, X, Plus,
  ChevronLeft as ChevronLeftIcon, Megaphone, Pencil
} from "lucide-react";
import RecentOrders from "./RecentOrders";
import { useRouter } from "next/navigation";
import BrandReviewModal from './BrandReviewModal';
import { getReviewByOrderId, getBrandPromotions, getPromotionApplications, getBrandExperienceReviews } from '../../services/api';
import WorkSubmissions from './WorkSubmissions';
import WorkSubmissionModal from './WorkSubmissionModal';
import BrandQuoteRequests from './BrandQuoteRequests';
import API from '../../services/api';
import RatingMessage from '../ui/RatingMessage';

const formatTimeAgo = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return date.toLocaleDateString();
};

interface Message {
  _id: string;
  content: string;
  sender: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
  createdAt: string;
  read: boolean;
}

interface Conversation {
  _id: string;
  otherUser: {
    _id: string;
    fullName: string;
    avatar?: string;
    username?: string;
    email?: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

interface BrandDashboardOverviewProps {
  brandName: string | null;
  setActiveTab: (tab: string) => void;
  memberSince: string;
  totalSpent: number;
  brandRating: number;
  completedOrders: number;
  pendingOrders: number;
  loadingStats: boolean;
  accountStatus: {
    email: boolean;
    phone: boolean;
    pan: boolean;
    gst: boolean;
    idProof: boolean;
    payment: {
      upi: boolean;
      card: boolean;
    };
  };
  topCreators: Array<{
    id: number | string;
    name: string;
    username: string;
    avatar: string;
    category: string;
    rating: number;
    engagement: string;
    completedProjects: number;
    profileUrl?: string;
  }>;
  fetchingCreators?: boolean;
  recentOrders: Array<{
    id: string;
    creator: string;
    service: string;
    date: string;
    amount: number;
    status: string;
    rating: number | null;
    creatorRating: number | null;
    feedback: string;
  }>;
  recentMessages: Conversation[];
  loadingMessages: boolean;
  setSelectedOrder: (order: any) => void;
  setShowOrderDetail: (show: boolean) => void;
  setReplyingTo: (id: number | null) => void;
  replyingTo: number | null;
  replyText: string;
  setReplyText: (text: string) => void;
  handleSendReply: (id: number) => void;
  setShowPromotionModal: (show: boolean) => void;
  workSubmissions?: any[];
  onApproveSubmission?: (id: string) => void;
  onRejectSubmission?: (id: string, reason: string) => void;
  onReleasePayment?: (id: string) => void;
}

export default function BrandDashboardOverview({ 
  brandName, 
  setActiveTab, 
  memberSince, 
  totalSpent, 
  brandRating, 
  completedOrders, 
  pendingOrders,
  loadingStats,
  accountStatus,
  topCreators,
  fetchingCreators,
  recentOrders,
  recentMessages,
  loadingMessages,
  setSelectedOrder,
  setShowOrderDetail,
  setReplyingTo,
  replyingTo,
  replyText,
  setReplyText,
  handleSendReply,
  setShowPromotionModal,
  setPromotionData,
  setPromotionStep,
  workSubmissions = [],
  onApproveSubmission = () => {},
  onRejectSubmission = () => {},
  onReleasePayment = () => {},
}: BrandDashboardOverviewProps & { setPromotionData: (data: any) => void; setPromotionStep: (step: number) => void; }) {
  // Helper function to calculate verification status
  const calculateVerificationStatus = () => {
    // Count verified items
    const verifiedItems = [
      accountStatus.email,
      accountStatus.phone,
      accountStatus.pan,
      accountStatus.gst,
      accountStatus.idProof,
      (accountStatus.payment.upi || accountStatus.payment.card)
    ];
    
    const verifiedCount = verifiedItems.filter(Boolean).length;
    const totalItems = verifiedItems.length;
    const itemsLeft = totalItems - verifiedCount;
    const progressPercentage = (verifiedCount / totalItems) * 100;
    
    return {
      verifiedCount,
      totalItems,
      itemsLeft,
      progressPercentage,
      isComplete: verifiedCount === totalItems
    };
  };
  const router = useRouter();
  // Add state for tracking current slider position
  const [currentSlide, setCurrentSlide] = useState(0);
  const sliderRef = useRef<HTMLDivElement>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState<any>(null);
  const [orderReviews, setOrderReviews] = useState<{ [orderId: string]: any }>({});
  const [reviewLoading, setReviewLoading] = useState<{ [orderId: string]: boolean }>({});
  const [selectedSubmission, setSelectedSubmission] = useState<any | null>(null);
  // Active promotions state
  const [activePromotions, setActivePromotions] = useState<any[]>([]);
  const [loadingPromotions, setLoadingPromotions] = useState(true);
  const [promotionsError, setPromotionsError] = useState<string | null>(null);
  // Applicants state
  const [applicants, setApplicants] = useState<{ [promoId: string]: any[] }>({});
  const [loadingApplicants, setLoadingApplicants] = useState<{ [promoId: string]: boolean }>({});
  const [showApplicantsModal, setShowApplicantsModal] = useState(false);
  const [modalApplicants, setModalApplicants] = useState<any[]>([]);
  const [modalPromoTitle, setModalPromoTitle] = useState('');
  const [brandExperienceReviews, setBrandExperienceReviews] = useState<any[]>([]);
  const [brandExperienceLoading, setBrandExperienceLoading] = useState(false);
  const [brandExperienceError, setBrandExperienceError] = useState<string | null>(null);
  const [brandExperienceAvg, setBrandExperienceAvg] = useState<number>(0);
  const [brandId, setBrandId] = useState<string>('');
  const [brandUserLoading, setBrandUserLoading] = useState(true);
  const [brandUserError, setBrandUserError] = useState<string | null>(null);
  
  console.log('Rendering messages:', recentMessages);
  
  // Function to handle slider scroll and update currentSlide
  const handleSliderScroll = () => {
    if (sliderRef.current) {
      const scrollPosition = sliderRef.current.scrollLeft;
      const slideWidth = 300 + 16; // card width + margin
      const newSlide = Math.round(scrollPosition / slideWidth);
      setCurrentSlide(newSlide);
    }
  };
  
  // Attach scroll event handler
  useEffect(() => {
    const slider = sliderRef.current;
    if (slider) {
      slider.addEventListener('scroll', handleSliderScroll);
      return () => {
        slider.removeEventListener('scroll', handleSliderScroll);
      };
    }
  }, []);
  
  // Function to scroll to a specific slide
  const scrollToSlide = (index: number) => {
    if (sliderRef.current) {
      const slideWidth = 300 + 16; // card width + margin
      sliderRef.current.scrollTo({
        left: index * slideWidth,
        behavior: 'smooth'
      });
    }
  };
  
  // Brand stats cards
  const renderStatsCards = () => {
    if (loadingStats) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {Array(4).fill(0).map((_, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
            </div>
          ))}
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Member Since</p>
          <p className="text-lg font-medium">{memberSince}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Total Spent</p>
          <p className="text-lg font-medium">${totalSpent.toLocaleString()}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Brand Rating</p>
          <div className="flex items-center">
            <p className="text-lg font-medium mr-1">{brandExperienceAvg.toFixed(1)}</p>
            <div className="flex items-center">
              {Array(5).fill(0).map((_, index) => (
                <svg key={index} className={`w-4 h-4 ${index < Math.floor(brandExperienceAvg) ? 'text-yellow-400' : 'text-gray-300'}`} aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 22 20">
                  <path d="M20.924 7.625a1.523 1.523 0 0 0-1.238-1.044l-5.051-.734-2.259-4.577a1.534 1.534 0 0 0-2.752 0L7.365 5.847l-5.051.734A1.535 1.535 0 0 0 1.463 9.2l3.656 3.563-.863 5.031a1.532 1.532 0 0 0 2.226 1.616L11 17.033l4.518 2.375a1.534 1.534 0 0 0 2.226-1.617l-.863-5.03L20.537 9.2a1.523 1.523 0 0 0 .387-1.575Z"/>
                </svg>
              ))}
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-1 text-sm">Orders</p>
          <p className="text-lg font-medium">{completedOrders} <span className="text-sm text-gray-500">completed</span> / {pendingOrders} <span className="text-sm text-gray-500">pending</span></p>
        </div>
      </div>
    );
  };
  
  // Fetch reviews for recent completed orders
  useEffect(() => {
    recentOrders.forEach(async (order) => {
      if (order.status === 'completed' && !orderReviews[order.id]) {
        setReviewLoading(prev => ({ ...prev, [order.id]: true }));
        try {
          const review = await getReviewByOrderId(order.id);
          setOrderReviews(prev => ({ ...prev, [order.id]: review }));
        } catch (error) {
          // Silently handle errors for review fetching
          // These are expected when reviews don't exist yet
          console.log('No review found for order:', order.id);
          setOrderReviews(prev => ({ ...prev, [order.id]: null }));
        } finally {
          setReviewLoading(prev => ({ ...prev, [order.id]: false }));
        }
      }
    });
  }, [recentOrders]);

  // Get completed orders without a review
  const reviewableOrders = recentOrders.filter(order => order.status === 'completed' && !orderReviews[order.id]);

  // Show only the latest 3 work submissions
  const latestSubmissions = (workSubmissions || []).slice(0, 2);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        setLoadingPromotions(true);
        setPromotionsError(null);
        const response = await getBrandPromotions('active', 1, 2);
        setActivePromotions(response.data || []);
      } catch (err: any) {
        setPromotionsError(err.message || 'Failed to load promotions');
      } finally {
        setLoadingPromotions(false);
      }
    };
    fetchPromotions();
  }, []);

  // Fetch applicants for each promotion
  useEffect(() => {
    activePromotions.forEach((promo) => {
      if (!applicants[promo._id]) {
        setLoadingApplicants((prev) => ({ ...prev, [promo._id]: true }));
        getPromotionApplications(promo._id, 'pending', 1, 10)
          .then((res) => {
            setApplicants((prev) => ({ ...prev, [promo._id]: res.data || [] }));
          })
          .catch(() => {
            setApplicants((prev) => ({ ...prev, [promo._id]: [] }));
          })
          .finally(() => {
            setLoadingApplicants((prev) => ({ ...prev, [promo._id]: false }));
          });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePromotions]);

  useEffect(() => {
    // Fetch current user from backend using token
    const fetchBrandUser = async () => {
      setBrandUserLoading(true);
      setBrandUserError(null);
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) {
          setBrandUserError('Not authenticated. Please log in.');
          setBrandUserLoading(false);
          return;
        }
        const res = await fetch('http://localhost:5001/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) {
          setBrandUserError('Failed to fetch user info.');
          setBrandUserLoading(false);
          return;
        }
        const response = await res.json();
        const user = response.data || response; // Support both { data: { ...user } } and { ...user }
        if (!user || !user._id || user.role !== 'brand') {
          setBrandUserError('You must be logged in as a brand to view this dashboard.');
          setBrandUserLoading(false);
          return;
        }
        setBrandId(user._id);
        setBrandUserLoading(false);
      } catch (e) {
        setBrandUserError('Error fetching user info.');
        setBrandUserLoading(false);
      }
    };
    fetchBrandUser();
  }, []);

  useEffect(() => {
    if (!brandId) return;
    setBrandExperienceLoading(true);
    getBrandExperienceReviews(brandId)
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setBrandExperienceReviews(res.data);
          if (res.data.length > 0) {
            const avg = res.data.reduce((sum: number, r: any) => sum + r.rating, 0) / res.data.length;
            setBrandExperienceAvg(avg);
          } else {
            setBrandExperienceAvg(0);
          }
        } else {
          setBrandExperienceReviews([]);
          setBrandExperienceAvg(0);
        }
      })
      .catch(err => {
        // Silently handle 404 errors for brand experience reviews
        // These are expected when reviews don't exist yet
        if (err?.response?.status !== 404) {
          console.error('Error loading brand experience reviews:', err);
          setBrandExperienceError('Failed to load brand experience reviews');
        }
        setBrandExperienceReviews([]);
        setBrandExperienceAvg(0);
      })
      .finally(() => setBrandExperienceLoading(false));
  }, [brandId]);

  // Add a function to refresh reviews (can be called after a new review is submitted)
  const refreshBrandExperienceReviews = () => {
    if (!brandId) return;
    setBrandExperienceLoading(true);
    getBrandExperienceReviews(brandId)
      .then(res => {
        if (res.success && Array.isArray(res.data)) {
          setBrandExperienceReviews(res.data);
          if (res.data.length > 0) {
            const avg = res.data.reduce((sum: number, r: any) => sum + r.rating, 0) / res.data.length;
            setBrandExperienceAvg(avg);
          } else {
            setBrandExperienceAvg(0);
          }
        } else {
          setBrandExperienceReviews([]);
          setBrandExperienceAvg(0);
        }
      })
      .catch(err => {
        // Silently handle 404 errors for brand experience reviews
        // These are expected when reviews don't exist yet
        if (err?.response?.status !== 404) {
          console.error('Error loading brand experience reviews:', err);
          setBrandExperienceError('Failed to load brand experience reviews');
        }
        setBrandExperienceReviews([]);
        setBrandExperienceAvg(0);
      })
      .finally(() => setBrandExperienceLoading(false));
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Welcome Card */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-6 lg:col-span-2 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -mt-12 -mr-12"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white opacity-10 rounded-full -mb-10 -ml-10"></div>
          
          <div className="relative z-10">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center mr-4">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Welcome back, {brandName || 'Brand'}!</h1>
                <div className="flex items-center mt-1 text-purple-100">
                  <Calendar className="w-4 h-4 mr-1" />
                  <span>Member since {memberSince}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/30 rounded-md">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-purple-100">Total Spent</p>
                    <p className="font-bold text-xl">₹{totalSpent.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/30 rounded-md">
                    <Star className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-purple-100">Brand Rating</p>
                    <p className="font-bold text-xl">{brandExperienceAvg.toFixed(1)} <span className="text-xs font-normal">/ 5</span></p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 sm:col-span-1 col-span-2">
                <div className="flex items-center">
                  <div className="p-2 bg-purple-500/30 rounded-md">
                    <ShoppingBag className="w-5 h-5 text-white" />
                  </div>
                  <div className="ml-3">
                    <p className="text-xs text-purple-100">Completed Orders</p>
                    <p className="font-bold text-xl">{completedOrders}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Brand Rating Message */}
        {brandExperienceAvg > 0 && (
          <RatingMessage
            rating={brandExperienceAvg}
            reviewCount={brandExperienceReviews.length}
            title="Your Brand Rating"
            variant="brand"
            className="mb-6"
          />
        )}
        
        {/* Verification Status */}
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
          {/* Verification status */}
          {(() => {
            const { verifiedCount, totalItems, progressPercentage } = calculateVerificationStatus();
            
            return (
              <>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                    <Shield className="w-5 h-5 mr-2 text-purple-600" />
                    Account Verification
                  </h2>
                  <div className="text-sm text-gray-500">{verifiedCount}/{totalItems} Complete</div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full h-2 bg-gray-200 rounded-full mb-4 overflow-hidden">
                  <div 
                    className="h-full bg-purple-600 rounded-full" 
                    style={{ width: `${progressPercentage}%` }}
                  ></div>
                </div>
              </>
            );
          })()}
          
          <div className="space-y-3">
            {/* Email */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Mail className="w-4 h-4 mr-2 text-gray-600" />
                <span className={accountStatus.email ? "text-gray-900" : "text-gray-600"}>Email</span>
              </div>
              <div>
                {accountStatus.email ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <button className="text-purple-600 hover:text-purple-800">Verify</button>
                )}
              </div>
            </div>
            {/* Phone */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <Phone className="w-4 h-4 mr-2 text-gray-600" />
                <span className={accountStatus.phone ? "text-gray-900" : "text-gray-600"}>Phone</span>
              </div>
              <div>
                {accountStatus.phone ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <button className="text-purple-600 hover:text-purple-800">Verify</button>
                )}
              </div>
            </div>
            {/* PAN */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                <span className={accountStatus.pan ? "text-gray-900" : "text-gray-600"}>PAN</span>
              </div>
              <div>
                {accountStatus.pan ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <button className="text-purple-600 hover:text-purple-800">Verify</button>
                )}
              </div>
            </div>
            {/* GST */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-gray-600" />
                <span className={accountStatus.gst ? "text-gray-900" : "text-gray-600"}>GST</span>
              </div>
              <div>
                {accountStatus.gst ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <button className="text-purple-600 hover:text-purple-800">Verify</button>
                )}
              </div>
            </div>
            {/* ID Proof */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <UserCheck className="w-4 h-4 mr-2 text-gray-600" />
                <span className={accountStatus.idProof ? "text-gray-900" : "text-gray-600"}>ID Proof</span>
              </div>
              <div>
                {accountStatus.idProof ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <button className="text-purple-600 hover:text-purple-800">Verify</button>
                )}
              </div>
            </div>
            {/* Payment Method (combined UPI & Card) */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2 text-purple-600" />
                <span className={(accountStatus.payment.upi || accountStatus.payment.card) ? "text-gray-900" : "text-gray-600"}>Payment Method</span>
              </div>
              <div>
                {accountStatus.payment.upi || accountStatus.payment.card ? (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-4 h-4 mr-1" /> Verified
                  </span>
                ) : (
                  <span className="text-orange-600 flex items-center">
                    <AlertCircle className="w-4 h-4 mr-1" /> Pending
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-200">
            {(() => {
              const { verifiedCount, totalItems, itemsLeft, isComplete } = calculateVerificationStatus();
              
              return (
                <button 
                  onClick={() => router.push('/brand-dashboard?tab=verifications')}
                  className={`w-full py-2 px-4 ${isComplete ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'} text-white rounded-lg flex items-center justify-center transition-colors`}>
                  {isComplete ? (
                    <>
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Verification Complete
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4 mr-2" />
                      Complete Verification {itemsLeft > 0 && `(${itemsLeft} item${itemsLeft > 1 ? 's' : ''} left)`}
                    </>
                  )}
                </button>
              );
            })()}
          </div>
        </div>
      </div>
      
      {/* Top Creators */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Award className="w-5 h-5 mr-2 text-purple-600" />
            Top Creators for Your Brand
          </h2>
          <Link href="/search" className="text-sm text-purple-600 hover:text-purple-800 flex items-center">
            View All <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </div>
        
        {fetchingCreators ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin h-8 w-8 border-4 border-purple-600 border-t-transparent rounded-full mb-4"></div>
            <p className="text-gray-500">Finding top creators for you...</p>
          </div>
        ) : (
          <div className="relative">
            {/* Left Arrow */}
            <button 
              className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                const newSlide = Math.max(currentSlide - 1, 0);
                scrollToSlide(newSlide);
              }}
              disabled={currentSlide === 0}
              aria-label="Previous creators"
            >
              <ChevronLeftIcon className="w-6 h-6" />
            </button>
            
            {/* Slider Container */}
            <div 
              id="creators-slider" 
              ref={sliderRef}
              className="flex overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide hide-scrollbar"
              style={{ 
                scrollbarWidth: 'none',
                msOverflowStyle: 'none',
                scrollSnapType: 'x mandatory',
              }}
            >
              <style jsx global>{`
                /* Hide scrollbar for Chrome, Safari and Opera */
                .hide-scrollbar::-webkit-scrollbar {
                  display: none;
                }
                
                /* Hide scrollbar for IE, Edge and Firefox */
                .hide-scrollbar {
                  -ms-overflow-style: none;  /* IE and Edge */
                  scrollbar-width: none;  /* Firefox */
                }
              `}</style>
              
              {topCreators.map((creator) => (
                <div key={creator.id} className="min-w-[300px] max-w-[300px] mx-2 first:ml-8 last:mr-8 snap-start">
                  <Link href={creator.profileUrl || `/creator/${creator.username.replace('@', '')}`} className="block">
                    <div className="border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition-shadow h-full">
                      <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 flex items-center">
                        <div className="w-14 h-14 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden border-2 border-white relative">
                          {creator.avatar && creator.avatar !== '/avatars/default.jpg' ? (
                            <img 
                              src={creator.avatar} 
                              alt={creator.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // If image fails to load, show the initial letter
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <div className={`absolute inset-0 flex items-center justify-center bg-purple-200 text-purple-700 font-bold text-xl ${creator.avatar && creator.avatar !== '/avatars/default.jpg' ? 'hidden' : ''}`}>
                            {creator.name.charAt(0)}
                          </div>
                        </div>
                        <div className="ml-3 flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{creator.name}</h3>
                          <p className="text-xs text-gray-600 truncate">{creator.username}</p>
                          <div className="flex items-center mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs font-medium text-gray-700 ml-1">{creator.rating}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 bg-white">
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium text-gray-900">{creator.category}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-3">
                          <span className="text-gray-600">Engagement:</span>
                          <span className="font-medium text-gray-900">{creator.engagement}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Completed:</span>
                          <span className="font-medium text-gray-900">{creator.completedProjects} projects</span>
                        </div>
                        
                        <div className="mt-4 w-full py-2 px-4 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg flex items-center justify-center text-sm">
                          <MessageSquare className="w-4 h-4 mr-2" />
                          View Creator Profile
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
              
              {/* Empty card with "Find more creators" button */}
              <div className="min-w-[300px] max-w-[300px] mx-2 last:mr-8 snap-start">
                <Link href="/search" className="block w-full h-full">
                  <div className="border border-dashed border-gray-300 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors p-6 flex flex-col items-center justify-center h-full">
                    <div className="w-14 h-14 rounded-full bg-purple-100 flex items-center justify-center mb-4">
                      <Users className="w-7 h-7 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2 text-center">Discover More Creators</h3>
                    <p className="text-sm text-gray-600 mb-4 text-center">Find the perfect creators for your upcoming campaigns</p>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm font-medium flex items-center">
                      <Plus className="w-4 h-4 mr-1" />
                      Browse Creators
                    </button>
                  </div>
                </Link>
              </div>
            </div>
            
            {/* Pagination Dots */}
            <div className="flex justify-center mt-4 space-x-1.5">
              {[...Array(topCreators.length + 1)].map((_, index) => (
                <button
                  key={index}
                  onClick={() => scrollToSlide(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentSlide === index
                      ? 'bg-purple-600 w-4' // Make active dot wider
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Right Arrow */}
            <button 
              className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white rounded-full p-1.5 shadow-md hover:shadow-lg text-purple-600 hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => {
                const newSlide = Math.min(currentSlide + 1, topCreators.length);
                scrollToSlide(newSlide);
              }}
              disabled={currentSlide === topCreators.length}
              aria-label="Next creators"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </div>
      
      {/* Active Quote Requests Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Active Quote Requests
          </h2>
          <Link href="/brand-dashboard?tab=quote-requests" className="text-purple-600 hover:text-purple-800 text-sm font-medium">View All</Link>
        </div>
        <BrandQuoteRequests limit={2} statusFilter="pending" hideHeader />
      </div>
      
      {/* Active Promotions Section */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
            Active Promotions
          </h2>
          <Link href="/brand-dashboard?tab=promotions" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View All</Link>
        </div>
        {loadingPromotions ? (
          <div className="flex justify-center items-center h-24">
            <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
          </div>
        ) : promotionsError ? (
          <div className="text-center text-red-600 p-4">{promotionsError}</div>
        ) : activePromotions.length === 0 ? (
          <div className="text-center text-gray-500 py-8">No active promotions found.</div>
        ) : (
          <div className="grid gap-4">
            {activePromotions.map((promo) => (
              <div key={promo._id} className="border border-gray-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center md:justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">{promo.title}</h4>
                    <button
                      className="ml-2 p-1 rounded hover:bg-gray-100"
                      title="Edit Promotion"
                      onClick={() => {
                        setPromotionData({ ...promo, deadline: new Date(promo.deadline).toISOString().split('T')[0] });
                        setPromotionStep(1);
                        setShowPromotionModal(true);
                      }}
                    >
                      <Pencil className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
                    <span>Deadline: {promo.deadline ? new Date(promo.deadline).toLocaleDateString() : 'N/A'}</span>
                    <span className="mx-2">•</span>
                    <DollarSign className="w-4 h-4 mr-1" />
                    <span>Budget: {promo.budget}</span>
                  </div>
                  {/* Applicants */}
                  <div className="mt-3">
                    <div className="font-semibold text-sm text-gray-700 mb-1">Applicants:</div>
                    {loadingApplicants[promo._id] ? (
                      <div className="flex items-center text-gray-400 text-xs"><span className="animate-spin h-4 w-4 border-2 border-blue-400 rounded-full border-t-transparent mr-2"></span>Loading...</div>
                    ) : applicants[promo._id] && applicants[promo._id].length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {applicants[promo._id].slice(0, 3).map((app: any) => (
                          <div key={app._id} className="flex items-center bg-gray-50 rounded px-2 py-1 text-xs">
                            <img src={app.creator?.avatar || '/avatars/placeholder-1.svg'} alt={app.creator?.fullName || app.creator?.username} className="w-6 h-6 rounded-full mr-2" />
                            <span className="font-medium text-gray-800 mr-1">{app.creator?.fullName || app.creator?.username}</span>
                            <span className="text-gray-500">@{app.creator?.username}</span>
                            <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px]">{app.status}</span>
                          </div>
                        ))}
                        {applicants[promo._id].length > 3 && (
                          <button
                            className="text-xs text-blue-600 underline ml-2"
                            onClick={() => {
                              setModalApplicants(applicants[promo._id]);
                              setModalPromoTitle(promo.title);
                              setShowApplicantsModal(true);
                            }}
                          >View All</button>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-gray-400">No applicants yet.</div>
                    )}
                  </div>
                </div>
                <span className="mt-2 md:mt-0 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>
              </div>
            ))}
          </div>
        )}
        {/* Applicants Modal */}
        {showApplicantsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
              <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setShowApplicantsModal(false)}>
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4">Applicants for {modalPromoTitle}</h3>
              {modalApplicants.length === 0 ? (
                <div className="text-gray-500">No applicants found.</div>
              ) : (
                <ul className="space-y-3 max-h-72 overflow-y-auto pr-2">
                  {modalApplicants.map((app) => (
                    <li key={app._id} className="flex items-center bg-gray-50 rounded px-3 py-2">
                      <img src={app.creator?.avatar || '/avatars/placeholder-1.svg'} alt={app.creator?.fullName || app.creator?.username} className="w-8 h-8 rounded-full mr-3" />
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{app.creator?.fullName || app.creator?.username}</div>
                        <div className="text-xs text-gray-500">@{app.creator?.username}</div>
                      </div>
                      <span className="ml-2 px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs">{app.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>
      
      {/* Recent Orders */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <RecentOrders 
          setSelectedOrder={setSelectedOrder}
          setShowOrderDetail={setShowOrderDetail}
        />
      </div>

      {/* Latest Work Submissions Section */}
      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-purple-600" />
            Latest Work Submissions
          </h2>
          <Link href="/brand-dashboard/work-submissions" className="text-purple-600 hover:text-purple-800 text-sm font-medium">View All</Link>
        </div>
        {latestSubmissions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">No recent work submissions found.</div>
        ) : (
          <WorkSubmissions
            submissions={latestSubmissions}
            onViewSubmission={setSelectedSubmission}
            onApproveSubmission={onApproveSubmission}
            onRejectSubmission={onRejectSubmission}
          />
        )}
        {selectedSubmission && (
          <WorkSubmissionModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onApprove={onApproveSubmission}
            onReject={onRejectSubmission}
            onReleasePayment={onReleasePayment}
          />
        )}
      </div>
      
      {/* Recent Messages */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Recent Messages</h3>
          <Link href="/messages" className="text-purple-600 hover:text-purple-700 text-sm font-medium">
            View All
          </Link>
        </div>
        {loadingMessages ? (
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin h-6 w-6 border-2 border-purple-600 rounded-full border-t-transparent"></div>
          </div>
        ) : recentMessages.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            No messages yet
          </div>
        ) : (
          <div className="space-y-4">
            {recentMessages.map((conversation) => (
              <div
                key={conversation._id}
                className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => router.push(`/messages?conversation=${conversation._id}`)}
              >
                <div className="flex-shrink-0">
                  <img
                    src={conversation.otherUser?.avatar || "/avatars/placeholder-1.svg"}
                    alt={conversation.otherUser?.fullName || "User"}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {conversation.otherUser?.fullName || "Unknown User"}
                    </p>
                    <span className="text-xs text-gray-500">
                      {conversation.lastMessage ? formatTimeAgo(conversation.lastMessage.createdAt) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                </div>
                {conversation.unreadCount > 0 && (
                  <div className="flex-shrink-0">
                    <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-purple-600 rounded-full">
                      {conversation.unreadCount}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Create Promotion card */}
      <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl p-6 text-white">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-semibold text-lg">Post a Promotion</h3>
          <CheckCircle className="w-5 h-5 text-blue-200" />
        </div>
        <p className="mb-4 text-blue-100">Create a promotion post to attract suitable creators for your marketing campaign</p>
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-200" />
            <span className="text-sm">Receive applications from relevant creators</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-200" />
            <span className="text-sm">Set your budget and requirements</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-blue-200" />
            <span className="text-sm">Choose from interested creators</span>
          </div>
        </div>
        <button 
          onClick={() => setShowPromotionModal(true)}
          className="w-full py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Create Promotion
        </button>
      </div>
      
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-lg relative">
            <button className="absolute top-3 right-3 text-gray-400 hover:text-gray-600" onClick={() => setReviewModalOpen(false)}>
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-semibold mb-4">Select an Order to Review</h3>
            {reviewableOrders.length === 0 ? (
              <div className="text-gray-500">No completed orders available for review.</div>
            ) : (
              <ul className="space-y-3">
                {reviewableOrders.map(order => (
                  <li key={order.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div>
                      <div className="font-medium text-gray-900">{order.creator}</div>
                      <div className="text-xs text-gray-500">{order.service} • {new Date(order.date).toLocaleDateString()}</div>
                    </div>
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                      onClick={() => {
                        setReviewOrder(order);
                        setReviewModalOpen(false);
                      }}
                    >
                      Review
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {reviewOrder && (
        <BrandReviewModal
          open={!!reviewOrder}
          onClose={() => setReviewOrder(null)}
          order={reviewOrder}
          onReviewSubmitted={() => {
            setReviewOrder(null);
            refreshBrandExperienceReviews();
          }}
        />
      )}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mt-6">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Star className="w-5 h-5 text-yellow-400 mr-2" /> Brand Experience Reviews
        </h2>
        {brandUserLoading ? (
          <div>Loading user info...</div>
        ) : brandUserError ? (
          <div className="text-red-500">{brandUserError}</div>
        ) : brandExperienceLoading ? (
          <div>Loading reviews...</div>
        ) : brandExperienceError ? (
          <div className="text-red-500">{brandExperienceError}</div>
        ) : !brandId ? (
          <div className="text-red-500">No brandId found. Please log in again.</div>
        ) : brandExperienceReviews.length === 0 ? (
          <div>No reviews yet.</div>
        ) : (
          <>
            <div className="flex items-center mb-2">
              <span className="text-lg font-bold mr-2">{brandExperienceAvg.toFixed(1)}</span>
              <div className="flex items-center mr-2">
                {Array(5).fill(0).map((_, i) => (
                  <Star key={i} className={`w-4 h-4 ${i < Math.round(brandExperienceAvg) ? 'text-yellow-400' : 'text-gray-300'}`} />
                ))}
              </div>
              <span className="text-gray-500">({brandExperienceReviews.length} review{brandExperienceReviews.length !== 1 ? 's' : ''})</span>
            </div>
            <div className="divide-y divide-gray-100">
              {brandExperienceReviews.map((review, idx) => (
                <div key={review._id || idx} className="py-4">
                  <div className="flex items-center mb-1">
                    <div className="w-8 h-8 rounded-full bg-gray-200 overflow-hidden mr-3">
                      {review.creatorId && review.creatorId.avatar ? (
                        <Image src={review.creatorId.avatar} alt="avatar" width={32} height={32} />
                      ) : (
                        <UserCheck className="w-6 h-6 text-gray-400 mx-auto my-1" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{review.creatorId && (review.creatorId.fullName || review.creatorId.username || 'Creator')}</div>
                      <div className="text-xs text-gray-500">{formatTimeAgo(review.createdAt)}</div>
                    </div>
                    <div className="ml-auto flex items-center">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-300'}`} />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <div className="text-gray-700 mt-1">{review.comment}</div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}