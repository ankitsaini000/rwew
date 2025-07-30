"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { 
  ArrowLeft, Calendar, DollarSign, Briefcase, Clock, 
  Tag, CheckCircle, MessageSquare, Bookmark, BookmarkPlus, 
  Globe, Target, Layers, PaperclipIcon, Send, Users, Star, Heart,
  Mail, AlertCircle, Megaphone, Hash, ChevronRight, ChevronDown,
  BadgeCheck, Shield, Smartphone, Award, Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPromotionById, getBrandVerificationById, getPublicBrandProfileByUsername, sendMessageToCreator, getPromotions } from "../../../services/api";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function PromotionPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState('description');
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);
  const [brandTotalSpent, setBrandTotalSpent] = useState<number | null>(null);
  const [completedProjects, setCompletedProjects] = useState<number | null>(null);
  const [responseTime, setResponseTime] = useState<number | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [similarPromotions, setSimilarPromotions] = useState<any[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);

  const router = useRouter();

  // Fetch promotion data
  const fetchPromotion = useCallback(async () => {
    try {
      setLoading(true);
      
      // Check if ID is saved in localStorage
      if (typeof window !== 'undefined') {
        const savedPromos = JSON.parse(localStorage.getItem('savedPromotions') || '[]');
        setIsSaved(savedPromos.includes(params.id));
      }
      
      const response = await getPromotionById(params.id);
      setPromotion(response.data);
      // Fetch brand verification by brandId if available
      if (response.data && response.data.brandId && response.data.brandId._id) {
        setVerificationLoading(true);
        const vRes = await getBrandVerificationById(response.data.brandId._id);
        if (vRes.success && 'data' in vRes && vRes.data && vRes.data.verificationRequest) {
          setVerificationStatus(vRes.data.verificationRequest || null);
        } else {
          setVerificationStatus(null);
        }
        setVerificationLoading(false);
      } else {
        setVerificationStatus(null);
        setVerificationLoading(false);
      }

      // Fetch totalSpend from public brand profile by username
      if (response.data && response.data.brandId && response.data.brandId.username) {
        const brandProfileRes = await getPublicBrandProfileByUsername(response.data.brandId.username);
        if (brandProfileRes.success && 'data' in brandProfileRes && brandProfileRes.data && brandProfileRes.data.metrics) {
          if (typeof brandProfileRes.data.metrics.totalSpend === 'number') {
            setBrandTotalSpent(brandProfileRes.data.metrics.totalSpend);
          } else {
            setBrandTotalSpent(null);
          }
          if (typeof brandProfileRes.data.metrics.completedOrders === 'number') {
            setCompletedProjects(brandProfileRes.data.metrics.completedOrders);
          } else {
            setCompletedProjects(null);
          }
          if (typeof brandProfileRes.data.metrics.responseTime === 'number') {
            setResponseTime(brandProfileRes.data.metrics.responseTime);
          } else {
            setResponseTime(null);
          }
        } else {
          setBrandTotalSpent(null);
          setCompletedProjects(null);
          setResponseTime(null);
        }
      } else {
        setBrandTotalSpent(null);
        setCompletedProjects(null);
        setResponseTime(null);
      }
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching promotion:', err);
      setError(err.message || 'Failed to load promotion details');
      setLoading(false);
      setVerificationStatus(null);
      setVerificationLoading(false);
    }
  }, [params.id]);

  // Fetch similar promotions
  const fetchSimilarPromotions = useCallback(async (category: string, platform: string, currentId: string) => {
    setSimilarLoading(true);
    try {
      const filters = { category, platform };
      const res = await getPromotions(filters, 1, 6);
      if (res && res.data) {
        // Exclude the current promotion
        const filtered = res.data.filter((promo: any) => promo._id !== currentId).slice(0, 3);
        setSimilarPromotions(filtered);
      } else {
        setSimilarPromotions([]);
      }
    } catch (e) {
      setSimilarPromotions([]);
    } finally {
      setSimilarLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotion();
    // Fetch similar promotions after promotion is loaded
    // (category/platform may be undefined on first render)
  }, [fetchPromotion]);

  useEffect(() => {
    if (promotion && promotion.category && promotion.platform && promotion._id) {
      fetchSimilarPromotions(promotion.category, promotion.platform, promotion._id);
    }
  }, [promotion, fetchSimilarPromotions]);

  const toggleSavePromotion = () => {
    if (typeof window !== 'undefined') {
      const savedPromos = JSON.parse(localStorage.getItem('savedPromotions') || '[]');
      
      if (isSaved) {
        // Remove from saved list
        const updatedSavedPromos = savedPromos.filter((id: string) => id !== params.id);
        localStorage.setItem('savedPromotions', JSON.stringify(updatedSavedPromos));
      } else {
        // Add to saved list
        savedPromos.push(params.id);
        localStorage.setItem('savedPromotions', JSON.stringify(savedPromos));
      }
      
      setIsSaved(!isSaved);
    }
  };

  // Format date if available
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  function ContactBrandModal({ isOpen, onClose, brand }: { isOpen: boolean; onClose: () => void; brand: any }) {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!message.trim()) {
        toast.error("Please enter a message");
        return;
      }
      try {
        await sendMessageToCreator({
          receiverId: brand?._id || brand?.userId || brand?.id,
          content: message,
          subject: subject,
        });
        toast.success("Message sent to brand!");
        setSubject("");
        setMessage("");
        onClose();
        router.push("/messages");
      } catch (err: any) {
        toast.error(err.message || "Failed to send message");
      }
    };

    if (!isOpen) return null;
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6 w-full max-w-md">
          <h2 className="text-xl font-semibold mb-4">Contact {brand?.username || brand?.fullName || "Brand"}</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter subject"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 min-h-[100px]"
                placeholder="Type your message here..."
                required
              />
            </div>
            <div className="flex justify-end gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">Send Message</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !promotion) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 p-6 rounded-xl text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Promotion</h3>
            <p className="text-red-700 mb-4">{error || 'Promotion not found'}</p>
            <Link 
              href="/available-promotions"
              className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition inline-block"
            >
              Back to Promotions
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/available-promotions" 
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Available Promotions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Promotion Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              {promotion.featured && (
                <div className="mb-4 inline-flex items-center bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 mr-1" /> Featured Promotion
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mr-4 relative overflow-hidden">
                    {promotion.brandId?.avatar ? (
                      <Image 
                        src={promotion.brandId.avatar}
                        alt={promotion.brandId?.username || 'Brand'}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/48x48?text=B";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700 font-semibold">
                        {(promotion.brandId?.username || 'B').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold text-gray-900">{promotion.brandId?.username || "Brand"}</h2>
                      {promotion.brandId?.verified && (
                        <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <BadgeCheck className="w-3 h-3 mr-1 text-blue-600" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Posted {promotion.createdAt ? formatDate(promotion.createdAt) : 'Recently'}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleSavePromotion}
                  className="text-gray-400 hover:text-blue-600 transition-colors duration-200"
                >
                  {isSaved ? (
                    <Bookmark className="w-6 h-6 fill-blue-600 text-blue-600" />
                  ) : (
                    <BookmarkPlus className="w-6 h-6" />
                  )}
                </button>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{promotion.title}</h1>
              
              {/* Key Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1 text-green-600" />
                    <span>Budget</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.budget || 'Not specified'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-1 text-blue-600" />
                    <span>Deadline</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.deadline ? formatDate(promotion.deadline) : 'Not specified'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-purple-600" />
                    <span>Platform</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.platform || 'Any'}</p>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Tag className="w-4 h-4 mr-1 text-amber-600" />
                    <span>Category</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.category || 'General'}</p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {promotion.tags && promotion.tags.map((tag: string, idx: number) => (
                  <span key={idx} className="bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-sm flex items-center">
                    <Hash className="w-3 h-3 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
            </div>
            
            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex border-b border-gray-200">
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'description' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('description')}
                >
                  Description
                </button>
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'deliverables' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('deliverables')}
                >
                  Deliverables
                </button>
                <button 
                  className={`flex-1 py-3 font-medium text-sm ${activeTab === 'requirements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-600 hover:text-gray-900'}`}
                  onClick={() => setActiveTab('requirements')}
                >
                  Requirements
                </button>
              </div>
              
              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'description' && (
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-line">{promotion.description || 'No description provided.'}</p>
                  </div>
                )}
                
                {activeTab === 'deliverables' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Expected Deliverables</h3>
                    
                    {promotion.deliverables && promotion.deliverables.length > 0 ? (
                      <ul className="space-y-2">
                        {promotion.deliverables.map((item: string, idx: number) => (
                          <li key={idx} className="flex items-start">
                            <CheckCircle className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-gray-600">No specific deliverables have been specified for this promotion.</p>
                    )}
                    
                    {promotion.promotionType && (
                      <div className="mt-6 bg-blue-50 p-4 rounded-lg">
                        <h4 className="font-medium text-blue-800 mb-2">Promotion Type</h4>
                        <p className="text-blue-700">{promotion.promotionType}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {activeTab === 'requirements' && (
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Creator Requirements</h3>
                    
                    {promotion.requirements ? (
                      <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-800">
                        {promotion.requirements}
                      </div>
                    ) : (
                      <p className="text-gray-600">No specific requirements have been specified for this promotion.</p>
                    )}
                    
                    {promotion.timeline && (
                      <div className="mt-6">
                        <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
                        <div className="whitespace-pre-line bg-gray-50 p-4 rounded-lg text-gray-800">
                          {promotion.timeline}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Apply Button */}
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <Link 
                  href={`/promotion/${params.id}/apply`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center"
                >
                  Apply for this Promotion
                </Link>
                <p className="text-center text-gray-500 text-sm mt-2">
                  Application deadline: {promotion.deadline ? formatDate(promotion.deadline) : 'Not specified'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Brand Information */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">About the Brand</h3>
              
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full mr-3 relative overflow-hidden">
                  {promotion.brandId?.avatar ? (
                    <Image 
                      src={promotion.brandId.avatar}
                      alt={promotion.brandId?.username || 'Brand'}
                      fill
                      className="object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "https://via.placeholder.com/48x48?text=B";
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700 font-semibold">
                      {(promotion.brandId?.username || 'B').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">{promotion.brandId?.username || "Brand"}</h4>
                  <p className="text-sm text-gray-500">{promotion.brandId?.fullName || ""}</p>
                </div>
              </div>
              
              {promotion.aboutBrand && (
                <div className="mb-4">
                  <p className="text-gray-700 text-sm">{promotion.aboutBrand}</p>
                </div>
              )}
              
              {/* Verification Badges */}
              <div className="space-y-2 mb-6">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Verification Status</h4>
                {verificationLoading ? (
                  <div className="text-gray-500 text-sm flex items-center gap-2"><Shield className="w-4 h-4 animate-spin" />Loading verification status...</div>
                ) : verificationStatus ? (
                  <>
                    <div className={`flex items-center p-2 rounded-lg ${verificationStatus.idProof?.status === 'verified' ? 'bg-blue-50' : 'bg-gray-50'}`}> 
                      <BadgeCheck className={`w-5 h-5 mr-3 ${verificationStatus.idProof?.status === 'verified' ? 'text-blue-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Identity Verified</p>
                        <p className="text-xs text-gray-500">
                          {verificationStatus.idProof?.status === 'verified' 
                            ? 'Brand identity has been verified' 
                            : 'Brand has not verified their identity yet'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center p-2 rounded-lg ${(verificationStatus.payment?.upi?.status === 'verified' || verificationStatus.payment?.card?.status === 'verified') ? 'bg-green-50' : 'bg-gray-50'}`}> 
                      <Shield className={`w-5 h-5 mr-3 ${(verificationStatus.payment?.upi?.status === 'verified' || verificationStatus.payment?.card?.status === 'verified') ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Payment Verified</p>
                        <p className="text-xs text-gray-500">
                          {(verificationStatus.payment?.upi?.status === 'verified' || verificationStatus.payment?.card?.status === 'verified')
                            ? 'Payment method has been verified' 
                            : 'Brand has not verified their payment method'}
                        </p>
                      </div>
                    </div>
                    <div className={`flex items-center p-2 rounded-lg ${verificationStatus.phone?.status === 'verified' ? 'bg-teal-50' : 'bg-gray-50'}`}> 
                      <Smartphone className={`w-5 h-5 mr-3 ${verificationStatus.phone?.status === 'verified' ? 'text-teal-600' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone Verified</p>
                        <p className="text-xs text-gray-500">
                          {verificationStatus.phone?.status === 'verified' 
                            ? 'Phone number has been verified' 
                            : 'Brand has not verified their phone number'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-gray-500 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />Verification status unavailable</div>
                )}
              </div>
              
              {/* Brand Stats */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-3">Brand Statistics</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Total Spend</p>
                    <p className="font-medium text-gray-900">
                      {brandTotalSpent !== null ? `₹${brandTotalSpent.toLocaleString()}` : 'N/A'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Avg. Response Time</p>
                    <p className="font-medium text-gray-900">
                      {responseTime !== null ? `Avg. ${responseTime} hr${responseTime === 1 ? '' : 's'}` : 'Avg. 1 hr+'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Completed Projects</p>
                    <p className="font-medium text-gray-900">{completedProjects !== null ? completedProjects : 'N/A'}</p>
                  </div>
                  
                  {/* <div className="bg-gray-50 p-2 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Followers</p>
                    <p className="font-medium text-gray-900">{promotion.brandFollowers || 'N/A'}</p>
                  </div> */}
                </div>
              </div>
              
              {/* Contact Brand */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <button
                  className="w-full bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 py-2.5 px-4 rounded-lg font-medium flex items-center justify-center"
                  onClick={() => setContactModalOpen(true)}
                >
                  <Mail className="w-4 h-4 mr-2" />
                  Contact Brand
                </button>
                <ContactBrandModal
                  isOpen={contactModalOpen}
                  onClose={() => setContactModalOpen(false)}
                  brand={promotion.brandId}
                />
              </div>
            </div>
            
            {/* Similar Promotions */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Similar Promotions</h3>
              {similarLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : similarPromotions.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {similarPromotions.map((promo) => (
                    <div key={promo._id} className="border rounded-lg p-4 flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        {promo.brandId?.avatar ? (
                          <img src={promo.brandId.avatar} alt={promo.brandId.username || 'Brand'} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">B</div>
                        )}
                        <span className="font-medium text-gray-900">{promo.brandId?.username || 'Brand'}</span>
                      </div>
                      <div className="font-semibold text-gray-800">{promo.title}</div>
                      <div className="text-xs text-gray-500">{promo.category} &bull; {promo.platform}</div>
                      <Link href={`/promotion/${promo._id}`} className="text-blue-600 hover:underline text-sm mt-1">View Details</Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Megaphone className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-2">No similar promotions found</p>
                  <Link 
                    href="/available-promotions"
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    View all promotions
                  </Link>
                </div>
              )}
            </div>
            
            {/* Past Collaborations */}
            {promotion.pastCollaborations && promotion.pastCollaborations.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Past Collaborations</h3>
                
                <div className="space-y-3">
                  {promotion.pastCollaborations.map((collab: any, idx: number) => (
                    <div key={idx} className="flex items-center p-2 bg-gray-50 rounded-lg">
                      <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
                        {collab.image ? (
                          <Image 
                            src={collab.image}
                            alt={collab.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-600 font-medium">
                            {collab.name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <p className="font-medium text-gray-900">{collab.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 