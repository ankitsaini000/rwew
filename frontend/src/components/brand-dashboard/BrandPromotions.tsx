"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Megaphone, 
  Plus, 
  CheckCircle, 
  Users, 
  Calendar,
  Star, 
  Globe, 
  DollarSign,
  Layers,
  Pencil,
  Hash,
  X,
  Target,
  ChevronRight,
  AlertCircle,
  Trash2
} from "lucide-react";
import { getBrandPromotions, updatePromotion, getPromotionApplications, updateApplicationStatus, deletePromotion } from '../../services/api';
import { toast } from 'react-hot-toast';

interface PromotionsProps {
  setShowPromotionModal: (show: boolean) => void;
  setPromotionStep: (step: number) => void;
  setPromotionData: (data: any) => void;
  promotionData: any;
}

export default function BrandPromotions({ 
  setShowPromotionModal, 
  setPromotionStep,
  setPromotionData,
  promotionData
}: PromotionsProps) {
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Add state for viewing applications
  const [selectedPromotion, setSelectedPromotion] = useState<any>(null);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApplications, setLoadingApplications] = useState(false);
  
  // Add state for recent applications section
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loadingRecentApplications, setLoadingRecentApplications] = useState(false);
  
  // Add state for confirmation modals
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [promotionToDeactivate, setPromotionToDeactivate] = useState<any>(null);
  const [promotionToDelete, setPromotionToDelete] = useState<any>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchPromotions();
    fetchRecentApplications();
    
    // Set up interval to check deadlines every minute
    const interval = setInterval(checkDeadlines, 60000);
    
    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, []);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const response = await getBrandPromotions();
      setPromotions(response.data);
      setLoading(false);
      
      // Check deadlines immediately after fetching
      checkDeadlines();
    } catch (err: any) {
      console.error('Error fetching promotions:', err);
      setError(err.message || 'Failed to load promotions');
      setLoading(false);
    }
  };

  const checkDeadlines = async () => {
    const now = new Date();
    let updatedAny = false;
    
    // Check each promotion's deadline
    const updatedPromotions = promotions.map(promotion => {
      const deadlineDate = new Date(promotion.deadline);
      
      // If deadline has passed and promotion is still active
      if (deadlineDate < now && promotion.status === 'active') {
        updatedAny = true;
        
        // Update on backend
        updatePromotion(promotion._id, { ...promotion, status: 'closed' })
          .catch(err => console.error(`Failed to update promotion ${promotion._id}:`, err));
        
        // Return updated promotion for local state
        return { ...promotion, status: 'closed' };
      }
      
      return promotion;
    });
    
    // Only update state if any promotions were changed
    if (updatedAny) {
      setPromotions(updatedPromotions);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const isDeadlineSoon = (dateString: string) => {
    const deadlineDate = new Date(dateString);
    const now = new Date();
    const diffTime = deadlineDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0; // 3 days or less, but not past
  };

  // Function to handle editing a promotion
  const handleEditPromotion = (promotion: any) => {
    // Set the promotion data in the parent component
    setPromotionData({
      ...promotion,
      deadline: new Date(promotion.deadline).toISOString().split('T')[0] // Format date for input field
    });
    setPromotionStep(1); // Start at first step of the wizard
    setShowPromotionModal(true);
  };

  // Function to handle deactivating a promotion
  const handleDeactivateConfirm = (promotion: any) => {
    setPromotionToDeactivate(promotion);
    setShowDeactivateModal(true);
  };

  // Function to actually deactivate the promotion
  const deactivatePromotion = async () => {
    if (!promotionToDeactivate) return;
    
    try {
      setActionLoading(true);
      
      // Update the promotion status to 'closed'
      await updatePromotion(promotionToDeactivate._id, { 
        ...promotionToDeactivate, 
        status: 'closed' 
      });
      
      // Update local state
      setPromotions(promotions.map(promo => 
        promo._id === promotionToDeactivate._id 
          ? { ...promo, status: 'closed' } 
          : promo
      ));
      
      // Close the modal
      setShowDeactivateModal(false);
      setPromotionToDeactivate(null);
      setActionLoading(false);
    } catch (err: any) {
      console.error('Error deactivating promotion:', err);
      alert('Failed to deactivate promotion');
      setActionLoading(false);
    }
  };

  // Function to handle deleting a promotion
  const handleDeleteConfirm = (promotion: any) => {
    setPromotionToDelete(promotion);
    setShowDeleteModal(true);
  };

  // Function to actually delete the promotion
  const removePromotion = async () => {
    if (!promotionToDelete) return;
    
    try {
      setActionLoading(true);
      
      // Delete the promotion
      await deletePromotion(promotionToDelete._id);
      
      // Update local state by removing the deleted promotion
      setPromotions(promotions.filter(promo => promo._id !== promotionToDelete._id));
      
      // Close the modal
      setShowDeleteModal(false);
      setPromotionToDelete(null);
      setActionLoading(false);
    } catch (err: any) {
      console.error('Error deleting promotion:', err);
      alert('Failed to delete promotion');
      setActionLoading(false);
    }
  };

  // Function to view applications for a promotion
  const handleViewApplications = async (promotion: any) => {
    try {
      setSelectedPromotion(promotion);
      setLoadingApplications(true);
      setShowApplicationsModal(true);
      
      const response = await getPromotionApplications(promotion._id);
      setApplications(response.data || []);
      setLoadingApplications(false);
    } catch (err: any) {
      console.error('Error fetching applications:', err);
      setLoadingApplications(false);
    }
  };

  // Function to update application status
  const handleUpdateApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected' | 'completed') => {
    try {
      setActionLoading(true);
      
      // If status is 'accepted', redirect to checkout page first without updating the status
      if (status === 'accepted') {
        // Find the application in either recentApplications or applications
        const acceptedApp = recentApplications.find(app => app._id === applicationId) || 
                            (showApplicationsModal ? applications.find(app => app._id === applicationId) : null);
        
        if (acceptedApp) {
          // Extract the creator username from the application data
          let creatorUsername = '';
          
          // Log the full creator data to debug
          console.log('Full creator data:', acceptedApp.creatorId);
          
          // First check if we have personalInfo object
          if (acceptedApp.creatorId?.personalInfo?.username) {
            creatorUsername = acceptedApp.creatorId.personalInfo.username;
          } 
          // Then try username from User model
          else if (acceptedApp.creatorId?.username) {
            creatorUsername = acceptedApp.creatorId.username;
          }
          // Check if creatorId is a string (direct ID reference)
          else if (typeof acceptedApp.creatorId === 'string') {
            console.log('CreatorId is a string ID:', acceptedApp.creatorId);
            toast.error('Creator profile needs to be loaded first. Please try again.');
            setActionLoading(false);
            return;
          }
          // Fallback to creator.username if it exists
          else if (acceptedApp.creator?.username) {
            creatorUsername = acceptedApp.creator.username;
          }
          
          console.log('Extracted creator username:', creatorUsername);
          
          if (creatorUsername) {
            // Get promotion details from the application
            const promotionTitle = acceptedApp.promotion?.title || 'Promotion';
            const promotionId = acceptedApp.promotion?._id || '';
            
            // Redirect to checkout page with creator info, promotion details, and application ID
            toast.success('Redirecting to payment confirmation...');
            const checkoutUrl = `/checkout?creatorId=${creatorUsername}&packageType=standard&promotionTitle=${encodeURIComponent(promotionTitle)}&promotionId=${promotionId}&applicationId=${applicationId}&pendingAccept=true`;
            window.location.href = checkoutUrl;
            setActionLoading(false);
            return;
          } else {
            console.error('Creator username not found in application data', acceptedApp);
            
            // If we have a creatorId but no username, try to fetch creator profile
            if (acceptedApp.creatorId && typeof acceptedApp.creatorId === 'object' && acceptedApp.creatorId._id) {
              toast.error('Fetching creator profile information. Please try again in a moment.');
            } else {
              toast.error('Could not redirect to checkout. Creator username is missing. Please view the creator profile first.');
            }
            
            setActionLoading(false);
            return;
          }
        } else {
          console.error('Application data not found');
          toast.error('Could not redirect to checkout. Application data is missing.');
          setActionLoading(false);
          return;
        }
      }
      
      // For rejected or completed statuses, continue with the API call
      const response = await updateApplicationStatus(applicationId, status);
      
      if (response.success) {
        // Update local state to reflect the new status
        setRecentApplications(prevApplications => 
          prevApplications.map(app => 
            app._id === applicationId 
              ? { ...app, status } 
              : app
          )
        );
        
        // Also update in applications list if viewing applications modal
        if (showApplicationsModal) {
          setApplications(prevApplications => 
            prevApplications.map(app => 
              app._id === applicationId 
                ? { ...app, status } 
                : app
            )
          );
        }
        
        if (status === 'rejected') {
          toast.success('Application rejected successfully');
        } else if (status === 'completed') {
          toast.success('Application marked as completed');
        }
      } else {
        // Show error message
        console.error('Failed to update application status:', response.message);
        toast.error(response.message || 'Failed to update application status');
      }
      
      setActionLoading(false);
    } catch (error) {
      console.error('Error updating application status:', error);
      setActionLoading(false);
      toast.error('An error occurred while updating the application');
    }
  };

  // Function to fetch recent applications across all promotions
  const fetchRecentApplications = async () => {
    try {
      setLoadingRecentApplications(true);
      
      // First, check if we have promotions
      if (promotions.length === 0) {
        const promotionsResponse = await getBrandPromotions();
        const fetchedPromotions = promotionsResponse.data;
        
        if (fetchedPromotions.length === 0) {
          setRecentApplications([]);
          setLoadingRecentApplications(false);
          return;
        }
        
        // Get up to 5 most recent applications across all promotions
        const recentApps = [];
        for (const promotion of fetchedPromotions.slice(0, 3)) {
          const response = await getPromotionApplications(promotion._id);
          if (response.data && response.data.length > 0) {
            // Add promotion info to each application
            const appsWithPromotion = response.data.map((app: any) => ({
              ...app,
              promotion: {
                _id: promotion._id,
                title: promotion.title
              }
            }));
            recentApps.push(...appsWithPromotion);
          }
        }
        
        // Sort by date (newest first) and take the first 3
        const sortedApps = recentApps.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 3);
        
        setRecentApplications(sortedApps);
      } else {
        // Get applications from existing promotions
        const recentApps = [];
        for (const promotion of promotions.slice(0, 3)) {
          const response = await getPromotionApplications(promotion._id);
          if (response.data && response.data.length > 0) {
            const appsWithPromotion = response.data.map((app: any) => ({
              ...app,
              promotion: {
                _id: promotion._id,
                title: promotion.title
              }
            }));
            recentApps.push(...appsWithPromotion);
          }
        }
        
        // Sort by date (newest first) and take the first 3
        const sortedApps = recentApps.sort((a: any, b: any) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }).slice(0, 3);
        
        setRecentApplications(sortedApps);
      }
      
      setLoadingRecentApplications(false);
    } catch (err: any) {
      console.error('Error fetching recent applications:', err);
      setLoadingRecentApplications(false);
    }
  };

  // Helper function to format time ago
  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = Math.floor(seconds / 31536000);
    if (interval >= 1) {
      return interval === 1 ? interval + ' year ago' : interval + ' years ago';
    }
    
    interval = Math.floor(seconds / 2592000);
    if (interval >= 1) {
      return interval === 1 ? interval + ' month ago' : interval + ' months ago';
    }
    
    interval = Math.floor(seconds / 86400);
    if (interval >= 1) {
      return interval === 1 ? interval + ' day ago' : interval + ' days ago';
    }
    
    interval = Math.floor(seconds / 3600);
    if (interval >= 1) {
      return interval === 1 ? interval + ' hour ago' : interval + ' hours ago';
    }
    
    interval = Math.floor(seconds / 60);
    if (interval >= 1) {
      return interval === 1 ? interval + ' minute ago' : interval + ' minutes ago';
    }
    
    return 'just now';
  };

  return (
    <div className="space-y-6">
      {/* Promotions content */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Megaphone className="w-5 h-5 mr-2 text-blue-600" />
            Promotion Posts
          </h2>
          <button 
            onClick={() => {
              setPromotionData({
                title: "",
                description: "",
                budget: "",
                category: "",
                platform: "",
                deadline: "",
                promotionType: "",
                deliverables: [],
                tags: [],
                requirements: ""
              });
              setPromotionStep(1);
              setShowPromotionModal(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Promotion
          </button>
        </div>
        
        {/* How it Works Section */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">How Promotion Posts Work</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Pencil className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">1. Create a Post</h4>
              <p className="text-sm text-gray-600">
                Describe your promotion needs, budget, requirements, and deadlines. Be specific about what you're looking for.
              </p>
              <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative w-full h-40">
                  <Image 
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=1000&auto=format&fit=crop"
                    alt="Creating a promotion post form" 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className="rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/400x300?text=Create+Promotion";
                      target.onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                      Create a detailed brief
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">2. Receive Applications</h4>
              <p className="text-sm text-gray-600">
                Creators who match your requirements will apply for your promotion opportunity with their portfolio and rates.
              </p>
              <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative w-full h-40">
                  <Image 
                    src="https://images.unsplash.com/photo-1557838923-2985c318be48?q=80&w=1000&auto=format&fit=crop"
                    alt="Creators applying to your promotion" 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className="rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/400x300?text=Review+Applications";
                      target.onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                      Review creator profiles
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg p-5 shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-medium text-gray-900 mb-2">3. Select and Collaborate</h4>
              <p className="text-sm text-gray-600">
                Review applications, select the best creators for your campaign, and start collaborating directly.
              </p>
              <div className="mt-4 bg-gray-100 rounded-lg overflow-hidden">
                <div className="relative w-full h-40">
                  <Image 
                    src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=1000&auto=format&fit=crop"
                    alt="Collaborating with creators" 
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    style={{objectFit: "cover"}}
                    className="rounded-lg"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = "https://via.placeholder.com/400x300?text=Collaborate";
                      target.onerror = null;
                    }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                    <div className="bg-white/80 px-3 py-1 rounded-full text-sm font-medium text-gray-800">
                      Track your campaign results
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Your Promotion Posts */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Promotion Posts</h3>
          
          {loading ? (
            <div className="flex justify-center items-center h-48">
              <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
            </div>
          ) : error ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-800">
              <p>{error}</p>
              <button 
                onClick={fetchPromotions}
                className="mt-2 px-3 py-1 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200"
              >
                Try Again
              </button>
            </div>
          ) : promotions.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl">
              <Megaphone className="w-10 h-10 text-gray-400 mx-auto mb-3" />
              <h4 className="text-lg font-medium text-gray-800 mb-2">No promotions yet</h4>
              <p className="text-gray-600 mb-4">Create your first promotion post to reach creators</p>
              <button 
                onClick={() => {
                  setPromotionData({
                    title: "",
                    description: "",
                    budget: "",
                    category: "",
                    platform: "",
                    deadline: "",
                    promotionType: "",
                    deliverables: [],
                    tags: [],
                    requirements: ""
                  });
                  setPromotionStep(1);
                  setShowPromotionModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Promotion
              </button>
            </div>
          ) : (
            /* Active Promotions */
            <div className="space-y-4">
              {promotions.map((promotion) => (
                <div key={promotion._id} className="border border-gray-200 rounded-xl p-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{promotion.title}</h4>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span className={isDeadlineSoon(promotion.deadline) ? "text-amber-600 font-medium" : ""}>
                          Deadline: {formatDate(promotion.deadline)}
                          {isDeadlineSoon(promotion.deadline) && " (Soon)"}
                        </span>
                        <span className="mx-2">•</span>
                        <DollarSign className="w-4 h-4 mr-1" />
                        <span>Budget: {promotion.budget}</span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      promotion.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : promotion.status === 'closed'
                          ? 'bg-gray-100 text-gray-800'
                          : 'bg-blue-100 text-blue-800'
                    }`}>
                      {promotion.status === 'active' ? 'Active' : 
                       promotion.status === 'closed' ? 'Closed' : 'Draft'}
                    </span>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {promotion.tags && promotion.tags.map((tag: string, i: number) => (
                      <span key={i} className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs">
                        #{tag}
                      </span>
                    ))}
                    {(!promotion.tags || promotion.tags.length === 0) && (
                      <span className="text-gray-400 text-xs">No tags</span>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
                    <div className="text-sm text-gray-500">
                      <span className="font-medium">{promotion.applications?.length || 0}</span> applications received
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button 
                        onClick={() => handleEditPromotion(promotion)}
                        className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleViewApplications(promotion)}
                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                      >
                        View Applications
                      </button>
                      
                      {promotion.status === 'active' && (
                        <button 
                          onClick={() => handleDeactivateConfirm(promotion)}
                          className="px-3 py-1.5 bg-amber-100 text-amber-800 rounded-lg text-sm hover:bg-amber-200 flex items-center"
                        >
                          <AlertCircle className="w-4 h-4 mr-1" />
                          Deactivate
                        </button>
                      )}
                      
                      <button 
                        onClick={() => handleDeleteConfirm(promotion)}
                        className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200 flex items-center"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Applications from Creators */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Applications</h3>
          
          <div className="space-y-4">
            {loadingRecentApplications ? (
              <div className="flex justify-center items-center h-48">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
              </div>
            ) : recentApplications.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl">
                <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-800 mb-2">No applications yet</h4>
                <p className="text-gray-600 mb-4">
                  When creators apply to your promotions, they'll appear here
                </p>
                <button 
                  onClick={() => {
                    setPromotionData({
                      title: "",
                      description: "",
                      budget: "",
                      category: "",
                      platform: "",
                      deadline: "",
                      promotionType: "",
                      deliverables: [],
                      tags: [],
                      requirements: ""
                    });
                    setPromotionStep(1);
                    setShowPromotionModal(true);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 inline-flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Promotion
                </button>
              </div>
            ) : (
              <>
                {/* Map through real applications */}
                {recentApplications.map((application) => (
                  <div key={application._id} className="border border-gray-200 rounded-xl overflow-hidden">
                    <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                      <div className="flex items-center">
                        <Megaphone className="w-5 h-5 text-blue-600 mr-2" />
                        <span className="font-medium">{application.promotion?.title || "Untitled Promotion"}</span>
                      </div>
                      <span className="text-sm text-gray-500">
                        Application received {application.createdAt ? formatTimeAgo(application.createdAt) : 'recently'}
                      </span>
                    </div>
                    
                    <div className="p-5">
                      <div className="flex items-start">
                        <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 relative overflow-hidden">
                          {(application.creatorId?.personalInfo?.profileImage || application.creatorId?.avatar) ? (
                            <Image 
                              src={application.creatorId?.personalInfo?.profileImage || application.creatorId?.avatar} 
                              alt={application.creatorId?.personalInfo?.username || application.creatorId?.username || 'Creator'} 
                              fill
                              style={{objectFit: "cover"}}
                              className="rounded-full"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center font-semibold text-blue-700">
                              {(application.creatorId?.personalInfo?.username || application.creatorId?.username || 'A').charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {application.creatorId?.personalInfo?.firstName && application.creatorId?.personalInfo?.lastName ? 
                                  `${application.creatorId.personalInfo.firstName} ${application.creatorId.personalInfo.lastName}` : 
                                  (application.creatorId?.fullName || 
                                   application.creatorId?.personalInfo?.username || 
                                   application.creatorId?.username || 
                                   'Anonymous')
                                }
                              </h4>
                              <div className="flex items-center text-sm text-gray-500 mt-0.5">
                                {application.creatorId?.followers && (
                                  <>
                                    <Users className="w-4 h-4 mr-1" />
                                    <span>{application.creatorId.followers?.toLocaleString() || 0} followers</span>
                                    <span className="mx-2">•</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {application.matchPercentage && (
                              <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full">
                                {application.matchPercentage}% match
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-700">
                              {application.message 
                                ? (application.message.length > 150 
                                  ? `"${application.message.substring(0, 150)}..."` 
                                  : `"${application.message}"`) 
                                : "No message provided"}
                            </p>
                          </div>
                          
                          <div className="mt-3 flex flex-wrap gap-2">
                            {application.proposedRate && (
                              <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Proposed rate: {application.proposedRate}
                              </span>
                            )}
                            {application.availability && (
                              <span className="bg-green-50 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Available: {application.availability}
                              </span>
                            )}
                            {application.platform && (
                              <span className="bg-amber-50 text-amber-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Globe className="w-3 h-3 mr-1" />
                                Platform: {application.platform}
                              </span>
                            )}
                          </div>
                          
                          <div className="mt-4 flex gap-3">
                            <button 
                              onClick={() => {
                                setSelectedPromotion({_id: application.promotion?._id});
                                handleViewApplications({_id: application.promotion?._id, title: application.promotion?.title});
                              }}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                            >
                              View Full Application
                            </button>
                            <button 
                              onClick={() => {
                                // Handle different possible data structures
                                let username = '';
                                
                                // First check if we have personalInfo object
                                if (application.creatorId?.personalInfo?.username) {
                                  username = application.creatorId.personalInfo.username;
                                } 
                                // Then try username from User model
                                else if (application.creatorId?.username) {
                                  username = application.creatorId.username;
                                }
                                // Fallback to creator.username if it exists
                                else if (application.creator?.username) {
                                  username = application.creator.username;
                                }
                                
                                if (username) {
                                  window.open(`/creator/${username}`, '_blank');
                                } else {
                                  console.error('No username found for creator profile');
                                  toast.error('Could not open profile. Creator username not found.');
                                }
                              }}
                              className="px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                            >
                              View Profile
                            </button>
                            {application.status === 'pending' && (
                              <>
                                <button 
                                  onClick={() => handleUpdateApplicationStatus(application._id, 'accepted')}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button 
                                  onClick={() => handleUpdateApplicationStatus(application._id, 'rejected')}
                                  className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200"
                                >
                                  Decline
                                </button>
                              </>
                            )}
                            {application.status === 'accepted' && (
                              <span className="px-3 py-1.5 bg-green-100 text-green-800 rounded-lg text-sm flex items-center">
                                <CheckCircle className="w-4 h-4 mr-1" />
                                Accepted
                              </span>
                            )}
                            {application.status === 'rejected' && (
                              <span className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm flex items-center">
                                <X className="w-4 h-4 mr-1" />
                                Declined
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                <div className="text-center">
                  <Link
                    href="/brand/applications"
                    className="text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center"
                  >
                    View All Applications <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Applications Modal */}
      {showApplicationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-5 h-5 mr-2 text-blue-600" />
                  Applications for {selectedPromotion?.title}
                </h3>
                <button 
                  onClick={() => setShowApplicationsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {loadingApplications ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
                </div>
              ) : applications.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-gray-300 rounded-xl">
                  <Users className="w-10 h-10 text-gray-400 mx-auto mb-3" />
                  <h4 className="text-lg font-medium text-gray-800 mb-2">No applications yet</h4>
                  <p className="text-gray-600">Check back later for creator applications</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {applications.map((application) => (
                    <div key={application._id} className="border border-gray-200 rounded-xl overflow-hidden">
                      <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex justify-between items-center">
                        <div className="flex items-center">
                          <Star className="w-5 h-5 text-yellow-500 mr-2" />
                          <span className="font-medium">
                            Application from {
                              application.creatorId?.personalInfo?.username || 
                              application.creatorId?.username || 
                              'Anonymous'
                            }
                          </span>
                        </div>
                        <span className={`text-sm px-3 py-1 rounded-full ${
                          application.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                          application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-purple-100 text-purple-800' // completed
                        }`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="p-5">
                        <div className="flex items-start">
                          <div className="w-12 h-12 rounded-full bg-blue-100 flex-shrink-0 relative overflow-hidden">
                            {(application.creatorId?.personalInfo?.profileImage || application.creatorId?.avatar) ? (
                              <Image 
                                src={application.creatorId?.personalInfo?.profileImage || application.creatorId?.avatar} 
                                alt={application.creatorId?.personalInfo?.username || application.creatorId?.username || 'Creator'} 
                                fill
                                style={{objectFit: "cover"}}
                                className="rounded-full"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center font-semibold text-blue-700">
                                {(application.creatorId?.personalInfo?.username || application.creatorId?.username || 'A').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-4 flex-1">
                            <h4 className="font-medium text-gray-900">
                              {application.creatorId?.personalInfo?.firstName && application.creatorId?.personalInfo?.lastName ? 
                                `${application.creatorId.personalInfo.firstName} ${application.creatorId.personalInfo.lastName}` : 
                                (application.creatorId?.fullName || 
                                 application.creatorId?.personalInfo?.username || 
                                 application.creatorId?.username || 
                                 'Anonymous')
                              }
                            </h4>
                            
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <p className="text-sm text-gray-700">
                                {application.message || "No message provided"}
                              </p>
                            </div>
                            
                            <div className="mt-3 flex flex-wrap gap-2">
                              <span className="bg-blue-50 text-blue-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <DollarSign className="w-3 h-3 mr-1" />
                                Proposed rate: {application.proposedRate}
                              </span>
                              <span className="bg-green-50 text-green-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                Available: {application.availability}
                              </span>
                              {application.deliverables && (
                                <span className="bg-purple-50 text-purple-800 text-xs px-2.5 py-1 rounded-full flex items-center">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  {application.deliverables}
                                </span>
                              )}
                            </div>
                            
                            {application.status === 'pending' && (
                              <div className="mt-4 flex gap-3">
                                <button
                                  onClick={() => handleUpdateApplicationStatus(application._id, 'accepted')}
                                  className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700"
                                >
                                  Accept
                                </button>
                                <button
                                  onClick={() => handleUpdateApplicationStatus(application._id, 'rejected')}
                                  className="px-3 py-1.5 bg-red-100 text-red-800 rounded-lg text-sm hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            
                            {application.status === 'accepted' && (
                              <div className="mt-4 flex gap-3">
                                <button
                                  onClick={() => handleUpdateApplicationStatus(application._id, 'completed')}
                                  className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700"
                                >
                                  Mark as Completed
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Deactivate Confirmation Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center mb-4 text-amber-600">
              <div className="bg-amber-50 p-3 rounded-full">
                <AlertCircle className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-center mb-2">Deactivate Promotion</h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to deactivate "{promotionToDeactivate?.title}"? 
              It will no longer be visible to creators and won't receive new applications.
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={deactivatePromotion}
                className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 flex items-center"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Deactivate Promotion'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-center mb-4 text-red-600">
              <div className="bg-red-50 p-3 rounded-full">
                <Trash2 className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-xl font-semibold text-center mb-2">Delete Promotion</h3>
            
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to permanently delete "{promotionToDelete?.title}"? 
              This action cannot be undone, and all associated applications will also be deleted.
            </p>
            
            <div className="flex justify-center gap-3">
              <button 
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50"
                disabled={actionLoading}
              >
                Cancel
              </button>
              <button 
                onClick={removePromotion}
                className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 flex items-center"
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <div className="animate-spin h-4 w-4 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                    Processing...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 