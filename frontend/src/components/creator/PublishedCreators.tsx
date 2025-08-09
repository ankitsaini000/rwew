import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPublishedCreators, getFilteredCreators, getCreatorReviewsDirect, getCategories } from '@/services/api';
import CreatorCard from '@/components/creator/CreatorCard';
import { useCreatorStore } from '@/store/creatorStore';

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
  const router = useRouter();
  const [creators, setCreators] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { likedCreators } = useCreatorStore();
  
  // Categories state
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);
  
  // Pagination state
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCreators, setTotalCreators] = useState(0);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      setCategoriesError(null);
      try {
        const fetchedCategories = await getCategories();
        // Transform categories to match the expected format
        const formattedCategories = fetchedCategories.map((cat: any) => ({
          icon: getCategoryIcon(cat.name), // Helper function to get icon based on category name
          name: cat.name,
          count: cat.count || 0
        }));
        setCategories(formattedCategories);
      } catch (err) {
        setCategoriesError("Failed to load categories");
        // Fallback to default categories if fetch fails
        setCategories([
          { icon: "👗", name: "Fashion & Beauty", count: 0 },
          { icon: "✈️", name: "Travel", count: 0 },
          { icon: "💪", name: "Fitness & Health", count: 0 },
          { icon: "💻", name: "Tech", count: 0 },
          { icon: "🎵", name: "Music", count: 0 },
          { icon: "🎮", name: "Gaming", count: 0 },
          { icon: "🍳", name: "Food & Cooking", count: 0 },
          { icon: "📚", name: "Education", count: 0 },
        ]);
      } finally {
        setCategoriesLoading(false);
      }
    };
    
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchCreators();
  }, [selectedCategory, page]);

  // Reset page when category changes
  useEffect(() => {
    setPage(1);
  }, [selectedCategory]);

  // Helper function to get icon based on category name
  const getCategoryIcon = (categoryName: string): string => {
    const iconMap: {[key: string]: string} = {
      "Fashion & Beauty": "👗",
      "Travel": "✈️",
      "Fitness & Health": "💪",
      "Tech": "💻",
      "Technology": "💻",
      "Music": "🎵",
      "Gaming": "🎮",
      "Food & Cooking": "🍳",
      "Food": "🍳",
      "Education": "📚",
      "Lifestyle": "🌿",
      "Beauty": "💄",
      "Sports": "⚽",
      "Entertainment": "🎬",
      "Business": "💼",
      "Art": "🎨"
    };
    
    return iconMap[categoryName] || "🔍"; // Default icon if category not found
  };

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
      console.log('Fetching published creators...');
      
      // Use the getFilteredCreators function with category filter and pagination
      const result = await getFilteredCreators({
        category: selectedCategory === "All" ? "" : selectedCategory,
        page: page,
        limit
      });
      
      console.log('Received data from API:', result);
      
      if (!result || !result.creators || !Array.isArray(result.creators)) {
        console.error('Invalid data format returned:', result);
        setCreators([]);
        setError('Failed to load creators - invalid data format');
        setTotalPages(1);
        setTotalCreators(0);
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
        setTotalPages(result.pagination?.pages || 1);
        setTotalCreators(result.pagination?.total || 0);
        setError(null);
      }
    } catch (err: any) {
      console.error('Error fetching published creators:', err);
      setCreators([]); // Set empty array to prevent UI issues
      setError('Failed to load creators. Please try again later.');
      setTotalPages(1);
      setTotalCreators(0);
    } finally {
      setLoading(false);
    }
  };
  
  // Function to handle page change
  const handlePageChange = (newPage: number) => {
    if (newPage === page) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
        <button 
          className="text-purple-600 text-sm font-medium"
          onClick={() => router.push('/find-creators')}
        >
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
            {!categoriesLoading && categories.map((category) => (
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
            {categoriesLoading && (
              <div className="flex items-center px-4 py-2 text-gray-400">
                <div className="animate-spin h-4 w-4 mr-2 border-2 border-gray-300 border-t-gray-600 rounded-full"></div>
                <span>Loading categories...</span>
              </div>
            )}
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
              return (
                <div key={`creator-${creator._id || index}`}>
                  <CreatorCard 
                    key={`card-${creator._id || index}`}
                    {...mapCreatorToCardProps(creator)} 
                  />
                </div>
              );
            })}
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => handlePageChange(page - 1)}
                  disabled={page === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${page === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Previous</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${page === pageNum ? 'z-10 bg-purple-50 border-purple-500 text-purple-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                
                <button
                  onClick={() => handlePageChange(page + 1)}
                  disabled={page === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${page === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                  <span className="sr-only">Next</span>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          )}
          
          {/* Results Summary */}
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {filteredCreators.length} of {totalCreators} creators
          </div>
        </>
      )}
    </div>
  );
};

export default PublishedCreators;