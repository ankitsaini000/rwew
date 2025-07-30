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
import { useCreatorStore } from "@/store/creatorStore";
import PublishedCreators from '../creator/PublishedCreators';
import { getCategories, getPublishedCreators, getFilteredCreators } from "@/services/api";
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

  // Profiles You May Like State
  const [profilesYouMayLike, setProfilesYouMayLike] = useState<any[]>([]);
  const [profilesYouMayLikeLoading, setProfilesYouMayLikeLoading] = useState(false);

  // Best Creators State
  const [bestCreators, setBestCreators] = useState<any[]>([]);
  const [bestCreatorsLoading, setBestCreatorsLoading] = useState(false);

  useEffect(() => {
    document.title = "Home | Creator Platform";
    // Fetch categories from backend
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
    fetchCategories();
    // Fetch top creators from backend
    const fetchTopCreators = async () => {
      setTopCreatorsLoading(true);
      setTopCreatorsError(null);
      try {
        const creators = await getPublishedCreators();
        console.log('🎯 Dashboard Debug - Received creators from getPublishedCreators:', creators);
        creators.forEach((creator: any, index: number) => {
          console.log(`🎯 Dashboard Debug - Creator ${index + 1}:`, {
            name: creator.userId?.fullName || creator.personalInfo?.username,
            categories: creator.professionalInfo?.categories,
            category: creator.professionalInfo?.category
          });
        });
        setTopCreatorsList(creators.slice(0, 3));
      } catch (err) {
        setTopCreatorsError("Failed to load top creators");
      } finally {
        setTopCreatorsLoading(false);
      }
    };
    fetchTopCreators();
    // Fetch matches for brand user
    if (isAuthenticated && user?.role === 'brand' && user?._id) {
      setMatchesLoading(true);
      fetchBrandMatches(user._id)
        .then(setMatches)
        .catch((err) => setMatchesError(err.message || 'Error fetching matches'))
        .finally(() => setMatchesLoading(false));
    }
  }, [isAuthenticated, user]);

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
      getDashboardRecommendations(recent)
        .then(setRecommendations)
        .catch(() => setRecommendations([]))
        .finally(() => setRecommendationsLoading(false));
      setProfilesYouMayLikeLoading(true);
      getProfilesYouMayLike()
        .then(setProfilesYouMayLike)
        .catch(() => setProfilesYouMayLike([]))
        .finally(() => setProfilesYouMayLikeLoading(false));
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (isAuthenticated && user?.role === 'brand') {
      setBestCreatorsLoading(true);
      getBestCreatorsForBrand()
        .then(setBestCreators)
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
    window.location.reload();
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

  const handleSearchCategorySelect = (category: string) => {
    setSelectedSearchCategory(category);
    setIsCategoryDropdownOpen(false);
    localStorage.setItem("selectedSearchCategory", category);
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
                <h2 className="text-lg font-semibold text-gray-900">
                  Best Creators
                </h2>
                <button className="text-purple-600 text-sm font-medium">
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
                      <button className="text-sm text-purple-600 font-medium hover:text-purple-700">
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
              <h2 className="text-xl font-semibold text-gray-900">Categories</h2>
              <div className="flex items-center gap-4">
                <div className="flex gap-2">
                  <button className="category-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronLeft className="w-4 h-4 text-gray-600" />
                  </button>
                  <button className="category-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                    <ChevronRight className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
                <button className="text-purple-600 text-sm font-medium">
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
                <h2 className="text-xl font-semibold text-gray-900">What you might be looking for</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="recommendations-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="recommendations-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button className="text-purple-600 text-sm font-medium">View all</button>
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
                        categories={creator.professionalInfo?.categories || []}
                        level={creator.level || creator.professionalInfo?.title || ''}
                        description={creator.description || creator.descriptionFaq?.briefDescription || ''}
                        rating={creator.rating || creator.metrics?.ratings?.average || 0}
                        reviewCount={Array.isArray(creator.reviews) ? creator.reviews.length : (creator.reviews || creator.metrics?.ratings?.count || 0)}
                        startingPrice={creator.startingPrice || (creator.pricing?.basic?.price ? `₹${creator.pricing.basic.price}` : undefined)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url,
                          tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url,
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
                <h2 className="text-xl font-semibold text-gray-900">Best creators for your brand</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="best-creators-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="best-creators-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button className="text-purple-600 text-sm font-medium">View all</button>
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
                        categories={creator.professionalInfo?.categories || []}
                        level={creator.level || creator.professionalInfo?.title || ''}
                        description={creator.description || creator.descriptionFaq?.briefDescription || ''}
                        rating={creator.rating || creator.metrics?.ratings?.average || 0}
                        reviewCount={Array.isArray(creator.reviews) ? creator.reviews.length : (creator.reviews || creator.metrics?.ratings?.count || 0)}
                        startingPrice={creator.startingPrice || (creator.pricing?.basic?.price ? `₹${creator.pricing.basic.price}` : undefined)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url,
                          tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url,
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

          {/* Best Match For You Section */}
          {isAuthenticated && user?.role === 'brand' && (
            <section className="mb-10">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Best Match For You</h2>
                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    <button className="best-matches-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft className="w-4 h-4 text-gray-600" />
                    </button>
                    <button className="best-matches-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                  <button className="text-purple-600 text-sm font-medium">View all</button>
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
                        level: profile.professionalInfo?.title || '',
                        description: profile.descriptionFaq?.briefDescription || '',
                        rating: profile.metrics?.ratings?.average || 0,
                        reviewCount: profile.metrics?.ratings?.count || 0,
                        startingPrice: profile.pricing?.basic?.price ? `₹${profile.pricing.basic.price}` : undefined,
                        isLiked: false,
                        title: profile.professionalInfo?.title || '',
                        completedProjects: match.metrics?.profileMetrics?.projectsCompleted || match.metrics?.completedProjects || 0,
                        socialMedia: {
                          instagram: profile.socialMedia?.socialProfiles?.instagram?.url,
                          twitter: profile.socialMedia?.socialProfiles?.twitter?.url,
                          linkedin: profile.socialMedia?.socialProfiles?.linkedin?.url,
                          youtube: profile.socialMedia?.socialProfiles?.youtube?.url,
                          facebook: profile.socialMedia?.socialProfiles?.facebook?.url,
                          tiktok: profile.socialMedia?.socialProfiles?.tiktok?.url,
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
                        rating={creator.rating || creator.metrics?.ratings?.average || 0}
                        reviewCount={creator.reviews || creator.metrics?.ratings?.count || 0}
                        startingPrice={creator.startingPrice || (creator.pricing?.basic?.price ? `₹${creator.pricing.basic.price}` : undefined)}
                        isLiked={false}
                        title={creator.title || creator.professionalInfo?.title || ''}
                        completedProjects={creator.metrics?.profileMetrics?.projectsCompleted || creator.metrics?.completedProjects || 0}
                        socialMedia={{
                          instagram: creator.socialMedia?.socialProfiles?.instagram?.url,
                          twitter: creator.socialMedia?.socialProfiles?.twitter?.url,
                          linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url,
                          youtube: creator.socialMedia?.socialProfiles?.youtube?.url,
                          facebook: creator.socialMedia?.socialProfiles?.facebook?.url,
                          tiktok: creator.socialMedia?.socialProfiles?.tiktok?.url,
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
            <PublishedCreators title="Top Creators" />
          </div>
        </main>
      </DashboardLayout>
    </>
  );
}
