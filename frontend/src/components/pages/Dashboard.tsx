'use client';

import { useEffect, useState, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Grid } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/grid";
import { DashboardLayout } from "../layout/DashboardLayout";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCreatorStore } from "@/store/creatorStore";
import PublishedCreators from '../creator/PublishedCreators';
import { getCategories, getPublishedCreators, getFilteredCreators, getAvailableTags, getAvailableContentTypes, saveSearchHistory, getRecentSearches, clearSearchHistory } from "@/services/api";
import { useAuth } from '@/context/AuthContext';
import { BrandSignupPopup } from '../modals/BrandSignupPopup';
import { createBrandPreference, getBrandPreference } from '../../services/brandPreference';
import { toast } from 'react-hot-toast';
import { fetchBrandMatches } from '@/api/matching';
import CreatorCard from '../creator/CreatorCard';
import { getDashboardRecommendations, getProfilesYouMayLike, getPopularProfilesByCategory, getBestCreatorsForBrand } from '@/services/api';

interface Creator {
  id: string;
  name: string;
  username: string;
  level: string;
  category: string;
  avatar: string;
  coverImage: string;
  description: string;
  rating: number;
  reviews: number;
  startingPrice: string;
  isOnline?: boolean;
  location: string;
  tags?: string[];
  followers?: string;
  isLiked: boolean;
}

// Category icon mapping
const categoryIcons: Record<string, string> = {
  "Fashion & Beauty": "👗",
  "Travel": "✈️",
  "Fitness & Health": "💪",
  "Health & Fitness": "💪",
  "Tech": "💻",
  "Technology & Gadgets": "💻",
  "Music": "🎵",
  "Gaming": "🎮",
  "Food & Cooking": "🍳",
  "Food & Beverage": "🍳",
  "Education": "📚",
  "Lifestyle": "🌟",
  "Finance & Business": "💼",
  "Entertainment": "🎬",
  "Parenting & Family": "👨‍👩‍👧‍👦",
  "Automobile": "🚗",
  "Art & Creativity": "🎨",
  "Home & Gardening": "🏡",
  "Pets & Animals": "🐾",
  "Motivation & Spirituality": "🧘",
  "Books & Literature": "📖",
  "Events & Festivals": "🎉",
  "Environment & Social Causes": "🌱",
  "Others": "📁"
};

// Comprehensive pricing utility function
const getStartingPrice = (creator: any): string | number | undefined => {
  // Debug logging for pricing
  console.log('💰 Pricing Debug - Creator:', creator?.name || creator?.fullName || creator?.username);
  console.log('💰 Pricing Debug - Raw startingPrice:', creator?.startingPrice);
  console.log('💰 Pricing Debug - Raw pricing object:', creator?.pricing);
  console.log('💰 Pricing Debug - Professional info pricing:', creator?.professionalInfo?.pricing);

  // Direct startingPrice field
  if (creator?.startingPrice !== undefined && creator?.startingPrice !== null) {
    const sp = creator.startingPrice;
    if (typeof sp === 'number' && !isNaN(sp) && sp > 0) return sp;
    if (typeof sp === 'string' && sp.trim()) return sp;
  }

  // Pricing object structure
  if (creator?.pricing) {
    // Basic pricing
    if (creator.pricing.basic) {
      const basicPrice = creator.pricing.basic.price || creator.pricing.basic;
      if (typeof basicPrice === 'number' && !isNaN(basicPrice) && basicPrice > 0) return basicPrice;
      if (typeof basicPrice === 'string' && basicPrice.trim()) return basicPrice;
    }

    // Standard pricing
    if (creator.pricing.standard) {
      const standardPrice = creator.pricing.standard.price || creator.pricing.standard;
      if (typeof standardPrice === 'number' && !isNaN(standardPrice) && standardPrice > 0) return standardPrice;
      if (typeof standardPrice === 'string' && standardPrice.trim()) return standardPrice;
    }

    // Premium pricing
    if (creator.pricing.premium) {
      const premiumPrice = creator.pricing.premium.price || creator.pricing.premium;
      if (typeof premiumPrice === 'number' && !isNaN(premiumPrice) && premiumPrice > 0) return premiumPrice;
      if (typeof premiumPrice === 'string' && premiumPrice.trim()) return premiumPrice;
    }

    // Any other pricing field
    for (const [key, value] of Object.entries(creator.pricing)) {
      if (key !== 'basic' && key !== 'standard' && key !== 'premium') {
        const price = (value as any)?.price || value;
        if (typeof price === 'number' && !isNaN(price) && price > 0) return price;
        if (typeof price === 'string' && price.trim()) return price;
      }
    }
  }

  // Alternative pricing fields
  const altFields = ['price', 'rate', 'cost', 'fee', 'amount'];
  for (const field of altFields) {
    if (creator?.[field] !== undefined && creator?.[field] !== null) {
      const value = creator[field];
      if (typeof value === 'number' && !isNaN(value) && value > 0) return value;
      if (typeof value === 'string' && value.trim()) return value;
    }
  }

  // Check professionalInfo for pricing
  if (creator?.professionalInfo?.pricing) {
    const profPricing = creator.professionalInfo.pricing;
    if (profPricing.basic) {
      const basicPrice = profPricing.basic.price || profPricing.basic;
      if (typeof basicPrice === 'number' && !isNaN(basicPrice) && basicPrice > 0) return basicPrice;
      if (typeof basicPrice === 'string' && basicPrice.trim()) return basicPrice;
    }
  }

  console.log('💰 Pricing Debug - No valid price found, returning undefined');
  return undefined;
};

// Category normalization function
function normalizeCategoryName(name: string): string {
  if (!name) return "Others";
  const n = name.toLowerCase();
  if (["tech", "technology", "technology & gadgets"].includes(n)) return "Technology & Gadgets";
  if (["food & cooking", "food & beverage"].includes(n)) return "Food & Beverage";
  if (["fitness & health", "health & fitness"].includes(n)) return "Health & Fitness";
  if (["art", "creativity", "art & creativity"].includes(n)) return "Art & Creativity";
  if (["parenting", "family", "parenting & family"].includes(n)) return "Parenting & Family";
  if (["home", "gardening", "home & gardening"].includes(n)) return "Home & Gardening";
  if (["motivation", "spirituality", "motivation & spirituality"].includes(n)) return "Motivation & Spirituality";
  if (["books", "literature", "books & literature"].includes(n)) return "Books & Literature";
  if (["events", "festivals", "events & festivals"].includes(n)) return "Events & Festivals";
  if (["environment", "social causes", "environment & social causes"].includes(n)) return "Environment & Social Causes";
  return name;
}

const POPUP_DISMISS_KEY = 'brand_signup_popup_dismissed_at';
const POPUP_TIMEOUT = 4 * 60 * 1000; // 4 minutes in ms

export function Dashboard() {
  const router = useRouter();
  const { toggleLike } = useCreatorStore();
  const { user, isAuthenticated } = useAuth();
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Categories State
  const [categories, setCategories] = useState<{ name: string; subcategories: { name: string }[] }[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState<string | null>(null);

  // Top Creators State
  const [topCreatorsList, setTopCreatorsList] = useState<any[]>([]);
  const [topCreatorsLoading, setTopCreatorsLoading] = useState(true);
  const [topCreatorsError, setTopCreatorsError] = useState<string | null>(null);

  // Match Data State
  const [matches, setMatches] = useState<any[]>([]);
  const [matchesLoading, setMatchesLoading] = useState(false);
  const [matchesError, setMatchesError] = useState<string | null>(null);

  // Shuffle matches for brand view
  function shuffleArray(array: any[]) {
    const arr = array.slice();
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }
  const shuffledMatches = shuffleArray(matches);

  // Recommendations State
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  // Helpers to compute rating/reviewCount robustly
  const toNumber = (value: any): number => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      const parsed = parseFloat(value);
      return isNaN(parsed) ? NaN : parsed;
    }
    return NaN;
  };

  const computeReviewCount = (creator: any): number => {
    if (Array.isArray(creator?.reviews)) return creator.reviews.length;
    const metricsCount = creator?.metrics?.ratings?.count;
    if (typeof metricsCount === 'number') return metricsCount;
    if (typeof creator?.reviewCount === 'number') return creator.reviewCount;
    return 0;
  };

  const computeRating = (creator: any): number => {
    const explicit = toNumber(creator?.rating);
    if (!isNaN(explicit) && explicit > 0) return explicit;

    const metricsAvg = toNumber(creator?.metrics?.ratings?.average);
    if (!isNaN(metricsAvg) && metricsAvg > 0) return metricsAvg;

    // Try alternative average fields
    const altAvg = toNumber(creator?.metrics?.averageRating ?? creator?.averageRating);
    if (!isNaN(altAvg) && altAvg > 0) return altAvg;

    // Compute from reviews array if available
    if (Array.isArray(creator?.reviews) && creator.reviews.length > 0) {
      const withNumbers = creator.reviews
        .map((r: any) => toNumber(r?.rating))
        .filter((n: number) => !isNaN(n));
      if (withNumbers.length > 0) {
        const sum = withNumbers.reduce((acc: number, n: number) => acc + n, 0);
        return sum / withNumbers.length;
      }
    }
    return 0;
  };

  // Profiles You May Like State
  const [profilesYouMayLike, setProfilesYouMayLike] = useState<any[]>([]);
  const [profilesYouMayLikeLoading, setProfilesYouMayLikeLoading] = useState(false);

  // Best Creators State
  const [bestCreators, setBestCreators] = useState<any[]>([]);
  const [bestCreatorsLoading, setBestCreatorsLoading] = useState(false);
  
  // Tags and Content Types State
  const [availableTags, setAvailableTags] = useState<Array<{tag: string, count: number}>>([]);
  const [availableContentTypes, setAvailableContentTypes] = useState<Array<{contentType: string, count: number}>>([]);
  const [tagBasedRecommendations, setTagBasedRecommendations] = useState<any[]>([]);
  const [contentTypeBasedRecommendations, setContentTypeBasedRecommendations] = useState<any[]>([]);
  
  // Search-based recommendations state
  const [searchBasedRecommendations, setSearchBasedRecommendations] = useState<any[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentSearches, setRecentSearches] = useState<Array<{query: string, timestamp: number}>>([]);
  const [searchHistoryLoading, setSearchHistoryLoading] = useState(false);

  // Function to fetch top creators from backend
  const fetchTopCreators = async () => {
    setTopCreatorsLoading(true);
    setTopCreatorsError(null);
    try {
      const creators = await getPublishedCreators();
      console.log('🎯 Dashboard Debug - Received creators from getPublishedCreators:', creators);
      
      // Filter only active profiles. Backend returns published items and may omit fields,
      // so treat missing publish fields as published while excluding deactivated ones.
      const publishedCreators = creators.filter((creator: any) => {
        const isActive = creator?.isActive !== false;
        const statusOk = creator?.status ? creator.status === 'published' : true;
        const publishInfoOk =
          creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
            ? creator.publishInfo.isPublished === true
            : true;
        return isActive && statusOk && publishInfoOk;
      });
      
      publishedCreators.forEach((creator: any, index: number) => {
        console.log(`🎯 Dashboard Debug - Published Creator ${index + 1}:`, {
          name: creator.userId?.fullName || creator.personalInfo?.username,
          categories: creator.professionalInfo?.categories,
          category: creator.professionalInfo?.category,
          status: creator.status,
          isPublished: creator.publishInfo?.isPublished
        });
      });
      
      // Shuffle the published creators array to get different creators each time
      const shuffledCreators = shuffleArray([...publishedCreators]);
      setTopCreatorsList(shuffledCreators.slice(0, 3));
    } catch (err) {
      setTopCreatorsError("Failed to load top creators");
    } finally {
      setTopCreatorsLoading(false);
    }
  };

  // Function to fetch categories from backend
  const fetchCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError(null);
    try {
      const cats = await getCategories();
      // Normalize and deduplicate
      const normalizedMap = new Map();
      cats.forEach((cat: any) => {
        const normName = normalizeCategoryName(cat.name);
        if (!normalizedMap.has(normName)) {
          normalizedMap.set(normName, { ...cat, name: normName });
        }
      });
      setCategories(Array.from(normalizedMap.values()));
    } catch (err) {
      setCategoriesError("Failed to load categories");
    } finally {
      setCategoriesLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Home | Creator Platform";
    
    // Load search history from backend
    const loadSearchHistory = async () => {
      if (isAuthenticated && user?.role === 'brand') {
        setSearchHistoryLoading(true);
        try {
          const recentSearchesData = await getRecentSearches(10);
          const formattedSearches = recentSearchesData.map((search: any) => ({
            query: search.query,
            timestamp: new Date(search.createdAt).getTime()
          }));
          setRecentSearches(formattedSearches);
          setSearchHistory(formattedSearches.map((s: any) => s.query));
        } catch (error) {
          console.error('Error loading search history from backend:', error);
          // Fallback to localStorage
          try {
            const savedSearches = localStorage.getItem('recentSearches');
            const savedHistory = localStorage.getItem('searchHistory');
            if (savedSearches) {
              setRecentSearches(JSON.parse(savedSearches));
            }
            if (savedHistory) {
              setSearchHistory(JSON.parse(savedHistory));
            }
          } catch (localError) {
            console.error('Error loading search history from localStorage:', localError);
          }
        } finally {
          setSearchHistoryLoading(false);
        }
      }
    };
    
    loadSearchHistory();
    
    // Fetch categories
    fetchCategories();
    
    // Fetch top creators
    fetchTopCreators();
    
    // Fetch matches for brand user
    if (isAuthenticated && user?.role === 'brand' && user?._id) {
      setMatchesLoading(true);
      fetchBrandMatches(user._id)
        .then(setMatches)
        .catch(() => {
          // Set empty matches array instead of error
          setMatches([]);
          // Don't set error message
        })
        .finally(() => setMatchesLoading(false));
    }
  }, [isAuthenticated, user]);
  
  // Add an effect to reload creators when the page is refreshed
  useEffect(() => {
    // Add event listener for page visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reload creators when page becomes visible (including refresh)
        fetchTopCreators();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Clean up the event listener
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'brand' && user?._id) {
      // Check if brand preference already exists
      getBrandPreference(user._id)
        .then(() => setShowBrandPopup(false))
        .catch(() => {
          // Check localStorage for last dismissed time
          const lastDismissed = localStorage.getItem(POPUP_DISMISS_KEY);
          if (lastDismissed && Date.now() - Number(lastDismissed) < POPUP_TIMEOUT) {
            setShowBrandPopup(false);
            // Set a timer for the remaining time to show the popup automatically
            if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
            popupTimerRef.current = setTimeout(() => {
              setShowBrandPopup(true);
            }, POPUP_TIMEOUT - (Date.now() - Number(lastDismissed)));
          } else {
            setShowBrandPopup(true);
          }
        });
    }
    return () => {
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'brand') {
      setRecommendationsLoading(true);
      let recent: string[] = [];
      try {
        recent = JSON.parse(localStorage.getItem('recentlyViewedCreators') || '[]');
      } catch (e) {
        recent = [];
      }
      
      // Generate recommendations based on search history
      const generateHistoryBasedRecommendations = async () => {
        if (searchHistory.length > 0) {
          // Use the most recent search for recommendations
          const latestSearch = searchHistory[0];
          await generateSearchBasedRecommendations(latestSearch);
        }
      };
      
      getDashboardRecommendations(recent)
        .then(creators => {
          // Filter only active profiles; treat missing publish fields as published
          const publishedCreators = creators.filter((creator: any) => {
            const isActive = creator?.isActive !== false;
            const statusOk = creator?.status ? creator.status === 'published' : true;
            const publishInfoOk =
              creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                ? creator.publishInfo.isPublished === true
                : true;
            return isActive && statusOk && publishInfoOk;
          });
          setRecommendations(publishedCreators);
        })
        .catch(() => setRecommendations([]))
        .finally(() => setRecommendationsLoading(false));

      setProfilesYouMayLikeLoading(true);
      getProfilesYouMayLike()
        .then(creators => {
          const publishedCreators = creators.filter((creator: any) => {
            const isActive = creator?.isActive !== false;
            const statusOk = creator?.status ? creator.status === 'published' : true;
            const publishInfoOk =
              creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                ? creator.publishInfo.isPublished === true
                : true;
            return isActive && statusOk && publishInfoOk;
          });
          setProfilesYouMayLike(publishedCreators);
        })
        .catch(() => setProfilesYouMayLike([]))
        .finally(() => setProfilesYouMayLikeLoading(false));
        
      // Generate history-based recommendations
      generateHistoryBasedRecommendations();
    }
  }, [isAuthenticated, user, searchHistory]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'brand') {
      setBestCreatorsLoading(true);
      
      // Fetch tags and content types for enhanced recommendations
      Promise.all([
        getAvailableTags(),
        getAvailableContentTypes()
      ]).then(([tags, contentTypes]) => {
        setAvailableTags(tags);
        setAvailableContentTypes(contentTypes);
        
        // Get tag-based recommendations (top 3 tags) - only published profiles
        if (tags.length > 0) {
          const topTags = tags.slice(0, 3).map((t: {tag: string, count: number}) => t.tag);
          getFilteredCreators({ tags: topTags, limit: 6 })
            .then(result => {
              // Filter only active profiles; treat missing publish fields as published
              const publishedCreators = result.creators.filter((creator: any) => {
                const isActive = creator?.isActive !== false;
                const statusOk = creator?.status ? creator.status === 'published' : true;
                const publishInfoOk =
                  creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                    ? creator.publishInfo.isPublished === true
                    : true;
                return isActive && statusOk && publishInfoOk;
              });
              setTagBasedRecommendations(publishedCreators);
            })
            .catch(() => setTagBasedRecommendations([]));
        }
        
        // Get content type-based recommendations (top 3 content types) - only published profiles
        if (contentTypes.length > 0) {
          const topContentTypes = contentTypes.slice(0, 3).map((ct: {contentType: string, count: number}) => ct.contentType);
          getFilteredCreators({ contentTypes: topContentTypes, limit: 6 })
            .then(result => {
              const publishedCreators = result.creators.filter((creator: any) => {
                const isActive = creator?.isActive !== false;
                const statusOk = creator?.status ? creator.status === 'published' : true;
                const publishInfoOk =
                  creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                    ? creator.publishInfo.isPublished === true
                    : true;
                return isActive && statusOk && publishInfoOk;
              });
              setContentTypeBasedRecommendations(publishedCreators);
            })
            .catch(() => setContentTypeBasedRecommendations([]));
        }
      }).catch(() => {
        setAvailableTags([]);
        setAvailableContentTypes([]);
      });
      
      getBestCreatorsForBrand()
        .then(creators => {
          // Filter only active profiles (treat missing publish fields as published)
          const publishedCreators = creators.filter((creator: any) => {
            const isActive = creator?.isActive !== false;
            const statusOk = creator?.status ? creator.status === 'published' : true;
            const publishInfoOk =
              creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                ? creator.publishInfo.isPublished === true
                : true;
            return isActive && statusOk && publishInfoOk;
          });
          setBestCreators(publishedCreators);
        })
        .catch(() => setBestCreators([]))
        .finally(() => setBestCreatorsLoading(false));
    }
  }, [isAuthenticated, user]);

  const handleBrandPopupClose = () => {
    setShowBrandPopup(false);
    localStorage.setItem(POPUP_DISMISS_KEY, Date.now().toString());
    // Set a timer to show the popup again after 4 minutes
    if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    popupTimerRef.current = setTimeout(() => {
      setShowBrandPopup(true);
    }, POPUP_TIMEOUT);
    
    // Instead of reloading, show general creator recommendations
    if (isAuthenticated && user?.role === 'brand') {
      setBestCreatorsLoading(true);
      
      // Try to get brand-specific creators first, fallback to general recommendations
      getBestCreatorsForBrand()
        .then(creators => {
          if (creators && creators.length > 0) {
            // Filter only published profiles
            const publishedCreators = creators.filter((creator: any) => 
              creator.status === 'published' && 
              creator.publishInfo?.isPublished === true &&
              creator.isActive !== false
            );
            setBestCreators(publishedCreators);
          } else {
            // Fallback: Use general published creators as recommendations
            return getPublishedCreators().then(generalCreators => {
              // Filter only active profiles and shuffle (treat missing publish fields as published)
              const publishedCreators = generalCreators.filter((creator: any) => {
                const isActive = creator?.isActive !== false;
                const statusOk = creator?.status ? creator.status === 'published' : true;
                const publishInfoOk =
                  creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                    ? creator.publishInfo.isPublished === true
                    : true;
                return isActive && statusOk && publishInfoOk;
              });
              const shuffled = publishedCreators.sort(() => 0.5 - Math.random());
              setBestCreators(shuffled.slice(0, 6));
            });
          }
        })
        .catch(() => {
          // If brand-specific API fails, use general published creators
          getPublishedCreators()
            .then(generalCreators => {
              // Filter only active profiles and shuffle (treat missing publish fields as published)
              const publishedCreators = generalCreators.filter((creator: any) => {
                const isActive = creator?.isActive !== false;
                const statusOk = creator?.status ? creator.status === 'published' : true;
                const publishInfoOk =
                  creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
                    ? creator.publishInfo.isPublished === true
                    : true;
                return isActive && statusOk && publishInfoOk;
              });
              const shuffled = publishedCreators.sort(() => 0.5 - Math.random());
              setBestCreators(shuffled.slice(0, 6));
            })
            .catch(() => setBestCreators([]))
        })
        .finally(() => setBestCreatorsLoading(false));
    }
    
    // Remove the page reload
    // window.location.reload();
  };

  const handleBrandPopupSubmit = async (data: any) => {
    setShowBrandPopup(false);
    // --- Send data to backend ---
    try {
      if (!user || !user._id) throw new Error('User not found');
      const payload = {
        brandId: user._id,
        category: data.category,
        marketingCampaignType: data.marketingCampaignType,
        brandValues: data.brandValues.split(',').map((v: string) => v.trim()),
        marketingInterests: data.marketingInterests,
        campaignRequirements: data.campaignRequirements,
        physicalAppearanceRequirement: data.physicalAppearance,
        ageTargeting: (data.targetAgeRanges || []).join(','),
        genderTargeting: (data.targetGenders || []).join(','),
        socialMediaPreferences: data.socialMediaPreferences,
        budget: Number(data.budgetMax || data.budgetMin || 0),
      };
      await createBrandPreference(payload);
      toast.success('Preferences saved!');
      setShowBrandPopup(false); // Hide popup after successful submit
      window.location.reload(); // Refresh the page after submit
    } catch (err: any) {
      toast.error('Failed to save preferences: ' + (err?.message || 'Unknown error'));
    }
  };

  // Hero Section Data
  const heroStats = [
    { value: "12K+", label: "NETWORKS" },
    { value: "76K+", label: "BRANDS" },
    { value: "55K+", label: "CREATORS" },
  ];

  // Top Creators Data
  const topCreators: Creator[] = [
    // Fashion & Beauty Creators
    {
      id: "@stylemaven",
      name: "Style Maven",
      username: "@stylemaven",
      level: "Level 1 Creator",
      category: "Fashion & Beauty",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330",
      coverImage:
        "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04",
      description:
        "Fashion blogger and style consultant specializing in sustainable fashion",
      rating: 4.9,
      reviews: 485,
      startingPrice: "₹45000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@beautyqueen",
      name: "Beauty Expert",
      username: "@beautyqueen",
      level: "Level 2 Creator",
      category: "Fashion & Beauty",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      coverImage:
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796",
      description: "Professional makeup artist and beauty influencer",
      rating: 4.8,
      reviews: 380,
      startingPrice: "₹40000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Tech Creators
    {
      id: "@techguru",
      name: "Tech Guru",
      username: "@techguru",
      level: "Level 3 Creator",
      category: "Tech",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d",
      coverImage:
        "https://images.unsplash.com/photo-1513542789411-b6a5d4f31634",
      description: "Tech reviewer and gadget specialist",
      rating: 4.9,
      reviews: 450,
      startingPrice: "₹55000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@codemaster",
      name: "Code Master",
      username: "@codemaster",
      level: "Level 2 Creator",
      category: "Tech",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e",
      coverImage: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0",
      description: "Software developer and tech educator",
      rating: 4.7,
      reviews: 320,
      startingPrice: "₹48000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Travel Creators
    {
      id: "@wanderlust",
      name: "Wanderlust",
      username: "@wanderlust",
      level: "Level 2 Creator",
      category: "Travel",
      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6",
      coverImage:
        "https://images.unsplash.com/photo-1488646953014-85cb44e25828",
      description: "Travel blogger exploring hidden gems worldwide",
      rating: 4.8,
      reviews: 410,
      startingPrice: "₹42000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@globetrotter",
      name: "Globe Trotter",
      username: "@globetrotter",
      level: "Level 1 Creator",
      category: "Travel",
      avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61",
      coverImage:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
      description: "Adventure travel and photography expert",
      rating: 4.6,
      reviews: 280,
      startingPrice: "₹38000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Fitness & Health Creators
    {
      id: "@fitnesspro",
      name: "Fitness Pro",
      username: "@fitnesspro",
      level: "Level 3 Creator",
      category: "Fitness & Health",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb",
      coverImage:
        "https://images.unsplash.com/photo-1517836357463-d25dfeac3438",
      description: "Personal trainer and nutrition expert",
      rating: 4.9,
      reviews: 520,
      startingPrice: "₹50000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@wellnessguide",
      name: "Wellness Guide",
      username: "@wellnessguide",
      level: "Level 2 Creator",
      category: "Fitness & Health",
      avatar: "https://images.unsplash.com/photo-1548142813-c348350df52b",
      coverImage:
        "https://images.unsplash.com/photo-1517130038641-a774d04afb3c",
      description: "Holistic health coach and yoga instructor",
      rating: 4.7,
      reviews: 340,
      startingPrice: "₹45000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Music Creators
    {
      id: "@musicmaestro",
      name: "Music Maestro",
      username: "@musicmaestro",
      level: "Level 2 Creator",
      category: "Music",
      avatar: "https://images.unsplash.com/photo-1463453091185-61582044d556",
      coverImage:
        "https://images.unsplash.com/photo-1511735111819-9a3f7709049c",
      description: "Music producer and vocal coach",
      rating: 4.8,
      reviews: 390,
      startingPrice: "₹46000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@rhythmmaster",
      name: "Rhythm Master",
      username: "@rhythmmaster",
      level: "Level 1 Creator",
      category: "Music",
      avatar: "https://images.unsplash.com/photo-1536321115970-5dfa13356211",
      coverImage:
        "https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae",
      description: "DJ and electronic music producer",
      rating: 4.6,
      reviews: 260,
      startingPrice: "₹40000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Gaming Creators
    {
      id: "@gamemaster",
      name: "Game Master",
      username: "@gamemaster",
      level: "Level 3 Creator",
      category: "Gaming",
      avatar: "https://images.unsplash.com/photo-1566492031773-4f4e44671857",
      coverImage: "https://images.unsplash.com/photo-1542751371-adc38448a05e",
      description: "Professional gamer and strategy guide creator",
      rating: 4.9,
      reviews: 480,
      startingPrice: "₹52000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@streampro",
      name: "Stream Pro",
      username: "@streampro",
      level: "Level 2 Creator",
      category: "Gaming",
      avatar: "https://images.unsplash.com/photo-1557555187-23d685287bc3",
      coverImage:
        "https://images.unsplash.com/photo-1538481199705-c710c4e965fc",
      description: "Game streamer and community builder",
      rating: 4.7,
      reviews: 350,
      startingPrice: "₹44000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Food & Cooking Creators
    {
      id: "@chefsupreme",
      name: "Chef Supreme",
      username: "@chefsupreme",
      level: "Level 2 Creator",
      category: "Food & Cooking",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80",
      coverImage: "https://images.unsplash.com/photo-1556910103-1c02745aae4d",
      description: "Professional chef and recipe developer",
      rating: 4.8,
      reviews: 430,
      startingPrice: "₹47000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@foodartist",
      name: "Food Artist",
      username: "@foodartist",
      level: "Level 1 Creator",
      category: "Food & Cooking",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2",
      coverImage:
        "https://images.unsplash.com/photo-1495521821757-a1efb6729352",
      description: "Food photographer and styling expert",
      rating: 4.6,
      reviews: 290,
      startingPrice: "₹41000",
      location: "Delhi, India",
      isLiked: false,
    },

    // Education Creators
    {
      id: "@learningpro",
      name: "Learning Pro",
      username: "@learningpro",
      level: "Level 3 Creator",
      category: "Education",
      avatar: "https://images.unsplash.com/photo-1507152832244-10d45c7eda57",
      coverImage:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655",
      description: "Online course creator and education expert",
      rating: 4.9,
      reviews: 510,
      startingPrice: "₹54000",
      location: "Mumbai, India",
      isLiked: false,
    },
    {
      id: "@studyguide",
      name: "Study Guide",
      username: "@studyguide",
      level: "Level 2 Creator",
      category: "Education",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956",
      coverImage:
        "https://images.unsplash.com/photo-1523050854058-8df90110c9f1",
      description: "Academic tutor and study skills coach",
      rating: 4.7,
      reviews: 330,
      startingPrice: "₹43000",
      location: "Delhi, India",
      isLiked: false,
    },
  ];

  const [selectedCategory, setSelectedCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("selectedCategory") || "All";
    }
    return "All";
  });

  const [selectedSearchCategory, setSelectedSearchCategory] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("selectedSearchCategory") || "All";
    }
    return "All";
  });

  const [searchQuery, setSearchQuery] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("searchQuery") || "";
    }
    return "";
  });

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    localStorage.setItem("selectedCategory", category);
  };

  const handleSearchCategorySelect = async (category: string) => {
    setSelectedSearchCategory(category);
    setIsCategoryDropdownOpen(false);
    localStorage.setItem("selectedSearchCategory", category);
    
    // Save category selection to search history for recommendations
    if (category !== "All Categories") {
      await saveSearchToHistory(category, 'category', { category });
      await generateSearchBasedRecommendations(category);
    }
  };

  // Function to save search to history
  const saveSearchToHistory = async (query: string, searchType: 'text' | 'category' | 'tag' | 'contentType' = 'text', filters?: any) => {
    if (!query.trim()) return;
    
    try {
      // Save to backend
      await saveSearchHistory({
        query: query.trim(),
        searchType,
        filters,
        resultsCount: 0 // Will be updated after search results
      });
      
      // Update local state
      const newSearch = { query: query.trim(), timestamp: Date.now() };
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== query.trim())].slice(0, 10);
      setRecentSearches(updatedSearches);
      
      // Update search history for recommendations
      const uniqueQueries = [...new Set([query.trim(), ...searchHistory.filter(q => q !== query.trim())])].slice(0, 20);
      setSearchHistory(uniqueQueries);
    } catch (error) {
      console.error('Error saving search to history:', error);
      // Fallback to localStorage if backend fails
      const newSearch = { query: query.trim(), timestamp: Date.now() };
      const updatedSearches = [newSearch, ...recentSearches.filter(s => s.query !== query.trim())].slice(0, 10);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
      
      const uniqueQueries = [...new Set([query.trim(), ...searchHistory.filter(q => q !== query.trim())])].slice(0, 20);
      setSearchHistory(uniqueQueries);
      localStorage.setItem('searchHistory', JSON.stringify(uniqueQueries));
    }
  };

  // Function to generate search-based recommendations
  const generateSearchBasedRecommendations = async (searchQuery: string) => {
    try {
      // Get similar creators based on search query
      const result = await getFilteredCreators({ 
        search: searchQuery, 
        limit: 6,
        tags: searchQuery.toLowerCase().includes('tag') ? availableTags.slice(0, 3).map(t => t.tag) : [],
        contentTypes: searchQuery.toLowerCase().includes('content') || searchQuery.toLowerCase().includes('type') ? 
          availableContentTypes.slice(0, 3).map(ct => ct.contentType) : []
      });
      
      // Filter only active profiles (missing publish fields are treated as published)
      const publishedCreators = result.creators.filter((creator: any) => {
        const isActive = creator?.isActive !== false;
        const statusOk = creator?.status ? creator.status === 'published' : true;
        const publishInfoOk =
          creator?.publishInfo && typeof creator.publishInfo.isPublished !== 'undefined'
            ? creator.publishInfo.isPublished === true
            : true;
        return isActive && statusOk && publishInfoOk;
      });
      
      setSearchBasedRecommendations(publishedCreators);
    } catch (error) {
      console.error('Error generating search-based recommendations:', error);
      setSearchBasedRecommendations([]);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    localStorage.setItem("searchQuery", query);
    
    if (query.trim() === "") {
      setShowSearchResults(false);
      setSearchResults([]);
      setSearchError(null);
      return;
    }
    
    setSearchLoading(true);
    setSearchError(null);
    setShowSearchResults(true);
    
    try {
      const res = await getFilteredCreators({ search: query, limit: 5 });
      setSearchResults(res.creators);
      
      // Save search to history with results count
      await saveSearchToHistory(query, 'text', undefined);
      
      // Generate search-based recommendations
      await generateSearchBasedRecommendations(query);
    } catch (err) {
      setSearchError("Failed to fetch search results");
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  };

  const handleSearchInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch(searchQuery);
    }
  };

  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Add state for dropdown
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  // Add state for category dropdown window
  const [categoryDropdownStart, setCategoryDropdownStart] = useState(0);
  const categoriesPerPage = 4;
  const visibleCategories = categories.slice(categoryDropdownStart, categoryDropdownStart + categoriesPerPage);

  const handleCategoryDropdownPrev = () => {
    setCategoryDropdownStart((prev) => Math.max(0, prev - categoriesPerPage));
  };
  const handleCategoryDropdownNext = () => {
    setCategoryDropdownStart((prev) =>
      Math.min(categories.length - categoriesPerPage, prev + categoriesPerPage)
    );
  };

  const filteredCreators = topCreators.filter((creator) => {
    if (selectedCategory === "All") return true;
    return creator.category === selectedCategory;
  });

  return (
    <>
      {showBrandPopup && (
        <BrandSignupPopup
          isOpen={showBrandPopup}
          onClose={handleBrandPopupClose}
          isSignedIn={true}
          onSubmit={handleBrandPopupSubmit}
        />
      )}
      <DashboardLayout>
        <main className="p-6 space-y-8">
          {/* Hero and Top Creators Section */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Hero Section */}
            <div className="lg:col-span-2 bg-gradient-to-r from-purple-500 to-purple-600 rounded-3xl p-6 text-white">
              <h1 className="text-3xl font-bold mb-4">We Help to hires</h1>

              {/* Stats */}
              <div className="flex gap-8 mb-6">
                {heroStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs opacity-80">{stat.label}</p>
                  </div>
                ))}
              </div>

              <button className="bg-white text-purple-600 px-5 py-1.5 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors mb-8">
                Explore
              </button>

              {/* Search Section - Moved to bottom */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-auto">
                {/* Categories Dropdown */}
                <div className="relative w-full sm:min-w-[200px] mb-3 sm:mb-0">
                  <button
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                    className="w-full flex items-center justify-between bg-white/10 backdrop-blur-sm text-white px-5 py-3 rounded-full border border-white/20"
                  >
                    <span>{selectedSearchCategory}</span>
                    <svg
                      className={`w-4 h-4 transition-transform ${
                        isCategoryDropdownOpen ? "rotate-180" : ""
                      }`}
                      viewBox="0 0 24 24"
                      fill="none"
                    >
                      <path
                        d="M6 9L12 15L18 9"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>

                  {/* Dropdown Menu */}
                  {isCategoryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden z-50 w-full min-w-[220px] max-w-xs">
                      <div className="flex items-center justify-between px-2 pt-2 pb-1">
                        <button
                          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCategoryDropdownPrev}
                          disabled={categoryDropdownStart === 0}
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-600" />
                        </button>
                        <span className="text-gray-900 font-semibold text-sm">Choose a category</span>
                        <button
                          className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                          onClick={handleCategoryDropdownNext}
                          disabled={categoryDropdownStart + categoriesPerPage >= categories.length}
                        >
                          <ChevronRight className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                      <div className="divide-y">
                        <div
                          className={`p-2 hover:bg-gray-50 cursor-pointer text-gray-900 ${selectedSearchCategory === "All Categories" ? "bg-purple-100" : ""}`}
                          onClick={() => handleSearchCategorySelect("All Categories")}
                        >
                          <div className="flex items-center gap-2">
                            <span>{categoryIcons["Others"]}</span>
                            <div>
                              <h3 className="font-medium text-gray-900 text-xs truncate">All Categories</h3>
                            </div>
                          </div>
                        </div>
                        {visibleCategories.map((category) => (
                          <div
                            key={category.name}
                            className={`p-2 hover:bg-gray-50 cursor-pointer text-gray-900 ${selectedSearchCategory === category.name ? "bg-purple-100" : ""}`}
                            onClick={() => handleSearchCategorySelect(category.name)}
                          >
                            <div className="flex items-center gap-2">
                              <span>{categoryIcons[normalizeCategoryName(category.name)] || "📁"}</span>
                              <div>
                                <h3 className="font-medium text-gray-900 text-xs truncate">
                                  {normalizeCategoryName(category.name)}
                                </h3>
                                <p className="text-[10px] text-gray-500">
                                  {category.subcategories?.length || 0} subcategories
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Search Input */}
                <div className="relative w-full">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchInputKeyDown}
                    placeholder="Search here"
                    className="w-full px-5 py-3 rounded-full bg-white text-gray-900 placeholder-gray-400 focus:outline-none"
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-purple-500 p-2 rounded-full hover:bg-purple-600 transition-colors"
                    onClick={() => handleSearch(searchQuery)}
                  >
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                      />
                    </svg>
                  </button>

                  {/* Search Results Dropdown */}
                  {showSearchResults && searchQuery && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-lg overflow-hidden max-h-[400px] overflow-y-auto z-50">
                      {searchQuery.length >= 2 && !searchLoading && !searchError && searchResults.length === 0 && (
                        <div className="p-4 text-center text-gray-400 border-b">Try searching for creators by name, username, or category.</div>
                      )}
                      {searchLoading ? (
                        <div className="p-4 text-center text-gray-500">Loading...</div>
                      ) : searchError ? (
                        <div className="p-4 text-center text-red-500">{searchError}</div>
                      ) : searchResults.length > 0 ? (
                        searchResults.map((creator) => (
                          <div
                            key={creator.username}
                            className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center gap-3 p-3"
                            onClick={() => router.push(`/creator/${creator.username.replace(/^@/, "")}`)}
                          >
                            <img
                              src={creator.avatar}
                              alt={creator.name}
                              className="w-12 h-12 rounded-full object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {creator.name}
                              </h3>
                              <p className="text-xs text-gray-500 truncate">
                                {creator.username}
                              </p>
                              <p className="text-[10px] text-gray-500 truncate flex items-center gap-1">
                                <span>{categoryIcons[normalizeCategoryName(creator.category)] || "📁"}</span>
                                <span>{normalizeCategoryName(creator.category)}</span>
                              </p>
                            </div>
                          </div>
                        ))
                      ) : (
                        searchQuery.length < 2 ? null : <div className="p-4 text-center text-gray-400">No results found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Top Creators Card */}
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Best Creators
                  </h2>
                  <button 
                    className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
                    onClick={fetchTopCreators}
                    title="Refresh creators list"
                    disabled={topCreatorsLoading}
                  >
                    {topCreatorsLoading ? (
                      <svg className="animate-spin h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    )}
                  </button>
                </div>
                <button 
                  className="text-purple-600 text-[10px] sm:text-xs font-medium"
                  onClick={() => router.push('/find-creators')}
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {topCreatorsLoading ? (
                  <div className="text-center text-gray-500">Loading top creators...</div>
                ) : topCreatorsError ? (
                  <div className="text-center text-red-500">{topCreatorsError}</div>
                ) : topCreatorsList.length === 0 ? (
                  <div className="text-center text-gray-400">No creators found</div>
                ) : (
                  topCreatorsList.map((creator, index) => (
                    <div
                      key={creator.username || index}
                      className="flex items-center justify-between py-2"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar || creator.personalInfo?.profileImage || "/avatars/placeholder-1.svg"}
                          alt={creator.name || creator.personalInfo?.username || "Creator"}
                          className="w-9 h-9 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 truncate max-w-[120px]">
                            {creator.name || creator.personalInfo?.username || "Creator"}
                          </h3>
                          <p className="text-xs text-gray-500 truncate max-w-[120px]">
                            @{creator.username || creator.personalInfo?.username || "username"}
                          </p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[120px] flex items-center gap-1">
                            {(() => {
                              const catRaw = Array.isArray(creator.professionalInfo?.categories) && creator.professionalInfo.categories.length > 0
                                ? creator.professionalInfo.categories[0]
                                : creator.professionalInfo?.category || creator.category || "Others";
                              const cat = normalizeCategoryName(catRaw);
                              return <>
                                <span>{categoryIcons[cat] || "📁"}</span>
                                <span>{cat}</span>
                              </>;
                            })()}
                          </p>
                        </div>
                      </div>
                      <button 
                        className="text-sm text-purple-600 font-medium hover:text-purple-700"
                        onClick={() => router.push(`/creator/${(creator.username || creator.personalInfo?.username || "").replace(/^@/, "").trim()}`)}
                      >
                        View
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Categories Section with Slider */}
          <div className="relative">
            {/* Header with Navigation */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm sm:text-xl font-semibold text-gray-900">Categories</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button className="category-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="category-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <button 
                  className="text-purple-600 text-[10px] sm:text-xs font-medium"
                  onClick={() => router.push('/categories')}
                >
                  View all
                </button>
              </div>
            </div>

            {/* Slider */}
            {categoriesLoading ? (
              <div className="p-4 text-center text-gray-500">Loading categories...</div>
            ) : categoriesError ? (
              <div className="p-4 text-center text-red-500">{categoriesError}</div>
            ) : categories.length === 0 ? (
              <div className="p-4 text-center text-gray-400">No categories found</div>
            ) : (
              <Swiper
                modules={[Navigation, Grid]}
                spaceBetween={16}
                slidesPerView={1}
                navigation={{
                  prevEl: ".category-prev",
                  nextEl: ".category-next",
                }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  768: { slidesPerView: 3 },
                  1024: { slidesPerView: 4 },
                }}
                className="categories-slider"
              >
                {categories.map((category) => (
                  <SwiperSlide key={category.name}>
                    <div
                      className="bg-white rounded-xl p-2 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center"
                      style={{ minWidth: '70px', minHeight: '40px' }}
                      onClick={() => router.push(`/categories/${encodeURIComponent(normalizeCategoryName(category.name))}`)}
                    >
                      <div className="flex flex-col items-center gap-1 w-full">
                        <span className="text-base mb-0.5">{categoryIcons[normalizeCategoryName(category.name)] || "📁"}</span>
                        <h3 className="font-medium text-gray-900 text-[10px] mb-0 text-center truncate w-full">
                          {normalizeCategoryName(category.name)}
                        </h3>
                        <p className="text-[8px] text-gray-500 text-center">
                          {category.subcategories?.length || 0} subcategories
                        </p>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>

          {/* What you might be looking for Section */}
          {isAuthenticated && user?.role === 'brand' && recommendations.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">What you might be looking for</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="recommendations-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="recommendations-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button className="text-purple-600 text-[10px] sm:text-xs font-medium">View all</button>
                </div>
              </div>
              <div className="relative">
                <Swiper
                  modules={[Navigation, Grid]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".recommendations-prev",
                    nextEl: ".recommendations-next",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                                          className="recommendations-slider"
                >
                  {recommendations.map((creator) => (
                    <SwiperSlide key={creator.id || creator._id}>
                      <CreatorCard
                        id={creator.id || creator._id}
                        username={creator.username || creator.personalInfo?.username || ''}
                        fullName={creator.name || creator.personalInfo?.username || ''}
                        avatar={creator.avatar || creator.personalInfo?.profileImage}
                        categories={Array.isArray(creator.professionalInfo?.categories) && creator.professionalInfo.categories.length > 0
                          ? creator.professionalInfo.categories
                          : (creator.category ? [creator.category] : (Array.isArray(creator.categories) ? creator.categories : []))}
                        // level={creator.level || creator.professionalInfo?.title || ''}
                        description={creator.description || creator.descriptionFaq?.briefDescription || creator.personalInfo?.bio || creator.bio || ''}
                        rating={computeRating(creator)}
                        reviewCount={computeReviewCount(creator)}
                        startingPrice={getStartingPrice(creator)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                         socialMedia={{
                           instagram: creator.socialMedia?.socialProfiles?.instagram?.url || creator.socialMedia?.socialProfiles?.instagram,
                           twitter: creator.socialMedia?.socialProfiles?.twitter?.url || creator.socialMedia?.socialProfiles?.twitter,
                           linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || creator.socialMedia?.socialProfiles?.linkedin,
                           youtube: creator.socialMedia?.socialProfiles?.youtube?.url || creator.socialMedia?.socialProfiles?.youtube,
                           facebook: creator.socialMedia?.socialProfiles?.facebook?.url || creator.socialMedia?.socialProfiles?.facebook,
                         }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                {recommendationsLoading && <div>Loading recommendations...</div>}
                {!recommendationsLoading && recommendations.length === 0 && <div>No recommendations found.</div>}
              </div>
            </section>
          )}

          {/* Best Creators For Brand Section */}
          {isAuthenticated && user?.role === 'brand' && bestCreators.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">Best creators for your brand</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="best-creators-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="best-creators-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button className="text-purple-600 text-[10px] sm:text-xs font-medium">View all</button>
                </div>
              </div>
              <div className="relative">
                <Swiper
                  modules={[Navigation, Grid]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".best-creators-prev",
                    nextEl: ".best-creators-next",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                                          className="best-creators-slider"
                >
                  {bestCreators.map((creator) => (
                    <SwiperSlide key={creator.id || creator._id}>
                      <CreatorCard
                        id={creator.id || creator._id}
                        username={creator.username || creator.personalInfo?.username || ''}
                        fullName={creator.name || creator.personalInfo?.username || ''}
                        avatar={creator.avatar || creator.personalInfo?.profileImage}
                        categories={Array.isArray(creator.professionalInfo?.categories) && creator.professionalInfo.categories.length > 0
                          ? creator.professionalInfo.categories
                          : (creator.category ? [creator.category] : (Array.isArray(creator.categories) ? creator.categories : []))}
                        // level={creator.level || creator.professionalInfo?.title || ''}
                        description={creator.description || creator.descriptionFaq?.briefDescription || creator.personalInfo?.bio || creator.bio || ''}
                        rating={computeRating(creator)}
                        reviewCount={computeReviewCount(creator)}
                        startingPrice={getStartingPrice(creator)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url || creator.socialMedia?.socialProfiles?.instagram,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url   || creator.socialMedia?.socialProfiles?.twitter,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || creator.socialMedia?.socialProfiles?.linkedin,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url || creator.socialMedia?.socialProfiles?.youtube,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url || creator.socialMedia?.socialProfiles?.facebook,
                          // tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url || creator.socialMedia?.socialProfiles?.tiktok,
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
                {bestCreatorsLoading && <div>Loading best creators...</div>}
                {!bestCreatorsLoading && bestCreators.length === 0 && <div>No best creators found.</div>}
              </div>
            </section>
          )}

          {/* Tag-Based Recommendations Section */}
          {isAuthenticated && user?.role === 'brand' && tagBasedRecommendations.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">
                  Trending in {availableTags.slice(0, 3).map(t => t.tag).join(', ')}
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="tag-recommendations-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="tag-recommendations-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <Link href="/find-creators" className="text-purple-600 text-[10px] sm:text-xs font-medium">View all</Link>
                </div>
              </div>
              <div className="relative">
                <Swiper
                  modules={[Navigation, Grid]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".tag-recommendations-prev",
                    nextEl: ".tag-recommendations-next",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                                          className="tag-recommendations-slider"
                >
                  {tagBasedRecommendations.map((creator) => (
                    <SwiperSlide key={creator.id || creator._id}>
                      <CreatorCard
                        id={creator.id || creator._id}
                        username={creator.username || creator.personalInfo?.username || ''}
                        fullName={creator.name || creator.personalInfo?.username || ''}
                        avatar={creator.avatar || creator.personalInfo?.profileImage}
                        categories={Array.isArray(creator.professionalInfo?.categories) && creator.professionalInfo.categories.length > 0
                          ? creator.professionalInfo.categories
                          : (creator.category ? [creator.category] : (Array.isArray(creator.categories) ? creator.categories : []))}
                        description={creator.description || creator.descriptionFaq?.briefDescription || creator.personalInfo?.bio || creator.bio || ''}
                        rating={computeRating(creator)}
                        reviewCount={computeReviewCount(creator)}
                        startingPrice={getStartingPrice(creator)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url || creator.socialMedia?.socialProfiles?.instagram,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url   || creator.socialMedia?.socialProfiles?.twitter,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || creator.socialMedia?.socialProfiles?.linkedin,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url || creator.socialMedia?.socialProfiles?.youtube,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url || creator.socialMedia?.socialProfiles?.facebook,
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </section>
          )}

          {/* Content Type-Based Recommendations Section */}
          {isAuthenticated && user?.role === 'brand' && contentTypeBasedRecommendations.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">
                  Popular {availableContentTypes.slice(0, 3).map(ct => ct.contentType).join(', ')} Creators
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="content-type-recommendations-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="content-type-recommendations-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <Link href="/find-creators" className="text-purple-600 text-[10px] sm:text-xs font-medium">View all</Link>
                </div>
              </div>
              <div className="relative">
                <Swiper
                  modules={[Navigation, Grid]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".content-type-recommendations-prev",
                    nextEl: ".content-type-recommendations-next",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                                          className="content-type-recommendations-slider"
                >
                  {contentTypeBasedRecommendations.map((creator) => (
                    <SwiperSlide key={creator.id || creator._id}>
                      <CreatorCard
                        id={creator.id || creator._id}
                        username={creator.username || creator.personalInfo?.username || ''}
                        fullName={creator.name || creator.personalInfo?.username || ''}
                        avatar={creator.avatar || creator.personalInfo?.profileImage}
                        categories={Array.isArray(creator.professionalInfo?.categories) && creator.professionalInfo.categories.length > 0
                          ? creator.professionalInfo.categories
                          : (creator.category ? [creator.category] : (Array.isArray(creator.categories) ? creator.categories : []))}
                        description={creator.description || creator.descriptionFaq?.briefDescription || creator.personalInfo?.bio || creator.bio || ''}
                        rating={computeRating(creator)}
                        reviewCount={computeReviewCount(creator)}
                        startingPrice={getStartingPrice(creator)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url || creator.socialMedia?.socialProfiles?.instagram,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url   || creator.socialMedia?.socialProfiles?.twitter,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || creator.socialMedia?.socialProfiles?.linkedin,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url || creator.socialMedia?.socialProfiles?.youtube,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url || creator.socialMedia?.socialProfiles?.facebook,
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </section>
          )}

          {/* Search-Based Recommendations Section */}
          {isAuthenticated && user?.role === 'brand' && searchBasedRecommendations.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">
                  Similar to "{searchHistory[0] || 'your search'}"
                </h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="search-recommendations-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="search-recommendations-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <Link href="/find-creators" className="text-purple-600 text-[10px] sm:text-xs font-medium">View all</Link>
                </div>
              </div>
              <div className="relative">
                <Swiper
                  modules={[Navigation, Grid]}
                  spaceBetween={16}
                  slidesPerView={1}
                  navigation={{
                    prevEl: ".search-recommendations-prev",
                    nextEl: ".search-recommendations-next",
                  }}
                  breakpoints={{
                    640: { slidesPerView: 2 },
                    1024: { slidesPerView: 3 },
                  }}
                                          className="search-recommendations-slider"
                >
                  {searchBasedRecommendations.map((creator) => (
                    <SwiperSlide key={creator.id || creator._id}>
                      <CreatorCard
                        id={creator.id || creator._id}
                        username={creator.username || creator.personalInfo?.username || ''}
                        fullName={creator.name || creator.personalInfo?.username || ''}
                        avatar={creator.avatar || creator.personalInfo?.profileImage}
                        categories={creator.professionalInfo?.categories || []}
                        description={creator.description || creator.descriptionFaq?.briefDescription || creator.personalInfo?.bio || creator.bio || ''}
                        rating={(creator.metrics?.ratings?.average ?? creator.rating ?? 0)}
                        reviewCount={(Array.isArray(creator.reviews) ? creator.reviews.length : (typeof creator.metrics?.ratings?.count === 'number' ? creator.metrics.ratings.count : (typeof creator.reviewCount === 'number' ? creator.reviewCount : 0)))}
                        startingPrice={getStartingPrice(creator)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url || creator.socialMedia?.socialProfiles?.instagram,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url   || creator.socialMedia?.socialProfiles?.twitter,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || creator.socialMedia?.socialProfiles?.linkedin,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url || creator.socialMedia?.socialProfiles?.youtube,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url || creator.socialMedia?.socialProfiles?.facebook,
                        }}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </section>
          )}

          {/* Recent Searches Section */}
          {isAuthenticated && user?.role === 'brand' && recentSearches.length > 0 && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">Recent Searches</h2>
                <button 
                  onClick={async () => {
                    try {
                      await clearSearchHistory();
                      setRecentSearches([]);
                      setSearchHistory([]);
                      localStorage.removeItem('recentSearches');
                      localStorage.removeItem('searchHistory');
                    } catch (error) {
                      console.error('Error clearing search history:', error);
                      // Fallback to local clearing
                      setRecentSearches([]);
                      setSearchHistory([]);
                      localStorage.removeItem('recentSearches');
                      localStorage.removeItem('searchHistory');
                    }
                  }}
                  className="text-purple-600 text-sm font-medium hover:text-purple-700"
                >
                  Clear history
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.slice(0, 8).map((search, index) => (
                  <button
                    key={index}
                    onClick={() => handleSearch(search.query)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full text-sm font-medium transition-colors"
                  >
                    {search.query}
                  </button>
                ))}
              </div>
            </section>
          )}

          {/* Best Match For You Section */}
          {isAuthenticated && user?.role === 'brand' && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm sm:text-xl font-semibold text-gray-900">Best Match For You</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="best-matches-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="best-matches-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button className="text-purple-600 text-[10px] sm:text-xs font-medium">View all</button>
                </div>
              </div>
              <div className="relative">
                {matchesLoading && <div>Loading matches...</div>}
                {matchesError && <div className="text-red-500">{matchesError}</div>}
                {!matchesLoading && shuffledMatches.length === 0 && <div>No matches found.</div>}
                {!matchesLoading && shuffledMatches.length > 0 && (
                  <Swiper
                    modules={[Navigation, Grid]}
                    spaceBetween={8}
                    slidesPerView={1}
                    grid={{
                      rows: 2,
                      fill: 'row'
                    }}
                    navigation={{
                      prevEl: ".best-matches-prev",
                      nextEl: ".best-matches-next",
                    }}
                    breakpoints={{
                      640: { 
                        slidesPerView: 2,
                        grid: {
                          rows: 2,
                          fill: 'row'
                        }
                      },
                      1024: { 
                        slidesPerView: 3,
                        grid: {
                          rows: 2,
                          fill: 'row'
                        }
                      },
                    }}
                    className="best-matches-slider"
                  >
                    {shuffledMatches.map((match) => {
                      const profile = match.profile;
                      const creatorCardProps = {
                        id: match.creatorId,
                        username: profile.personalInfo?.username || '',
                        fullName: `${profile.personalInfo?.firstName || ''} ${profile.personalInfo?.lastName || ''}`.trim(),
                        avatar: profile.personalInfo?.profileImage,
                        category: profile.professionalInfo?.categories?.join(', ') || '',
                        // level: profile.professionalInfo?.title || '',
                        description: profile.descriptionFaq?.briefDescription || '',
                        rating: profile.metrics?.ratings?.average || 0,
                        reviewCount: profile.metrics?.ratings?.count || 0,
                        startingPrice: getStartingPrice(profile),
                        isLiked: false,
                        title: profile.professionalInfo?.title || '',
                        completedProjects: match.metrics?.profileMetrics?.projectsCompleted || match.metrics?.completedProjects || 0,
                        socialMedia: {
                           instagram: profile.socialMedia?.socialProfiles?.instagram?.url || profile.socialMedia?.socialProfiles?.instagram,
                          twitter: profile.socialMedia?.socialProfiles?.twitter?.url   || profile.socialMedia?.socialProfiles?.twitter,
                          linkedin: profile.socialMedia?.socialProfiles?.linkedin?.url || profile.socialMedia?.socialProfiles?.linkedin,
                          youtube: profile.socialMedia?.socialProfiles?.youtube?.url || profile.socialMedia?.socialProfiles?.youtube,
                          facebook: profile.socialMedia?.socialProfiles?.facebook?.url || profile.socialMedia?.socialProfiles?.facebook,
                          // tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url || creator.socialMedia?.socialProfiles?.tiktok,
                        },
                      };
                      return (
                        <SwiperSlide key={match.creatorId}>
                          <div className="min-w-[280px] max-w-[320px]">
                            <CreatorCard {...creatorCardProps} />
                          </div>
                        </SwiperSlide>
                      );
                    })}
                  </Swiper>
                )}
              </div>
            </section>
          )}

          {/* Creators Under Top Categories Section */}
          {false && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold mb-4">Creators Under Top Categories</h2>
            {categories.slice(0, 4).map((category) => (
              <div key={category.name} className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{category.name}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {topCreatorsList
                    .filter((creator) =>
                      creator.category === category.name ||
                      (creator.professionalInfo?.categories && creator.professionalInfo.categories.includes(category.name))
                    )
                    .slice(0, 4)
                    .map((creator) => (
                      <CreatorCard
                        key={creator.id || creator._id}
                        id={creator.id || creator._id}
                        username={creator.username || creator.personalInfo?.username || ''}
                        fullName={creator.name || creator.personalInfo?.username || ''}
                        avatar={creator.avatar || creator.personalInfo?.profileImage}
                        categories={creator.professionalInfo?.categories || []}
                        level={creator.level || creator.professionalInfo?.title || ''}
                        description={creator.description || creator.descriptionFaq?.briefDescription || ''}
                        rating={(creator.metrics?.ratings?.average ?? creator.rating ?? 0)}
                        reviewCount={(Array.isArray(creator.reviews) ? creator.reviews.length : (typeof creator.metrics?.ratings?.count === 'number' ? creator.metrics.ratings.count : (typeof creator.reviewCount === 'number' ? creator.reviewCount : 0)))}
                        startingPrice={getStartingPrice(creator)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url || creator.socialMedia?.socialProfiles?.instagram,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url || creator.socialMedia?.socialProfiles?.twitter,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url || creator.socialMedia?.socialProfiles?.linkedin,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url || creator.socialMedia?.socialProfiles?.youtube,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url || creator.socialMedia?.socialProfiles?.facebook,
                          // tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url || creator.socialMedia?.socialProfiles?.tiktok,
                        }}
                      />
                    ))}
                </div>
              </div>
            ))}
          </section>
          )}

          {/* Top Creators Section */}
          <div>
            <PublishedCreators title="Top Creators" limit={9} />
          </div>
        </main>
      </DashboardLayout>
    </>
  );
}
