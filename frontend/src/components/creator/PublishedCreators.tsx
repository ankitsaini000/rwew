import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getPublishedCreators, getFilteredCreators, getCreatorReviewsDirect } from '@/services/api';
import CreatorCard from '@/components/creator/CreatorCard';
import { useCreatorStore } from '@/store/creatorStore';

// Categories array mirroring the one in Dashboard.tsx
const categories = [
  { icon: "👗", name: "Fashion & Beauty", count: 2500 },
  { icon: "✈️", name: "Travel", count: 1800 },
  { icon: "💪", name: "Fitness & Health", count: 2100 },
  { icon: "💻", name: "Tech", count: 1500 },
  { icon: "🎵", name: "Music", count: 2800 },
  { icon: "🎮", name: "Gaming", count: 2300 },
  { icon: "🍳", name: "Food & Cooking", count: 1900 },
  { icon: "📚", name: "Education", count: 1700 },
];

interface PublishedCreatorsProps {
  title?: string;
  showFilters?: boolean;
  limit?: number;
}

const PublishedCreators: React.FC<PublishedCreatorsProps> = ({ 
  title = "Published Creators", 
  showFilters = true,
  limit = 6
}) => {
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { likedCreators } = useCreatorStore();
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // Infinite scroll observer
  const observer = useRef<IntersectionObserver | null>(null);
  const lastCreatorElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (loading || loadingMore) return;
      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(entries => {
        if (entries[0].isIntersecting && hasMore) {
          loadMoreCreators();
        }
      });
      
      if (node) observer.current.observe(node);
    },
    [loading, loadingMore, hasMore]
  );

  useEffect(() => {
    fetchCreators();
  }, [selectedCategory]);

  // Fetch and log reviews for each creator after creators are loaded
  useEffect(() => {
    if (!creators || creators.length === 0) return;
    creators.forEach(async (creator) => {
      try {
        const reviewsData = await getCreatorReviewsDirect(creator.id);
        console.log('Raw creator data:', creator);
        console.log('Fetched reviews for creator', creator.id, ':', reviewsData);
      } catch (err) {
        console.error('Error fetching reviews for creator', creator.id, err);
      }
    });
  }, [creators]);

  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null); // Clear any previous errors
      setPage(1); // Reset to page 1
      console.log('Fetching published creators...');
      
      // Use the getFilteredCreators function with category filter
      const result = await getFilteredCreators({
        category: selectedCategory === "All" ? "" : selectedCategory,
        page: 1,
        limit
      });
      
      console.log('Received data from API:', result);
      
      if (!result || !result.creators || !Array.isArray(result.creators)) {
        console.error('Invalid data format returned:', result);
        setCreators([]);
        setError('Failed to load creators - invalid data format');
        setHasMore(false);
      } else {
        // For each creator, fetch reviews and add to the creator object
        const enrichedCreators = await Promise.all(result.creators.map(async (creator) => {
          try {
            const reviewsData = await getCreatorReviewsDirect(creator.id);
            console.log('reviewsData for creator', creator.id, ':', reviewsData);
            const enriched = {
              ...creator,
              reviews: reviewsData?.reviews || [],
              reviewCount: reviewsData?.totalReviews || 0,
              rating: typeof reviewsData?.averageRating === 'number' ? reviewsData.averageRating : 0
            };
            console.log('enriched creator:', enriched);
            return enriched;
          } catch (err) {
            console.error('Error fetching reviews for creator', creator.id, err);
            return {
              ...creator,
              reviews: [],
              reviewCount: 0,
              rating: 0
            };
          }
        }));
        setCreators(enrichedCreators);
        setHasMore(result.pagination?.hasMore || false);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching published creators:', err);
      setCreators([]); // Set empty array to prevent UI issues
      setError('Failed to load creators. Please try again later.');
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };
  
  const loadMoreCreators = async () => {
    if (!hasMore || loadingMore) return;
    
    try {
      setLoadingMore(true);
      const nextPage = page + 1;
      console.log(`Loading more creators (page ${nextPage})...`);
      
      // Use getFilteredCreators with pagination
      const result = await getFilteredCreators({
        category: selectedCategory === "All" ? "" : selectedCategory,
        page: nextPage,
        limit
      });
      
      if (!result || !result.creators || !Array.isArray(result.creators)) {
        console.error('Invalid data format returned for page', nextPage);
        setHasMore(false);
      } else {
        // Enrich each new creator with reviews and reviewCount
        const enrichedNewCreators = await Promise.all(result.creators.map(async (creator) => {
          try {
            const reviewsData = await getCreatorReviewsDirect(creator.id);
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
        }));
        setCreators(prevCreators => [...prevCreators, ...enrichedNewCreators]);
        setHasMore(result.pagination?.hasMore || false);
        setPage(nextPage);
      }
    } catch (err) {
      console.error('Error loading more creators:', err);
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const handleCategorySelect = (category: string) => {
    if (category === selectedCategory) return;
    setSelectedCategory(category);
    // The fetchCreators will be called via useEffect when selectedCategory changes
  };

  // Filter creators by selected category - no longer needed as we filter on the server
  const filteredCreators = creators;

  // Map creator data to props needed by CreatorCard
  const mapCreatorToCardProps = (creator: any) => {
    // Extract creator ID - critical for liking functionality
    // The server expects a valid MongoDB ID
    const creatorId = (() => {
      // Log the raw creator object to help diagnose ID issues
      console.log('Raw creator data:', creator);
      
      // Try _id first (direct MongoDB ID)
      if (creator._id) {
        if (typeof creator._id === 'string') {
          return creator._id;
        } else if (typeof creator._id === 'object') {
          // Handle MongoDB ObjectId
          return creator._id.toString();
        }
      }
      
      // Try direct id property
      if (creator.id) {
        return typeof creator.id === 'string' ? creator.id : creator.id.toString();
      }
      
      // If no ID found, log warning and return empty string
      console.warn('No valid MongoDB ID found for creator:', creator);
      return '';
    })();
    
    // Log the extracted ID for debugging
    console.log('Extracted MongoDB ID for creator:', creatorId);

    // Check if this creator is in liked creators
    const isLiked = likedCreators.some(
      (likedCreator) => likedCreator.id === creatorId
    );

    // Extract username with proper fallback - check multiple places username might be stored
    let username = '';
    
    // First try to get username from top-level property
    if (creator.username) {
      username = creator.username;
    }
    // Then try from userId object
    else if (creator.userId && typeof creator.userId === 'object' && creator.userId.username) {
      username = creator.userId.username;
    }
    // Then try from personalInfo object
    else if (creator.personalInfo && creator.personalInfo.username) {
      username = creator.personalInfo.username;
    }
    // Finally, fallback to a generated username
    else {
      username = `user_${creatorId.substring(0, 8)}`;
    }

    // Extract full name with fallbacks
    let fullName = 'Creator';
    
    // Try to get name from userId object first
    if (creator.userId && typeof creator.userId === 'object' && creator.userId.fullName) {
      fullName = creator.userId.fullName;
    }
    // Then try from personalInfo
    else if (creator.personalInfo && creator.personalInfo.fullName) {
      fullName = creator.personalInfo.fullName;
    }
    // Then try direct fullName property
    else if (creator.fullName) {
      fullName = creator.fullName;
    }
    // Then try name property
    else if (creator.name) {
      fullName = creator.name;
    }

    // Extract avatar with fallbacks
    const avatar = creator.personalInfo?.profileImage || 
                  (creator.userId && creator.userId.avatar) || 
                  creator.avatar || 
                  'https://via.placeholder.com/150?text=Creator';

    // Map social media URLs or presence
    const socialMedia: any = {};
    if (creator.socialMedia && creator.socialMedia.socialProfiles) {
      const profiles = creator.socialMedia.socialProfiles;
      if (profiles.instagram && profiles.instagram.url) {
        socialMedia.instagram = profiles.instagram.url;
      }
      if (profiles.twitter && profiles.twitter.url) {
        socialMedia.twitter = profiles.twitter.url;
      }
      if (profiles.linkedin && profiles.linkedin.url) {
        socialMedia.linkedin = profiles.linkedin.url;
      }
      if (profiles.youtube && profiles.youtube.url) {
        socialMedia.youtube = profiles.youtube.url;
      }
      if (profiles.facebook && profiles.facebook.url) {
        socialMedia.facebook = profiles.facebook.url;
      }
      if (profiles.tiktok && profiles.tiktok.url) {
        socialMedia.tiktok = profiles.tiktok.url;
      }
    }
    // Fallback: check for direct fields
    if (creator.instagram) socialMedia.instagram = creator.instagram;
    if (creator.twitter) socialMedia.twitter = creator.twitter;
    if (creator.linkedin) socialMedia.linkedin = creator.linkedin;
    if (creator.youtube) socialMedia.youtube = creator.youtube;
    if (creator.facebook) socialMedia.facebook = creator.facebook;
    if (creator.tiktok) socialMedia.tiktok = creator.tiktok;
    // If no URLs, use platforms array to show icons as present (not clickable)
    if (Array.isArray(creator.platforms)) {
      for (const platform of creator.platforms) {
        const key = platform.toLowerCase();
        if (!socialMedia[key]) {
          socialMedia[key] = true; // just a flag, not a URL
        }
      }
    }

    // Extract categories with fallbacks
    console.log('🎯 PublishedCreators Debug - Creator data structure:', {
      name: creator.name || creator.userId?.fullName,
      professionalInfo: creator.professionalInfo,
      categories: creator.professionalInfo?.categories,
      category: creator.category,
      hasCategories: !!creator.professionalInfo?.categories,
      hasCategory: !!creator.category,
      topLevelCategories: creator.categories
    });
    
    // Check for categories at multiple levels
    const categories = creator.professionalInfo?.categories || 
                      creator.categories || 
                      (creator.category ? [creator.category] : ['Creator']);
    
    console.log('🎯 PublishedCreators Debug - Extracted categories:', categories);

    // Extract professional title with fallbacks
    const level = creator.professionalInfo?.title || 
                 creator.level || 
                 creator.professionalInfo?.subcategory;
    
    // Get description with fallbacks
    const description = creator.descriptionFaq?.briefDescription || 
                        creator.personalInfo?.bio || 
                        creator.description || 
                        creator.bio ||
                        `Creator specializing in ${categories.join(', ')}`;

    // Get pricing data with proper fallbacks - prioritize basic pricing
    let pricing = null;
    if (creator.pricing) {
      // First try basic pricing
      if (creator.pricing.basic) {
        if (typeof creator.pricing.basic === 'object' && creator.pricing.basic.price) {
          pricing = creator.pricing.basic.price;
        } else if (typeof creator.pricing.basic === 'number') {
          pricing = creator.pricing.basic;
        }
      } 
      // Then try standard pricing
      else if (creator.pricing.standard && creator.pricing.standard.price) {
        pricing = creator.pricing.standard.price;
      } 
      // Finally try premium pricing
      else if (creator.pricing.premium && creator.pricing.premium.price) {
        pricing = creator.pricing.premium.price;
      }
    }
    
    const formattedPrice = pricing ? `₹${pricing}` : 'Contact for price';

    // Ensure we have valid rating and review count
    const rating = creator.rating || 
                  (creator.metrics && creator.metrics.ratings ? creator.metrics.ratings.average : 0) || 
                  0;
                  
    // If reviews is an array, use its length; if it's a number, use it; otherwise fallback
    let reviewCount = 0;
    if (typeof creator.reviewCount === 'number') {
      reviewCount = creator.reviewCount;
    } else if (Array.isArray(creator.reviews)) {
      reviewCount = creator.reviews.length;
    } else if (typeof creator.reviews === 'number') {
      reviewCount = creator.reviews;
    } else if (creator.metrics && creator.metrics.ratings && typeof creator.metrics.ratings.count === 'number') {
      reviewCount = creator.metrics.ratings.count;
    }

    // Return the mapped creator data with the MongoDB ID
    return {
      id: creatorId,
      username,
      fullName,
      avatar,
      categories,
      level,
      description,
      rating,
      reviewCount,
      startingPrice: formattedPrice,
      isLiked,
      socialMedia,
      title: creator.title || creator.professionalInfo?.title || '',
      completedProjects: creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0
    };
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {title}
        </h2>
        <button className="text-purple-600 text-sm font-medium">
          View all
        </button>
      </div>

      {/* Filter Categories Bar */}
      {showFilters && (
        <div className="mb-8 overflow-x-auto">
          <div className="flex gap-3 min-w-max pb-4">
            <button
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === "All"
                  ? "bg-purple-600 text-white hover:bg-purple-700"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
              onClick={() => handleCategorySelect("All")}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category.name}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                  selectedCategory === category.name
                    ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                }`}
                onClick={() => handleCategorySelect(category.name)}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Initial Loading State */}
      {loading && (
        <div className="p-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-500 border-t-transparent"></div>
          <p className="mt-2 text-gray-600">Loading creators...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="p-6 text-center">
          <div className="text-red-500 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-700">{error}</p>
          <button 
            onClick={fetchCreators}
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredCreators.length === 0 && (
        <div className="p-8 text-center">
          <div className="text-gray-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900">No creators found</h3>
          <p className="mt-1 text-gray-500">
            {selectedCategory === "All"
              ? "There are no published creators available at the moment."
              : `There are no published creators in the ${selectedCategory} category.`}
          </p>
        </div>
      )}

      {/* Creators Grid */}
      {!loading && !error && filteredCreators.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.map((creator, index) => {
              // Add ref to the last element for infinite scrolling
              const isLastElement = index === filteredCreators.length - 1;
              
              return (
                <div 
                  key={`creator-${creator._id || index}`} 
                  ref={isLastElement ? lastCreatorElementRef : null}
                >
                  <CreatorCard 
                    key={`card-${creator._id || index}`}
                    {...mapCreatorToCardProps(creator)} 
                  />
                </div>
              );
            })}
          </div>
          
          {/* Loading More Indicator */}
          {loadingMore && (
            <div className="text-center py-4 mt-4">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-4 border-purple-500 border-t-transparent mr-2"></div>
              <span className="text-gray-600">Loading more creators...</span>
            </div>
          )}
          
          {/* End of Results Message */}
          {!hasMore && filteredCreators.length > limit && (
            <div className="text-center py-4 mt-4">
              <p className="text-gray-500">You've reached the end of the list</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PublishedCreators; 