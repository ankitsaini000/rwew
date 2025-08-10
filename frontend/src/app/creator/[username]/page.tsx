"use client";

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useParams, notFound } from 'next/navigation';
import { getCreatorByUsername } from '@/services/creatorApi';
import { getCategories } from '@/services/api';
import { 
  Star, 
  Heart, 
  Share2, 
  MessageSquare,
  Instagram,
  Facebook,
  Twitter,
  Youtube,
  Linkedin,
  Link as LinkIcon,
  ChevronLeft, 
  ChevronRight,
  CheckCircle,
  Clock,
  Users,
  Calendar,
  Image as ImageIcon,
  X,
  Globe,
  MapPin,
  Check,
  Mail,
  Plane,
  ArrowRight,
  Package,
  PlusCircle,
  MinusCircle,
  ThumbsUp,
  ThumbsDown,
  Search,
  ChevronDown,
  MapPin as MapPinIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../../components/ui/tabs";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../../components/ui/avatar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../../../components/ui/card";
import { Input } from "../../../components/ui/input";
import { Label } from "../../../components/ui/label";
import toast from "react-hot-toast";
import { Loading } from '../../../components/ui/loading';
import { ErrorMessage } from '../../../components/ui/error-message';
import { PortfolioItemModal } from '../../../components/modals/PortfolioItemModal';
import { ShareModal } from '../../../components/modals/ShareModal';
import { MessageModal } from '../../../components/modals/MessageModal';
import { sendMessageToCreator } from '@/services/api';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import RequestCustomQuoteModal from '@/components/modals/RequestCustomQuoteModal';
import { getUserById } from '@/services/api';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import CreatorCard from '@/components/creator/CreatorCard';
import { getPublishedCreators } from '@/services/api';
import { getFilteredCreators } from '@/services/api';
import Link from 'next/link';


// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';

export default function CreatorProfilePage({ params }: { params: { username: string } }) {
  const { username } = params;
  const { isAuthenticated, user } = useAuth(); // Destructure user from useAuth
  const router = useRouter();
  
  const [creator, setCreator] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [currentSocialSlide, setCurrentSocialSlide] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [priceExpanded, setPriceExpanded] = useState<string | null>('basic');
  const [portfolioFilter, setPortfolioFilter] = useState('all');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
  const [messageSubject, setMessageSubject] = useState('');
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedMessageType, setSelectedMessageType] = useState<'contact' | 'custom'>('contact');
  const [portfolioModalOpen, setPortfolioModalOpen] = useState(false);
  const [selectedPortfolioItem, setSelectedPortfolioItem] = useState<any>(null);
  const [portfolioItems, setPortfolioItems] = useState<any[]>([]);
  const [galleryImages, setGalleryImages] = useState<string[]>([]);
  const [socialLinks, setSocialLinks] = useState<any>({});
  const [bio, setBio] = useState('');
  const [description, setDescription] = useState('');
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);
  const [attemptedEndpoints, setAttemptedEndpoints] = useState<string[]>([]);
  const [dataSource, setDataSource] = useState<'api' | 'localStorage' | 'fallback'>('api');
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [selectedPricingTab, setSelectedPricingTab] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [showComparison, setShowComparison] = useState(false);
  const [isCustomQuoteModalOpen, setIsCustomQuoteModalOpen] = useState(false); // New state for custom quote modal
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewerInfoMap, setReviewerInfoMap] = useState<Record<string, { name: string; avatar: string }>>({});
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const [relatedCreators, setRelatedCreators] = useState<any[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [tagRelatedCreators, setTagRelatedCreators] = useState<any[]>([]);
  const [tagRelatedLoading, setTagRelatedLoading] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // Calculate the average rating
  const calculateAverageRating = () => {
    if (!reviews || reviews.length === 0) return '0';
    const total = reviews.reduce((sum, review) => sum + review.rating, 0);
    return (total / reviews.length).toFixed(1);
  };

  // Count ratings by star value
  const getRatingCounts = () => {
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      counts[review.rating as keyof typeof counts]++;
    });
    return counts;
  };

  // Render reviews section (now with expandable view)
  const renderReviewsSection = () => {
    const averageRating = calculateAverageRating();
    const ratingCounts = getRatingCounts();
    const reviewsToShow = showAllReviews ? reviews : reviews.slice(0, 1);
    return (
      <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Reviews</h2>
        </div>
        <div className="p-6">
          <div className="mb-8">
            <div className="flex items-center mb-4">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${parseFloat(averageRating) >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="ml-2 text-xl font-bold">{averageRating}</span>
              <span className="ml-2 text-gray-600">({reviews.length} reviews)</span>
            </div>
            <div className="space-y-2 mb-6">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="flex items-center">
                  <div className="w-20 text-sm font-medium text-gray-800">{rating} Stars</div>
                  <div className="flex-1 h-4 mx-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400"
                      style={{ width: `${(ratingCounts[rating as keyof typeof ratingCounts] / reviews.length) * 100}%` }}
                    ></div>
                  </div>
                  <div className="w-10 text-sm text-gray-600">({ratingCounts[rating as keyof typeof ratingCounts]})</div>
                </div>
              ))}
            </div>
            {/* Show all reviews if expanded, otherwise just the first */}
            {reviewsToShow.length > 0 ? (
              reviewsToShow.map((review, idx) => (
                <div key={idx} className="border rounded-lg p-4 mb-4">
                  <div className="flex items-center mb-2">
                    <img
                      src={reviewerInfoMap[review.brandId?._id || review.brandId]?.avatar || 'https://placehold.co/40x40?text=U'}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <h4 className="font-medium text-sm">{reviewerInfoMap[review.brandId?._id || review.brandId]?.name || 'User'}</h4>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500">{review.createdAt ? new Date(review.createdAt).toLocaleDateString() : (review.date || '')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center mb-2">
                    <div className="flex mr-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${review.rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm line-clamp-3 mb-2">{review.comment || review.content}</p>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-4">No more reviews.</div>
            )}
            {/* View All Reviews button */}
            {reviews.length > 1 && !showAllReviews && (
              <Button
                onClick={() => setShowAllReviews(true)}
                variant="outline"
                size="sm"
                className="w-full mt-2 text-xs"
              >
                View All Reviews
              </Button>
            )}
          </div>
        </div>
      </section>
    );
  };

  // Helper to check if a URL is an external URL or a local reference
  const isExternalUrl = (url: string): boolean => {
    if (!url) return false;
    return url.startsWith('http://') || url.startsWith('https://');
  };

  // Process image URLs to ensure they're correctly formatted
  const processImageUrl = (url: string): string => {
    if (!url) return '';
    
    console.log('Processing image URL:', url);
    
    // If it's already a full URL, return it as is
    if (isExternalUrl(url)) {
      console.log('Using external URL:', url);
      return url;
    }
    
    // For local references, prepend the API base URL
    const fullUrl = `${API_BASE_URL}/${url.startsWith('/') ? url.slice(1) : url}`;
    console.log('Converted to full URL:', fullUrl);
    return fullUrl;
  };

  useEffect(() => {
    const fetchCreator = async () => {
      try {
      setLoading(true);
        setError('');

        console.log(`Fetching creator profile for username: ${username}`);
        
        // Use creatorApi to get creator data - the most reliable method
      try {
          console.log(`Getting creator with username: ${username} using creatorApi`);
          const response = await getCreatorByUsername(username as string);
          
        if (response && response.data) {
            console.log('✅ SUCCESS! Creator profile loaded from API');
            console.log('Full creator data received:', response.data);
            
            // Set creator data directly to state
          setCreator(response.data);
            
            // Extract all relevant data for display
            extractAndDisplayCreatorData(response.data);
            
            setLoading(false);
            return;
        } else {
            console.log(`Failed to load creator data: ${response?.error || 'Unknown error'}`);
          }
        } catch (apiError) {
          console.error('Error using creatorApi:', apiError);
        }
        
        // Fallback to direct API call if creatorApi fails
        try {
          // Try with the specific creators endpoint 
          console.log(`Trying direct API endpoint: ${API_BASE_URL}/creators/creators/${username}`);
          const directResponse = await fetch(`${API_BASE_URL}/creators/creators/${username}`);
          
          if (directResponse.ok) {
            const directData = await directResponse.json();
            console.log('✅ SUCCESS! Found creator profile with direct API endpoint');
            console.log('Creator data loaded:', directData);
            
            // Set creator data directly to state
            setCreator(directData.data || directData);
            
            // Extract all relevant data for display
            extractAndDisplayCreatorData(directData);
            
            setLoading(false);
            return;
          } else {
            console.log(`Direct API endpoint failed with status ${directResponse.status}`);
          }
        } catch (directError) {
          console.error('Error with direct API endpoint:', directError);
        }
        
        // Try one more alternative endpoint format
        try {
          console.log(`Trying alternative API endpoint: ${API_BASE_URL}/creators/${username}`);
          const altResponse = await fetch(`${API_BASE_URL}/creators/${username}`);
          
          if (altResponse.ok) {
            const altData = await altResponse.json();
            console.log('✅ SUCCESS! Found creator profile with alternative API endpoint');
            console.log('Creator data loaded:', altData);
            
            // Set creator data directly to state
            setCreator(altData.data || altData);
            
            // Extract all relevant data for display
            extractAndDisplayCreatorData(altData);
            
            setLoading(false);
            return;
          } else {
            console.log(`Alternative API endpoint failed with status ${altResponse.status}`);
          }
        } catch (altError) {
          console.error('Error with alternative API endpoint:', altError);
        }
        
        // If we reach here, all API calls failed
        setError('Could not load creator profile. Please try again later.');
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchCreator:', err);
        setError('Failed to fetch creator profile. Please try again later.');
        setLoading(false);
      }
    };

    if (username) {
      fetchCreator();
    }
    
    // Cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [username]);

  // Fetch categories from backend
  useEffect(() => {
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData);
        console.log('Categories loaded:', categoriesData);
      } catch (error) {
        console.error('Error fetching categories:', error);
        setCategories([]);
      } finally {
        setCategoriesLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // Helper function to extract and display all creator data
  const extractAndDisplayCreatorData = (data: any) => {
    console.log('Extracting data for display from:', data);
    
    // Handle different data sources format
    if (data.data) {
      // Data might be wrapped in a data property
      data = data.data;
      console.log('Unwrapped data from data property:', data);
    }
    
    // Set data source for tracking
    const source = data.dataSource || 'api';
    setDataSource(source as 'api' | 'localStorage' | 'fallback');
    
    // Log the complete data structure for debugging
    console.log('Full data structure being processed:', JSON.stringify(data, null, 2));
    
    // Extract personal info with detailed logging
    const personalInfo = data.personalInfo || {};
    console.log('Personal info found:', personalInfo);
    
    // Extract profile and cover images with detailed logging
    const profileImage = personalInfo.profileImage || data.profileImage || '';
    const coverImage = personalInfo.coverImage || data.coverImage || '';
    
    console.log('Extracted images:', { profileImage, coverImage });
    
    // Set portfolio items with careful extraction
    if (data.portfolio && Array.isArray(data.portfolio)) {
      console.log('Processing portfolio items:', data.portfolio);
      const portfolioItems = data.portfolio.map((item: any) => {
        console.log('Processing portfolio item:', item);
        const processedItem = {
          ...item,
          image: item.image || item.imageUrl || item.url || '',
          category: item.category || 'general',
          title: item.title || 'Portfolio Item',
          description: item.description || ''
        };
        return processedItem;
      });
      setPortfolioItems(portfolioItems);
      console.log('Portfolio items processed:', portfolioItems);
    } else if (data.galleryPortfolio && Array.isArray(data.galleryPortfolio.featured)) {
      // Fallback to featured items if portfolio is not available
      console.log('Processing featured items as portfolio:', data.galleryPortfolio.featured);
      const featuredItems = data.galleryPortfolio.featured.map((item: any, index: number) => {
        const processedItem = {
          id: item.id || `featured-${index}`,
          title: item.title || 'Featured Work',
          image: item.url || '',
          category: 'featured',
          description: item.description || ''
        };
        return processedItem;
      });
      setPortfolioItems(featuredItems);
      console.log('Featured items processed as portfolio:', featuredItems);
    }

    // Set gallery images from galleryPortfolio.images or gallery.images
    let galleryImages: string[] = [];
    
    if (data.galleryPortfolio && Array.isArray(data.galleryPortfolio.images)) {
      console.log('Processing gallery images from galleryPortfolio:', data.galleryPortfolio.images);
      galleryImages = data.galleryPortfolio.images.map((img: any) => {
        const imageUrl = typeof img === 'string' ? img : (img.url || '');
        return imageUrl;
      });
      console.log('Gallery images extracted from galleryPortfolio:', galleryImages);
    } else if (data.gallery && Array.isArray(data.gallery.images)) {
      console.log('Processing gallery images from gallery:', data.gallery.images);
      galleryImages = data.gallery.images.map((img: any) => {
        const imageUrl = typeof img === 'string' ? img : (img.url || '');
        return imageUrl;
      });
      console.log('Gallery images extracted from gallery:', galleryImages);
    }
    
    // Filter out any empty strings
    const filteredImages = galleryImages.filter(img => img);
    console.log('Filtered gallery images:', filteredImages);
    setGalleryImages(filteredImages);
    
    // Set social media links with careful extraction
    const socialLinks = {
      instagram: '',
      twitter: '',
      facebook: '',
      linkedin: '',
      youtube: '',
      tiktok: '',
      website: ''
    };
    
    // Get social media links from data
    if (data.socialMedia) {
      console.log('Processing social media links:', data.socialMedia);
      if (data.socialMedia.socialProfiles) {
        // Handle new format with socialProfiles object
        Object.entries(data.socialMedia.socialProfiles).forEach(([key, value]: [string, any]) => {
          if (value && value.url) {
            socialLinks[key as keyof typeof socialLinks] = value.url;
          }
        });
      } else {
        // Handle flat format
        Object.entries(data.socialMedia).forEach(([key, value]: [string, any]) => {
          if (typeof value === 'string') {
            socialLinks[key as keyof typeof socialLinks] = value;
          } else if (value && typeof value === 'object' && 'url' in value) {
            socialLinks[key as keyof typeof socialLinks] = value.url;
          }
        });
      }
    } else if (data.socialInfo) {
      console.log('Processing social info links:', data.socialInfo);
      Object.entries(data.socialInfo).forEach(([key, value]: [string, any]) => {
        if (typeof value === 'string') {
          socialLinks[key as keyof typeof socialLinks] = value;
        } else if (value && typeof value === 'object' && 'url' in value) {
          socialLinks[key as keyof typeof socialLinks] = value.url;
        }
      });
    }
    
    console.log('Processed social links:', socialLinks);
    setSocialLinks(socialLinks);
    
    // Set creator description with careful extraction
    let shortBio = '';
    let detailedDescription = '';
    
    if (data.description) {
      console.log('Processing description:', data.description);
      shortBio = data.description.short || data.description.brief || '';
      detailedDescription = data.description.detailed || data.description.long || '';
    } else if (data.descriptionFaq) {
      console.log('Processing descriptionFaq:', data.descriptionFaq);
      shortBio = data.descriptionFaq.briefDescription || data.descriptionFaq.brief || '';
      detailedDescription = data.descriptionFaq.longDescription || data.descriptionFaq.detailed || '';
    } else if (personalInfo.bio) {
      console.log('Using personalInfo.bio as short bio:', personalInfo.bio);
      shortBio = personalInfo.bio;
    }
    
    console.log('Processed bio:', { shortBio, detailedDescription });
    setBio(shortBio);
    setDescription(detailedDescription);
    
    // Show toast based on data source
    if (source === 'localStorage') {
      toast("Profile loaded from local cache. Data may not be up to date.", {
        icon: '⚠️',
        duration: 4000
      });
    } else if (source === 'api') {
      toast.success('Profile loaded successfully from server!');
    }
    
    // Set reviews from creator profile if available
    if (Array.isArray(data.reviews)) {
      setReviews(data.reviews);
    }
  };

  const refreshProfileData = async () => {
    try {
      setLoading(true);
      // Clear localStorage cache
      localStorage.removeItem(`creator_${username}`);
      console.log(`Forced refresh for creator: ${username}`);
      
      // Fetch fresh data using the updated API function
      const result = await getCreatorByUsername(username as string);
      
      // Check if we have an error
      if (result?.error) {
        console.error('Error refreshing creator data:', result.error);
        setError(result.error);
        setLoading(false);
        return;
      }
      
      // Check if we have data
      if (!result?.data) {
        setError(`Creator "${username}" not found`);
        setLoading(false);
        return;
      }
      
      console.log('Fresh data loaded:', result.data);
      
      // Determine if we're using mock data
      const usingMockData = 'isMockData' in result && result.isMockData === true;
      
      if (usingMockData) {
        console.log('Using mock data for creator profile (refresh)');
        toast("Using sample data for this profile", { 
          icon: '🔍',
          duration: 3000
        });
      } else {
        console.log('Successfully loaded fresh creator data from API');
        toast.success('Profile data refreshed successfully!');
      }
      
      setCreator(result.data);
      
      // Update portfolio items
      if (result.data.portfolio && Array.isArray(result.data.portfolio)) {
        setPortfolioItems(result.data.portfolio);
      } else if (result.data.galleryPortfolio && Array.isArray(result.data.galleryPortfolio.featured)) {
        // Fallback to featured items
        setPortfolioItems(result.data.galleryPortfolio.featured.map((item: any, index: number) => ({
          id: `featured-${index}`,
          title: item.title || 'Featured Work',
          image: item.url || '',
          category: 'featured',
          description: item.description || ''
        })));
      }
      
      // Update gallery images
      if (result.data.galleryPortfolio && Array.isArray(result.data.galleryPortfolio.images)) {
        setGalleryImages(result.data.galleryPortfolio.images.map((img: any) => 
          typeof img === 'string' ? img : img.url || ''
        ));
      } else if (result.data.gallery && Array.isArray(result.data.gallery.images)) {
        setGalleryImages(result.data.gallery.images.map((img: any) => 
          typeof img === 'string' ? img : img.url || ''
        ));
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error refreshing data:', err);
      setError('Failed to refresh creator profile. Please try again later.');
      setLoading(false);
    }
  };

  // Mock data for demonstration
  const mockSocialCounts = {
    instagram: 680000,
    facebook: 13900000,
    twitter: 12000000,
    youtube: 100000,
    linkedin: 21200000
  };

  const socialMediaPlatforms = [
    { 
      name: 'instagram', 
      icon: <Instagram className="h-6 w-6 text-pink-500" />, 
      followers: mockSocialCounts.instagram,
      url: 'https://instagram.com/username'
    },
    { 
      name: 'facebook', 
      icon: <Facebook className="h-6 w-6 text-blue-600" />, 
      followers: mockSocialCounts.facebook,
      url: 'https://facebook.com/username'
    },
    { 
      name: 'twitter', 
      icon: <Twitter className="h-6 w-6 text-blue-400" />, 
      followers: mockSocialCounts.twitter,
      url: 'https://twitter.com/username'
    },
    { 
      name: 'youtube', 
      icon: <Youtube className="h-6 w-6 text-red-600" />, 
      followers: mockSocialCounts.youtube,
      url: 'https://youtube.com/c/username'
    },
    { 
      name: 'linkedin', 
      icon: <Linkedin className="h-6 w-6 text-blue-700" />, 
      followers: mockSocialCounts.linkedin,
      url: 'https://linkedin.com/in/username'
    }
  ];

  const mockPricingPackages = [
    {
      id: 'basic',
      name: 'Basic Package',
      price: 499,
      description: 'Perfect for small brands and startups',
      features: [
        '1 social media post',
        'Basic content creation',
        '1 revision included',
        'Delivery within 7 days'
      ],
      popular: false
    },
    {
      id: 'standard',
      name: 'Standard Package',
      price: 999,
      description: 'Ideal for growing brands',
      features: [
        '3 social media posts',
        'Professional content creation',
        '3 revisions included',
        'Delivery within 5 days',
        'Basic analytics report'
      ],
      popular: true
    },
    {
      id: 'premium',
      name: 'Premium Package',
      price: 2499,
      description: 'Complete solution for established brands',
      features: [
        '5 social media posts',
        'Premium content creation',
        'Unlimited revisions',
        'Delivery within 3 days',
        'Comprehensive analytics report',
        'Strategy consultation call'
      ],
      popular: false
    }
  ];

  const mockReviews = [
    {
      id: '1',
      name: 'Alex Johnson',
      avatar: 'https://randomuser.me/api/portraits/men/32.jpg',
      date: 'Jan 20, 2024',
      rating: 5,
      text: 'Working with this creator was an incredible experience. The quality of work exceeded my expectations and the communication was clear throughout the entire process.'
    },
    {
      id: '2',
      name: 'Emily Rodriguez',
      avatar: 'https://randomuser.me/api/portraits/women/44.jpg',
      date: 'Dec 15, 2023',
      rating: 4,
      text: 'Great work overall. The creator was responsive and delivered on time. Would definitely work with them again.'
    },
    {
      id: '3',
      name: 'Michael Chen',
      avatar: 'https://randomuser.me/api/portraits/men/12.jpg',
      date: 'Nov 30, 2023',
      rating: 5,
      text: 'Exceptional talent and professionalism. Our campaign performance exceeded targets by 35% thanks to their creative direction.'
    }
  ];

  const mockPortfolio = [
    {
      id: '1',
      title: 'Fashion Campaign',
      image: 'https://images.unsplash.com/photo-1542902089-176c2c4e2081',
      category: 'photography'
    },
    {
      id: '2',
      title: 'Product Video Ad',
      image: 'https://images.unsplash.com/photo-1602992708402-6071ccb58805',
      category: 'video'
    },
    {
      id: '3',
      title: 'Social Media Campaign',
      image: 'https://images.unsplash.com/photo-1596637510451-e88ce55a8379',
      category: 'social'
    },
    {
      id: '4',
      title: 'Brand Story',
      image: 'https://images.unsplash.com/photo-1532102235608-dc8a83d39c13',
      category: 'branding'
    },
    {
      id: '5',
      title: 'Website Redesign',
      image: 'https://images.unsplash.com/photo-1554978771-f462f1fb8946',
      category: 'web'
    },
    {
      id: '6',
      title: 'Mobile App Promo',
      image: 'https://images.unsplash.com/photo-1567581935884-3349723552ca',
      category: 'video'
    }
  ];

  const portfolioCategories = [
    { id: 'all', name: 'All Works' },
    { id: 'photography', name: 'Photography' },
    { id: 'video', name: 'Video' },
    { id: 'social', name: 'Social Media' },
    { id: 'branding', name: 'Branding' },
    { id: 'web', name: 'Web Design' }
  ];

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  // Helper function to get category names from creator's category IDs
  const getCreatorCategoryNames = () => {
    if (!creator?.professionalInfo?.categories) {
      return [];
    }

    const creatorCategories = creator.professionalInfo.categories;
    const categoryNames: string[] = [];

    // Handle both array of strings and array of IDs
    creatorCategories.forEach((category: string) => {
      // If categories are already strings (category names), use them directly
      if (typeof category === 'string' && !category.match(/^[0-9a-fA-F]{24}$/)) {
        categoryNames.push(category);
      } else {
        // If categories are IDs, find the corresponding category name
        const categoryObj = categories.find((cat: any) => cat._id === category || cat.id === category);
        if (categoryObj) {
          categoryNames.push(categoryObj.name);
        }
      }
    });

    return categoryNames;
  };

  const nextSocialSlide = () => {
    setCurrentSocialSlide((prev) => (prev >= 4 ? 0 : prev + 1));
  };
  
  const prevSocialSlide = () => {
    setCurrentSocialSlide((prev) => (prev <= 0 ? 4 : prev - 1));
  };

  const handleSocialMediaClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredPortfolio = portfolioFilter === 'all' 
    ? mockPortfolio 
    : mockPortfolio.filter(item => item.category === portfolioFilter);

  const handleShareClick = () => {
    setIsShareModalOpen(true);
  };
  
  const closeShareModal = () => {
    setIsShareModalOpen(false);
  };

  const handleContactClick = () => {
    setSelectedMessageType('contact');
    setMessageSubject('');
    setMessageText('');
    setIsMessageModalOpen(true);
  };

  const handleCustomChatClick = () => {
    console.log("Attempting to open custom quote modal...");
    console.log("isAuthenticated:", isAuthenticated);
    console.log("user:", user);
    console.log("creator:", creator);

    if (!isAuthenticated || !user) {
      toast.error('You must be logged in to request a custom quote.');
      console.log("Blocked: User not authenticated or user object missing.");
      return;
    }
    if (user?.role !== 'brand') {
      toast.error('You must be logged in as a brand to request a custom quote.');
      console.log("Blocked: User is not a brand.");
      return;
    }
    if (!creator || (!creator._id && !creator.userId?._id)) {
      toast.error('Creator profile data not fully loaded. Please try again in a moment.');
      console.log("Blocked: Creator data not loaded or missing ID.");
      return;
    }
    console.log("All checks passed. Opening custom quote modal.");
    setIsCustomQuoteModalOpen(true);
  };

  const handleSendMessage = async () => {
    if (!messageText.trim() || !creator) return;

    try {
      console.log('Creator data:', creator);
      if (!creator.userId?._id) {
        throw new Error('Cannot identify the creator');
      }

      const messageData = {
        receiverId: creator.userId._id, // Use the userId._id instead of creator._id
        content: messageText,
        type: 'text'
      };

      console.log('Sending message with data:', messageData);
      await sendMessageToCreator(messageData);
      setMessageText('');
      setIsMessageModalOpen(false);
      toast.success('Message sent successfully!');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handlePortfolioItemClick = (item: any) => {
    console.log('Portfolio item clicked:', item);
    setSelectedPortfolioItem(item);
    setPortfolioModalOpen(true);
  };

  const closePortfolioModal = () => {
    setPortfolioModalOpen(false);
    setTimeout(() => setSelectedPortfolioItem(null), 300);
  };

  useEffect(() => {
    // Add CSS to hide scrollbars but keep functionality
    const style = document.createElement('style');
    style.textContent = `
      .hide-scrollbar {
        -ms-overflow-style: none;  /* IE and Edge */
        scrollbar-width: none;  /* Firefox */
      }
      .hide-scrollbar::-webkit-scrollbar {
        display: none; /* Chrome, Safari and Opera */
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Handle gallery image click
  const handleImageClick = (image: string, index: number) => {
    setSelectedImage(image);
    setSelectedImageIndex(index);
  };
  
  // Close the image modal
  const closeImageModal = () => {
    setSelectedImage(null);
  };
  
  // Navigate to next image
  const goToNextImage = () => {
    if (galleryImages.length > 1) {
      const nextIndex = (selectedImageIndex + 1) % galleryImages.length;
      setSelectedImageIndex(nextIndex);
      setSelectedImage(galleryImages[nextIndex]);
    }
  };
  
  // Navigate to previous image
  const goToPrevImage = () => {
    if (galleryImages.length > 1) {
      const prevIndex = selectedImageIndex === 0 ? galleryImages.length - 1 : selectedImageIndex - 1;
      setSelectedImageIndex(prevIndex);
      setSelectedImage(galleryImages[prevIndex]);
    }
  };

  // Render social links section
  const renderSocialLinks = () => {
    if (!socialLinks) return null;
    
    // Check if there are any social links to display
    const hasSocialLinks = Object.values(socialLinks).some(link => !!link);
    
    if (!hasSocialLinks) return null;
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Connect with {creator?.personalInfo?.firstName || creator?.personalInfo?.username || username}</h2>
        <div className="flex flex-wrap gap-4">
          {socialLinks.instagram && (
            <a 
              href={socialLinks.instagram} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
            >
              <Instagram size={20} />
              <span>Instagram</span>
            </a>
          )}
          {socialLinks.twitter && (
            <a 
              href={socialLinks.twitter} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-400 text-white rounded-full hover:bg-blue-500 transition-all duration-300"
            >
              <Twitter size={20} />
              <span>Twitter</span>
            </a>
          )}
          {socialLinks.facebook && (
            <a 
              href={socialLinks.facebook} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all duration-300"
            >
              <Facebook size={20} />
              <span>Facebook</span>
            </a>
          )}
          {socialLinks.linkedin && (
            <a 
              href={socialLinks.linkedin} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-full hover:bg-blue-800 transition-all duration-300"
            >
              <Linkedin size={20} />
              <span>LinkedIn</span>
            </a>
          )}
          {socialLinks.youtube && (
            <a 
              href={socialLinks.youtube} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-all duration-300"
            >
              <Youtube size={20} />
              <span>YouTube</span>
            </a>
          )}
          {socialLinks.website && (
            <a 
              href={socialLinks.website} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-full hover:bg-green-700 transition-all duration-300"
            >
              <Globe size={20} />
              <span>Website</span>
            </a>
          )}
            </div>
        </div>
    );
  };

  // Render about me section with bio and description
  const renderAboutSection = () => {
    // Use the description state variable that's set in extractAndDisplayCreatorData
    const descriptionText = description || (creator?.descriptionFaq?.longDescription || creator?.descriptionFaq?.detailedDescription || creator?.description?.detailed || creator?.description?.long || bio || '');
    
    // Get category names from creator's category IDs
    const categoryNames = getCreatorCategoryNames();
    
    if (!descriptionText && !bio && categoryNames.length === 0) return null;

  return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-bold mb-3 sm:mb-4 text-gray-900">About Me</h2>
        
        {bio && <p className="text-gray-700 mb-4">{bio}</p>}
        
        {/* Display the detailed/long description */}
        {descriptionText && descriptionText !== bio && (
          <div className="text-gray-700 mb-4 whitespace-pre-wrap">
            {descriptionText}
                  </div>
        )}
        
        {/* Show categories if available */}
        {categoriesLoading ? (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm animate-pulse">
                Loading categories...
              </span>
            </div>
          </div>
        ) : categoryNames.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Categories</h3>
            <div className="flex flex-wrap gap-2">
              {categoryNames.map((categoryName: string, index: number) => (
                <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                  {categoryName}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* Show specialties/expertise if available */}
        {creator?.descriptionFaq?.specialties && creator.descriptionFaq.specialties.length > 0 && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Expertise</h3>
            <div className="flex flex-wrap gap-2">
              {creator.descriptionFaq.specialties.map((tag: string, index: number) => (
                <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                  {tag}
                </span>
              ))}
                    </div>
                    </div>
        )}
                    </div>
    );
  };

  // Mock FAQ data - can be replaced with real data when available
  const faqData = [
    {
      question: "What services do you offer?",
      answer: creator?.descriptionFaq?.faq?.services || 
              "I offer a range of creative services including content creation, photography, and marketing consulting tailored to your specific needs."
    },
    {
      question: "How does your pricing work?",
      answer: creator?.descriptionFaq?.faq?.pricing || 
              "My pricing is based on the scope of work, timeline, and deliverables. I offer different packages to accommodate various budgets and project requirements."
    },
    {
      question: "What is your typical turnaround time?",
      answer: creator?.descriptionFaq?.faq?.turnaround || 
              "Turnaround time varies by project complexity. Standard projects typically take 1-2 weeks, while more complex projects may require 3-4 weeks."
    },
    {
      question: "Do you work with brands outside your location?",
      answer: creator?.descriptionFaq?.faq?.remote || 
              "Yes, I work with clients globally and can accommodate virtual meetings and remote collaborations."
    },
    {
      question: "How do we get started working together?",
      answer: creator?.descriptionFaq?.faq?.process || 
              "Contact me through this profile to discuss your project needs. We'll schedule a consultation call, and I'll provide a custom proposal based on your requirements."
    }
  ].filter(item => item.answer); // Only include FAQs that have answers

  // Handle package selection and modal opening
  const handlePackageSelect = (packageType: string) => {
    // Redirect directly to checkout page with package and creator info
    const creatorId = creator?.username || params?.username || '';
    window.location.href = `/checkout?packageType=${packageType}&creatorId=${creatorId}`;
  };

  // Toggle FAQ item expansion
  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  // Render FAQ section
  const renderFaqSection = () => {
    // Prefer backend faqs if available
    const faqs = Array.isArray(creator?.descriptionFaq?.faqs) && creator.descriptionFaq.faqs.length > 0
      ? creator.descriptionFaq.faqs.filter((faq: any) => faq.question && faq.answer)
      : faqData;
    if (!faqs || faqs.length === 0) return null;
    return (
      <section className="bg-white rounded-xl shadow-sm overflow-hidden mt-8">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Frequently Asked Questions</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {faqs.map((faq: any, index: number) => (
              <div 
                key={index}
                className="border rounded-lg overflow-hidden"
              >
                <button 
                  className="w-full flex justify-between items-center p-4 text-left focus:outline-none"
                  onClick={() => toggleFaq(index)}
                >
                  <h3 className="font-medium text-gray-900">{faq.question}</h3>
                  <div>
                    {expandedFaq === index ? (
                      <MinusCircle className="h-5 w-5 text-purple-600" />
                    ) : (
                      <PlusCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </button>
                {expandedFaq === index && (
                  <div className="px-4 pb-4 text-gray-700">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Render comparison table (moved to its own function)
  const renderComparisonTable = () => {
    if (!creator?.pricing) return null;
    
    const pricing = creator.pricing;
    const currency = pricing.currency || 'USD';
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };
    
    // Define features to compare
    // Gather all unique features from all packages
    const allFeatures = [
      ...(pricing.basic?.features || []),
      ...(pricing.standard?.features || []),
      ...(pricing.premium?.features || [])
    ];
    const uniqueFeatures = Array.from(new Set(allFeatures));
    
    return (
      <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-8 mt-8">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-xl font-bold text-gray-900">Compare Packages</h2>
        </div>
        <div className="p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b">
                <th className="py-2 px-4 text-left">Package</th>
                <th className="py-2 px-4 text-center">{formatCurrency(pricing.basic?.price || 0)}<br/>Basic</th>
                <th className="py-2 px-4 text-center">{formatCurrency(pricing.standard?.price || 0)}<br/>Standard</th>
                <th className="py-2 px-4 text-center">{formatCurrency(pricing.premium?.price || 0)}<br/>Premium</th>
              </tr>
            </thead>
            <tbody>
              {/* Features comparison row(s) */}
              {uniqueFeatures.map((feature, idx) => (
                <tr key={idx} className="border-b">
                  <td className="py-3 px-4 font-medium">{feature}</td>
                  <td className="py-3 px-4 text-center">
                    {pricing.basic?.features?.includes(feature) ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {pricing.standard?.features?.includes(feature) ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {pricing.premium?.features?.includes(feature) ? (
                      <Check className="h-5 w-5 text-green-500 mx-auto" />
                    ) : (
                      <span className="text-gray-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
              <tr className="border-b">
                <td className="py-3 px-4">Total</td>
                <td className="py-3 px-4 text-center font-bold">{formatCurrency(pricing.basic?.price || 0)}</td>
                <td className="py-3 px-4 text-center font-bold">{formatCurrency(pricing.standard?.price || 0)}</td>
                <td className="py-3 px-4 text-center font-bold">{formatCurrency(pricing.premium?.price || 0)}</td>
              </tr>
              
              <tr>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-center">
                  <Button 
                    onClick={() => handlePackageSelect('basic')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-6"
                    size="sm"
                  >
                    Select
                  </Button>
                </td>
                <td className="py-3 px-4 text-center">
                  <Button 
                    onClick={() => handlePackageSelect('standard')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-6"
                    size="sm"
                  >
                    Select
                  </Button>
                </td>
                <td className="py-3 px-4 text-center">
                  <Button 
                    onClick={() => handlePackageSelect('premium')}
                    className="bg-purple-600 hover:bg-purple-700 text-white text-sm px-6"
                    size="sm"
                  >
                    Select
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
              </div>
            </section>
    );
  };

  // Render pricing section with tabbed design
  const renderPricingSection = () => {
    if (!creator?.pricing) return null;
    
    const pricing = creator.pricing;
    const currency = pricing.currency || 'USD';
    
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    const renderPackageDetails = (packageType: 'basic' | 'standard' | 'premium') => {
      const packageData = pricing[packageType];
      if (!packageData) return null;
      
      return (
        <div className="py-8">
          <div className="mb-4">
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {packageData.title || `${packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package`}
            </h3>
            <p className="text-gray-600">{packageData.description || 'Custom creative services'}</p>
          </div>

          {/* Features List - show above price */}
          {Array.isArray(packageData.features) && packageData.features.length > 0 && (
            <ul className="mb-6 space-y-2">
              {packageData.features.map((feature: string, idx: number) => (
                <li key={idx} className="flex items-center text-gray-700">
                  <Check className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="text-3xl font-bold text-purple-600 mb-6">
            {formatCurrency(packageData.price || 0)}
          </div>
          
          {packageData.deliverables && packageData.deliverables.length > 0 && (
            <div className="space-y-4 mb-8">
              {packageData.deliverables.map((item: string, index: number) => (
                <div key={index} className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                  <span className="text-gray-700">{item}</span>
                          </div>
              ))}
                        </div>
                      )}
          
          <div className="flex flex-col space-y-3 mb-8">
            {packageData.timeframe && (
              <div className="flex items-center text-gray-700">
                <Clock className="h-5 w-5 mr-2 text-purple-500" />
                <span>{packageData.timeframe} delivery</span>
                    </div>
            )}
            
            {packageData.revisions && (
              <div className="flex items-center text-gray-700">
                <ArrowRight className="h-5 w-5 mr-2 text-purple-500" />
                <span>{packageData.revisions} revisions</span>
                      </div>
            )}
              </div>
              
          <Button 
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
            onClick={() => {
              if (user && user.role === 'brand') {
                handlePackageSelect(packageType);
              } else if (user && user.role === 'creator') {
                toast.error('Only brands can check out. Please log in as a brand account.');
              } else {
                toast.error('Please log in as a brand account to check out.');
              }
            }}
          >
            Check Out
          </Button>
          {/* {!(user && user.role === 'brand') && (
            <div className="text-sm text-red-500 mt-2 text-center">Only brands can check out. Please log in as a brand account.</div>
          )} */}
              </div>
      );
    };
    
    return (
      <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
        <div className="border-b border-gray-100">
              <div className="flex border-b">
            {pricing.basic && (
                <button 
                className={`flex-1 py-4 px-6 text-center font-semibold ${selectedPricingTab === 'basic' ? 
                  'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setSelectedPricingTab('basic')}
                >
                  Basic
                </button>
            )}
            {pricing.standard && (
                <button 
                className={`flex-1 py-4 px-6 text-center font-semibold ${selectedPricingTab === 'standard' ? 
                  'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setSelectedPricingTab('standard')}
                >
                  Standard
                </button>
            )}
            {pricing.premium && (
                <button 
                className={`flex-1 py-4 px-6 text-center font-semibold ${selectedPricingTab === 'premium' ? 
                  'border-b-2 border-purple-600 text-purple-600' : 'text-gray-600'}`}
                onClick={() => setSelectedPricingTab('premium')}
                >
                  Premium
                </button>
            )}
          </div>
              </div>
              
        <div className="p-6">
          {/* Package details */}
          {renderPackageDetails(selectedPricingTab)}
          
          {/* Custom service request */}
          <div className="mt-8">
            <div className="relative rounded-2xl bg-gradient-to-br from-purple-50/80 via-white/80 to-pink-50/80 border border-purple-200 shadow-lg p-6 sm:p-8 flex flex-col items-center overflow-hidden animate-fadeIn">
              <div className="absolute -top-6 right-6 opacity-20 text-purple-300 text-7xl pointer-events-none select-none">
                <svg width="64" height="64" fill="none" viewBox="0 0 24 24"><path d="M12 2v20m10-10H2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="flex flex-col items-center z-10">
                <div className="bg-gradient-to-tr from-purple-500 to-pink-400 rounded-full p-3 mb-3 shadow-lg animate-bounce">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24"><path d="M12 2v20m10-10H2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <h3 className="text-2xl font-extrabold text-purple-900 mb-2 drop-shadow">Need something custom?</h3>
                <p className="text-purple-700 text-base mb-6 text-center max-w-xs">Get a personalized quote for your specific needs</p>
                <Button 
                  onClick={handleCustomChatClick}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-700 hover:to-pink-600 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-lg transition-all duration-200 transform hover:scale-105 active:scale-95 animate-glow"
                  size="lg"
                >
                  Request Custom Quote
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  };

  // Render gallery section
  const renderGallerySection = () => {
    if (!galleryImages || galleryImages.length === 0) return null;
    
    console.log('Rendering gallery with images:', galleryImages);
    
    // Limit the number of images shown initially
    const displayImages = showAllGallery ? galleryImages : galleryImages.slice(0, 6);
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Gallery</h2>
          {galleryImages.length > 6 && (
            <Button 
              variant="outline"
              size="sm"
              onClick={() => setShowAllGallery(!showAllGallery)}
            >
              {showAllGallery ? 'Show Less' : `Show All (${galleryImages.length})`}
            </Button>
          )}
                    </div>
                    
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {displayImages.map((image, index) => {
            // Ensure image is a string - this handles both string images and object images
            const imageUrl = typeof image === 'string' ? image : (image as any).url || '';
            console.log(`Gallery image ${index}:`, imageUrl);
            
            return (
              <div 
                key={index} 
                className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                onClick={() => handleImageClick(imageUrl, index)}
              >
                <img 
                  src={imageUrl} 
                  alt={`Gallery image ${index + 1}`} 
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => {
                    console.error(`Error loading image: ${imageUrl}`);
                    e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                  <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
                        </div>
                      </div>
            );
          })}
                        </div>
                      </div>
    );
  };

  // Render profile header
  const renderProfileHeader = () => {
    if (!creator) return null;
    
    // Log complete creator data for debugging
    console.log('Rendering profile header with creator data:', creator);
    
    // Extract profile and cover images with proper URL processing
    const profileImagePath = creator.personalInfo?.profileImage || creator.profileImage || '';
    const coverImagePath = creator.personalInfo?.coverImage || creator.coverImage || '';
    
    const profileImage = processImageUrl(profileImagePath);
    const coverImage = processImageUrl(coverImagePath);
    
    console.log('Profile image path:', profileImagePath);
    console.log('Processed profile image URL:', profileImage);
    console.log('Cover image path:', coverImagePath);
    console.log('Processed cover image URL:', coverImage);
    
    // Extract name information with proper fallbacks
    const firstName = creator.personalInfo?.firstName || '';
    const lastName = creator.personalInfo?.lastName || '';
    const fullName = creator.personalInfo?.fullName || '';
    
    console.log('Name data:', { firstName, lastName, fullName });
    
    // Build display name with proper priority
    let displayName = fullName;
    if (!displayName && firstName && lastName) {
      displayName = `${firstName} ${lastName}`;
    }
    if (!displayName) {
      displayName = creator.fullName || username as string;
    }
    
    console.log('Display name used:', displayName);
    
    // Build location string with proper formatting
    let location = '';
    if (creator.personalInfo?.location) {
      console.log('Location data:', creator.personalInfo.location);
      const locationData = creator.personalInfo.location;
      
      // Create location parts array with only non-empty values
      const locationParts = [];
      if (locationData.city) locationParts.push(locationData.city);
      if (locationData.state) locationParts.push(locationData.state);
      if (locationData.country) locationParts.push(locationData.country);
      
      // Join with commas
      location = locationParts.join(', ');
    } else if (typeof creator.personalInfo?.location === 'string') {
      location = creator.personalInfo.location;
    }
    
    console.log('Formatted location:', location);
    
    const title = creator.professionalInfo?.title || creator.title || '';
    
    // Extract event availability
    const eventAvailability = creator.professionalInfo?.eventAvailability || null;
    const isAvailableForEvents = eventAvailability && eventAvailability.available;
    
    return (
      <div className="relative rounded-lg overflow-hidden">
        {/* Cover image */}
        <div className="h-48 md:h-64 w-full relative">
          {coverImage ? (
            <div 
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: `url(${coverImage})` }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600" />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                    
        {/* Profile info section with overlap */}
        <div className="relative bg-white shadow-md rounded-b-lg">
          <div className="px-4 md:px-8 relative -mt-16 pb-6">
            <div className="flex flex-col md:flex-row items-center md:items-end">
              {/* Profile image */}
              <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white bg-white shadow-lg flex-shrink-0 mb-4 md:mb-0">
                {profileImage ? (
                  <img 
                    src={profileImage} 
                    alt={displayName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      console.error(`Error loading profile image: ${profileImage}`);
                      e.currentTarget.src = '/images/default-avatar.png';
                      e.currentTarget.onerror = null; // Prevent infinite loop
                    }}
                  />
                ) : (
                  <div className="flex items-center justify-center w-full h-full bg-gradient-to-r from-purple-400 to-indigo-500 text-white text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                        </div>
                )}
                    </div>
                    
              {/* Creator info */}
              <div className="md:ml-6 text-center md:text-left flex-grow">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">{displayName}</h1>
                <p className="text-gray-600 mt-1">@{username}</p>
                {location && (
                  <p className="text-gray-500 mt-1 flex items-center justify-center md:justify-start">
                    <MapPinIcon className="h-4 w-4 mr-1" />
                    {location}
                  </p>
                )}
                {/* Categories under location as links */}
                {getCreatorCategoryNames().length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    {getCreatorCategoryNames().map((categoryName: string, idx: number) => (
                      <Link
                        key={idx}
                        href={`/categories/${encodeURIComponent(categoryName)}`}
                        className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition-colors"
                        prefetch={false}
                      >
                        {categoryName}
                      </Link>
                    ))}
                  </div>
                )}
                {title && (
                  <p className="text-gray-600 mt-2">{title}</p>
                )}
                {isAvailableForEvents && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    {/* Green badge with both event and travel info */}
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Available for events
                      {creator.professionalInfo.eventAvailability.travelWillingness && (
                        <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full flex items-center">
                          <Plane size={12} className="inline mr-1" /> Willing to travel
                        </span>
                      )}
                    </div>
                    {/* Categories next to the green badge */}
                    {categoriesLoading ? (
                      <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm animate-pulse">
                        Loading categories...
                      </span>
                    ) : getCreatorCategoryNames().length > 0 && getCreatorCategoryNames().map((categoryName: string, idx: number) => (
                      <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                        {categoryName}
                      </span>
                    ))}
                  </div>
                )}
                    </div>
                    
              {/* Action buttons and availability */}
              <div className="mt-4 md:mt-0 flex flex-col space-y-2">
                {isAvailableForEvents && (
                  <div className="bg-green-50 border border-green-100 rounded-md p-2 mb-2 text-center md:text-left">
                    <p className="text-green-700 font-medium flex items-center justify-center md:justify-start">
                      <Calendar size={16} className="mr-1" /> Available for events
                      {creator.professionalInfo.eventAvailability.travelWillingness && (
                        <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">
                          <Plane size={12} className="inline mr-1" /> Willing to travel
                        </span>
                      )}
                    </p>
                  </div>
                )}
                
                {/* Event Types */}
                {creator?.professionalInfo?.eventAvailability?.eventTypes && 
                 creator.professionalInfo.eventAvailability.eventTypes.length > 0 && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                      {creator.professionalInfo.eventAvailability.eventTypes.map((type: string, index: number) => (
                        <span key={index} className="inline-block px-3 py-1 bg-green-50 text-xs rounded-full text-green-700 border border-green-100">
                          {type}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render portfolio section
  const renderPortfolioSection = () => {
    if (!portfolioItems || portfolioItems.length === 0) return null;
    
    console.log('Rendering portfolio with items:', portfolioItems);
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Portfolio</h2>
        </div>
        
        <div className="space-y-8">
          {portfolioItems.map((item, index) => {
            // Make sure we have a valid item with title
            const title = item?.title || 'Portfolio Item';
            const description = item?.description || '';
            const imageUrl = typeof item?.image === 'string' ? item.image : (item?.image as any)?.url || '';
            const processedImageUrl = processImageUrl(imageUrl);
            
            return (
              <div key={index} className="border-b pb-6 last:border-0 last:pb-0">
                <div className="flex flex-col md:flex-row gap-6">
                  {imageUrl && (
                    <div className="w-full md:w-1/3 h-48 md:h-auto">
                      <div className="h-full rounded-lg overflow-hidden">
                        <img 
                          src={processedImageUrl} 
                          alt={title} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            console.error(`Error loading portfolio image: ${imageUrl}`);
                            e.currentTarget.src = 'https://placehold.co/600x400?text=Portfolio+Item';
                          }}
                        />
                      </div>
                  </div>
                )}
                
                  <div className="w-full md:w-2/3">
                  <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
                      
                      {item.client && (
                        <p className="text-gray-600 text-sm mb-2">Client: {item.client}</p>
                      )}
                      
                      {item.category && (
                        <p className="text-purple-600 text-xs uppercase tracking-wide mb-3">
                          {item.category}
                        </p>
                      )}
                      
                      {description && (
                        <p className="text-gray-700 mb-4">{description}</p>
                      )}
                      
                      {item.projectDate && (
                        <p className="text-gray-500 text-sm">
                          <Calendar size={14} className="inline mr-1" /> {item.projectDate}
                        </p>
                      )}
                      
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-3 text-purple-700 hover:text-purple-900"
                        onClick={() => handlePortfolioItemClick(item)}
                      >
                        View Details <ArrowRight size={14} className="ml-1" />
                      </Button>
                        </div>
                      </div>
                        </div>
                      </div>
            );
          })}
                    </div>
      </div>
    );
  };

  // Update the renderSocialSection function to display follower counts
  const renderSocialSection = () => {
    // Skip rendering if no social links are available
    if (!socialLinks || Object.values(socialLinks).every(link => !link)) {
      return null;
    }
    
    // Get follower counts from creator data if available
    const getSocialStats = (platform: string) => {
      if (creator?.socialMedia?.socialProfiles && 
          creator.socialMedia.socialProfiles[platform]) {
        const profile = creator.socialMedia.socialProfiles[platform];
        if (platform === 'youtube' && profile.subscribers) {
          return { count: profile.subscribers, label: 'Subscribers' };
        } else if (platform === 'linkedin' && profile.connections) {
          return { count: profile.connections, label: 'Connections' };
        } else if (profile.followers) {
          return { count: profile.followers, label: 'Followers' };
        }
      }
      return null;
    };
    
    // Format large numbers (e.g., 1.2M, 450K)
    const formatNumber = (num: number) => {
      if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
      if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
      return num.toString();
    };
    
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Social Media</h2>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {/* Instagram */}
          {socialLinks.instagram && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.instagram, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                <Instagram className="h-8 w-8 text-pink-500" />
                <span className="mt-2 font-medium text-sm">Instagram</span>
                
                {getSocialStats('instagram') && (
                  <div className="mt-2 text-center">
                    <p className="text-lg font-bold">{formatNumber(getSocialStats('instagram')!.count)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                        </div>
                )}
                    </div>
            </div>
          )}
          
          {/* Facebook */}
          {socialLinks.facebook && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.facebook, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                <Facebook className="h-8 w-8 text-blue-600" />
                <span className="mt-2 font-medium text-sm">Facebook</span>
                
                {getSocialStats('facebook') && (
                  <div className="mt-2 text-center">
                    <p className="text-lg font-bold">{formatNumber(getSocialStats('facebook')!.count)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                )}
              </div>
                  </div>
                )}
                
          {/* Twitter/X */}
          {socialLinks.twitter && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.twitter, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                <Twitter className="h-8 w-8 text-blue-400" />
                <span className="mt-2 font-medium text-sm">Twitter</span>
                
                {getSocialStats('twitter') && (
                  <div className="mt-2 text-center">
                    <p className="text-lg font-bold">{formatNumber(getSocialStats('twitter')!.count)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
                  </div>
                )}
                </div>
              </div>
          )}
          
          {/* YouTube */}
          {socialLinks.youtube && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.youtube, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                <Youtube className="h-8 w-8 text-red-600" />
                <span className="mt-2 font-medium text-sm">YouTube</span>
                
                {getSocialStats('youtube') && (
                  <div className="mt-2 text-center">
                    <p className="text-lg font-bold">{formatNumber(getSocialStats('youtube')!.count)}</p>
                    <p className="text-xs text-gray-500">Subscribers</p>
            </div>
                )}
          </div>
        </div>
          )}
          
          {/* LinkedIn */}
          {socialLinks.linkedin && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.linkedin, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                <Linkedin className="h-8 w-8 text-blue-700" />
                <span className="mt-2 font-medium text-sm">LinkedIn</span>
                
                {getSocialStats('linkedin') && (
                  <div className="mt-2 text-center">
                    <p className="text-lg font-bold">{formatNumber(getSocialStats('linkedin')!.count)}</p>
                    <p className="text-xs text-gray-500">Connections</p>
            </div>
                )}
            </div>
            </div>
          )}
          
          {/* TikTok */}
          {socialLinks.tiktok && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.tiktok, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                {/* Use a generic icon if no TikTok icon is available */}
                <div className="h-8 w-8 flex items-center justify-center text-black font-bold">TT</div>
                <span className="mt-2 font-medium text-sm">TikTok</span>
                
                {getSocialStats('tiktok') && (
                  <div className="mt-2 text-center">
                    <p className="text-lg font-bold">{formatNumber(getSocialStats('tiktok')!.count)}</p>
                    <p className="text-xs text-gray-500">Followers</p>
            </div>
                )}
          </div>
            </div>
          )}
          
          {/* Website/Portfolio */}
          {socialLinks.website && (
            <div 
              className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer bg-white"
              onClick={() => window.open(socialLinks.website, '_blank', 'noopener,noreferrer')}
            >
              <div className="flex flex-col items-center">
                <Globe className="h-8 w-8 text-gray-600" />
                <span className="mt-2 font-medium text-sm">Website</span>
          </div>
        </div>
          )}
            </div>
      </div>
    );
  };

  useEffect(() => {
    // Fetch reviewer info for each review
    const fetchReviewerInfo = async () => {
      if (!reviews || reviews.length === 0) return;
      const infoMap: Record<string, { name: string; avatar: string }> = {};
      await Promise.all(reviews.map(async (review) => {
        const brandId = review.brandId?._id || review.brandId;
        if (brandId && !infoMap[brandId]) {
          const res = await getUserById(brandId);
          if (res.success && res.data) {
            const user = res.data;
            infoMap[brandId] = {
              name: user.fullName || user.name || user.username || 'User',
              avatar: user.profileImage || user.avatar || 'https://placehold.co/40x40?text=U',
            };
          }
        }
      }));
      setReviewerInfoMap(infoMap);
    };
    fetchReviewerInfo();
  }, [reviews]);

  // Fetch smart suggestions based on current creator
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (!creator) return;
      
      setSuggestionsLoading(true);
      try {
        // Get all published creators
        const allCreators = await getPublishedCreators();
        
        // Filter out the current creator
        const otherCreators = allCreators.filter((c: any) => 
          c.username !== username && c.personalInfo?.username !== username
        );
        
        // Smart filtering based on current creator's profile
        let smartSuggestions = otherCreators;
        
        // If creator has categories, prioritize creators with similar categories
        if (creator.professionalInfo?.categories && creator.professionalInfo.categories.length > 0) {
          const currentCategories = creator.professionalInfo.categories;
          smartSuggestions = otherCreators.filter((c: any) => {
            const creatorCategories = c.professionalInfo?.categories || c.category || [];
            return creatorCategories.some((cat: string) => 
              currentCategories.includes(cat)
            );
          });
        }
        
        // If creator has expertise, also consider that
        if (creator.professionalInfo?.expertise && creator.professionalInfo.expertise.length > 0) {
          const currentExpertise = creator.professionalInfo.expertise;
          const expertiseMatches = otherCreators.filter((c: any) => {
            const creatorExpertise = c.professionalInfo?.expertise || [];
            return creatorExpertise.some((exp: string) => 
              currentExpertise.includes(exp)
            );
          });
          
          // Combine category and expertise matches, remove duplicates
          const allMatches = [...smartSuggestions, ...expertiseMatches];
          const uniqueMatches = allMatches.filter((creator, index, self) => 
            index === self.findIndex(c => c._id === creator._id)
          );
          
          smartSuggestions = uniqueMatches;
        }
        
        // If we don't have enough category/expertise matches, add some high-rated creators
        if (smartSuggestions.length < 6) {
          const highRatedCreators = otherCreators
            .filter((c: any) => !smartSuggestions.find((s: any) => s._id === c._id))
            .sort((a: any, b: any) => {
              const ratingA = a.metrics?.ratings?.average || a.rating || 0;
              const ratingB = b.metrics?.ratings?.average || b.rating || 0;
              return ratingB - ratingA;
            })
            .slice(0, 6 - smartSuggestions.length);
          
          smartSuggestions = [...smartSuggestions, ...highRatedCreators];
        }
        
        // Limit to 6 suggestions and shuffle for variety
        smartSuggestions = smartSuggestions
          .slice(0, 6)
          .sort(() => Math.random() - 0.5);
        
        setSuggestions(smartSuggestions);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setSuggestionsLoading(false);
      }
    };
    
    fetchSuggestions();
  }, [creator, username]);

  // Fetch related creators by category
  useEffect(() => {
    const fetchRelated = async () => {
      if (!creator || !creator.professionalInfo?.categories || creator.professionalInfo.categories.length === 0) return;
      setRelatedLoading(true);
      try {
        const mainCategory = creator.professionalInfo.categories[0];
        const res = await getFilteredCreators({ category: mainCategory, limit: 6 });
        // Exclude the current creator from the related list
        const filtered = res.creators.filter((c: any) => c.username !== username && c.personalInfo?.username !== username);
        setRelatedCreators(filtered);
      } catch (err) {
        setRelatedCreators([]);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [creator, username]);

  // Fetch related creators by tag when a tag is selected
  useEffect(() => {
    if (!selectedTag) return;
    setTagRelatedLoading(true);
    getFilteredCreators({ search: selectedTag, limit: 6 })
      .then(res => {
        // Exclude the current creator from the related list
        const filtered = res.creators.filter((c: any) => c.username !== username && c.personalInfo?.username !== username);
        setTagRelatedCreators(filtered);
      })
      .catch(() => setTagRelatedCreators([]))
      .finally(() => setTagRelatedLoading(false));
  }, [selectedTag, username]);

  if (!loading && !creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <DashboardLayout>
        {isMessageModalOpen && (
          <MessageModal
            isOpen={isMessageModalOpen}
            onClose={() => setIsMessageModalOpen(false)}
            messageType={selectedMessageType}
            subject={messageSubject}
            setSubject={setMessageSubject}
            message={messageText}
            setMessage={setMessageText}
            onSend={handleSendMessage}
            isSending={isSending}
          />
        )}
        
      {isShareModalOpen && (
          <ShareModal
            isOpen={isShareModalOpen}
            onClose={closeShareModal}
            username={username as string}
            displayName={creator?.personalInfo?.fullName || username as string}
          />
        )}
        
        {portfolioModalOpen && selectedPortfolioItem && (
          <PortfolioItemModal 
            isOpen={portfolioModalOpen}
            onClose={closePortfolioModal}
            item={selectedPortfolioItem}
          />
        )}
        
        {/* New: Custom Quote Request Modal */}
        {isCustomQuoteModalOpen && creator && (
          <RequestCustomQuoteModal
            creatorId={creator.userId?._id || creator._id} // Ensure creator ID is passed
            creatorName={creator.personalInfo?.fullName || username}
            onClose={() => setIsCustomQuoteModalOpen(false)}
          />
        )}
        
        {loading ? (
          <Loading />
        ) : error ? (
          <ErrorMessage message={error} />
        ) : (
          <div className="pb-16">
            {/* Hero Banner Section */}
            <section className="relative h-40 md:h-60 w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 overflow-hidden">  {/* Reduced height from h-60 md:h-80 to h-40 md:h-60 */}
              {creator?.personalInfo?.coverImage ? (
                <img 
                  src={processImageUrl(creator.personalInfo.coverImage)} 
                  alt="Cover"
                  className="w-full h-full object-cover object-center"
                />
              ) : null}
              <div className="absolute inset-0 bg-black bg-opacity-30"></div>
            </section>
            
            {/* Profile Header Section */}
            <section className="max-w-7xl mx-auto px-4 relative -mt-12 z-10 mb-8">  {/* Adjusted margin-top from -mt-16 to -mt-12 and bottom margin from mb-12 to mb-8 */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <div className="p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                    {/* Profile Image */}
                   <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden flex-shrink-0">
  {creator?.personalInfo?.profileImage ? (
    <img
      src={
        creator.personalInfo.profileImage.startsWith("data:image")
          ? creator.personalInfo.profileImage
          : processImageUrl(creator.personalInfo.profileImage)
      }
      alt={creator.personalInfo.fullName || (username as string)}
      className="w-full h-full object-cover"
      onError={(e) => {
        const fallback = "https://placehold.co/200x200?text=User";
        if (e.currentTarget.src !== fallback) {
          e.currentTarget.src = fallback;
        }
      }}
    />
  ) : (
    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-purple-500 to-indigo-600 text-white text-4xl font-bold">
      {(creator?.personalInfo?.fullName || username || "U").charAt(0).toUpperCase()}
    </div>
  )}
            </div>
            
                    {/* Profile Info */}

                    <div className="flex-1 text-center md:text-left">

                      <div className="space-y-1">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
  {creator?.personalInfo?.firstName || creator?.personalInfo?.lastName
    ? `${creator.personalInfo.firstName ?? ''} ${creator.personalInfo.lastName ?? ''}`.trim()
    : (username as string)}
</h1>

                        <p className="text-gray-500">@{username}</p>
                        {/* Categories under username */}
                        {/* {getCreatorCategoryNames().length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                            {getCreatorCategoryNames().map((categoryName: string, idx: number) => (
                              <span key={idx} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                                {categoryName}
                              </span>
                            ))}
                          </div>
                        )} */}
                        
                        {creator?.professionalInfo?.title && (
                          <p className="text-purple-600 font-medium text-lg">
                            {creator.professionalInfo.title}
                          </p>
                        )}
                        
                        {creator?.personalInfo?.location && (
                          <p className="flex items-center justify-center md:justify-start text-gray-600 mt-2">
                            <MapPin size={16} className="mr-1" />
                            {typeof creator.personalInfo.location === 'string' 
                              ? creator.personalInfo.location 
                              : [
                                  creator.personalInfo.location.city, 
                                  creator.personalInfo.location.state, 
                                  creator.personalInfo.location.country
                                ].filter(Boolean).join(', ')}
                          </p>
                        )}
                        {/* Categories under location as links */}
                        {getCreatorCategoryNames().length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                            {getCreatorCategoryNames().map((categoryName: string, idx: number) => (
                              <Link
                                key={idx}
                                href={`/categories/${encodeURIComponent(categoryName)}`}
                                className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200 hover:bg-blue-100 transition-colors"
                                prefetch={false}
                              >
                                {categoryName}
                              </Link>
                            ))}
                          </div>
                        )}
                </div>
              </div>
              
                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row md:flex-col gap-3 mt-4 md:mt-0">
                      <Button 
                        onClick={handleContactClick}
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        size="lg"
                      >
                        <Mail size={16} className="mr-2" /> Contact
                      </Button>
                      
                      <Button 
                        variant="outline"
                        onClick={handleShareClick}
                        size="lg"
                        className="border-purple-200 hover:bg-purple-50"
                      >
                        <Share2 size={16} className="mr-2" /> Share
                      </Button>
                </div>
              </div>
                  
                  {/* Availability Badge */}
                  {creator?.professionalInfo?.eventAvailability?.available && (
                    <div className="mt-6 flex flex-wrap justify-center md:justify-start gap-4">
                      <button
                        type="button"
                        className="bg-green-50 border border-green-100 rounded-full px-4 py-1.5 focus:outline-none focus:ring-2 focus:ring-green-300 transition"
                        onClick={() => setShowEventDetails((prev) => !prev)}
                      >
                        <span className="text-green-700 font-medium flex items-center">
                          <Calendar size={16} className="mr-2" /> Available for events
                          {creator.professionalInfo.eventAvailability.travelWillingness && (
                            <span className="ml-2 text-xs bg-green-100 px-2 py-0.5 rounded-full">
                              <Plane size={12} className="inline mr-1" /> Willing to travel
                            </span>
                          )}
                          <span className="ml-2">{showEventDetails ? "▲" : "▼"}</span>
                        </span>
                      </button>
                      {/* Dropdown */}
                      {showEventDetails && (
                        <div className="w-full mt-2 bg-green-50 border border-green-100 rounded-lg p-4 shadow">
                          {/* Event Types */}
                          {creator.professionalInfo.eventAvailability.eventTypes && creator.professionalInfo.eventAvailability.eventTypes.length > 0 && (
                            <div className="mb-2">
                              <strong>Event Types:</strong>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {creator.professionalInfo.eventAvailability.eventTypes.map((type: string, idx: number) => (
                                  <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-xs rounded-full text-green-700 border border-green-200">
                                    {type}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Pricing */}
                          {creator.professionalInfo.eventAvailability.pricing && (
                            <div className="mb-2">
                              <strong>Pricing:</strong> <span className="ml-1">{creator.professionalInfo.eventAvailability.pricing}</span>
                            </div>
                          )}
                          {/* Requirements */}
                          {creator.professionalInfo.eventAvailability.requirements && (
                            <div className="mb-2">
                              <strong>Requirements:</strong> <span className="ml-1">{creator.professionalInfo.eventAvailability.requirements}</span>
                            </div>
                          )}
                          {/* Willing to travel */}
                          {creator.professionalInfo.eventAvailability.travelWillingness !== undefined && (
                            <div className="mb-2">
                              <strong>Willing to travel:</strong> <span className="ml-1">{creator.professionalInfo.eventAvailability.travelWillingness ? 'Yes' : 'No'}</span>
                            </div>
                          )}
                          {/* Preferred Locations */}
                          {creator.professionalInfo.eventAvailability.preferredLocations && creator.professionalInfo.eventAvailability.preferredLocations.length > 0 && (
                            <div className="mb-2">
                              <strong>Preferred Locations:</strong>
                              <div className="flex flex-wrap gap-2 mt-1">
                                {creator.professionalInfo.eventAvailability.preferredLocations.map((loc: string, idx: number) => (
                                  <span key={idx} className="inline-block px-3 py-1 bg-green-100 text-xs rounded-full text-green-700 border border-green-200">
                                    {loc}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          {/* Lead Time */}
                          {creator.professionalInfo.eventAvailability.leadTime !== undefined && (
                            <div className="mb-2">
                              {/* <strong>Lead Time:</strong> <span className="ml-1">{creator.professionalInfo.eventAvailability.leadTime} days</span> */}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                  
                </div>
                </div>
            </section>
            
            {/* Main Content Grid */}
            <div className="max-w-7xl mx-auto px-4">
              {/* Connect Section - Full width above other sections */}
              <section className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
                <div className="border-b border-gray-100 px-6 py-4">
                  <h2 className="text-xl font-bold text-gray-900">Connect</h2>
              </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                    {/* Instagram */}
                    {socialLinks.instagram && (
                      <div 
                        className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => window.open(socialLinks.instagram, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex flex-col items-center p-4">
                          <Instagram className="h-8 w-8 text-pink-500" />
                          <span className="mt-2 font-medium text-sm">Instagram</span>
                          
                          {creator?.socialMedia?.socialProfiles?.instagram?.followers && (
                            <div className="mt-2 text-center">
                              <p className="text-lg font-bold">
                                {formatNumber(creator.socialMedia.socialProfiles.instagram.followers)}
                              </p>
                              <p className="text-xs text-gray-500">Followers</p>
            </div>
                          )}
          </div>
                      </div>
                    )}
                    
                    {/* Facebook */}
                    {socialLinks.facebook && (
                      <div 
                        className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => window.open(socialLinks.facebook, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex flex-col items-center p-4">
                          <Facebook className="h-8 w-8 text-blue-600" />
                          <span className="mt-2 font-medium text-sm">Facebook</span>
                          
                          {creator?.socialMedia?.socialProfiles?.facebook?.followers && (
                            <div className="mt-2 text-center">
                              <p className="text-lg font-bold">
                                {formatNumber(creator.socialMedia.socialProfiles.facebook.followers)}
                              </p>
                              <p className="text-xs text-gray-500">Followers</p>
          </div>
                          )}
        </div>
      </div>
                    )}
                    
                    {/* Twitter */}
                    {socialLinks.twitter && (
                      <div 
                        className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => window.open(socialLinks.twitter, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex flex-col items-center p-4">
                          <Twitter className="h-8 w-8 text-blue-400" />
                          <span className="mt-2 font-medium text-sm">Twitter</span>
                          
                          {creator?.socialMedia?.socialProfiles?.twitter?.followers && (
                            <div className="mt-2 text-center">
                              <p className="text-lg font-bold">
                                {formatNumber(creator.socialMedia.socialProfiles.twitter.followers)}
                              </p>
                              <p className="text-xs text-gray-500">Followers</p>
                </div>
                          )}
                </div>
              </div>
                    )}
                    
                    {/* YouTube */}
                    {socialLinks.youtube && (
                      <div 
                        className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => window.open(socialLinks.youtube, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex flex-col items-center p-4">
                          <Youtube className="h-8 w-8 text-red-600" />
                          <span className="mt-2 font-medium text-sm">YouTube</span>
                          
                          {creator?.socialMedia?.socialProfiles?.youtube?.subscribers && (
                            <div className="mt-2 text-center">
                              <p className="text-lg font-bold">
                                {formatNumber(creator.socialMedia.socialProfiles.youtube.subscribers)}
                              </p>
                              <p className="text-xs text-gray-500">Subscribers</p>
                            </div>
                          )}
              </div>
            </div>
                    )}
                    
                    {/* LinkedIn */}
                    {socialLinks.linkedin && (
                      <div 
                        className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => window.open(socialLinks.linkedin, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex flex-col items-center p-4">
                          <Linkedin className="h-8 w-8 text-blue-700" />
                          <span className="mt-2 font-medium text-sm">LinkedIn</span>
                          
                          {creator?.socialMedia?.socialProfiles?.linkedin?.connections && (
                            <div className="mt-2 text-center">
                              <p className="text-lg font-bold">
                                {formatNumber(creator.socialMedia.socialProfiles.linkedin.connections)}
                              </p>
                              <p className="text-xs text-gray-500">Connections</p>
                            </div>
                          )}
          </div>
        </div>
      )}

                    {/* Website */}
                    {socialLinks.website && (
                      <div 
                        className="border rounded-lg hover:shadow-md transition-shadow cursor-pointer bg-white"
                        onClick={() => window.open(socialLinks.website, '_blank', 'noopener,noreferrer')}
                      >
                        <div className="flex flex-col items-center p-4">
                          <Globe className="h-8 w-8 text-gray-600" />
                          <span className="mt-2 font-medium text-sm">Website</span>
                        </div>
                      </div>
              )}
            </div>
                </div>
              </section>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left Column - About, FAQ, Portfolio, and Reviews */}
                <div className="lg:col-span-8 space-y-8">
                  {/* About Section */}
                  <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="border-b border-gray-100 px-6 py-4">
                      <h2 className="text-xl font-bold text-gray-900">About</h2>
                    </div>
                    <div className="p-6">
                      {bio && <p className="text-gray-700 mb-6">{bio}</p>}
                      
                      {description && description !== bio && (
                        <div className="text-gray-700 mb-6 whitespace-pre-wrap">
                          {description}
                </div>
                      )}
                      
                      {/* Categories */}
                      {categoriesLoading ? (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Categories</h3>
                          <div className="flex flex-wrap gap-2">
                            <span className="bg-gray-100 text-gray-500 px-3 py-1 rounded-full text-sm animate-pulse">
                              Loading categories...
                            </span>
                          </div>
                        </div>
                      ) : getCreatorCategoryNames().length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Categories</h3>
                          <div className="flex flex-wrap gap-2">
                            {getCreatorCategoryNames().map((categoryName: string, index: number) => (
                              <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm border border-blue-200">
                                {categoryName}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Expertise */}
                      {creator?.professionalInfo?.expertise && creator.professionalInfo.expertise.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-gray-800 mb-3">Areas of Expertise</h3>
                          <div className="flex flex-wrap gap-2">
                            {creator.professionalInfo.expertise.map((tag: string, index: number) => (
                              <span key={index} className="bg-purple-50 text-purple-700 px-3 py-1 rounded-full text-sm">
                                {tag}
                              </span>
                            ))}
                </div>
                        </div>
                      )}
                    </div>
                  </section>
                  
                  {/* FAQ Section */}
                  {renderFaqSection()}
                  
                  {/* Reviews Section - Now under FAQ at half width */}
                  {renderReviewsSection()}
                  
                  {/* Portfolio Section */}
                  {portfolioItems && portfolioItems.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="border-b border-gray-100 px-6 py-4">
                        <h2 className="text-xl font-bold text-gray-900">Portfolio</h2>
                      </div>
                      <div className="p-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          {portfolioItems.map((item, index) => (
                            <div 
                              key={index}
                              className="group cursor-pointer rounded-lg overflow-hidden border border-gray-100 hover:border-purple-200 transition-all duration-300"
                              onClick={() => handlePortfolioItemClick(item)}
                            >
                              <div className="aspect-[4/3] overflow-hidden bg-gray-50">
                                <img 
                                  src={typeof item.image === 'string' ? item.image : item.image?.url || ''}
                                  alt={item.title || 'Portfolio item'}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/600x400?text=Portfolio+Item';
                                  }}
                                />
                              </div>
                              <div className="p-4">
                                <h3 className="font-semibold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">
                                  {item.title || 'Portfolio Item'}
                                </h3>
                                {item.category && (
                                  <span className="inline-block text-xs text-purple-600 uppercase tracking-wide">
                                    {item.category}
                      </span>
                                )}
                              </div>
                            </div>
                    ))}
                  </div>
                </div>
                    </section>
                  )}
                  
                  {/* Gallery Section */}
                  {galleryImages && galleryImages.length > 0 && (
                    <section className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
                        <h2 className="text-xl font-bold text-gray-900">Gallery</h2>
                        {galleryImages.length > 8 && (
                          <Button 
                            variant="outline"
                            size="sm"
                            onClick={() => setShowAllGallery(!showAllGallery)}
                            className="text-sm"
                          >
                            {showAllGallery ? 'Show Less' : `View All (${galleryImages.length})`}
                          </Button>
                        )}
                </div>
                      <div className="p-6">
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                          {(showAllGallery ? galleryImages : galleryImages.slice(0, 8)).map((image, index) => {
                            const imageUrl = typeof image === 'string' ? image : (image as any).url || '';
                            
                            return (
                              <div 
                                key={index} 
                                className="aspect-square rounded-lg overflow-hidden cursor-pointer relative group"
                                onClick={() => handleImageClick(imageUrl, index)}
                              >
                                <img 
                                  src={imageUrl} 
                                  alt={`Gallery image ${index + 1}`} 
                                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                  onError={(e) => {
                                    e.currentTarget.src = 'https://placehold.co/600x400?text=Image+Error';
                                  }}
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
                                  <ImageIcon className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" size={24} />
              </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </section>
                  )}
                  
                  {/* Compare Packages Section - Now under Gallery */}
                  {creator?.pricing && renderComparisonTable()}
                </div>
                
                {/* Right Column - Services & Pricing */}
                <div className="lg:col-span-4">
                  {creator?.pricing && renderPricingSection()}
              </div>
            </div>
          </div>
            </div>
          )}
      
      {/* Smart Suggestions Section */}
      <div className="max-w-7xl mx-auto px-4">
        <section className="mb-10 mt-16">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">You might also like</h2>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                <button className="suggestions-prev p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronLeft className="w-4 h-4 text-gray-600" />
                </button>
                <button className="suggestions-next p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed">
                  <ChevronRight className="w-4 h-4 text-gray-600" />
                </button>
              </div>
            </div>
          </div>
          <div className="relative">
            {suggestionsLoading && (
              <div className="text-center py-8 text-gray-500">Finding similar creators...</div>
            )}
            {!suggestionsLoading && suggestions.length === 0 && (
              <div className="text-center py-8 text-gray-500">No suggestions available at the moment.</div>
            )}
            {!suggestionsLoading && suggestions.length > 0 && (
              <Swiper
                modules={[Navigation]}
                spaceBetween={16}
                slidesPerView={1}
                navigation={{
                  prevEl: ".suggestions-prev",
                  nextEl: ".suggestions-next",
                }}
                breakpoints={{
                  640: { slidesPerView: 2 },
                  1024: { slidesPerView: 3 },
                }}
                className="suggestions-slider"
              >
                {suggestions.map((creator) => (
                  <SwiperSlide key={creator.id || creator._id}>
                    <CreatorCard
                      id={creator.id || creator._id}
                      username={creator.username || creator.personalInfo?.username || ''}
                      fullName={creator.name || creator.personalInfo?.username || ''}
                      avatar={creator.avatar || creator.personalInfo?.profileImage}
                      categories={creator.professionalInfo?.categories || []}
                      // level={creator.level || creator.professionalInfo?.title || ''}
                      description={creator.description || creator.descriptionFaq?.briefDescription || ''}
                      rating={creator.rating || creator.metrics?.ratings?.average || 0}
                      reviewCount={Array.isArray(creator.reviews) ? creator.reviews.length : (creator.reviews || creator.metrics?.ratings?.count || 0)}
                      startingPrice={creator.startingPrice || (creator.pricing?.basic?.price ? `₹${creator.pricing.basic.price}` : undefined)}
                      isLiked={false}
                      title={creator.title || creator.professionalInfo?.title || ''}
                      socialMedia={{
                        instagram: creator.socialMedia?.socialProfiles?.instagram?.url,
                        twitter: creator.socialMedia?.socialProfiles?.twitter?.url,
                        linkedin: creator.socialMedia?.socialProfiles?.linkedin?.url,
                        youtube: creator.socialMedia?.socialProfiles?.youtube?.url,
                        facebook: creator.socialMedia?.socialProfiles?.facebook?.url,
                      }}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            )}
          </div>
        </section>
      </div>
      {/* After the main profile content, add the related creators section */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <section className="mb-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            {selectedTag
              ? `Related Creators for #${selectedTag}`
              : `Related Creators in ${creator?.professionalInfo?.categories?.[0] || 'this category'}`}
          </h2>
          {selectedTag ? (
            tagRelatedLoading ? (
              <div className="text-center py-8 text-gray-500">Loading related creators...</div>
            ) : tagRelatedCreators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No related creators found for this tag.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {tagRelatedCreators.map((c) => (
                  <div
                    key={c.username}
                    className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                    onClick={() => router.push(`/creator/${c.username.replace(/^@/, "")}`)}
                  >
                    <img
                      src={c.avatar || c.personalInfo?.profileImage}
                      alt={c.name || c.personalInfo?.fullName || c.username}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{c.name || c.personalInfo?.fullName || c.username}</h3>
                    <p className="text-xs text-gray-500 mb-1">@{c.username}</p>
                    <p className="text-xs text-purple-600 mb-1">{c.category || c.professionalInfo?.categories?.[0]}</p>
                    <p className="text-xs text-gray-500">{c.professionalInfo?.title}</p>
                  </div>
                ))}
              </div>
            )
          ) : (
            relatedLoading ? (
              <div className="text-center py-8 text-gray-500">Loading related creators...</div>
            ) : relatedCreators.length === 0 ? (
              <div className="text-center py-8 text-gray-500">No related creators found.</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {relatedCreators.map((c) => (
                  <div
                    key={c.username}
                    className="bg-white rounded-xl shadow-md p-4 flex flex-col items-center cursor-pointer hover:shadow-lg transition"
                    onClick={() => router.push(`/creator/${c.username.replace(/^@/, "")}`)}
                  >
                    <img
                      src={c.avatar || c.personalInfo?.profileImage}
                      alt={c.name || c.personalInfo?.fullName || c.username}
                      className="w-20 h-20 rounded-full object-cover mb-3"
                    />
                    <h3 className="font-semibold text-gray-900 text-lg mb-1">{c.name || c.personalInfo?.fullName || c.username}</h3>
                    <p className="text-xs text-gray-500 mb-1">{c.username}</p>
                    <p className="text-xs text-purple-600 mb-1">{c.category || c.professionalInfo?.categories?.[0]}</p>
                    <p className="text-xs text-gray-500">{c.professionalInfo?.title}</p>
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </div>
      </DashboardLayout>
    </div>
  );
}