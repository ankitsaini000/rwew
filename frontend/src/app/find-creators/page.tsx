"use client";

import { useState, useEffect, useRef, useCallback } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { 
  Search, Filter, Star, Users, MapPin, Sparkles, 
  CheckCircle, Heart, ChevronDown, Globe,
  MessageSquare, Instagram, Youtube, Twitter
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { getFilteredCreators, getCategories, getCreatorReviewsDirect, getAvailableTags, getAvailableContentTypes, saveSearchHistory } from '@/services/api';

// Creator interface to define the expected shape of creator data
interface Creator {
  id: number;
  name: string;
  username: string;
  avatar: string;
  category: string;
  categories?: string[]; // Added categories array property
  subCategory?: string;
  location: string | {
    city?: string;
    state?: string;
    country?: string;
    address?: string;
    postalCode?: string;
  };
  bio: string;
  pricing: {
    basic: number;
    standard: number;
    premium: number;
  };
  rating: number;
  followers: {
    total: number;
    instagram?: number;
    tiktok?: number;
    youtube?: number;
    twitter?: number;
  };
  tags: string[];
  isVerified: boolean;
  platforms: string[];
  featuredWork?: string[];
  completedProjects: number;
  // Added properties for reviews
  reviews?: Array<{
    id?: string;
    text: string;
    rating?: number;
    createdAt?: string;
    brandId?: any;
    creatorId?: string;
    orderId?: any;
  }>;
  reviewCount?: number;
    }


// Define platforms for filtering
const platforms = [
  "All Platforms",
  "Instagram",
  "YouTube",
  "TikTok",
  "Twitter"
];

// Custom TikTok icon component
const TikTokIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path 
      d="M19.321 6.34C18.5722 5.77448 18.033 4.99094 17.7733 4.09979C17.5137 3.20864 17.5456 2.25735 17.864 1.386H14.398V10.372C14.398 10.5564 14.3636 10.7389 14.2967 10.9093C14.2298 11.0796 14.1317 11.2344 14.0079 11.3641C13.884 11.4939 13.7369 11.596 13.5737 11.6658C13.4105 11.7355 13.2345 11.7717 13.057 11.7717C12.8795 11.7717 12.7035 11.7355 12.5403 11.6658C12.377 11.596 12.23 11.4939 12.1061 11.3641C11.9822 11.2344 11.8842 11.0796 11.8173 10.9093C11.7504 10.7389 11.716 10.5564 11.716 10.372C11.716 9.82309 11.9294 9.29669 12.3095 8.90148C12.6896 8.50627 13.1964 8.284 13.726 8.284C13.8713 8.284 14.015 8.301 14.154 8.334V4.994C14.0084 4.98116 13.862 4.97425 13.716 4.974C12.5105 4.96719 11.3294 5.3271 10.321 6.001C9.31269 6.6749 8.52542 7.6356 8.05287 8.75546C7.58033 9.87533 7.44322 11.1073 7.65876 12.3052C7.8743 13.5031 8.43151 14.616 9.26216 15.5108C10.0928 16.4056 11.1642 17.0447 12.3392 17.3513C13.5142 17.658 14.7486 17.6199 15.9027 17.2414C17.0568 16.8629 18.0767 16.1613 18.8456 15.222C19.6145 14.2826 20.1011 13.1426 20.244 11.934V7.894C20.9676 8.429 21.7753 8.82521 22.633 9.064L22.636 5.626C21.4459 5.62154 20.2864 5.15757 19.321 4.323V6.34Z" 
      fill="currentColor"
    />
  </svg>
);

export default function FindCreatorsPage() {
  // Categories state for filtering
  const [categories, setCategories] = useState<string[]>(["All Categories"]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  
  // Tags and Content Types state
  const [availableTags, setAvailableTags] = useState<Array<{tag: string, count: number}>>([]);
  const [availableContentTypes, setAvailableContentTypes] = useState<Array<{contentType: string, count: number}>>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedContentTypes, setSelectedContentTypes] = useState<string[]>([]);
  
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPlatform, setSelectedPlatform] = useState("All Platforms");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 100000]);
  const [followerRange, setFollowerRange] = useState<[number, number]>([0, 1000000]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortOption, setSortOption] = useState("relevance");
  const [loading, setLoading] = useState(true);
  const [likedCreators, setLikedCreators] = useState<number[]>([]);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCreators, setTotalCreators] = useState(0);
  
  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCreatorElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          setPage(prevPage => prevPage + 1);
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [loading, hasMore]
  );

  // Fetch categories, tags, and content types from backend
  useEffect(() => {
    const fetchFilterData = async () => {
      setCategoriesLoading(true);
      try {
        const [fetchedCategories, fetchedTags, fetchedContentTypes] = await Promise.all([
          getCategories(),
          getAvailableTags(),
          getAvailableContentTypes()
        ]);
        
        // Add "All Categories" as the first option
        const formattedCategories = ["All Categories", ...fetchedCategories.map((cat: any) => cat.name)];
        setCategories(formattedCategories);
        setAvailableTags(fetchedTags);
        setAvailableContentTypes(fetchedContentTypes);
      } catch (error) {
        console.error('Error fetching filter data:', error);
        // Fallback to default categories if fetch fails
        setCategories([
          "All Categories",
          "Fashion & Lifestyle",
          "Tech & Gaming",
          "Food & Cooking",
          "Fitness & Health",
          "Travel",
          "Beauty",
          "Education",
          "Entertainment",
          "Business"
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchFilterData();
  }, []);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Fetch creators when debouncedQuery or filters change
  useEffect(() => {
    setPage(1);
    fetchCreators();
  }, [debouncedQuery, selectedCategory, selectedPlatform, priceRange, followerRange, sortOption, selectedTags, selectedContentTypes]);

  // Fetch more creators on page change (for infinite scroll)
  useEffect(() => {
    if (page > 1) fetchCreators();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      
      // Map sort option to API format
      const sortByMap: Record<string, string> = {
        'relevance': 'relevance',
        'price-low': 'price-low',
        'price-high': 'price-high',
        'rating': 'rating',
        'followers': 'followers'
      };
      
      // Prepare filters for API
      const filters = {
        search: debouncedQuery,
        category: selectedCategory,
        platform: selectedPlatform,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        followersMin: followerRange[0],
        followersMax: followerRange[1],
        sortBy: sortByMap[sortOption] || 'relevance',
        page,
        limit: 9, // Show 9 creators per page (3x3 grid)
        tags: selectedTags,
        contentTypes: selectedContentTypes
      };
      
      const result = await getFilteredCreators({
        search: debouncedQuery,
        category: selectedCategory,
        platform: selectedPlatform,
        priceMin: priceRange[0],
        priceMax: priceRange[1],
        followersMin: followerRange[0],
        followersMax: followerRange[1],
        sortBy: sortByMap[sortOption] || 'relevance',
        page,
        limit: 9,
        tags: selectedTags,
        contentTypes: selectedContentTypes
      });
      console.log('Fetched creators:', result.creators); // Debug log
      
      // Save search to backend if there's a search query or filters
      if (debouncedQuery || selectedCategory !== 'All Categories' || selectedPlatform !== 'All Platforms' || selectedTags.length > 0 || selectedContentTypes.length > 0) {
        try {
          const searchQuery = debouncedQuery || `${selectedCategory} ${selectedPlatform} ${selectedTags.join(' ')} ${selectedContentTypes.join(' ')}`.trim();
          if (searchQuery) {
            await saveSearchHistory({
              query: searchQuery,
              searchType: debouncedQuery ? 'text' : 'category',
              filters: {
                category: selectedCategory !== 'All Categories' ? selectedCategory : undefined,
                platform: selectedPlatform !== 'All Platforms' ? selectedPlatform : undefined,
                tags: selectedTags.length > 0 ? selectedTags : undefined,
                contentTypes: selectedContentTypes.length > 0 ? selectedContentTypes : undefined,
                priceMin: priceRange[0],
                priceMax: priceRange[1],
                followersMin: followerRange[0],
                followersMax: followerRange[1]
              },
              resultsCount: result.creators.length
            });
          }
        } catch (error) {
          console.error('Error saving search history:', error);
          // Don't break the main functionality if search history fails
        }
      }
      
      // Enrich creators with reviews and ratings
      const enrichedCreators = await Promise.all(
        result.creators
          .filter((c: any) => c.isActive !== false)
          .map(async (creator: any) => {
            try {
              const reviewsData = await getCreatorReviewsDirect(creator.id);
              console.log('Reviews data for creator', creator.id, ':', reviewsData);
              return {
                ...creator,
                reviews: reviewsData?.reviews || [],
                reviewCount: reviewsData?.totalReviews || 0,
                rating: typeof reviewsData?.averageRating === 'number' ? reviewsData.averageRating : 0
              };
            } catch (err) {
              console.error('Error fetching reviews for creator', creator.id, err);
              return {
                ...creator,
                reviews: [],
                reviewCount: 0,
                rating: 0
              };
            }
          })
      );
      
      // First page replaces all creators, subsequent pages append
      if (page === 1) {
        setCreators(enrichedCreators);
      } else {
        setCreators(prev => [...prev, ...enrichedCreators]);
      }
      
      // Update pagination info
      setTotalCreators(result.pagination.total);
      setHasMore(result.pagination.hasMore);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  // Toggle creator like status
  const toggleLike = (creatorId: number) => {
    setLikedCreators(prev => {
      if (prev.includes(creatorId)) {
        return prev.filter(id => id !== creatorId);
      } else {
        return [...prev, creatorId];
      }
    });
  };

  // Get platform icon
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "Instagram":
        return <Instagram className="w-4 h-4" />;
      case "YouTube":
        return <Youtube className="w-4 h-4" />;
      case "TikTok":
        return <TikTokIcon />;
      case "Twitter":
        return <Twitter className="w-4 h-4" />;
      default:
        return <Globe className="w-4 h-4" />;
    }
  };

  // Format follower count
  const formatFollowers = (count: number) => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Helper to highlight matched text
  function highlightMatch(text: string, query: string) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.split(regex).map((part, i) =>
      regex.test(part) ? <mark key={i} className="bg-yellow-200 text-black px-0.5 rounded">{part}</mark> : part
    );
  }

  // Filter out deactivated creators (isActive === false) before rendering
  const visibleCreators = creators.filter((c: any) => c.isActive !== false);

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Search Section */}
        <div className="bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="text-purple-200" />
              <span className="text-purple-100 font-medium">Find the perfect match</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Discover Your Ideal Creator Partners
            </h1>
            <p className="text-purple-100 mb-8 text-lg max-w-2xl">
              Connect with India's most influential content creators who align with your brand values and audience
            </p>

            {/* Search Bar */}
            <div className="flex gap-4 flex-col sm:flex-row">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by name, category, or location"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-purple-200 focus:outline-none focus:border-white/40"
                  onKeyDown={e => { if (e.key === 'Enter') setDebouncedQuery(searchQuery); }}
                />
              </div>
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="px-6 py-3.5 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium flex items-center gap-2"
              >
                <Filter size={20} className="text-purple-600" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showAdvancedFilters && (
              <div className="mt-4 p-6 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                      disabled={categoriesLoading}
                    >
                      {categoriesLoading ? (
                        <option>Loading categories...</option>
                      ) : (
                        categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Platform
                    </label>
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      {platforms.map((platform) => (
                        <option key={platform} value={platform}>
                          {platform}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Sort By
                    </label>
                    <select
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value="relevance">Most Relevant</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                      <option value="followers">Most Followers</option>
                    </select>
                  </div>
                  
                  {/* Tags Filter */}
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm mb-2">
                      Tags
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableTags.slice(0, 10).map((tagData) => (
                        <button
                          key={tagData.tag}
                          onClick={() => {
                            setSelectedTags(prev => 
                              prev.includes(tagData.tag) 
                                ? prev.filter(t => t !== tagData.tag)
                                : [...prev, tagData.tag]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedTags.includes(tagData.tag)
                              ? 'bg-white text-purple-600'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {tagData.tag} ({tagData.count})
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Types Filter */}
                  <div className="md:col-span-2">
                    <label className="block text-white text-sm mb-2">
                      Content Types
                    </label>
                    <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                      {availableContentTypes.slice(0, 8).map((contentTypeData) => (
                        <button
                          key={contentTypeData.contentType}
                          onClick={() => {
                            setSelectedContentTypes(prev => 
                              prev.includes(contentTypeData.contentType) 
                                ? prev.filter(t => t !== contentTypeData.contentType)
                                : [...prev, contentTypeData.contentType]
                            );
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                            selectedContentTypes.includes(contentTypeData.contentType)
                              ? 'bg-white text-purple-600'
                              : 'bg-white/20 text-white hover:bg-white/30'
                          }`}
                        >
                          {contentTypeData.contentType} ({contentTypeData.count})
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Price Range (₹)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="100000"
                        step="5000"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                      <span className="text-white whitespace-nowrap">
                        ₹{priceRange[0].toLocaleString()} - ₹{priceRange[1].toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Follower Count
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="range"
                        min="0"
                        max="1000000"
                        step="50000"
                        value={followerRange[1]}
                        onChange={(e) => setFollowerRange([followerRange[0], parseInt(e.target.value)])}
                        className="w-full"
                      />
                      <span className="text-white whitespace-nowrap">
                        {formatFollowers(followerRange[0])} - {formatFollowers(followerRange[1])}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Categories */}
            <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
              {categoriesLoading ? (
                <div className="px-4 py-2 bg-white/10 text-white rounded-full text-sm flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Loading categories...
                </div>
              ) : (
                categories.slice(0, 6).map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-full text-sm whitespace-nowrap transition-colors ${
                      selectedCategory === category
                        ? "bg-white text-purple-600"
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    {category}
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {totalCreators} Creators Found
              </h2>
              <p className="text-gray-600">
                {searchQuery && `Showing results for "${searchQuery}"`}
              </p>
            </div>
          </div>

          {/* Initial Loading State */}
          {loading && creators.length === 0 ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          ) : (
            <>
              {/* Creators Grid */}
              {visibleCreators.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-10">
                  {visibleCreators.map((creator, idx) => {
                    // Add ref to the last element for infinite scrolling
                    const isLastElement = idx === visibleCreators.length - 1;
                    
                    return (
                      <div
                        key={creator.id}
                        ref={isLastElement ? lastCreatorElementRef : null}
                        className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4"
                      >
                        <div className="flex items-center gap-4">
                          <img src={creator.avatar} alt={creator.name} className="w-16 h-16 rounded-full object-cover" />
                          <div>
                            <h3 className="text-lg font-bold text-gray-900">
                              {highlightMatch(creator.name, debouncedQuery)}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {highlightMatch(creator.username, debouncedQuery)}
                            </p>
                            <p className="text-xs text-gray-500">
                              {creator.categories && creator.categories.length > 0 
                                ? highlightMatch(creator.categories.join(', '), debouncedQuery)
                                : creator.category 
                                  ? highlightMatch(creator.category, debouncedQuery)
                                  : ''}
                            </p>
                          </div>
                        </div>
                        <p className="text-gray-700 text-sm line-clamp-3">
                          {highlightMatch(creator.bio, debouncedQuery)}
                        </p>
                        <div className="flex items-center gap-4 mb-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star size={16} className="text-yellow-400 fill-yellow-400" />
                            <span className="font-medium">{typeof creator.rating === 'number' ? creator.rating.toFixed(1) : '0.0'} / 5</span>
                            {creator.reviewCount && creator.reviewCount > 0 && (
                              <span className="text-gray-500 ml-1">({creator.reviewCount})</span>
                            )}
                          </div>
                          {creator.reviews && Array.isArray(creator.reviews) && creator.reviews.length > 0 && creator.reviews[0]?.text && (
                            <div className="mt-2 text-sm text-gray-600 italic border-l-2 border-gray-200 pl-2">
                              "{creator.reviews[0].text?.substring(0, 100)}{creator.reviews[0].text && creator.reviews[0].text.length > 100 ? '...' : ''}"
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users size={16} className="text-gray-400" />
                            <span>{formatFollowers(creator.followers.total)}</span>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-4">
                          {creator.platforms.map((platform) => (
                            <span
                              key={platform}
                              className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs flex items-center gap-1"
                            >
                              {getPlatformIcon(platform)}
                              {platform}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {creator.tags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>

                        <div className="pt-4 border-t border-gray-100">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-sm text-gray-500">Starting from</span>
                            <span className="font-semibold text-gray-900">
                              ₹{creator.pricing.basic.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => toggleLike(creator.id)}
                              className={`p-2 rounded-lg transition-colors ${
                                likedCreators.includes(creator.id)
                                  ? "text-red-500 bg-red-50"
                                  : "text-gray-400 hover:text-red-500 hover:bg-red-50"
                              }`}
                            >
                              <Heart size={20} className={likedCreators.includes(creator.id) ? "fill-red-500" : ""} />
                            </button>
                            <Link
                              href={`/creator/${creator.username.replace('@', '')}`}
                              className="flex-1"
                            >
                              <button className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                                View Profile
                              </button>
                            </Link>
                            <Link
                              href={`/messages/new?creator=${creator.username.replace('@', '')}`}
                            >
                              <button className="p-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors">
                                <MessageSquare size={20} />
                              </button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* No Results */}
              {!loading && creators.length === 0 && (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search size={32} className="text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No creators found
                  </h3>
                  <p className="text-gray-600">
                    Try adjusting your search or filters to find what you're looking for
                  </p>
                </div>
              )}
              
              {/* Loading More Indicator (for infinite scroll) */}
              {loading && creators.length > 0 && (
                <div className="flex justify-center items-center py-6 mt-6">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-purple-500 mr-3"></div>
                  <span className="text-gray-600">Loading more creators...</span>
                </div>
              )}
              
              {/* End of Results */}
              {!loading && !hasMore && creators.length > 0 && (
                <div className="text-center py-8 mt-6">
                  <p className="text-gray-500">You've reached the end of the results</p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}