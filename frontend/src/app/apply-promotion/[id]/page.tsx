"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../../../components/layout/DashboardLayout";
import { 
  ArrowLeft, Calendar, DollarSign, Briefcase, Clock, 
  CheckCircle, MessageSquare, Bookmark, BookmarkPlus, 
  Globe, PaperclipIcon, Send, Users, Star, Mail,
  AlertCircle, Hash, ChevronRight, BadgeCheck, Shield,
  Upload, Smartphone, Award, Image as ImageIcon, Link as LinkIcon,
  UploadCloud, FileText, Trash2, Sparkles
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ApplyPromotionPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [applicationData, setApplicationData] = useState({
    coverLetter: "",
    rate: "",
    availability: "",
    deliveryTime: "1 week",
    portfolioLinks: "",
    additionalNotes: ""
  });
  const [attachments, setAttachments] = useState<{name: string, size: string, type: string}[]>([]);
  const [selectedTab, setSelectedTab] = useState<'overview' | 'application'>('overview');
  const [isEditorExpanded, setIsEditorExpanded] = useState(false);

  // Mock promotion data
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
    description: "We're launching a new line of plant-based pre-workout supplements and need fitness creators to showcase their workout routine using our products. The campaign aims to highlight the natural energy boost and improved performance that our supplements provide.",
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
      "Before/After Results with performance metrics"
    ],
    requirements: [
      "Minimum 10K followers in the fitness/health niche",
      "Engagement rate above 3%",
      "Previous experience with fitness product reviews",
      "Authentic workout content on your feed",
      "Ability to showcase measurable results"
    ],
    timeline: [
      "Application review: 1-2 days",
      "Product shipping: 3-5 days",
      "Content creation period: 2 weeks",
      "Content approval: 3 days",
      "Posting window: May 20-30, 2023"
    ],
    matchPercentage: 85
  };

  // Sample creator profile for matching
  const creatorProfile = {
    name: "Alex Fitness",
    username: "alexfitness",
    followers: 15000,
    engagementRate: 4.2,
    category: "Fitness & Health",
    platforms: ["Instagram", "TikTok"],
    previousCategories: ["fitness", "health", "nutrition"],
    completedProjects: 12
  };

  const deliveryTimeOptions = [
    "3 days", 
    "1 week", 
    "2 weeks", 
    "3 weeks", 
    "4 weeks",
    "Custom"
  ];

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleChange = (field: string, value: string) => {
    setApplicationData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAttachmentAdd = () => {
    // Simulate attachment upload
    const files = [
      { name: "portfolio-sample.pdf", size: "2.4 MB", type: "pdf" },
      { name: "previous-promotion.jpg", size: "1.2 MB", type: "image" },
      { name: "engagement-stats.xlsx", size: "0.8 MB", type: "excel" }
    ];
    
    // Add a random file from the list that's not already added
    const availableFiles = files.filter(file => 
      !attachments.some(attachment => attachment.name === file.name)
    );
    
    if (availableFiles.length > 0) {
      const randomFile = availableFiles[Math.floor(Math.random() * availableFiles.length)];
      setAttachments(prev => [...prev, randomFile]);
    }
  };

  const handleAttachmentRemove = (fileName: string) => {
    setAttachments(prev => prev.filter(file => file.name !== fileName));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setSubmitLoading(false);
      alert("Your application has been submitted successfully! The brand will review it and get back to you soon.");
      router.push("/creator-dashboard");
    }, 1500);
  };

  const getFileIcon = (fileType: string) => {
    switch(fileType) {
      case 'pdf':
        return <FileText className="w-4 h-4 text-red-500" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-500" />;
      case 'excel':
        return <FileText className="w-4 h-4 text-green-500" />;
      default:
        return <PaperclipIcon className="w-4 h-4 text-gray-500" />;
    }
  };

  // Calculate match strength areas
  const matchStrengths = [
    { name: "Category Match", strength: 100, description: "You're in the exact category this brand is looking for" },
    { name: "Follower Count", strength: 95, description: "You exceed the minimum follower requirement" },
    { name: "Engagement Rate", strength: 90, description: "Your engagement rate is above the required minimum" },
    { name: "Content Experience", strength: 85, description: "You've created similar content before" }
  ];

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
        {/* Header */}
        <div className="mb-6">
          <Link 
            href={`/promotion-details/${promotion.id}`} 
            className="flex items-center text-purple-600 hover:text-purple-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Promotion Details
          </Link>
        </div>
        
        {/* Main Application Container */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          {/* Header Banner with Gradient */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
            <h1 className="text-2xl font-bold mb-2">Apply for Promotion</h1>
            <p className="text-purple-100">Complete your application for "{promotion.title}"</p>
          </div>
          
          {/* Tabs Navigation */}
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                  selectedTab === 'overview' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('overview')}
              >
                Promotion Overview
              </button>
              <button
                className={`py-4 px-6 font-medium text-sm focus:outline-none ${
                  selectedTab === 'application' 
                  ? 'text-purple-600 border-b-2 border-purple-600' 
                  : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setSelectedTab('application')}
              >
                Your Application
              </button>
            </div>
          </div>
          
          {/* Tab Content */}
          <div className="p-6">
            {selectedTab === 'overview' ? (
              <div className="space-y-6">
                {/* Promotion Overview Section */}
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-full relative overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-purple-200 to-indigo-200 text-purple-700 font-semibold">
                        {promotion.brandName.charAt(0)}
                      </div>
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center">
                      <h2 className="text-lg font-semibold text-gray-900">{promotion.brandName}</h2>
                      {promotion.brandVerified && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center">
                          <BadgeCheck className="w-3 h-3 mr-1" /> Verified
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">Posted {promotion.posted}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{promotion.title}</h3>
                  <p className="text-gray-700">{promotion.description}</p>
                </div>
                
                {/* Match Percentage Card */}
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 border border-purple-100">
                  <div className="flex items-center mb-3">
                    <Star className="w-5 h-5 text-purple-600 mr-2 fill-purple-600" />
                    <h3 className="font-semibold text-gray-900">Profile Match</h3>
                    <span className="ml-auto bg-purple-100 text-purple-800 text-sm px-2 py-0.5 rounded-full">
                      {promotion.matchPercentage}% Match
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    {matchStrengths.map((strength, idx) => (
                      <div key={idx} className="flex items-center">
                        <div className="w-1/3 text-sm text-gray-700">{strength.name}</div>
                        <div className="w-2/3 flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div 
                              className="bg-gradient-to-r from-purple-600 to-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${strength.strength}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-600">{strength.strength}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Key Details */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <DollarSign className="w-4 h-4 mr-1 text-purple-500" />
                      <span>Budget</span>
                    </div>
                    <p className="font-medium">{promotion.budget}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Calendar className="w-4 h-4 mr-1 text-purple-500" />
                      <span>Deadline</span>
                    </div>
                    <p className="font-medium">{promotion.deadline}</p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center text-sm text-gray-500 mb-1">
                      <Briefcase className="w-4 h-4 mr-1 text-purple-500" />
                      <span>Type</span>
                    </div>
                    <p className="font-medium">{promotion.promotionType}</p>
                  </div>
                </div>
                
                {/* Deliverables & Requirements Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Deliverables</h3>
                    <ul className="space-y-2">
                      {promotion.deliverables.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Requirements</h3>
                    <ul className="space-y-2">
                      {promotion.requirements.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Timeline */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Project Timeline</h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <ul className="space-y-2">
                      {promotion.timeline.map((item, idx) => (
                        <li key={idx} className="flex items-start">
                          <Clock className="w-5 h-5 text-purple-600 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="text-gray-700">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* CTA to apply */}
                <div className="flex justify-center">
                  <button
                    onClick={() => setSelectedTab('application')}
                    className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 shadow-sm flex items-center"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Your Application
                  </button>
                </div>
              </div>
            ) : (
              <div>
                {/* Application Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Message to Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Message to Brand <span className="text-red-500">*</span>
                    </label>
                    <div className={`relative ${isEditorExpanded ? 'h-96' : ''}`}>
                      <textarea 
                        rows={isEditorExpanded ? 12 : 5}
                        placeholder="Introduce yourself and explain why you're a great fit for this promotion. Be specific about your experience with similar content and how you plan to showcase this product."
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                        value={applicationData.coverLetter}
                        onChange={(e) => handleChange('coverLetter', e.target.value)}
                        required
                      />
                      <button
                        type="button"
                        className="absolute bottom-2 right-2 text-gray-400 hover:text-purple-600 transition-colors duration-200"
                        onClick={() => setIsEditorExpanded(!isEditorExpanded)}
                      >
                        <svg 
                          className="w-4 h-4" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          {isEditorExpanded 
                            ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 14h5m7 0h5M7 10V4m0 0L3 8m4-4l4 4" /> 
                            : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                          }
                        </svg>
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      The brand will see this message when reviewing your application
                    </p>
                  </div>
                  
                  {/* Pricing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                      <input 
                        type="text"
                        placeholder="Enter your rate for this promotion" 
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                        value={applicationData.rate}
                        onChange={(e) => handleChange('rate', e.target.value)}
                        required
                      />
                    </div>
                    <div className="flex items-center mt-1">
                      <p className="text-xs text-gray-500">
                        Brand's budget: <span className="font-medium">{promotion.budget}</span> 
                      </p>
                      <div className="ml-auto flex items-center">
                        <span className="text-xs text-purple-600 font-medium mr-1">Price Guide</span>
                        <InfoIcon />
                      </div>
                    </div>
                  </div>
                  
                  {/* Delivery Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Delivery Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {deliveryTimeOptions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          className={`px-4 py-2 text-sm rounded-lg transition-colors duration-200 ${
                            applicationData.deliveryTime === option
                              ? 'bg-purple-100 text-purple-700 border border-purple-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                          }`}
                          onClick={() => handleChange('deliveryTime', option)}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Availability */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Availability <span className="text-red-500">*</span>
                    </label>
                    <input 
                      type="text"
                      placeholder="When can you start working on this project?" 
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                      value={applicationData.availability}
                      onChange={(e) => handleChange('availability', e.target.value)}
                      required
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      E.g., "Available to start immediately" or "Available after May 15th"
                    </p>
                  </div>
                  
                  {/* Portfolio Items */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relevant Portfolio Links
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-5 h-5" />
                      <textarea
                        rows={2}
                        placeholder="Share links to similar content you've created"
                        className="w-full pl-10 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                        value={applicationData.portfolioLinks}
                        onChange={(e) => handleChange('portfolioLinks', e.target.value)}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      Add links to content similar to what this brand is looking for (optional but recommended)
                    </p>
                  </div>
                  
                  {/* Attachments */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Attachments
                    </label>
                    <div className="border-2 border-dashed border-gray-300 hover:border-purple-300 transition-colors duration-200 rounded-lg overflow-hidden">
                      <div className="p-4">
                        {attachments.length > 0 ? (
                          <ul className="space-y-2 mb-4">
                            {attachments.map((file, idx) => (
                              <li key={idx} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                                <div className="flex items-center">
                                  {getFileIcon(file.type)}
                                  <span className="ml-2 text-sm font-medium">{file.name}</span>
                                  <span className="ml-2 text-xs text-gray-500">{file.size}</span>
                                </div>
                                <button 
                                  type="button"
                                  onClick={() => handleAttachmentRemove(file.name)}
                                  className="text-gray-400 hover:text-red-500 transition-colors duration-200"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-6">
                            <UploadCloud className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                            <p className="text-sm text-gray-500 mb-1">
                              Drag and drop your files here, or click to upload
                            </p>
                            <p className="text-xs text-gray-400">
                              Accepted file types: JPG, PNG, PDF, DOC, MP4 (Max 10MB)
                            </p>
                          </div>
                        )}
                        
                        <button
                          type="button"
                          onClick={handleAttachmentAdd}
                          className="w-full py-2.5 mt-2 border border-purple-300 text-purple-700 rounded-lg hover:bg-purple-50 transition-colors duration-200 text-sm font-medium flex items-center justify-center"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Upload Files
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Additional Notes
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Any additional information or questions for the brand?"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent hover:border-purple-300 transition-colors duration-200"
                      value={applicationData.additionalNotes}
                      onChange={(e) => handleChange('additionalNotes', e.target.value)}
                    />
                  </div>
                  
                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => setSelectedTab('overview')}
                      className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={submitLoading}
                      className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-indigo-700 transition-colors duration-200 shadow-sm flex items-center"
                    >
                      {submitLoading ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent mr-2"></div>
                          Submitting...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 mr-2" />
                          Submit Application
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Info icon component
function InfoIcon() {
  return (
    <div className="relative group">
      <button className="w-4 h-4 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs">
        ?
      </button>
      <div className="absolute z-10 bottom-full right-0 mb-2 w-64 p-3 bg-white rounded-lg shadow-lg border border-gray-200 transform scale-0 group-hover:scale-100 transition-transform duration-200 origin-bottom-right">
        <h4 className="text-xs font-semibold text-gray-900 mb-1">Price Guide</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Small creators (1K-10K): $100-$300</li>
          <li>• Medium creators (10K-50K): $300-$800</li>
          <li>• Large creators (50K-100K): $800-$2,000</li>
          <li>• Major creators (100K+): $2,000+</li>
        </ul>
        <p className="text-xs text-gray-500 mt-1">Prices may vary based on deliverables and requirements</p>
      </div>
    </div>
  );
} 