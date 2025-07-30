"use client";

import { useState, useEffect } from "react";
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

export default function PromotionDetailsPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(true);
  const [isSaved, setIsSaved] = useState<boolean>(() => {
    // Check localStorage on component mount to see if this promotion is saved
    if (typeof window !== 'undefined') {
      const savedPromos = JSON.parse(localStorage.getItem('savedPromotions') || '[]');
      return savedPromos.includes(params.id);
    }
    return false;
  });
  const [showApplicationForm, setShowApplicationForm] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    rate: "",
    availability: "",
    portfolioLinks: ""
  });
  const [attachments, setAttachments] = useState<string[]>([]);

  // Mock promotion data - enhanced with verification fields and spa services
  const promotion = {
    id: params.id,
    brandId: "brand1",
    brandName: "Fitness Glow",
    brandLogo: "/images/brand-logos/fitness-glow.jpg",
    brandVerified: true,
    paymentVerified: true, 
    phoneVerified: true,
    featured: true,
    title: "Fitness Influencers Needed for Workout Supplements Campaign",
    description: "We're launching a new line of plant-based pre-workout supplements and need fitness creators to showcase their workout routine using our products. The campaign aims to highlight the natural energy boost and improved performance that our supplements provide.\n\nWe want authentic content that demonstrates real results and connects with fitness enthusiasts looking for cleaner alternatives to mainstream supplements.",
    category: "Fitness & Health",
    platform: "Instagram",
    budget: "$500-$800",
    deadline: "May 30, 2023",
    posted: "3 days ago",
    tags: ["fitness", "supplements", "workout", "health"],
    applicationsCount: 18,
    promotionType: "Product Review",
    deliverables: [
      "1 Instagram Post showing product in use",
      "3 Instagram Stories documenting experience",
      "Before/After Results with performance metrics",
      "Product packaging and details showcase"
    ],
    requirements: "• Minimum 10K followers in the fitness/health niche\n• Engagement rate above 3%\n• Previous experience with fitness product reviews\n• Authentic workout content on your feed\n• Ability to showcase measurable results",
    timeline: "• Application review: 1-2 days\n• Product shipping: 3-5 days\n• Content creation period: 2 weeks\n• Content approval: 3 days\n• Posting window: May 20-30, 2023",
    aboutBrand: "Fitness Glow is a health supplement company focused on creating natural, plant-based alternatives to traditional workout supplements. Founded in 2019, our mission is to provide fitness enthusiasts with clean energy solutions that support both performance and long-term health.",
    brandWebsite: "https://fitnessglow.example.com",
    brandFollowers: "25.5K",
    successRate: "94%",
    avgResponseTime: "12 hours",
    pastProjects: 28,
    spaServices: [
      { name: "Product Promotion", price: "$500-$800", duration: "1 week" },
      { name: "Brand Ambassador", price: "$1200-$2000", duration: "1 month" },
      { name: "Full Campaign", price: "$3000+", duration: "3 months" }
    ],
    pastCollaborations: [
      { name: "Alex Fitness", image: "/images/creators/alex-fitness.jpg" },
      { name: "GymLife", image: "/images/creators/gymlife.jpg" },
      { name: "Workout Warriors", image: "/images/creators/workout-warriors.jpg" }
    ],
    matchPercentage: 85
  };

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const toggleSavePromotion = () => {
    // Update state
    setIsSaved(prev => !prev);
    
    // Update localStorage
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
    }
  };

  const handleApplicationChange = (field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttachmentUpload = () => {
    // Simulate attachment upload
    setAttachments(prev => [...prev, "portfolio-sample.pdf"]);
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would send the application to the API
    alert("Your application has been submitted successfully! The brand will review it and get back to you soon.");
    // Reset form and close it
    setApplicationData({
      coverLetter: "",
      rate: "",
      availability: "",
      portfolioLinks: ""
    });
    setAttachments([]);
    setShowApplicationForm(false);
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

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link 
            href="/available-promotions" 
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to All Promotions
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Promotion Header */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              {promotion.featured && (
                <div className="mb-4 inline-flex items-center bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-3 py-1 rounded-full">
                  <Sparkles className="w-3 h-3 mr-1" /> Featured Promotion
                </div>
              )}
              
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full mr-4 relative overflow-hidden">
                    {/* Brand Logo */}
                    <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 to-indigo-200 text-purple-700 font-semibold">
                      {promotion.brandName.charAt(0)}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold text-gray-900">{promotion.brandName}</h2>
                      {promotion.brandVerified && (
                        <span className="ml-2 bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <BadgeCheck className="w-3 h-3 mr-1 text-purple-600" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Posted {promotion.posted}</p>
                  </div>
                </div>
                <button 
                  onClick={toggleSavePromotion}
                  className="text-gray-400 hover:text-purple-600 transition-colors duration-200"
                >
                  {isSaved ? (
                    <Bookmark className="w-6 h-6 fill-purple-600 text-purple-600" />
                  ) : (
                    <BookmarkPlus className="w-6 h-6" />
                  )}
                </button>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-4">{promotion.title}</h1>
              
              {/* Match Badge */}
              {promotion.matchPercentage >= 80 && (
                <div className="inline-flex items-center bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-4">
                  <Star className="w-4 h-4 mr-1 fill-green-500 text-green-500" />
                  {promotion.matchPercentage}% match with your profile
                </div>
              )}
              
              {/* Key Details */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:border-purple-100 transition-colors duration-200">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <DollarSign className="w-4 h-4 mr-1 text-purple-500" />
                    <span>Budget</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.budget}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:border-purple-100 transition-colors duration-200">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                    <span>Deadline</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.deadline}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:border-purple-100 transition-colors duration-200">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Globe className="w-4 h-4 mr-1 text-purple-500" />
                    <span>Platform</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.platform}</p>
                </div>
                
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg p-3 border border-gray-100 hover:border-purple-100 transition-colors duration-200">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Briefcase className="w-4 h-4 mr-1 text-purple-500" />
                    <span>Type</span>
                  </div>
                  <p className="font-medium text-gray-900">{promotion.promotionType}</p>
                </div>
              </div>
              
              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-6">
                {promotion.tags.map((tag, idx) => (
                  <span key={idx} className="bg-gradient-to-r from-purple-50 to-indigo-50 text-purple-700 px-3 py-1.5 rounded-full text-sm flex items-center hover:from-purple-100 hover:to-indigo-100 transition-colors duration-200 cursor-pointer">
                    <Hash className="w-3.5 h-3.5 mr-1" />
                    {tag}
                  </span>
                ))}
              </div>
              
              {/* Description */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{promotion.description}</p>
              </div>
              
              {/* Deliverables */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Deliverables</h3>
                <ul className="space-y-2">
                  {promotion.deliverables.map((item, idx) => (
                    <li key={idx} className="flex items-start bg-gradient-to-r from-purple-50 to-indigo-50 p-3 rounded-lg">
                      <CheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Requirements */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-line">{promotion.requirements}</p>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Timeline</h3>
                <div className="bg-gradient-to-r from-gray-50 to-white p-4 rounded-lg border border-gray-100">
                  <p className="text-gray-700 whitespace-pre-line">{promotion.timeline}</p>
                </div>
              </div>
              
              {/* Apply Button for Mobile */}
              <div className="block lg:hidden">
                <button 
                  onClick={() => setShowApplicationForm(true)}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 shadow-sm flex items-center justify-center"
                >
                  <MessageSquare className="w-5 h-5 mr-2" />
                  Apply for this Promotion
                </button>
              </div>
            </div>
            
            {/* Application Form (Shown when Apply is clicked) */}
            {showApplicationForm && (
              <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Apply for this Promotion</h2>
                  <button 
                    onClick={() => setShowApplicationForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <ChevronDown className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmitApplication}>
                  <div className="space-y-4 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Why are you a good fit for this promotion?</label>
                      <textarea 
                        rows={4}
                        placeholder="Introduce yourself and explain why you're interested in this opportunity..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                        value={applicationData.coverLetter}
                        onChange={(e) => handleApplicationChange('coverLetter', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Your Rate</label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                        <input 
                          type="text"
                          placeholder="Your preferred rate for this promotion" 
                          className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                          value={applicationData.rate}
                          onChange={(e) => handleApplicationChange('rate', e.target.value)}
                          required
                        />
                      </div>
                      <p className="mt-1 text-xs text-gray-500">Enter an amount within the brand's budget range: {promotion.budget}</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                      <input 
                        type="text"
                        placeholder="When can you deliver the content?" 
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                        value={applicationData.availability}
                        onChange={(e) => handleApplicationChange('availability', e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Relevant Portfolio Links</label>
                      <textarea 
                        rows={2}
                        placeholder="Share links to similar content you've created in the past..."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                        value={applicationData.portfolioLinks}
                        onChange={(e) => handleApplicationChange('portfolioLinks', e.target.value)}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Attachments</label>
                      <div className="border-2 border-dashed border-gray-300 hover:border-purple-300 transition-colors duration-200 rounded-lg p-4">
                        {attachments.length > 0 ? (
                          <ul className="space-y-2 mb-4">
                            {attachments.map((file, idx) => (
                              <li key={idx} className="flex items-center text-sm">
                                <PaperclipIcon className="w-4 h-4 text-purple-500 mr-2" />
                                <span>{file}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-sm text-gray-500 text-center mb-4">
                            Drag and drop files here or click to upload
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleAttachmentUpload}
                          className="w-full py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition-colors duration-200 text-sm font-medium"
                        >
                          Add Attachment
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setShowApplicationForm(false)}
                      className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 shadow-sm"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            {/* Apply Card */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 sticky top-6 hover:shadow-lg transition-all duration-300">
              <div className="mb-4 text-center">
                <Users className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-gray-600">
                  <span className="font-semibold text-gray-900">{promotion.applicationsCount}</span> creators have applied
                </p>
              </div>
              
              <Link 
                href={`/apply-promotion/${promotion.id}`}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 shadow-sm flex items-center justify-center mb-4"
              >
                <MessageSquare className="w-5 h-5 mr-2" />
                Apply for this Promotion
              </Link>
              
              <button 
                onClick={toggleSavePromotion}
                className="w-full py-3 border border-purple-300 text-purple-700 rounded-lg font-medium hover:bg-purple-50 transition-colors duration-200 flex items-center justify-center"
              >
                {isSaved ? (
                  <>
                    <Bookmark className="w-5 h-5 mr-2 fill-purple-600 text-purple-600" />
                    Saved to Your List
                  </>
                ) : (
                  <>
                    <BookmarkPlus className="w-5 h-5 mr-2" />
                    Save for Later
                  </>
                )}
              </button>
            </div>
            
            {/* Spa Services Card - New */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-purple-600" />
                Spa Services Offered
              </h3>
              
              <div className="space-y-3">
                {promotion.spaServices.map((service, idx) => (
                  <div key={idx} className="border border-gray-100 rounded-lg p-3 hover:border-purple-200 transition-colors duration-200">
                    <div className="flex justify-between items-center mb-1">
                      <span className="font-medium text-gray-900">{service.name}</span>
                      <span className="text-purple-600 font-medium">{service.price}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>{service.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 pt-3 border-t border-gray-100 text-center">
                <Link 
                  href={`/brand/${promotion.brandId}`}
                  className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors duration-200"
                >
                  View all services <ChevronRight className="w-4 h-4 inline ml-1" />
                </Link>
              </div>
            </div>
            
            {/* Verification Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-purple-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Verification Status
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Brand Verification</span>
                  <span className={`text-sm font-medium flex items-center ${promotion.brandVerified ? 'text-green-600' : 'text-gray-400'}`}>
                    {promotion.brandVerified ? (
                      <>
                        <BadgeCheck className="w-4 h-4 mr-1" /> Verified
                      </>
                    ) : (
                      'Not Verified'
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Payment Method</span>
                  <span className={`text-sm font-medium flex items-center ${promotion.paymentVerified ? 'text-green-600' : 'text-gray-400'}`}>
                    {promotion.paymentVerified ? (
                      <>
                        <Shield className="w-4 h-4 mr-1" /> Verified
                      </>
                    ) : (
                      'Not Verified'
                    )}
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Phone Number</span>
                  <span className={`text-sm font-medium flex items-center ${promotion.phoneVerified ? 'text-green-600' : 'text-gray-400'}`}>
                    {promotion.phoneVerified ? (
                      <>
                        <Smartphone className="w-4 h-4 mr-1" /> Verified
                      </>
                    ) : (
                      'Not Verified'
                    )}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Brand Performance - New */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-purple-600" />
                Brand Performance
              </h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Success Rate</span>
                  <span className="text-sm font-medium text-green-600">{promotion.successRate}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Avg. Response Time</span>
                  <span className="text-sm font-medium">{promotion.avgResponseTime}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-700">Completed Projects</span>
                  <span className="text-sm font-medium">{promotion.pastProjects}</span>
                </div>
              </div>
            </div>
            
            {/* About Brand */}
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition-all duration-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Brand</h3>
              <p className="text-gray-700 mb-4">{promotion.aboutBrand}</p>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-gray-500">Brand Website</span>
                <a 
                  href={promotion.brandWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:text-purple-800 text-sm font-medium transition-colors duration-200"
                >
                  Visit Site <ChevronRight className="w-4 h-4 inline ml-1" />
                </a>
              </div>
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">Social Followers</span>
                <span className="text-sm font-medium">{promotion.brandFollowers}</span>
              </div>
              
              {promotion.pastCollaborations.length > 0 && (
                <>
                  <h4 className="text-sm font-medium text-gray-900 mb-3">Past Collaborations</h4>
                  <div className="flex -space-x-2">
                    {promotion.pastCollaborations.map((collab, idx) => (
                      <div key={idx} className="w-10 h-10 rounded-full border-2 border-white relative">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-200 to-indigo-200 flex items-center justify-center text-xs font-medium text-purple-700">
                          {collab.name.charAt(0)}
                        </div>
                      </div>
                    ))}
                    <div className="w-10 h-10 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center text-xs text-gray-500">
                      +{promotion.pastCollaborations.length > 3 ? promotion.pastCollaborations.length - 3 : 0}
                    </div>
                  </div>
                </>
              )}
            </div>
            
            {/* Need Help */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-5 border border-purple-100">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-purple-600 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">Need Help?</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Have questions about this promotion or how to apply?
                  </p>
                  <Link 
                    href="/support"
                    className="text-sm text-purple-600 font-medium hover:text-purple-800 transition-colors duration-200"
                  >
                    Contact Support <ChevronRight className="w-4 h-4 inline ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
} 