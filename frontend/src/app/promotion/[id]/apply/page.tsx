"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../../../components/layout/DashboardLayout";
import { 
  ArrowLeft, Calendar, DollarSign, Briefcase, Clock, 
  Tag, CheckCircle, MessageSquare, Bookmark, BookmarkPlus, 
  Globe, Target, Layers, PaperclipIcon, Send, Users, Star, Heart,
  Mail, AlertCircle, Megaphone, Hash, ChevronRight, ChevronDown,
  BadgeCheck, Shield, Smartphone, Award, Sparkles, Upload
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPromotionById, applyToPromotion, getBrandVerificationById, getPromotionApplications } from "../../../../services/api";
import { useAuth } from "../../../../context/AuthContext";

export default function ApplyPromotionPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [promotion, setPromotion] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const [applicationData, setApplicationData] = useState({
    message: "",
    proposedRate: "",
    availability: "",
    deliverables: "",
    portfolio: ""
  });

  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);

  const { user } = useAuth();
  const [alreadyApplied, setAlreadyApplied] = useState(false);

  // Fetch promotion data
  const fetchPromotion = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getPromotionById(params.id);
      setPromotion(response.data);
      // Fetch brand verification status if brandId is available
      if (response.data && response.data.brandId && response.data.brandId._id) {
        setVerificationLoading(true);
        const vRes = await getBrandVerificationById(response.data.brandId._id);
        if (vRes.success && 'data' in vRes && vRes.data && vRes.data.verificationRequest) {
          setVerificationStatus(vRes.data.verificationRequest);
        } else {
          setVerificationStatus(null);
        }
        setVerificationLoading(false);
      } else {
        setVerificationStatus(null);
        setVerificationLoading(false);
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

  useEffect(() => {
    fetchPromotion();
  }, [fetchPromotion]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setApplicationData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const data = {
        promotionId: params.id,
        ...applicationData
      };
      
      await applyToPromotion(data);
      setSubmitSuccess(true);
      
      // Reset form
      setApplicationData({
        message: "",
        proposedRate: "",
        availability: "",
        deliverables: "",
        portfolio: ""
      });
    } catch (err: any) {
      console.error('Error applying to promotion:', err);
      setError('Failed to submit application. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date if available
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-blue-600 rounded-full border-t-transparent"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !promotion) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-red-50 p-6 rounded-xl text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Promotion</h3>
            <p className="text-red-700 mb-4">{error}</p>
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

  if (alreadyApplied) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-yellow-50 p-8 rounded-xl text-center">
            <div className="w-16 h-16 bg-yellow-100 mx-auto rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-yellow-800 mb-2">You have already applied!</h2>
            <p className="text-yellow-700 mb-6">You can only apply to this promotion once. Please wait for the brand to review your application.</p>
            <div className="flex justify-center gap-4">
              <Link 
                href={`/promotion/${params.id}`}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                View Promotion
              </Link>
              <Link 
                href="/available-promotions"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse More Promotions
              </Link>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (submitSuccess) {
    return (
      <DashboardLayout>
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="bg-green-50 p-8 rounded-xl text-center">
            <div className="w-16 h-16 bg-green-100 mx-auto rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Application Submitted!</h2>
            <p className="text-green-700 mb-6">Your application has been successfully submitted to the brand.</p>
            <p className="text-gray-600 mb-8">The brand will review your application and contact you if they're interested in working with you.</p>
            <div className="flex justify-center gap-4">
              <Link 
                href={`/promotion/${params.id}`}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                View Promotion
              </Link>
              <Link 
                href="/available-promotions"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Browse More Promotions
              </Link>
            </div>
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
            href={`/promotion/${params.id}`}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Promotion Details
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Application Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Apply for this Promotion</h1>
              
              {error && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                  <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}
              
              <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                  {/* Cover Letter */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Cover Letter <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={applicationData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Introduce yourself and explain why you're a good fit for this promotion..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Explain why you're interested in this promotion and what makes you a good fit. Be specific!
                    </p>
                  </div>
                  
                  {/* Proposed Rate */}
                  <div>
                    <label htmlFor="proposedRate" className="block text-sm font-medium text-gray-700 mb-1">
                      Your Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                      <input
                        type="text"
                        id="proposedRate"
                        name="proposedRate"
                        value={applicationData.proposedRate}
                        onChange={handleInputChange}
                        className="w-full pl-7 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter your proposed rate"
                        required
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested budget: {promotion?.budget || 'Not specified'}
                    </p>
                  </div>
                  
                  {/* Availability */}
                  <div>
                    <label htmlFor="availability" className="block text-sm font-medium text-gray-700 mb-1">
                      Availability <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="availability"
                      name="availability"
                      value={applicationData.availability}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="When can you start? (e.g., 'Immediately', 'Next week', etc.)"
                      required
                    />
                  </div>
                  
                  {/* Deliverables */}
                  <div>
                    <label htmlFor="deliverables" className="block text-sm font-medium text-gray-700 mb-1">
                      Proposed Deliverables <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="deliverables"
                      name="deliverables"
                      value={applicationData.deliverables}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Describe what you'll deliver for this promotion..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Be specific about what you'll deliver, including format, quantity, and timeline.
                    </p>
                  </div>
                  
                  {/* Portfolio Links */}
                  <div>
                    <label htmlFor="portfolio" className="block text-sm font-medium text-gray-700 mb-1">
                      Portfolio Links
                    </label>
                    <textarea
                      id="portfolio"
                      name="portfolio"
                      value={applicationData.portfolio}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Share links to relevant work in your portfolio or past collaborations..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Share links to your best work that's relevant to this promotion. One URL per line.
                    </p>
                  </div>
                  
                  {/* Submit Button */}
                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className={`w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium flex items-center justify-center ${
                        submitting ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {submitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Submitting Application...
                        </>
                      ) : (
                        'Submit Application'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          
          {/* Promotion Summary */}
          <div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 sticky top-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Promotion Summary</h2>
              
              <div className="space-y-4">
                {/* Brand Info */}
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-gray-200 rounded-full relative overflow-hidden">
                    {promotion?.brandId?.avatar ? (
                      <Image 
                        src={promotion.brandId.avatar}
                        alt={promotion.brandId?.username || 'Brand'}
                        fill
                        className="object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = "https://via.placeholder.com/40x40?text=B";
                        }}
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-300 text-gray-700 font-semibold">
                        {(promotion?.brandId?.username || 'B').charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="flex items-center">
                      <p className="font-medium text-gray-900">{promotion?.brandId?.username || "Brand"}</p>
                      {promotion?.brandId?.verified && (
                        <BadgeCheck className="w-4 h-4 ml-1 text-blue-600" />
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Verification Statuses */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {verificationLoading ? (
                    <span className="text-xs text-gray-400">Loading verification...</span>
                  ) : (
                    <>
                      {/* Identity Verified */}
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${verificationStatus?.idProof?.status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle className={`w-4 h-4 mr-1 ${verificationStatus?.idProof?.status === 'verified' ? 'text-green-600' : 'text-gray-400'}`} />
                        Identity {verificationStatus?.idProof?.status === 'verified' ? 'Verified' : 'Not Verified'}
                      </span>
                      {/* Payment Verified */}
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${(verificationStatus?.payment?.upi?.status === 'verified' || verificationStatus?.payment?.card?.status === 'verified') ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle className={`w-4 h-4 mr-1 ${(verificationStatus?.payment?.upi?.status === 'verified' || verificationStatus?.payment?.card?.status === 'verified') ? 'text-green-600' : 'text-gray-400'}`} />
                        Payment {(verificationStatus?.payment?.upi?.status === 'verified' || verificationStatus?.payment?.card?.status === 'verified') ? 'Verified' : 'Not Verified'}
                      </span>
                      {/* Phone Verified */}
                      <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium ${verificationStatus?.phone?.status === 'verified' ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle className={`w-4 h-4 mr-1 ${verificationStatus?.phone?.status === 'verified' ? 'text-green-600' : 'text-gray-400'}`} />
                        Phone {verificationStatus?.phone?.status === 'verified' ? 'Verified' : 'Not Verified'}
                      </span>
                    </>
                  )}
                </div>
                
                {/* Title */}
                <div>
                  <h3 className="font-medium text-gray-900">{promotion?.title}</h3>
                </div>
                
                {/* Key Details */}
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-500">
                      <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                      <span>Budget:</span>
                    </div>
                    <span className="font-medium text-gray-900">{promotion?.budget || 'Not specified'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-500">
                      <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                      <span>Deadline:</span>
                    </div>
                    <span className="font-medium text-gray-900">
                      {promotion?.deadline ? formatDate(promotion.deadline) : 'Not specified'}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-500">
                      <Globe className="w-4 h-4 mr-2 text-purple-600" />
                      <span>Platform:</span>
                    </div>
                    <span className="font-medium text-gray-900">{promotion?.platform || 'Any'}</span>
                  </div>
                  
                  <div className="flex items-center justify-between py-2">
                    <div className="flex items-center text-gray-500">
                      <Tag className="w-4 h-4 mr-2 text-amber-600" />
                      <span>Category:</span>
                    </div>
                    <span className="font-medium text-gray-900">{promotion?.category || 'General'}</span>
                  </div>
                </div>
                
                {/* Tags */}
                {promotion?.tags && promotion.tags.length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500 mb-2">Tags:</p>
                    <div className="flex flex-wrap gap-2">
                      {promotion.tags.map((tag: string, idx: number) => (
                        <span key={idx} className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs flex items-center">
                          <Hash className="w-3 h-3 mr-0.5" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Tips for Application */}
                <div className="pt-3 border-t border-gray-200">
                  <h4 className="font-medium text-gray-900 mb-2">Tips for Your Application</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Be specific about your experience and skills relevant to this promotion</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Explain why your audience is a good fit for the brand</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Share examples of similar work you've done in the past</span>
                    </li>
                    <li className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span>Be clear about your proposed deliverables and timeline</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 