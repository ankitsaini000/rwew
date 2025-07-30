import React, { useState, useEffect } from 'react';
import { getCreatorByUsername } from '@/services/api';
import toast from 'react-hot-toast';
import { Star, Users, Clock, ArrowRight, Check, Share2, Instagram, Facebook, Twitter, Youtube, Linkedin, Heart, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useLikeStore } from '@/store/likeStore';
import { useMessageStore } from '@/store/messageStore';
import { useRouter } from 'next/navigation';

const CreatorProfileContainer = ({ username }: { username: string }) => {
  const router = useRouter();
  const [creatorData, setCreatorData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isLikeAnimating, setIsLikeAnimating] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactMessage, setContactMessage] = useState('');

  // Get like and message store functions
  const { isLiked, addLike, removeLike } = useLikeStore();
  const { addMessage } = useMessageStore();
  
  // Check if creator is liked - needs a proper useEffect to handle deps
  // Replace simple variable with state to ensure reactivity
  const [creatorIsLiked, setCreatorIsLiked] = useState(false);

  // Update liked status whenever creator data changes
  useEffect(() => {
    if (creatorData) {
      const liked = isLiked(username);
      console.log(`Is creator ${username} liked?`, liked);
      setCreatorIsLiked(liked);
    }
  }, [creatorData, isLiked, username]);

  // Debug and initialize stores in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const likeStorage = localStorage.getItem('liked-creators-storage');
      const messageStorage = localStorage.getItem('messages-storage');
      
      console.log('Likes localStorage data:', likeStorage ? JSON.parse(likeStorage) : 'Not found');
      console.log('Messages localStorage data:', messageStorage ? JSON.parse(messageStorage) : 'Not found');
    }
  }, []);

  const loadCreatorProfile = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await getCreatorByUsername(username);
      
      if (response && response.data) {
        setCreatorData(response.data);
      } else {
        setError(response.error || 'Failed to load creator profile');
      }
    } catch (err: any) {
      console.error(`Error loading creator profile for ${username}:`, err);
      setError(err.message || 'An unexpected error occurred');
      
      // Try to use any cached data we might have
      const cachedProfile = localStorage.getItem(`creator_${username}`);
      if (cachedProfile) {
        try {
          const parsedProfile = JSON.parse(cachedProfile);
          setCreatorData(parsedProfile);
          // Show a warning toast that we're using cached data
          toast.error('Using cached profile data. Some information may not be up to date.');
          setError(null);
        } catch (parseErr) {
          console.error('Error parsing cached profile:', parseErr);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCreatorProfile();
  }, [username]);

  // Social media platforms with real links and followers exactly matching the image
  const socialPlatforms = [
    { 
      name: 'Instagram', 
      followers: '24.6M', 
      type: 'followers',
      icon: <Instagram className="w-5 h-5" />,
      color: 'bg-pink-100',
      textColor: 'text-pink-600',
      iconColor: 'text-pink-600',
      url: 'https://instagram.com/bbkivines' 
    },
    { 
      name: 'Facebook', 
      followers: '9.9M', 
      type: 'followers',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-blue-100',
      textColor: 'text-blue-600',
      iconColor: 'text-blue-600',
      url: 'https://facebook.com' 
    },
    { 
      name: 'Twitter', 
      followers: '22.9M', 
      type: 'followers',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-sky-100',
      textColor: 'text-sky-500',
      iconColor: 'text-sky-500',
      url: 'https://twitter.com' 
    },
    { 
      name: 'YouTube', 
      followers: '1.5M', 
      type: 'subscribers',
      icon: <Youtube className="w-5 h-5" />,
      color: 'bg-red-100',
      textColor: 'text-red-600',
      iconColor: 'text-red-600',
      url: 'https://youtube.com' 
    },
    { 
      name: 'LinkedIn', 
      followers: '11.9M', 
      type: 'connections',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-700',
      url: 'https://linkedin.com' 
    }
  ];

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      name: 'Alex K.',
      title: 'Senior Analyst',
      rating: 5,
      date: 'Jan 20, 2024',
      comment: `Working with Sam-AI has been an incredible journey so far. The technology we're building is truly cutting edge, and being a part of a team that's revolutionizing how people achieve their goals is immensely fulfilling.`
    },
    {
      id: 2,
      name: 'Emily R.',
      title: 'Front-End Engineer',
      rating: 4,
      date: 'Nov 12, 2023',
      comment: `Sam-AI is not just a workplace; it's a community of passionate individuals driven by a common goal of helping others succeed.`
    },
    {
      id: 3,
      name: 'Michael S.',
      title: 'Product Manager',
      rating: 5,
      date: 'Dec 15, 2023',
      comment: `The attention to detail and commitment to quality is exceptional. Every project is handled with utmost professionalism.`
    }
  ];

  // Package features for pricing section
  const packageFeatures = [
    'Sponsored Content',
    'Targeted Reach',
    'Dynamic transitions',
    'Flexibility', 
    'Loyalty Programs',
    'Creative Content'
  ];

  // Portfolio items for past works
  const portfolioItems = [
    { id: 1, image: '/images/portfolio-1.jpg', alt: 'Web Dashboard' },
    { id: 2, image: '/images/portfolio-2.jpg', alt: 'Analytics Dashboard' },
    { id: 3, image: '/images/portfolio-3.jpg', alt: 'Mobile App' },
    { id: 4, image: '/images/portfolio-4.jpg', alt: 'Gaming Setup' },
    { id: 5, image: '/images/portfolio-5.jpg', alt: 'Team Meeting' },
    { id: 6, image: '/images/portfolio-6.jpg', alt: 'Social Media Content' }
  ];

  // Handle like/unlike
  const handleLikeToggle = () => {
    if (!creatorData) return;
    
    setIsLikeAnimating(true);
    setTimeout(() => setIsLikeAnimating(false), 300);
    
    if (creatorIsLiked) {
      removeLike(username);
      // Update state immediately for UI feedback
      setCreatorIsLiked(false);
      toast.success(
        <div className="flex flex-col">
          <span>Removed from your liked creators</span>
          <button 
            className="text-xs underline text-left mt-1"
            onClick={() => router.push('/likes')}
          >
            View all liked creators
          </button>
        </div>
      );
    } else {
      const creatorToAdd = {
        creatorId: username,
        creatorName: creatorData.name || 'Creator Name',
        creatorAvatar: creatorData.profileImage || 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4',
        creatorCategory: creatorData.category || 'Entertainment',
      };
      
      console.log('Adding creator to likes:', creatorToAdd);
      addLike(creatorToAdd);
      
      // Update state immediately for UI feedback
      setCreatorIsLiked(true);
      
      toast.success(
        <div className="flex flex-col">
          <span>Added to your liked creators</span>
          <button 
            className="text-xs underline text-left mt-1"
            onClick={() => router.push('/likes')}
          >
            View all liked creators
          </button>
        </div>
      );
    }
  };

  // Handle contact
  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!contactMessage.trim()) {
      toast.error('Please enter a message');
      return;
    }
    
    // Add message to store
    const newMessage = {
      creatorId: username,
      creatorName: creatorData?.name || 'Creator Name',
      creatorAvatar: creatorData?.profileImage || 'https://images.unsplash.com/photo-1531891437562-4301cf35b7e4',
      subject: 'New contact request',
      content: contactMessage,
      senderType: 'user' as 'user',
      source: 'contact' as 'contact',
    };
    
    console.log('Sending new message:', newMessage);
    addMessage(newMessage);
    
    // Close modal and reset
    setContactMessage('');
    setShowContactModal(false);
    
    // Show success toast with link to messages
    toast.success(
      <div className="flex flex-col">
        <span>Message sent successfully</span>
        <button 
          className="text-xs underline text-left mt-1"
          onClick={() => router.push('/messages')}
        >
          View in messages
        </button>
      </div>
    );
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]">
      <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
    </div>;
  }

  if (error) {
    return <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
      <div className="text-center p-4">
        <p className="text-red-600">{error}</p>
      </div>
    </div>;
  }

  return (
    <div className="w-full bg-gray-50">
      {/* Hero Banner Section */}
      <div className="w-full bg-white rounded-b-3xl shadow-sm overflow-hidden mb-6">
        {/* Banner Image */}
        <div className="h-48 w-full relative bg-gradient-to-r from-gray-800 to-gray-700">
          <img 
            src="https://source.unsplash.com/random/1200x400/?studio,creative" 
            alt="Profile Banner" 
            className="w-full h-full object-cover mix-blend-overlay opacity-60"
          />
          
          {/* Seller Level Badges */}
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <div className="bg-purple-800/40 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 mr-1 text-white" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span className="text-white text-xs font-medium">Level 2 Seller</span>
            </div>
            <div className="bg-purple-600 rounded-full px-3 py-1.5">
              <span className="text-white text-xs font-medium">Top Rated</span>
            </div>
          </div>
        </div>

        {/* Profile Info Section */}
        <div className="px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center sm:items-start justify-between relative">
          {/* Profile Image and Name */}
          <div className="flex flex-col sm:flex-row items-center text-center sm:text-left sm:items-end -mt-12 sm:-mt-16">
            <div className="h-24 w-24 sm:h-32 sm:w-32 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg mb-3 sm:mb-0 z-10">
              <img 
                src="https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?ixlib=rb-1.2.1&auto=format&fit=crop&w=256&q=80" 
                alt="Bhuvan Bam" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="sm:ml-4">
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Bhuvan Bam</h1>
              <p className="text-sm sm:text-base text-gray-600">Entertainment / Comedy</p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex mt-4 sm:mt-0 space-x-2">
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-full text-sm font-medium flex items-center"
              onClick={() => setShowContactModal(true)}
            >
              <MessageCircle className="h-4 w-4 mr-1.5" />
              Contact Me
            </button>
            <button className="border border-gray-300 text-gray-700 p-2 rounded-full hover:bg-gray-50">
              <Share2 className="h-4 w-4" />
            </button>
            <button 
              className={`border ${creatorIsLiked ? 'border-red-200 bg-red-50 text-red-500' : 'border-gray-300 text-gray-700'} p-2 rounded-full hover:bg-gray-50 relative overflow-hidden`}
              onClick={handleLikeToggle}
            >
              <Heart 
                className={`h-4 w-4 transform transition-transform ${isLikeAnimating ? 'animate-heartPulse' : 'scale-100'}`} 
                fill={creatorIsLiked ? 'currentColor' : 'none'} 
              />
              {isLikeAnimating && (
                <span className="absolute inset-0 animate-ping bg-red-400 rounded-full opacity-20"></span>
              )}
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="flex flex-wrap border-t border-gray-100 mt-2">
          <div className="flex items-center px-4 py-3 border-r border-gray-100">
            <Star className="h-5 w-5 text-yellow-400 mr-1.5" fill="currentColor" />
            <span className="font-bold text-gray-900">4.9</span>
            <span className="text-gray-500 ml-1 text-sm">(902)</span>
          </div>
          <div className="flex items-center px-4 py-3 border-r border-gray-100">
            <span className="text-purple-600 font-medium text-sm">Top 1%</span>
          </div>
          <div className="flex items-center px-4 py-3 border-r border-gray-100">
            <span className="text-gray-900 font-bold">3</span>
            <span className="text-gray-500 ml-1 text-sm">Orders in Queue</span>
          </div>
          <div className="flex items-center px-4 py-3">
            <span className="text-gray-900 font-bold">24.6M</span>
            <span className="text-gray-500 ml-1 text-sm">avg./platform</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Main Content Column */}
          <div className="lg:w-2/3 space-y-6">
            {/* Social Media Presence */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h2 className="text-lg font-semibold text-gray-800">Social Media Presence</h2>
                <div className="text-purple-600 font-medium flex items-center">
                  <span className="text-sm">54.6M Total Followers</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {socialPlatforms.map((platform, index) => (
                  <a 
                    key={index} 
                    href={platform.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-gray-100 hover:border-gray-200 rounded-lg p-3 hover:shadow-sm transition group"
                  >
                    <div className="flex items-center">
                      <div className={`w-10 h-10 rounded-full ${platform.color} flex items-center justify-center ${platform.iconColor} mr-3`}>
                        {platform.icon}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">{platform.name}</p>
                        <p className={`font-bold ${platform.textColor} text-sm`}>{platform.followers} <span className="text-xs font-normal text-gray-500">{platform.type}</span></p>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
            
            {/* About Us Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">About Us</h2>
              <p className="text-gray-700 text-sm leading-relaxed">
                At Ariuslesoft Premium Digital Studio we create all kinds of creative videos, specializing in Creating 
                Promot Website, Apps, Fashion, Real Estate, Youtube, NFT, and all other promos and all instructional
                videos.
              </p>
            </div>
            
            {/* Reviews Section */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Reviews</h2>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <Star className="h-4 w-4 text-yellow-400 mr-1" fill="currentColor" />
                    <span className="font-medium text-gray-700 text-sm">4.7</span>
                    <span className="text-gray-500 text-xs ml-1">(578 Reviews)</span>
                  </div>
                  <div className="relative">
                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 pl-3 pr-8 rounded-md text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>Most Recent</option>
                      <option>Highest Rated</option>
                      <option>Lowest Rated</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="space-y-5">
                {reviews.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-5 last:border-b-0 last:pb-0">
                    <div className="flex items-start">
                      <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold overflow-hidden mr-3 flex-shrink-0">
                        {review.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{review.name}</p>
                            <p className="text-xs text-gray-500">{review.title}</p>
                          </div>
                          <div className="text-xs text-gray-500">{review.date}</div>
                        </div>
                        <div className="flex mt-1 mb-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star 
                              key={star} 
                              fill={star <= review.rating ? "currentColor" : "none"} 
                              className="h-3 w-3 text-yellow-400" 
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-700">{review.comment}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <button className="mt-4 text-purple-600 text-sm font-medium flex items-center mx-auto">
                View All Reviews <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
            
            {/* Past Works */}
            <div className="bg-white rounded-xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Past Works</h2>
                <div className="flex items-center">
                  <div className="relative">
                    <select className="appearance-none bg-gray-50 border border-gray-200 text-gray-700 py-1 pl-3 pr-8 rounded-md text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500">
                      <option>All Categories</option>
                      <option>Websites</option>
                      <option>Mobile Apps</option>
                      <option>Marketing</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">Recent projects and collaborations</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                  <img src="https://source.unsplash.com/random/600x400/?dashboard,laptop" alt="Work Sample" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                  <img src="https://source.unsplash.com/random/600x400/?analytics,data" alt="Work Sample" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                  <img src="https://source.unsplash.com/random/600x400/?mobile,app" alt="Work Sample" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                  <img src="https://source.unsplash.com/random/600x400/?gaming,setup" alt="Work Sample" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                  <img src="https://source.unsplash.com/random/600x400/?meeting,business" alt="Work Sample" className="w-full h-full object-cover" />
                </div>
                <div className="rounded-lg overflow-hidden shadow-sm h-48 bg-gray-200">
                  <img src="https://source.unsplash.com/random/600x400/?social,media" alt="Work Sample" className="w-full h-full object-cover" />
                </div>
              </div>
              
              <button className="mt-6 text-purple-600 text-sm font-medium flex items-center mx-auto">
                Load More Works <ArrowRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
          
          {/* Sidebar Column */}
          <div className="lg:w-1/3 space-y-6">
            {/* Pricing Section */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="border-b border-gray-100">
                <div className="flex text-center">
                  <button 
                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'basic' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('basic')}
                  >
                    Basic
                  </button>
                  <button 
                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'standard' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('standard')}
                  >
                    Standard
                  </button>
                  <button 
                    className={`flex-1 px-4 py-3 text-sm font-medium ${activeTab === 'premium' ? 'bg-purple-50 text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveTab('premium')}
                  >
                    Premium
                  </button>
                </div>
              </div>
              
              <div className="p-5">
                <h3 className="text-base font-bold text-gray-900 mb-1">BASIC PROMO</h3>
                <div className="text-2xl font-bold text-gray-900 mb-4">₹868</div>
                
                <p className="text-sm text-gray-700 mb-4">
                  Basic Package Only Laptop-scenes includes Background Music, Logo, and 720HD Video
                </p>
                
                <div className="space-y-3 mb-5">
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 mr-3 flex-shrink-0">
                      <Clock className="h-3 w-3 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-700">14 Days Delivery</p>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center bg-gray-100 mr-3 flex-shrink-0">
                      <ArrowRight className="h-3 w-3 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-700">1 Revision</p>
                  </div>
                  
                  {packageFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center bg-purple-100 mr-3 flex-shrink-0">
                        <Check className="h-3 w-3 text-purple-600" />
                      </div>
                      <p className="text-sm text-gray-700">{feature}</p>
                    </div>
                  ))}
                </div>
                
                <button 
                  className="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full text-sm font-medium flex items-center justify-center"
                  onClick={() => {
                    console.log(`Continue button clicked for creator: ${username}, package: ${activeTab}`);
                    window.location.href = `/checkout?creatorId=${username}&packageType=${activeTab}`;
                  }}
                >
                  Continue <ArrowRight className="h-4 w-4 ml-1" />
                </button>
                
                <button className="w-full text-blue-600 text-sm font-medium mt-3">
                  Compare Packages
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-base font-bold text-purple-600 mb-3">App Logo</h3>
              <p className="text-sm text-gray-600 mb-4">Connecting influential creators with brands to create amazing content.</p>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">About Us</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">Services</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">Blog</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base font-bold text-gray-900 mb-3">Support</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">Help Center</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">Terms of Service</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">Privacy Policy</a></li>
                <li><a href="#" className="text-sm text-gray-600 hover:text-purple-600">FAQ</a></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <p className="text-sm text-gray-500 mb-4 md:mb-0">© 2024 Your Company. All rights reserved.</p>
              
              <div className="w-full md:w-auto">
                <div className="flex items-center max-w-md mx-auto md:mx-0 bg-gray-50 rounded-lg p-1 border border-gray-200">
                  <input 
                    type="email" 
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent border-none text-sm px-3 py-2 focus:outline-none text-gray-700"
                  />
                  <button className="bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md px-4 py-2">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 relative animate-fadeIn">
            <button 
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowContactModal(false)}
            >
              ✕
            </button>
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Contact {creatorData?.name || 'Creator'}</h2>
              <p className="text-gray-600 mt-1 text-sm">Send a message to start a conversation</p>
            </div>
            
            <form onSubmit={handleContactSubmit}>
              <div className="mb-4">
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Message
                </label>
                <textarea
                  id="message"
                  rows={5}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-700"
                  placeholder="Write your message here..."
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="button"
                  className="px-4 py-2 text-gray-600 mr-2"
                  onClick={() => setShowContactModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorProfileContainer; 