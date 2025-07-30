'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { getCreatorByUsername } from '../../../services/api';
import Link from 'next/link';
import { 
  Star, 
  Heart, 
  Clock, 
  CheckCircle, 
  Share2, 
  Instagram, 
  Facebook, 
  Twitter, 
  Youtube, 
  Linkedin, 
  ChevronRight,
  MessageSquare,
  ExternalLink,
  Home,
  Briefcase,
  Image,
  Info,
  Mail,
  X,
  Send
} from 'lucide-react';

interface Creator {
  _id: string;
  personalInfo?: {
    fullName: string;
    username: string;
    bio: string;
    profileImage?: string;
  };
  basicInfo?: {
    title: string;
    category: string;
    subcategory?: string;
  };
  status: string;
  rating?: number;
  reviews?: number;
  socialInfo?: {
    instagram?: string;
    facebook?: string;
    twitter?: string;
    youtube?: string;
    linkedin?: string;
    website?: string;
    followersCount?: {
      instagram?: number;
      facebook?: number;
      twitter?: number;
      youtube?: number;
      linkedin?: number;
    };
  };
  description?: {
    brief?: string;
    detailed?: string;
  };
}

const formatNumber = (num?: number) => {
  if (!num) return '0';
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

// Add a Contact Form Modal component
const ContactModal = ({ isOpen, onClose, creatorName }: { isOpen: boolean, onClose: () => void, creatorName: string }) => {
  const [message, setMessage] = useState('');
  const [subject, setSubject] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !subject.trim()) {
      toast.error("Please fill out all fields");
      return;
    }

    setLoading(true);
    // Simulate sending a message
    setTimeout(() => {
      setLoading(false);
      toast.success("Message sent successfully!");
      // Reset form
      setMessage('');
      setSubject('');
      onClose();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-5 border-b flex justify-between items-center">
          <h3 className="text-lg font-bold">Contact {creatorName}</h3>
          <button 
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-5">
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Enter subject"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">Message</label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Type your message here..."
              required
            ></textarea>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-purple-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center ${
              loading ? 'opacity-70 cursor-not-allowed' : 'hover:bg-purple-700'
            }`}
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Send Message
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Update the SocialIcon component to make it clickable
const SocialIcon = ({ platform, followers, url }: { platform: string; followers?: number; url?: string }) => {
  const icons = {
    instagram: <Instagram className="w-6 h-6 text-pink-500" />,
    facebook: <Facebook className="w-6 h-6 text-blue-600" />,
    twitter: <Twitter className="w-6 h-6 text-blue-400" />,
    youtube: <Youtube className="w-6 h-6 text-red-600" />,
    linkedin: <Linkedin className="w-6 h-6 text-blue-700" />
  };

  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1);
  const defaultUrls = {
    instagram: `https://instagram.com/`,
    facebook: `https://facebook.com/`,
    twitter: `https://twitter.com/`,
    youtube: `https://youtube.com/`,
    linkedin: `https://linkedin.com/`
  };
  
  const handleClick = () => {
    if (!url) return;
    window.open(url, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <div 
      className={`flex items-center p-4 bg-white rounded-lg shadow-sm ${url ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      onClick={url ? handleClick : undefined}
    >
      <div className="mr-4">
        {icons[platform as keyof typeof icons]}
      </div>
      <div>
        <p className="text-gray-800 font-bold">{formatNumber(followers)}</p>
        <p className="text-xs text-gray-500">{followers === 1 ? 'Follower' : 'Followers'}</p>
      </div>
      {url && (
        <div className="ml-auto">
          <ExternalLink className="w-4 h-4 text-gray-400" />
        </div>
      )}
    </div>
  );
};

// Update the main component to include the new features
const CreatorProfileContainer = ({ children }: { children: React.ReactNode }) => {
  const params = useParams();
  const username = params?.username as string;
  
  const [creator, setCreator] = useState<Creator | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [currentSocialSlide, setCurrentSocialSlide] = useState(0);

  useEffect(() => {
    const fetchCreator = async () => {
      setLoading(true);
      try {
        const response = await getCreatorByUsername(username);
        if (response && response.data) {
          console.log('Creator data:', response.data);
          setCreator(response.data);
        } else {
          setError(response.error || 'Creator not found');
        }
      } catch (error) {
        console.error('Error fetching creator:', error);
        setError('Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchCreator();
    }
  }, [username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600 border-solid"></div>
      </div>
    );
  }

  if (error || !creator) {
    return (
      <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-md">
        <div className="text-center p-4">
          <p className="text-red-600">{error || 'Creator not found'}</p>
        </div>
      </div>
    );
  }

  // Mock data for social media presence if not available
  const mockSocialCounts = {
    instagram: 680000,
    facebook: 13900000,
    twitter: 12000000,
    youtube: 100000,
    linkedin: 21200000
  };

  // Use real data if available, otherwise use mock data
  const socialMediaFollowers = {
    instagram: creator.socialInfo?.followersCount?.instagram || mockSocialCounts.instagram,
    facebook: creator.socialInfo?.followersCount?.facebook || mockSocialCounts.facebook,
    twitter: creator.socialInfo?.followersCount?.twitter || mockSocialCounts.twitter,
    youtube: creator.socialInfo?.followersCount?.youtube || mockSocialCounts.youtube,
    linkedin: creator.socialInfo?.followersCount?.linkedin || mockSocialCounts.linkedin
  };

  // Prepare social media URLs
  const socialMediaUrls = {
    instagram: creator.socialInfo?.instagram ? `https://instagram.com/${creator.socialInfo.instagram}` : undefined,
    facebook: creator.socialInfo?.facebook ? `https://facebook.com/${creator.socialInfo.facebook}` : undefined,
    twitter: creator.socialInfo?.twitter ? `https://twitter.com/${creator.socialInfo.twitter}` : undefined,
    youtube: creator.socialInfo?.youtube ? `https://youtube.com/${creator.socialInfo.youtube}` : undefined,
    linkedin: creator.socialInfo?.linkedin ? `https://linkedin.com/in/${creator.socialInfo.linkedin}` : undefined
  };

  const sidebarLinks = [
    { name: 'Overview', icon: <Home className="w-5 h-5" />, active: true },
    { name: 'Services', icon: <Briefcase className="w-5 h-5" /> },
    { name: 'Portfolio', icon: <Image className="w-5 h-5" /> },
    { name: 'Reviews', icon: <Star className="w-5 h-5" /> },
    { name: 'About', icon: <Info className="w-5 h-5" /> },
    { name: 'Contact', icon: <Mail className="w-5 h-5" /> },
  ];

  // Handle contact button click
  const handleContactClick = () => {
    setContactModalOpen(true);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Fixed Sidebar - Visible on all pages */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white shadow-lg z-30 transition-transform duration-300 transform translate-x-0">
        <div className="h-full flex flex-col">
          {/* Sidebar Header with Logo */}
          <div className="px-6 py-5 border-b border-gray-200 flex items-center justify-between">
            <div className="text-xl font-bold text-purple-700">CreatorPlatform</div>
            {/* Mobile close button would go here */}
          </div>
          
          {/* User Profile Section */}
          <div className="p-5 border-b border-gray-200">
            <div className="flex items-center">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-purple-600 mr-3">
                {creator.personalInfo?.profileImage ? (
                  <img 
                    src={creator.personalInfo.profileImage} 
                    alt={creator.personalInfo?.fullName} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white font-bold text-xl">
                    {(creator.personalInfo?.fullName || username || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{creator.personalInfo?.fullName || 'Creator'}</h3>
                <p className="text-xs text-gray-500">
                  @{
                    creator.personalInfo?.username
                      ? creator.personalInfo.username
                      : (creator.personalInfo?.fullName || 'No username set')
                  }
                </p>
              </div>
            </div>
          </div>
          
          {/* Navigation Links */}
          <nav className="flex-1 overflow-y-auto p-4">
            <div className="space-y-1">
              {sidebarLinks.map((link, index) => (
                <a 
                  key={index} 
                  href={`#${link.name.toLowerCase()}`}
                  className={`flex items-center px-4 py-3 rounded-lg transition-all ${
                    link.active 
                      ? 'bg-gradient-to-r from-purple-50 to-purple-100 text-purple-800 font-medium border-l-4 border-purple-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-purple-700'
                  }`}
                >
                  <span className="mr-3">{link.icon}</span>
                  {link.name}
                </a>
              ))}
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Social Media
              </h4>
              <div className="mt-3 space-y-1">
                {Object.entries(socialMediaUrls).map(([platform, url]) => 
                  url && (
                    <a 
                      key={platform}
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-purple-700 rounded-lg"
                    >
                      {platform === 'instagram' && <Instagram className="w-5 h-5 mr-3 text-pink-500" />}
                      {platform === 'facebook' && <Facebook className="w-5 h-5 mr-3 text-blue-600" />}
                      {platform === 'twitter' && <Twitter className="w-5 h-5 mr-3 text-blue-400" />}
                      {platform === 'youtube' && <Youtube className="w-5 h-5 mr-3 text-red-600" />}
                      {platform === 'linkedin' && <Linkedin className="w-5 h-5 mr-3 text-blue-700" />}
                      {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </a>
                  )
                )}
              </div>
            </div>
          </nav>
          
          {/* Bottom Action Button */}
          <div className="p-4 border-t border-gray-200">
            <button 
              onClick={handleContactClick}
              className="w-full bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 px-4 rounded-lg hover:from-purple-700 hover:to-purple-800 transition-all shadow-sm flex items-center justify-center"
            >
              <MessageSquare className="w-5 h-5 mr-2" />
              Contact Creator
            </button>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex-1 overflow-y-auto ml-64">
        {/* Banner with profile info */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-40 sm:h-48 md:h-56 bg-gray-200">
            <img 
              src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2070" 
              alt="Cover" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Profile Info */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 sm:-mt-16 relative pb-12">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between">
              <div className="flex items-center">
                {/* Profile Image */}
                <div className="w-24 h-24 rounded-full bg-white p-1 shadow-lg z-10">
                  {creator.personalInfo?.profileImage ? (
                    <img 
                      src={creator.personalInfo.profileImage} 
                      alt={creator.personalInfo?.fullName} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-purple-600 text-white rounded-full text-2xl font-bold">
                      {(creator.personalInfo?.fullName || username || 'A').charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <div className="ml-4 pt-4 sm:pt-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-2xl font-bold text-gray-900">{creator.personalInfo?.fullName || 'Creator'}</h1>
                    {creator.status === 'published' && (
                      <span className="flex items-center text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full text-sm">
                        <CheckCircle className="w-4 h-4 mr-1" /> Verified
                      </span>
                    )}
                  </div>
                  
                  <div className="text-gray-500 mt-1">{creator.basicInfo?.category || 'Creator'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Children will render here - can be different for each page */}
          {children}
        </div>
      </div>
      
      {/* Contact Form Modal */}
      <ContactModal 
        isOpen={contactModalOpen} 
        onClose={() => setContactModalOpen(false)} 
        creatorName={creator.personalInfo?.fullName || 'Creator'}
      />
    </div>
  );
};

export default CreatorProfileContainer; 