"use client";

import { useState, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import {
  Search,
  Star,
  Users,
  Filter,
  MapPin,
  Sparkles,
  CheckCircle2,
  Heart,
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Creator {
  id: number;
  name: string;
  avatar: string;
  location: string;
  category: string;
  rating: number;
  followers: string;
  price: string;
  tags: string[];
  isVerified: boolean;
  featured?: boolean;
}

const categories = [
  "All Categories",
  "Comedy",
  "Lifestyle",
  "Gaming",
  "Education",
  "Fashion",
  "Tech",
  "Food",
  "Travel",
  "Fitness",
];

const trendingCreators: Creator[] = [
  {
    id: 1,
    name: "Bhuvan Bam",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e",
    location: "Mumbai, India",
    category: "Comedy & Entertainment",
    rating: 4.9,
    followers: "25M",
    price: "₹49,999",
    tags: ["Comedy", "YouTube", "Acting"],
    isVerified: true,
    featured: true,
  },
  {
    id: 2,
    name: "Ashish Chanchlani",
    avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
    location: "Delhi, India",
    category: "Entertainment",
    rating: 4.8,
    followers: "15M",
    price: "₹39,999",
    tags: ["Vines", "Comedy", "Acting"],
    isVerified: true,
  },
  {
    id: 3,
    name: "Prajakta Koli",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
    location: "Mumbai, India",
    category: "Lifestyle & Comedy",
    rating: 4.7,
    followers: "12M",
    price: "₹29,999",
    tags: ["Lifestyle", "Fashion", "Comedy"],
    isVerified: true,
  },
  {
    id: 4,
    name: "Technical Guruji",
    avatar: "https://images.unsplash.com/photo-1531427186611-ecfd6d936c79",
    location: "Dubai, UAE",
    category: "Tech",
    rating: 4.9,
    followers: "22M",
    price: "₹59,999",
    tags: ["Technology", "Reviews", "Education"],
    isVerified: true,
    featured: true,
  },
  {
    id: 5,
    name: "Fit Tuber",
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde",
    location: "Chandigarh, India",
    category: "Fitness",
    rating: 4.6,
    followers: "8M",
    price: "₹24,999",
    tags: ["Fitness", "Health", "Nutrition"],
    isVerified: true,
  },
  {
    id: 6,
    name: "Kusha Kapila",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
    location: "Delhi, India",
    category: "Fashion & Lifestyle",
    rating: 4.7,
    followers: "9M",
    price: "₹34,999",
    tags: ["Fashion", "Comedy", "Lifestyle"],
    isVerified: true,
  },
  {
    id: 7,
    name: "Beer Biceps",
    avatar: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef",
    location: "Mumbai, India",
    category: "Fitness & Lifestyle",
    rating: 4.8,
    followers: "7M",
    price: "₹29,999",
    tags: ["Fitness", "Motivation", "Lifestyle"],
    isVerified: true,
  },
  {
    id: 8,
    name: "Flying Beast",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
    location: "Delhi, India",
    category: "Travel & Lifestyle",
    rating: 4.9,
    followers: "11M",
    price: "₹44,999",
    tags: ["Travel", "Vlogs", "Family"],
    isVerified: true,
    featured: true,
  },
  // Add more creators as needed
];

export const SearchPage = () => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [priceFilter, setPriceFilter] = useState("all");
  const [filteredCreators, setFilteredCreators] = useState(trendingCreators);
  const [similarCreators, setSimilarCreators] = useState<Creator[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [isLoadingSimilar, setIsLoadingSimilar] = useState(false);

  // Function to fetch similar creators from API
  const fetchSimilarCreators = async (searchResults: Creator[]) => {
    if (!searchQuery && searchResults.length === 0) {
      setSimilarCreators([]);
      return;
    }

    setIsLoadingSimilar(true);
    try {
      const response = await fetch('/api/creators/similar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          searchQuery,
          searchResults: searchResults.map(creator => ({
            _id: creator.id,
            professionalInfo: {
              categories: [creator.category],
              subcategories: creator.tags
            },
            pricing: {
              standard: {
                price: parseInt(creator.price.replace(/[^0-9]/g, ""))
              }
            }
          })),
          category: selectedCategory,
          limit: 6
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          // Convert API response to Creator interface format
          const convertedCreators: Creator[] = data.data.map((creator: any) => ({
            id: creator._id,
            name: creator.fullName || creator.personalInfo?.fullName || 'Creator',
            avatar: creator.userId?.avatar || creator.personalInfo?.profileImage || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e',
            location: creator.personalInfo?.location || 'Location not specified',
            category: creator.professionalInfo?.categories?.[0] || 'General',
            rating: creator.metrics?.ratings?.average || 4.5,
            followers: formatFollowerCount(creator.socialMedia?.totalReach || 0),
            price: `₹${creator.pricing?.standard?.price?.toLocaleString() || '25,000'}`,
            tags: creator.professionalInfo?.subcategories || creator.professionalInfo?.categories || ['Creator'],
            isVerified: true,
            featured: creator.metrics?.profileViews > 1000
          }));
          setSimilarCreators(convertedCreators);
        }
      }
    } catch (error) {
      console.error('Error fetching similar creators:', error);
      setSimilarCreators([]);
    } finally {
      setIsLoadingSimilar(false);
    }
  };

  // Helper function to format follower count
  const formatFollowerCount = (count: number): string => {
    if (count >= 1000000) {
      return `${(count / 1000000).toFixed(1)}M`;
    } else if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`;
    }
    return count.toString();
  };

  // Filter creators based on search, category, and price
  useEffect(() => {
    let results = trendingCreators;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (creator) =>
          creator.name.toLowerCase().includes(query) ||
          creator.category.toLowerCase().includes(query) ||
          creator.location.toLowerCase().includes(query) ||
          creator.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          creator.price.toLowerCase().includes(query) ||
          creator.followers.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      results = results.filter((creator) =>
        creator.category.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    // Price filter
    if (priceFilter !== "all") {
      const [min, max] = priceFilter.split("-").map(Number);
      results = results.filter((creator) => {
        const price = parseInt(creator.price.replace(/[^0-9]/g, ""));
        return max ? price >= min && price <= max : price >= min;
      });
    }

    setFilteredCreators(results);
    
    // Fetch similar creators when we have search results
    if (results.length > 0 && (searchQuery || selectedCategory !== "All Categories")) {
      fetchSimilarCreators(results);
    } else {
      setSimilarCreators([]);
    }
  }, [searchQuery, selectedCategory, priceFilter]);

  const handleViewProfile = (creatorId: number) => {
    router.push(`/creator/${creatorId}`);
  };

  const handleLike = (creator: Creator) => {
    const liked = localStorage.getItem("likedCreators");
    let likedCreators = liked ? JSON.parse(liked) : [];

    const isLiked = likedCreators.some((c: Creator) => c.id === creator.id);

    if (isLiked) {
      likedCreators = likedCreators.filter((c: Creator) => c.id !== creator.id);
    } else {
      likedCreators.push(creator);
    }

    localStorage.setItem("likedCreators", JSON.stringify(likedCreators));
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Hero Search Section */}
        <div className="bg-gradient-to-r from-purple-600 via-purple-500 to-blue-600 py-16">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles size={24} className="text-purple-200" />
              <span className="text-purple-100 font-medium">
                Discover amazing creators
              </span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Find Your Perfect Creator Match
            </h1>
            <p className="text-purple-100 mb-8 text-lg max-w-2xl">
              Connect with India's most influential content creators and bring
              your brand's vision to life
            </p>

            {/* Search Bar */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by creator name, category, or location"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-white/20 bg-white/10 backdrop-blur-sm text-white placeholder:text-purple-200 focus:outline-none focus:border-white/40"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3.5 bg-white text-purple-600 rounded-xl hover:bg-purple-50 transition-colors font-medium flex items-center gap-2"
              >
                <Filter size={20} className="text-white" />
                Filters
              </button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="mt-4 p-4 bg-white/10 backdrop-blur-sm rounded-xl border-2 border-white/20">
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Category
                    </label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-white text-sm mb-2">
                      Price Range
                    </label>
                    <select
                      value={priceFilter}
                      onChange={(e) => setPriceFilter(e.target.value)}
                      className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white"
                    >
                      <option value="all">All Prices</option>
                      <option value="0-10000">Under ₹10,000</option>
                      <option value="10000-50000">₹10,000 - ₹50,000</option>
                      <option value="50000">Above ₹50,000</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Categories */}
            <div className="flex gap-3 mt-6 overflow-x-auto pb-2 scrollbar-hide">
              {categories.map((category) => (
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
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {filteredCreators.length} Creators Found
              </h2>
              <p className="text-gray-600">
                {searchQuery && `Showing results for "${searchQuery}"`}
              </p>
            </div>
            <select className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600">
              <option value="relevant">Most Relevant</option>
              <option value="popular">Most Popular</option>
              <option value="recent">Recently Active</option>
            </select>
          </div>

          {/* Creators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator) => (
              <div
                key={creator.id}
                className="bg-white rounded-2xl p-6 hover:shadow-lg transition-all border border-gray-100 relative group"
              >
                {creator.featured && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium flex items-center gap-1">
                      <Sparkles size={12} className="text-yellow-400" />
                      Featured
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-4 mb-4">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">
                        {creator.name}
                      </h3>
                      {creator.isVerified && (
                        <CheckCircle2 size={16} className="text-blue-500" />
                      )}
                    </div>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin size={16} className="text-gray-400" />
                      {creator.location}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 mb-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-medium">{creator.rating}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={16} className="text-gray-400" />
                    <span>{creator.followers}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {creator.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <span className="font-semibold text-gray-900">
                    From {creator.price}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleLike(creator)}
                      className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Heart size={20} className="text-white hover:text-red-500 transition-colors" />
                    </button>
                    <button
                      onClick={() => handleViewProfile(creator.id)}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      View Profile
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* No Results */}
          {filteredCreators.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-purple-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No creators found
              </h3>
              <p className="text-gray-600">
                Try adjusting your search or filters to find what you're looking
                for
              </p>
            </div>
          )}

          {/* Similar Creators Section */}
          {similarCreators.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={24} className="text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-900">
                  Similar Creators You Might Like
                </h2>
              </div>
              
              {isLoadingSimilar ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div key={index} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 bg-gray-200 rounded-xl"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {similarCreators.map((creator) => (
                    <div
                      key={creator.id}
                      className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow cursor-pointer relative"
                      onClick={() => handleViewProfile(creator.id)}
                    >
                      {creator.featured && (
                        <div className="absolute top-4 right-4">
                          <span className="px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-xs font-medium flex items-center gap-1">
                            <Sparkles size={12} className="text-yellow-400" />
                            Featured
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold text-gray-900">
                              {creator.name}
                            </h3>
                            {creator.isVerified && (
                              <CheckCircle2 size={16} className="text-blue-500" />
                            )}
                          </div>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin size={16} className="text-gray-400" />
                            {creator.location}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-medium">{creator.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Users size={16} className="text-gray-400" />
                          <span>{creator.followers}</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {creator.tags.slice(0, 3).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 bg-purple-50 text-purple-600 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between pt-4 border-t">
                        <span className="font-semibold text-gray-900">
                          From {creator.price}
                        </span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleLike(creator);
                            }}
                            className="p-2 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                          >
                            <Heart size={20} className="text-white hover:text-red-500 transition-colors" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewProfile(creator.id);
                            }}
                            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="text-center mt-6">
                <p className="text-sm text-gray-500">
                  Based on your search for "{searchQuery}" {selectedCategory !== "All Categories" && `in ${selectedCategory}`}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
