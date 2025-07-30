"use client";

import { useState, useEffect, FormEvent, useRef } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import BrandDashboardOverview from "../../components/brand-dashboard/BrandDashboardOverview";
import BrandVerification from "../../components/brand-dashboard/BrandVerification";
import BrandPromotions from "../../components/brand-dashboard/BrandPromotions";
import BrandOrders from "../../components/brand-dashboard/BrandOrders";
import BrandReviews from "../../components/brand-dashboard/BrandReviews";
import OrderDetailModal from "../../components/brand-dashboard/OrderDetailModal";
import PromotionModal from "../../components/brand-dashboard/PromotionModal";
import VerificationModal from "../../components/brand-dashboard/VerificationModal";
import { 
  AlertCircle, 
  X, 
  ChevronRight, 
  LayoutDashboard, 
  Briefcase, 
  ShoppingBag, 
  MessageSquare, 
  Shield, 
  Settings,
  Loader2,
  Plus,
  FileText,
  CheckCircle,
  XCircle,
  Star
} from "lucide-react";
import { createPromotion, getPublishedCreators, getFilteredCreators, getBrandDashboardStats, getBrandOrders, getBrandSubmissions, updateSubmissionStatus, releasePayment, getConversations, getBrandVerificationStatus } from "../../services/api";
import WorkSubmissions from '../../components/brand-dashboard/WorkSubmissions';
import WorkSubmissionModal from '../../components/brand-dashboard/WorkSubmissionModal';
import { useRouter, useSearchParams } from 'next/navigation';
import BrandQuoteRequests from "../../components/brand-dashboard/BrandQuoteRequests";
import { toast } from "react-hot-toast";
import { WorkSubmission } from '@/types/workSubmission';
import BrandDashboardSettings from '../../components/brand-dashboard/BrandDashboardSettings';
import { useErrorHandler } from '../../hooks/useErrorHandler';
import { ErrorPopup } from '../../components/ui/ErrorPopup';
import RatingMessage from '../../components/ui/RatingMessage';

interface DashboardData {
  totalSpent: number;
  brandRating: number;
  completedOrders: number;
  pendingOrders: number;
  memberSince: string;
  workSubmissions: WorkSubmission[];
}

interface Order {
  _id: string;
  title: string;
  description: string;
  totalAmount: number;
  status: string;
  createdAt: string;
}

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
  };
  lastMessage?: Message;
  unreadCount: number;
}

export default function BrandDashboardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [brandName, setBrandName] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [showVerificationBanner, setShowVerificationBanner] = useState(true);
  const [selectedVerification, setSelectedVerification] = useState<string | null>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [fetchingCreators, setFetchingCreators] = useState(false);
  const [topCreators, setTopCreators] = useState<any[]>([]);
  
  // Rating state
  const [brandRating, setBrandRating] = useState<number>(0);
  const [brandReviewCount, setBrandReviewCount] = useState<number>(0);
  
  // Error handling
  const { 
    showErrorPopup, 
    errorMessage, 
    errorTitle, 
    handleError, 
    closeErrorPopup 
  } = useErrorHandler({ showPopup: true });
  
  // Dashboard stats state with initial values
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalSpent: 0,
    brandRating: 0,
    completedOrders: 0,
    pendingOrders: 0,
    memberSince: '',
    workSubmissions: []
  });
  
  // Loading state for dashboard stats
  const [loadingStats, setLoadingStats] = useState(true);

  // State for orders data
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [orderError, setOrderError] = useState<string | null>(null);

  // Mock data for account status
  const [accountStatus, setAccountStatus] = useState({
    email: false,
    phone: false,
    pan: false,
    gst: false,
    idProof: false,
    payment: {
      upi: false,
      card: false
    }
  });

  // Mock data for recent messages
  const [recentMessages, setRecentMessages] = useState<Conversation[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(true);

  // Add order detail state
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);

  // Add message reply state
  const [replyText, setReplyText] = useState("");
  const [replyingTo, setReplyingTo] = useState<number | null>(null);

  // Add the OTP verification state
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationStep, setVerificationStep] = useState<"input" | "verify" | "success">("input");

  // Add promotion state variables
  const [showPromotionModal, setShowPromotionModal] = useState(false);
  const [promotionStep, setPromotionStep] = useState(1);
  const [promotionData, setPromotionData] = useState({
    title: "",
    description: "",
    budget: "",
    category: [],
    platform: "",
    deadline: "",
    promotionType: "",
    deliverables: [] as string[],
    tags: [] as string[],
    requirements: ""
  });
  const [newDeliverable, setNewDeliverable] = useState("");
  const [newTag, setNewTag] = useState("");

  const [stats, setStats] = useState<DashboardData | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<WorkSubmission[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedSubmission, setSelectedSubmission] = useState<WorkSubmission | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState('');

  const isFirstMount = useRef(true);

  // Always sync activeTab with ?tab= query param
  useEffect(() => {
    const tab = searchParams?.get('tab');
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    } else if (!tab) {
      setActiveTab('overview');
      if (typeof window !== 'undefined') {
        router.replace(`${window.location.pathname}?tab=overview`);
      }
    }
    // No else: do not force overview if tab is present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // When user changes tab, update both state and URL
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      router.replace(`${window.location.pathname}?tab=${tab}`);
    }
  };

  const fetchMessages = async () => {
    try {
      setLoadingMessages(true);
      console.log('Fetching messages...');
      const response = await getConversations();
      console.log('Messages response:', response);
      
      if (response && Array.isArray(response)) {
        // Sort conversations by last message date and take the 5 most recent
        const sortedConversations = response.sort((a: Conversation, b: Conversation) => {
          const dateA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
          const dateB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
          return dateB - dateA;
        }).slice(0, 5);
        
        console.log('Sorted conversations:', sortedConversations);
        setRecentMessages(sortedConversations);
      } else {
        console.error('Invalid response format:', response);
        setRecentMessages([]);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      // Use the custom error handler for resource not found errors
      handleError(error, 'Messages Connection Issue', 'Some message data couldn\'t be loaded. This won\'t affect your main dashboard functionality.');
      setRecentMessages([]);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Function to fetch brand rating data
  const fetchBrandRatingData = async () => {
    try {
      // Get brand ID from localStorage or user data
      const userData = localStorage.getItem('user');
      let brandId = null;
      
      if (userData) {
        const user = JSON.parse(userData);
        brandId = user._id || user.id;
      }
      
      if (!brandId) {
        console.log('No brand ID found, skipping rating fetch');
        return;
      }
      
      const { getBrandExperienceReviews } = await import('../../services/api');
      const response = await getBrandExperienceReviews(brandId);
      
      if (response.success && response.data) {
        const reviews = response.data;
        if (reviews.length > 0) {
          const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
          const averageRating = totalRating / reviews.length;
          setBrandRating(averageRating);
          setBrandReviewCount(reviews.length);
        } else {
          setBrandRating(0);
          setBrandReviewCount(0);
        }
      }
    } catch (error) {
      console.error('Error fetching brand rating data:', error);
      // Use the custom error handler for resource not found errors
      handleError(error, 'Brand Rating Connection Issue', 'Some rating data couldn\'t be loaded. This won\'t affect your main dashboard functionality.');
    }
  };

  useEffect(() => {
    // Check if we're in browser environment
    if (typeof window !== 'undefined') {
      // Get brand name from localStorage or other state management
      const storedBrandName = localStorage.getItem('brandName');
      setBrandName(storedBrandName);
      
      // Fetch dashboard data
      fetchDashboardData();
      
      // Fetch messages
      fetchMessages();
      
      // Fetch brand rating data
      fetchBrandRatingData();
      
      // Fetch top creators
      const fetchTopCreators = async () => {
        setFetchingCreators(true);
        try {
          const response = await getPublishedCreators();
          if (response.success && response.data) {
            setTopCreators(response.data.slice(0, 5));
          }
        } catch (error) {
          console.error('Error fetching top creators:', error);
          // Use the custom error handler for resource not found errors
          handleError(error, 'Creators Connection Issue', 'Some creator data couldn\'t be loaded. This won\'t affect your main dashboard functionality.');
        } finally {
          setFetchingCreators(false);
        }
      };
      
      fetchTopCreators();

      // Fetch real brand verification status
      const fetchVerificationStatus = async () => {
        const response = await getBrandVerificationStatus();
        if (response.success && "data" in response && response.data) {
          const v = response.data;
          setAccountStatus({
            email: v.email?.status === 'verified',
            phone: v.phone?.status === 'verified',
            pan: v.pan?.status === 'verified',
            gst: v.gst?.status === 'verified',
            idProof: v.idProof?.status === 'verified',
            payment: {
              upi: v.payment?.upi?.status === 'verified',
              card: v.payment?.card?.status === 'verified',
            },
          });
        }
      };
      fetchVerificationStatus();
    }
  }, []);

  // Mock data for top creators - this will be used as fallback if API fails
  const mockTopCreators = [
    {
      id: 1,
      name: "Sophia Martinez",
      username: "@sophiastyle",
      avatar: "/avatars/placeholder-1.svg",
      category: "Fashion & Lifestyle",
      rating: 4.9,
      engagement: "5.2%",
      completedProjects: 8
    },
    {
      id: 2,
      name: "Alex Johnson",
      username: "@alextech",
      avatar: "/avatars/placeholder-2.svg",
      category: "Tech & Gaming",
      rating: 4.7,
      engagement: "6.8%",
      completedProjects: 5
    },
    {
      id: 3,
      name: "Emma Williams",
      username: "@emmafoodie",
      avatar: "/avatars/placeholder-3.svg",
      category: "Food & Cooking",
      rating: 4.8,
      engagement: "4.9%",
      completedProjects: 6
    }
  ];

  // Use fetched data or fallback to mock data
  const displayTopCreators = topCreators.length > 0 ? topCreators : mockTopCreators;

  // Functions for handling verification
  const handleVerificationSubmit = (e: FormEvent) => {
    e.preventDefault();
    const updatedStatus = { ...accountStatus, payment: { ...accountStatus.payment } };
    if (selectedVerification === 'email') updatedStatus.email = true;
    if (selectedVerification === 'phone') updatedStatus.phone = true;
    if (selectedVerification === 'pan') updatedStatus.pan = true;
    if (selectedVerification === 'gst') updatedStatus.gst = true;
    if (selectedVerification === 'idProof') updatedStatus.idProof = true;
    if (selectedVerification === 'upi') updatedStatus.payment.upi = true;
    if (selectedVerification === 'card') updatedStatus.payment.card = true;
    // setAccountStatus(updatedStatus); // Uncomment if you want to update state
    setShowVerificationModal(false);
    setSelectedVerification(null);
  };

  // Function to handle message reply
  const handleSendReply = (messageId: number) => {
    if (!replyText.trim()) return;
    
    // In a real app, you would send this via API
    console.log(`Replying to message ${messageId}: ${replyText}`);
    
    // Reset state
    setReplyText("");
    setReplyingTo(null);
  };

  // Add a function to handle form changes
  const handlePromotionChange = (field: string, value: string) => {
    setPromotionData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Add a function to add deliverables
  const addDeliverable = () => {
    if (newDeliverable.trim()) {
      setPromotionData(prev => ({
        ...prev,
        deliverables: [...prev.deliverables, newDeliverable.trim()]
      }));
      setNewDeliverable("");
    }
  };

  // Add a function to remove deliverables
  const removeDeliverable = (index: number) => {
    setPromotionData(prev => ({
      ...prev,
      deliverables: prev.deliverables.filter((_, i) => i !== index)
    }));
  };

  // Add a function to add tags
  const addTag = () => {
    if (newTag.trim()) {
      setPromotionData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  // Add a function to remove tags
  const removeTag = (index: number) => {
    setPromotionData(prev => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index)
    }));
  };

  // Add a function to publish promotion
  const publishPromotion = async () => {
    try {
      // Show loading indicator or notification
      console.log("Preparing to publish promotion...");
      // Validate data
      if (!promotionData.title || !promotionData.description || !promotionData.budget || 
          !promotionData.category || !promotionData.platform || !promotionData.deadline || 
          !promotionData.promotionType) {
        alert("Please fill in all required fields");
        return;
      }
      // Format data for API
      const formattedData = {
        ...promotionData,
        status: 'active' // Set as active immediately
      };
      // Call API
      const response = await createPromotion(formattedData);
      console.log("Promotion created successfully:", response);
      // Show toast and close modal
      toast.success("Promotion posted successfully! Creators will be notified about this opportunity.");
      setShowPromotionModal(false);
      // Reset form
      setPromotionData({
        title: "",
        description: "",
        budget: "",
        category: [],
        platform: "",
        deadline: "",
        promotionType: "",
        deliverables: [],
        tags: [],
        requirements: ""
      });
      setPromotionStep(1);
    } catch (error: any) {
      console.error("Error creating promotion:", error);
      alert("Error publishing promotion: " + (error.message || "Unknown error occurred"));
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsResponse, ordersResponse, submissionsResponse] = await Promise.all([
        getBrandDashboardStats(),
        getBrandOrders(),
        getBrandSubmissions()
      ]);

      if (statsResponse.success && 'data' in statsResponse) {
        setStats(statsResponse.data);
        
        // Update dashboardData with the fetched stats
        setDashboardData(prev => ({
          ...prev,
          totalSpent: statsResponse.data.totalSpent || 0,
          brandRating: statsResponse.data.brandRating || 0,
          completedOrders: statsResponse.data.completedOrders || 0,
          pendingOrders: statsResponse.data.pendingOrders || 0,
          memberSince: statsResponse.data.memberSince || ''
        }));
        
        // Set loading stats to false since we have the data
        setLoadingStats(false);
      } else if (!statsResponse.success && 'error' in statsResponse) {
        setError(statsResponse.error || 'Failed to fetch dashboard stats');
        setLoadingStats(false);
      }

      if (ordersResponse.success && 'data' in ordersResponse) {
        setOrders(ordersResponse.data || []);
      } else if (!ordersResponse.success && 'error' in ordersResponse) {
        setError(ordersResponse.error || 'Failed to fetch orders');
      }

      if (submissionsResponse.success && 'data' in submissionsResponse) {
        // Add paymentReleased field to each submission
        const submissionsWithPayment = submissionsResponse.data.map((submission: any) => ({
          ...submission,
          paymentReleased: submission.paymentReleased || false
        }));
        setSubmissions(submissionsWithPayment);
        setDashboardData(prev => ({
          ...prev,
          workSubmissions: submissionsWithPayment
        }));
      } else if (!submissionsResponse.success && 'error' in submissionsResponse) {
        setError(submissionsResponse.error || 'Failed to fetch submissions');
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      // Use the custom error handler for resource not found errors
      handleError(err, 'Dashboard Connection Issue', 'Some dashboard resources couldn\'t be loaded. This won\'t affect your main functionality.');
      setError('Failed to fetch dashboard data');
      setLoadingStats(false);
    } finally {
      setLoading(false);
    }
  };

  const handleApproveSubmission = async (submissionId: string) => {
    try {
      const response = await updateSubmissionStatus(submissionId, 'approved');
      if (response.success) {
        fetchDashboardData();
      } else if (!response.success && 'error' in response) {
        setError(response.error || 'Failed to approve submission');
      }
    } catch (err) {
      console.error('Error approving submission:', err);
      // Use the custom error handler for resource not found errors
      handleError(err, 'Submission Update Issue', 'Some submission data couldn\'t be updated. This won\'t affect your main dashboard functionality.');
      setError('Failed to approve submission');
    }
  };

  const handleRejectSubmission = async (submissionId: string, rejectionReason: string) => {
    try {
      const response = await updateSubmissionStatus(submissionId, 'rejected', rejectionReason);
      if (response.success) {
        fetchDashboardData();
      } else if (!response.success && 'error' in response) {
        setError(response.error || 'Failed to reject submission');
      }
    } catch (err) {
      console.error('Error rejecting submission:', err);
      // Use the custom error handler for resource not found errors
      handleError(err, 'Submission Update Issue', 'Some submission data couldn\'t be updated. This won\'t affect your main dashboard functionality.');
      setError('Failed to reject submission');
    }
  };

  const handleReleasePayment = async (submissionId: string) => {
    try {
      const response = await releasePayment(submissionId);
      if (response.success) {
        // Update both states
        setSubmissions(prev => prev.map(submission =>
          submission._id === submissionId
            ? { ...submission, paymentReleased: true }
            : submission
        ));
        setDashboardData(prev => ({
          ...prev,
          workSubmissions: prev.workSubmissions.map(submission =>
            submission._id === submissionId
              ? { ...submission, paymentReleased: true }
              : submission
          )
        }));
        return true; // Indicate success to the modal
      } else {
        throw new Error(response.error || 'Failed to release payment');
      }
    } catch (error) {
      console.error('Error releasing payment:', error);
      throw error; // Propagate error to the modal
    }
  };

  const handleViewSubmission = (submission: WorkSubmission | null) => {
    setSelectedSubmission(submission);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  // Render the appropriate component based on the active tab
  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <BrandDashboardOverview
            brandName={brandName}
            setActiveTab={setActiveTab}
            memberSince={dashboardData.memberSince}
            totalSpent={dashboardData.totalSpent}
            brandRating={dashboardData.brandRating}
            completedOrders={dashboardData.completedOrders}
            pendingOrders={dashboardData.pendingOrders}
            loadingStats={loadingStats}
            accountStatus={accountStatus}
            topCreators={displayTopCreators}
            fetchingCreators={fetchingCreators}
            recentOrders={recentOrders}
            recentMessages={recentMessages}
            loadingMessages={loadingMessages}
            setSelectedOrder={setSelectedOrder}
            setShowOrderDetail={setShowOrderDetail}
            setReplyingTo={setReplyingTo}
            replyingTo={replyingTo}
            replyText={replyText}
            setReplyText={setReplyText}
            handleSendReply={handleSendReply}
            setShowPromotionModal={setShowPromotionModal}
            workSubmissions={submissions}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
            onReleasePayment={handleReleasePayment}
            setPromotionData={setPromotionData}
            setPromotionStep={setPromotionStep}
          />
        );
      case "verifications":
        return (
          <BrandVerification 
            accountStatus={accountStatus}
            setAccountStatus={setAccountStatus}
          />
        );
      case "promotions":
        return (
          <BrandPromotions 
            setShowPromotionModal={setShowPromotionModal}
            setPromotionStep={setPromotionStep}
            setPromotionData={setPromotionData}
            promotionData={promotionData}
          />
        );
      case "orders":
        return (
          <BrandOrders
            setSelectedOrder={setSelectedOrder}
            setShowOrderDetail={setShowOrderDetail}
          />
        );
      case "quote-requests":
        return <BrandQuoteRequests />;
      case "submissions":
        return (
          <WorkSubmissions
            submissions={submissions}
            onViewSubmission={handleViewSubmission}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
          />
        );
      case "reviews":
        return <BrandReviews />;
      case "settings":
        return <BrandDashboardSettings />;
      default:
        return null;
    }
  };

  return (
    <DashboardLayout>
      {/* Show verification banner if not verified */}
      {showVerificationBanner && (
        <div className="bg-blue-50 border-blue-200 border p-4 rounded-xl mb-6 relative">
          <button
            className="absolute top-4 right-4 text-blue-400 hover:text-blue-600"
            onClick={() => setShowVerificationBanner(false)}
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-start sm:items-center flex-col sm:flex-row">
            <div className="p-2 bg-blue-100 rounded-full mr-4 mb-3 sm:mb-0">
              <AlertCircle className="h-6 w-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-800 mb-1">Complete Your Brand Verification</h3>
              <p className="text-blue-700 text-sm mb-3">
                Get verified to unlock all features and enhance your credibility with creators.
              </p>
              <button
                className="inline-flex items-center bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
                onClick={() => setActiveTab("verifications")}
              >
                Complete Verification
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex -mb-px overflow-x-auto hide-scrollbar">
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "overview"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("overview")}
          >
            <LayoutDashboard className="w-4 h-4 inline-block mr-2" />
            Overview
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "promotions"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("promotions")}
          >
            <Briefcase className="w-4 h-4 inline-block mr-2" />
            Promotions
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "orders"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("orders")}
          >
            <ShoppingBag className="w-4 h-4 inline-block mr-2" />
            Orders
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "quote-requests"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("quote-requests")}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Quote Requests
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "submissions"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("submissions")}
          >
            <FileText className="w-4 h-4 inline-block mr-2" />
            Work Submissions
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "reviews"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("reviews")}
          >
            <Star className="w-4 h-4 inline-block mr-2" />
            Reviews
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "verifications"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("verifications")}
          >
            <Shield className="w-4 h-4 inline-block mr-2" />
            Verification
          </button>
          <button
            className={`px-4 py-3 mr-2 font-medium text-sm whitespace-nowrap border-b-2 ${
              activeTab === "settings"
                ? "text-purple-600 border-purple-600"
                : "text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300"
            }`}
            onClick={() => handleTabChange("settings")}
          >
            <Settings className="w-4 h-4 inline-block mr-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Modals */}
      {/* Order Detail Modal */}
      {showOrderDetail && selectedOrder && (
        <OrderDetailModal 
          showOrderDetail={showOrderDetail}
          setShowOrderDetail={setShowOrderDetail}
          selectedOrder={selectedOrder}
        />
      )}
      
      {/* Verification Modal */}
      {showVerificationModal && selectedVerification && (
        <VerificationModal 
          showVerificationModal={showVerificationModal}
          setShowVerificationModal={setShowVerificationModal}
          selectedVerification={selectedVerification}
          handleVerificationSubmit={handleVerificationSubmit}
        />
      )}
      
      {/* Promotion Modal */}
      {showPromotionModal && (
        <PromotionModal 
          showPromotionModal={showPromotionModal}
          setShowPromotionModal={setShowPromotionModal}
          promotionStep={promotionStep}
          setPromotionStep={setPromotionStep}
          promotionData={promotionData}
          handlePromotionChange={handlePromotionChange}
          newDeliverable={newDeliverable}
          setNewDeliverable={setNewDeliverable}
          newTag={newTag}
          setNewTag={setNewTag}
          addDeliverable={addDeliverable}
          removeDeliverable={removeDeliverable}
          addTag={addTag}
          removeTag={removeTag}
          publishPromotion={publishPromotion}
        />
      )}

      {selectedSubmission && (
        <WorkSubmissionModal
          submission={selectedSubmission}
          onClose={() => setSelectedSubmission(null)}
          onApprove={handleApproveSubmission}
          onReject={handleRejectSubmission}
          onReleasePayment={handleReleasePayment}
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