"use client";

import { useState, useEffect, useCallback } from "react";
import { DashboardLayout } from "../../components/layout/DashboardLayout";
import { 
  Search, Filter, Briefcase, Star, Clock, ChevronDown, 
  DollarSign, Calendar, Tag, CheckCircle, MessageSquare,
  Bookmark, BookmarkPlus, ThumbsUp, Heart, Users, Megaphone,
  Hash, ArrowUp, ArrowDown, Globe, Target, Sliders, X, AlertCircle,
  Sparkles, TrendingUp, Shield, BadgeCheck
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { getPromotions, applyToPromotion } from "../../services/api";

export default function AvailablePromotionsPage() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "",
    platform: "",
    minBudget: "",
    maxBudget: "",
    sortBy: "newest"
  });
  const [showFilters, setShowFilters] = useState(false);
  const [savedPromotions, setSavedPromotions] = useState<string[]>([]);
  const [hoveredPromo, setHoveredPromo] = useState<string | null>(null);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [applyingTo, setApplyingTo] = useState<string | null>(null);

  // Mock data for demonstration
  const categories = [
    "All Categories",
    "Fashion & Lifestyle",
    "Beauty & Personal Care",
    "Food & Cooking",
    "Travel & Adventure",
    "Tech & Gaming",
    "Fitness & Health",
    "Home & Decor",
    "Business & Finance",
    "Entertainment"
  ];

  const platforms = [
    "All Platforms",
    "Instagram",
    "TikTok",
    "YouTube",
    "Twitter",
    "Facebook",
    "Multiple Platforms"
  ];

  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "highest-budget", label: "Highest Budget" },
    { value: "deadline", label: "Deadline (Soonest)" },
    { value: "relevance", label: "Relevance to You" }
  ];

  useEffect(() => {
    // Get username from localStorage on mount only
    const storedUsername = localStorage.getItem('username');
    setUsername(storedUsername);
  }, []);

  const fetchPromotions = useCallback(async () => {
    try {
      setLoading(true);
      
      const filterParams = {
        category: filters.category,
        platform: filters.platform,
        minBudget: filters.minBudget ? parseInt(filters.minBudget) : undefined,
        maxBudget: filters.maxBudget ? parseInt(filters.maxBudget) : undefined,
        sortBy: filters.sortBy
      };
      
      console.log('Fetching promotions with filters:', filterParams);
      const response = await getPromotions(filterParams, page, 10);
      
      setPromotions(response.data || []);
      setTotalPages(response.pagination?.pages || 1);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching promotions:', err);
      setError(err.message || 'Failed to load promotions');
      setLoading(false);
    }
  }, [filters.category, filters.platform, filters.minBudget, filters.maxBudget, filters.sortBy, page]);

  useEffect(() => {
    // Fetch promotions when filters or page changes
    fetchPromotions();
  }, [page, filters.category, filters.platform, filters.minBudget, filters.maxBudget, filters.sortBy, fetchPromotions]);

  const handleFilterChange = (field: string, value: string) => {
    // Reset to page 1 when filters change
    setPage(1);
    
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Filter changes are handled by the useEffect dependency on filters
  };

  const handleResetFilters = () => {
    setPage(1);
    setFilters({
      category: "",
      platform: "",
      minBudget: "",
      maxBudget: "",
      sortBy: "newest"
    });
    
    // Reset triggers a refetch via useEffect
  };

  const toggleSavePromotion = (promoId: string) => {
    if (savedPromotions.includes(promoId)) {
      setSavedPromotions(prev => prev.filter(id => id !== promoId));
    } else {
      setSavedPromotions(prev => [...prev, promoId]);
    }
  };

  const handleApply = async (promotionId: string) => {
    try {
      setApplyingTo(promotionId);
      
      // In a real implementation, you would open a modal to collect application details
      // For now, let's just redirect to a detail page
      window.location.href = `/promotion/${promotionId}/apply`;
      
      setApplyingTo(null);
    } catch (err: any) {
      console.error('Error applying to promotion:', err);
      alert('Failed to apply to promotion: ' + (err.message || 'Unknown error'));
      setApplyingTo(null);
    }
  };

  // Filter promotions based on user selections
  const filteredPromotions = promotions.filter(promo => {
    if (!promo) return false;
    
    if (filters.category && filters.category !== "All Categories" && promo?.category !== filters.category) {
      return false;
    }
    if (filters.platform && filters.platform !== "All Platforms" && promo?.platform !== filters.platform) {
      return false;
    }
    
    // Budget filtering
    if (filters.minBudget && filters.minBudget.trim() !== '') {
      const minBudget = parseInt(filters.minBudget);
      if (!isNaN(minBudget)) {
        // Extract numeric value from budget string
        const budgetValue = promo?.budget 
          ? parseInt(promo.budget.toString().replace(/\D/g, '')) || 0 
          : 0;
        if (budgetValue < minBudget) return false;
      }
    }
    
    if (filters.maxBudget && filters.maxBudget.trim() !== '') {
      const maxBudget = parseInt(filters.maxBudget);
      if (!isNaN(maxBudget)) {
        // Extract numeric value from budget string
        const budgetValue = promo?.budget 
          ? parseInt(promo.budget.toString().replace(/\D/g, '')) || 0 
          : 0;
        if (budgetValue > maxBudget) return false;
      }
    }
    
    return true;
  });

  // Sort promotions based on user selection
  const sortedPromotions = [...filteredPromotions].sort((a, b) => {
    // Skip sorting if either item is undefined
    if (!a || !b) return 0;
    
    // Always show featured promotions first
    if (a?.featured && !b?.featured) return -1;
    if (!a?.featured && b?.featured) return 1;
    
    switch (filters.sortBy) {
      case "highest-budget":
        // Handle budget parsing safely
        const budgetA = a?.budget ? parseInt(a.budget.toString().replace(/\D/g, '')) || 0 : 0;
        const budgetB = b?.budget ? parseInt(b.budget.toString().replace(/\D/g, '')) || 0 : 0;
        return budgetB - budgetA;
      case "deadline":
        // Handle deadline dates safely
        const dateA = a?.deadline ? new Date(a.deadline).getTime() : 0;
        const dateB = b?.deadline ? new Date(b.deadline).getTime() : 0;
        return dateA - dateB;
      case "relevance":
        // Handle applications count safely
        const appsA = a?.applicationsCount || 0;
        const appsB = b?.applicationsCount || 0;
        return appsB - appsA;
      case "newest":
      default:
        // Sort by creation date if available
        if (a?.createdAt && b?.createdAt) {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        // Fallback to safe sorting
        return 0;
    }
  });

  // Function to estimate match percentage based on creator profile
  const getMatchPercentage = (promo: any) => {
    if (!promo) return 0;
    // In a real app, this would compare the promotion requirements with the creator's profile
    // For now, return a random percentage for demonstration
    return Math.floor(Math.random() * 41) + 60; // Random number between 60-100
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
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Header with gradient background */}
        <div className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 sm:p-6 text-white shadow-md">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2 sm:mb-3 flex items-center">
            <Megaphone className="w-7 h-7 sm:w-8 sm:h-8 mr-2 sm:mr-3" />
            Available Promotions
            <span className="ml-2 sm:ml-3 text-xs sm:text-sm bg-white text-purple-700 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full font-normal">
              {sortedPromotions.length} Opportunities
            </span>
          </h1>
          <p className="text-purple-100 text-sm sm:text-base">
            Discover brand promotion opportunities that match your creator profile. Apply to collaborate with brands that align with your content.
          </p>
        </div>

        {/* Sticky Search and Filters for mobile */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur px-2 py-2 rounded-b-xl shadow-md mb-4 sm:static sm:bg-white sm:shadow-none sm:p-0 sm:mb-8 border-b border-gray-100 sm:border-0">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search for promotions..."
                className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-gray-50 hover:bg-white transition-colors duration-200 text-sm sm:text-base"
              />
            </div>
            {/* Filter Button */}
            <button 
              className="flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-3 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors duration-200 text-purple-700 text-sm sm:text-base"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-5 h-5" />
              <span className="font-medium">Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} />
            </button>
            {/* Sort Dropdown */}
            <div className="relative">
              <select 
                className="appearance-none pl-4 pr-8 sm:pr-10 py-2 sm:py-3 border border-purple-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-700 hover:bg-purple-50 transition-colors duration-200 text-sm sm:text-base"
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-purple-600 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          {/* Expanded Filters */}
          {showFilters && (
            <div className="mt-3 pt-3 border-t border-gray-200 animate-fadeIn">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 sm:gap-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-base"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                {/* Platform Filter */}
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Platform</label>
                  <select 
                    className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-base"
                    value={filters.platform}
                    onChange={(e) => handleFilterChange('platform', e.target.value)}
                  >
                    {platforms.map(platform => (
                      <option key={platform} value={platform}>{platform}</option>
                    ))}
                  </select>
                </div>
                {/* Budget Range Filter */}
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">Budget Range</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4" />
                      <input 
                        type="number" 
                        placeholder="Min"
                        className="w-full pl-8 sm:pl-9 p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-base"
                        value={filters.minBudget}
                        onChange={(e) => handleFilterChange('minBudget', e.target.value)}
                      />
                    </div>
                    <span className="text-gray-500 text-xs sm:text-base">to</span>
                    <div className="relative flex-1">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 w-4 h-4" />
                      <input 
                        type="number" 
                        placeholder="Max"
                        className="w-full pl-8 sm:pl-9 p-2 sm:p-3 border border-gray-300 rounded-lg hover:border-purple-300 transition-colors duration-200 focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs sm:text-base"
                        value={filters.maxBudget}
                        onChange={(e) => handleFilterChange('maxBudget', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end mt-3 sm:mt-4">
                <button 
                  onClick={handleResetFilters}
                  className="px-3 sm:px-4 py-2 text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors duration-200 text-xs sm:text-base"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          )}
        </div>
        {/* Results Stats */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-2 sm:gap-0">
          <p className="text-gray-700 text-sm sm:text-base">
            <span className="font-medium">{sortedPromotions.length}</span> promotions found
          </p>
          <div className="flex items-center text-xs sm:text-sm bg-gradient-to-r from-purple-50 to-indigo-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full border border-purple-100">
            <Sparkles className="w-4 h-4 mr-1 text-purple-600" />
            <span className="text-purple-800">Showing opportunities that match your profile</span>
          </div>
        </div>
        {/* Promotions Feed */}
        <div className="mt-4 sm:mt-6">
          {/* Promotions List */}
          <div className="mt-4 sm:mt-8">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin h-8 w-8 border-4 border-blue-600 rounded-full border-t-transparent"></div>
              </div>
            ) : error ? (
              <div className="bg-red-50 p-6 rounded-xl text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Promotions</h3>
                <p className="text-red-700 mb-4">{error}</p>
                <button 
                  onClick={fetchPromotions}
                  className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition"
                >
                  Try Again
                </button>
              </div>
            ) : promotions.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-xl text-center">
                <Megaphone className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-800 mb-2">No promotions available</h3>
                <p className="text-gray-600 mb-6">
                  Try adjusting your filters or check back later for new opportunities
                </p>
                <button 
                  onClick={handleResetFilters}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                >
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 sm:gap-6">
                {promotions.map((promo) => {
                  if (!promo) return null;
                  
                  return (
                    <div 
                      key={promo._id} 
                      className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition duration-200 ${
                        hoveredPromo === promo._id ? 'shadow-md transform -translate-y-1' : ''
                      }`}
                      onMouseEnter={() => setHoveredPromo(promo._id)}
                      onMouseLeave={() => setHoveredPromo(null)}
                    >
                      {/* Promotion Card Header with Brand Info */}
                      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                            {promo.brandId?.avatar ? (
                              <Image 
                                src={promo.brandId.avatar}
                                alt={promo.brandId?.username || 'Brand'}
                                width={40}
                                height={40}
                                className="object-cover w-full h-full"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = "https://via.placeholder.com/40x40?text=B";
                                }}
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-600 font-medium">
                                {(promo.brandId?.username || 'B').charAt(0).toUpperCase()}
                              </div>
                            )}
                          </div>
                          <div className="ml-3">
                            <h3 className="font-medium text-gray-900">
                              {promo.brandId?.username || 'Brand'}
                            </h3>
                            <div className="flex items-center text-xs text-gray-500">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Posted {promo.createdAt ? new Date(promo.createdAt).toLocaleDateString() : 'Recently'}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          {promo.brandId?.verified && (
                            <div className="bg-blue-50 p-1 rounded-full" title="Verified Brand">
                              <BadgeCheck className="w-4 h-4 text-blue-600" />
                            </div>
                          )}
                          {promo.paymentVerified && (
                            <div className="bg-green-50 p-1 rounded-full" title="Payment Verified">
                              <Shield className="w-4 h-4 text-green-600" />
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Promotion Content */}
                      <div className="p-5">
                        <div className="mb-3">
                          {promo.featured && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 mb-2">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Featured
                            </span>
                          )}
                          <h2 className="font-semibold text-lg text-gray-900 leading-tight">
                            {promo.title}
                          </h2>
                        </div>
                        
                        <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                          {promo.description}
                        </p>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {promo.tags && promo.tags.map((tag: string, index: number) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                            >
                              <Hash className="w-3 h-3 mr-0.5" />
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        {/* Verification Badges - Add below tags if available */}
                        <div className="flex flex-wrap gap-1.5 mb-4">
                          {promo.brandId?.verified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              <BadgeCheck className="w-3 h-3 mr-0.5" />
                              Verified Brand
                            </span>
                          )}
                          {promo.paymentVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              <Shield className="w-3 h-3 mr-0.5" />
                              Payment Verified
                            </span>
                          )}
                          {promo.phoneVerified && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                              <CheckCircle className="w-3 h-3 mr-0.5" />
                              Phone Verified
                            </span>
                          )}
                        </div>
                        
                        {/* Details */}
                        <div className="grid grid-cols-2 gap-3 mb-4">
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <DollarSign className="w-3.5 h-3.5 mr-1 text-green-600" />
                              Budget
                            </div>
                            <div className="font-medium text-sm text-gray-900">
                              {promo.budget}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-blue-600" />
                              Deadline
                            </div>
                            <div className="font-medium text-sm text-gray-900">
                              {new Date(promo.deadline).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <Globe className="w-3.5 h-3.5 mr-1 text-purple-600" />
                              Platform
                            </div>
                            <div className="font-medium text-sm text-gray-900">
                              {promo.platform}
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded-lg">
                            <div className="flex items-center text-xs text-gray-500 mb-1">
                              <Tag className="w-3.5 h-3.5 mr-1 text-amber-600" />
                              Category
                            </div>
                            <div className="font-medium text-sm text-gray-900">
                              {promo.category}
                            </div>
                          </div>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex justify-between items-center mt-6">
                          <button
                            onClick={() => toggleSavePromotion(promo._id)}
                            className={`flex items-center text-sm px-3 py-1.5 rounded-lg ${
                              savedPromotions.includes(promo._id)
                                ? 'bg-green-50 text-green-700'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            {savedPromotions.includes(promo._id) ? (
                              <>
                                <Bookmark className="w-4 h-4 mr-1.5" />
                                Saved
                              </>
                            ) : (
                              <>
                                <BookmarkPlus className="w-4 h-4 mr-1.5" />
                                Save
                              </>
                            )}
                          </button>
                          
                          <div className="flex gap-2">
                            <Link
                              href={`/promotion/${promo._id}`}
                              className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg text-sm font-medium"
                            >
                              Details
                            </Link>
                            
                            <button
                              onClick={() => handleApply(promo._id)}
                              disabled={applyingTo === promo._id}
                              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center"
                            >
                              {applyingTo === promo._id ? (
                                <>
                                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                                  Applying...
                                </>
                              ) : (
                                <>Apply</>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* Pagination */}
            {promotions.length > 0 && (
              <div className="flex justify-center mt-10">
                <div className="flex space-x-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      page === 1
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Previous
                  </button>
                  
                  <div className="flex space-x-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm ${
                          page === p
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm ${
                      page === totalPages
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Add this to your global styles or inline here
// (In a real app, you would add this to a global CSS file)
const styles = `
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
.animate-fadeIn {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
.animate-pulse {
  animation: pulse 1.5s ease-in-out infinite;
}
`; 