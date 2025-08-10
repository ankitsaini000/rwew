'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Instagram, Youtube, Twitter, Facebook, Linkedin, Globe, Plus, Trash2, RefreshCw, Link as LinkIcon, ChevronDown } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Button } from '../ui/button';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { getSocialMediaPreferences } from '../../services/api';

// Component for Facebook/Instagram connection button
const FacebookInstagramConnectButton = ({ 
  onSuccess, 
  isConnecting = false,
  setIsConnecting
}: { 
  onSuccess: (data: any) => void; 
  isConnecting?: boolean;
  setIsConnecting?: (state: boolean) => void;
}) => {
  const handleConnect = () => {
    // Set connecting state
    if (setIsConnecting) {
      setIsConnecting(true);
    }
    
    // Store the intent to redirect back to social media page after auth
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialMediaRedirect', 'true');
    }
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first to connect your social media accounts');
      return;
    }
    
    // Redirect to Facebook auth with Instagram permission and token
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';
    // Ensure we don't have duplicate /api in the URL
    const baseAuthUrl = apiBaseUrl.endsWith('/api') 
      ? `${apiBaseUrl}/social-media/facebook-instagram-auth`
      : `${apiBaseUrl}/api/social-media/facebook-instagram-auth`;
    
    // Add token as query parameter for authentication
    const authUrl = `${baseAuthUrl}?token=${encodeURIComponent(token)}`;
    
    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center px-3 py-2 text-sm bg-[#4267B2] text-white rounded hover:bg-[#365899] transition-colors"
    >
      {isConnecting ? (
        <>
          <span className="animate-spin mr-2">
            <RefreshCw className="h-4 w-4" />
          </span>
          Connecting...
        </>
      ) : (
        <>
          <Facebook className="h-4 w-4 mr-2" />
          Connect Instagram via Facebook
        </>
      )}
    </button>
  );
};

// Component for YouTube connection button
const YouTubeConnectButton = ({ 
  onSuccess, 
  isConnecting = false,
  setIsConnecting
}: { 
  onSuccess: (data: any) => void; 
  isConnecting?: boolean;
  setIsConnecting?: (state: boolean) => void;
}) => {
  const handleConnect = () => {
    // Set connecting state
    if (setIsConnecting) {
      setIsConnecting(true);
    }
    
    // Store the intent to redirect back to social media page after auth
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialMediaRedirect', 'true');
    }
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first to connect your social media accounts');
      return;
    }
    
    // Redirect to YouTube auth with token
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';
    // Ensure we don't have duplicate /api in the URL
    const baseAuthUrl = apiBaseUrl.endsWith('/api') 
      ? `${apiBaseUrl}/social-media/youtube-auth`
      : `${apiBaseUrl}/api/social-media/youtube-auth`;
    
    // Add token as query parameter for authentication
    const authUrl = `${baseAuthUrl}?token=${encodeURIComponent(token)}`;
    
    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center px-3 py-2 text-sm bg-[#FF0000] text-white rounded hover:bg-[#CC0000] transition-colors"
    >
      {isConnecting ? (
        <>
          <span className="animate-spin mr-2">
            <RefreshCw className="h-4 w-4" />
          </span>
          Connecting...
        </>
      ) : (
        <>
          <Youtube className="h-4 w-4 mr-2" />
          Connect YouTube
        </>
      )}
    </button>
  );
};

// Component for Twitter connection button
const TwitterConnectButton = ({ 
  onSuccess, 
  isConnecting = false,
  setIsConnecting
}: { 
  onSuccess: (data: any) => void; 
  isConnecting?: boolean;
  setIsConnecting?: (state: boolean) => void;
}) => {
  const handleConnect = () => {
    // Set connecting state
    if (setIsConnecting) {
      setIsConnecting(true);
    }
    
    // Store the intent to redirect back to social media page after auth
    if (typeof window !== 'undefined') {
      localStorage.setItem('socialMediaRedirect', 'true');
    }
    
    // Get the authentication token
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login first to connect your social media accounts');
      return;
    }
    
    // Redirect to Twitter auth with token
    const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';
    // Ensure we don't have duplicate /api in the URL
    const baseAuthUrl = apiBaseUrl.endsWith('/api') 
      ? `${apiBaseUrl}/social-media/twitter-auth`
      : `${apiBaseUrl}/api/social-media/twitter-auth`;
    
    // Add token as query parameter for authentication
    const authUrl = `${baseAuthUrl}?token=${encodeURIComponent(token)}`;
    
    window.location.href = authUrl;
  };

  return (
    <button
      type="button"
      onClick={handleConnect}
      disabled={isConnecting}
      className="flex items-center px-3 py-2 text-sm bg-[#1DA1F2] text-white rounded hover:bg-[#1A91DA] transition-colors"
    >
      {isConnecting ? (
        <>
          <span className="animate-spin mr-2">
            <RefreshCw className="h-4 w-4" />
          </span>
          Connecting...
        </>
      ) : (
        <>
          <Twitter className="h-4 w-4 mr-2" />
          Connect Twitter
        </>
      )}
    </button>
  );
};

export const CreatorSocialMedia = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    website: '',
    instagram: '',
    instagramHandle: '',
    instagramFollowers: 0,
    twitter: '',
    twitterHandle: '',
    twitterFollowers: 0,
    facebook: '',
    facebookHandle: '',
    facebookFollowers: 0,
    linkedin: '',
    linkedinHandle: '',
    linkedinConnections: 0,
    youtube: '',
    youtubeHandle: '',
    youtubeSubscribers: 0,
    other: [] as { platform: string; url: string }[],
    totalReach: 0,
    primaryPlatform: '',
    ageRanges: [] as string[],
    topCountries: [] as string[],
    malePercentage: 0,
    femalePercentage: 0,
    otherPercentage: 0
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [followerCounts, setFollowerCounts] = useState({
    instagram: '',
    youtube: '',
    twitter: '',
    facebook: '',
    linkedin: '',
    other: {} as Record<string, string>
  });
  
  // LinkedIn follower range options
  const linkedinFollowerRanges = [
    { label: 'Less than 500', value: '0-500', displayValue: 500 },
    { label: '500 - 1,000', value: '500-1000', displayValue: 1000 },
    { label: '1,000 - 5,000', value: '1000-5000', displayValue: 5000 },
    { label: '5,000 - 10,000', value: '5000-10000', displayValue: 10000 },
    { label: '10,000 - 50,000', value: '10000-50000', displayValue: 50000 },
    { label: '50,000 - 100,000', value: '50000-100000', displayValue: 100000 },
    { label: 'More than 100,000', value: '100000+', displayValue: 100000 }
  ];
  
  // Selected LinkedIn follower range
  const [selectedLinkedinRange, setSelectedLinkedinRange] = useState('');
  const [isConnectingInstagram, setIsConnectingInstagram] = useState(false);
  const [instagramConnected, setInstagramConnected] = useState(false);
  const [isConnectingYouTube, setIsConnectingYouTube] = useState(false);
  const [youtubeConnected, setYoutubeConnected] = useState(false);
  const [isConnectingTwitter, setIsConnectingTwitter] = useState(false);
  const [twitterConnected, setTwitterConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [facebookConnected, setFacebookConnected] = useState(false);
  const [linkedinConnected, setLinkedinConnected] = useState(false);
  const [socialMediaPreferences, setSocialMediaPreferences] = useState<{ name: string; code: string }[]>([]);

  // Fetch connected accounts on mount and after any connect
  const fetchConnectedAccounts = async () => {
    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://rwew.onrender.com/api';
      const baseApiUrl = apiBaseUrl.endsWith('/api') 
        ? `${apiBaseUrl}/social-media/accounts`
        : `${apiBaseUrl}/api/social-media/accounts`;
      const token = localStorage.getItem('token');
      const res = await fetch(baseApiUrl, {
        headers: { 'Authorization': `Bearer ${token}` },
        credentials: 'include',
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.accounts)) {
        setInstagramConnected(!!data.accounts.find((a: any) => a.platform === 'instagram' && a.connected));
        setYoutubeConnected(!!data.accounts.find((a: any) => a.platform === 'youtube' && a.connected));
        setTwitterConnected(!!data.accounts.find((a: any) => a.platform === 'twitter' && a.connected));
        setFacebookConnected(!!data.accounts.find((a: any) => a.platform === 'facebook' && a.connected));
        setLinkedinConnected(!!data.accounts.find((a: any) => a.platform === 'linkedin' && a.connected));
        // Update formData for usernames and followers
        const insta = data.accounts.find((a: any) => a.platform === 'instagram');
        if (insta) {
          setFormData(prev => ({ ...prev, instagram: insta.username || '', instagramFollowers: insta.followerCount || 0 }));
          setFollowerCounts(prev => ({ ...prev, instagram: insta.followerCount ? insta.followerCount.toString() : '' }));
        }
        const tw = data.accounts.find((a: any) => a.platform === 'twitter');
        if (tw) {
          setFormData(prev => ({ ...prev, twitter: tw.username || '', twitterFollowers: tw.followerCount || 0 }));
          setFollowerCounts(prev => ({ ...prev, twitter: tw.followerCount ? tw.followerCount.toString() : '' }));
        }
        const yt = data.accounts.find((a: any) => a.platform === 'youtube');
        if (yt) {
          setFormData(prev => ({ ...prev, youtube: yt.username || '', youtubeSubscribers: yt.followerCount || 0 }));
          setFollowerCounts(prev => ({ ...prev, youtube: yt.followerCount ? yt.followerCount.toString() : '' }));
        }
        const fb = data.accounts.find((a: any) => a.platform === 'facebook');
        if (fb) {
          setFormData(prev => ({ ...prev, facebook: fb.username || '', facebookFollowers: fb.followerCount || 0 }));
          setFollowerCounts(prev => ({ ...prev, facebook: fb.followerCount ? fb.followerCount.toString() : '' }));
        }
        const li = data.accounts.find((a: any) => a.platform === 'linkedin');
        if (li) {
          setFormData(prev => ({ ...prev, linkedin: li.username || '', linkedinConnections: li.followerCount || 0 }));
          setFollowerCounts(prev => ({ ...prev, linkedin: li.followerCount ? li.followerCount.toString() : '' }));
        }
      }
    } catch (err) {
      // Optionally log error
    }
  };

  useEffect(() => {
    fetchConnectedAccounts();
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
    
    // Check if redirected back from Facebook auth
    if (typeof window !== 'undefined') {
      const hasRedirect = localStorage.getItem('socialMediaRedirect');
      
      // Clear Instagram connecting state if it was set
      if (isConnectingInstagram) {
        setIsConnectingInstagram(false);
      }
      
      const urlParams = new URLSearchParams(window.location.search);
      const errorParam = urlParams.get('error');
      const instagramDataParam = urlParams.get('instagramData');
      const youtubeDataParam = urlParams.get('youtubeData');
      const twitterDataParam = urlParams.get('twitterData');
      const successParam = urlParams.get('success');
      
      // Handle Instagram data from URL parameters (new approach to avoid CSP issues)
      if (hasRedirect && instagramDataParam && successParam === 'true') {
        try {
          // Clear the redirect flag
          localStorage.removeItem('socialMediaRedirect');
          
          // Parse the Instagram data from URL
          const data = JSON.parse(decodeURIComponent(instagramDataParam));
          
          // Debug log to see what is received from Facebook/Instagram
          console.log('[Instagram Connect Callback] Received data:', data);
          
          // Always set the Instagram username if present in the data object
          if (data && typeof data.username === 'string') {
            setFormData(prev => {
              const updated = { ...prev, instagram: data.username };
              console.log('[DEBUG] setFormData from Instagram callback:', updated);
              return updated;
            });
          }
          // Update follower count if available
          if (data && data.followerCount) {
            setFollowerCounts(prev => ({
              ...prev,
              instagram: data.followerCount.toString()
            }));
          }
          setInstagramConnected(true);
          toast.success('Instagram account connected successfully!');
          // Clean up URL parameters
          window.history.replaceState({}, document.title, '/creator-setup/social-media');
        } catch (err) {
          console.error('Error processing Instagram data from URL:', err);
          toast.error('Failed to connect Instagram account');
        }
      }
      
      // Handle YouTube data from URL parameters
      if (hasRedirect && youtubeDataParam && successParam === 'true') {
        try {
          // Clear the redirect flag
          localStorage.removeItem('socialMediaRedirect');
          
          // Parse the YouTube data from URL
          const data = JSON.parse(decodeURIComponent(youtubeDataParam));
          
          // Debug log to see what is received from YouTube
          console.log('[YouTube Connect Callback] Received data:', data);
          
          // Set the YouTube channel title if present in the data object
          if (data && typeof data.username === 'string') {
            setFormData(prev => {
              const updated = { ...prev, youtube: data.username };
              console.log('[DEBUG] setFormData from YouTube callback:', updated);
              return updated;
            });
          }
          // Update subscriber count if available
          if (data && data.subscriberCount) {
            setFollowerCounts(prev => ({
              ...prev,
              youtube: data.subscriberCount.toString()
            }));
          }
          setYoutubeConnected(true);
          toast.success('YouTube account connected successfully!');
          // Clean up URL parameters
          window.history.replaceState({}, document.title, '/creator-setup/social-media');
        } catch (err) {
          console.error('Error processing YouTube data from URL:', err);
          toast.error('Failed to connect YouTube account');
        }
      }
      
      // Handle Twitter data from URL parameters
      if (hasRedirect && twitterDataParam && successParam === 'true') {
        try {
          // Clear the redirect flag
          localStorage.removeItem('socialMediaRedirect');
          
          // Parse the Twitter data from URL
          const data = JSON.parse(decodeURIComponent(twitterDataParam));
          
          // Twitter data received from callback
          
          // Set the Twitter username if present in the data object
          if (data && typeof data.username === 'string') {
            setFormData(prev => {
              const updated = { ...prev, twitter: data.username };
              // Update form data from Twitter callback
              return updated;
            });
          }
          // Update follower count if available
          if (data && data.followerCount) {
            setFollowerCounts(prev => ({
              ...prev,
              twitter: data.followerCount.toString()
            }));
          }
          setTwitterConnected(true);
          toast.success('Twitter account connected successfully!');
          // Clean up URL parameters
          window.history.replaceState({}, document.title, '/creator-setup/social-media');
        } catch (err) {
          console.error('Error processing Twitter data from URL:', err);
          toast.error('Failed to connect Twitter account');
        }
      }
      
      // Handle error cases
      else if (errorParam) {
        localStorage.removeItem('socialMediaRedirect');
        let errorMessage = 'Instagram connection failed.';
        
        switch(errorParam) {
          case 'auth_failed':
            errorMessage = 'Authentication failed. Please try again.';
            break;
          case 'no_access_token':
            errorMessage = 'Could not retrieve access token.';
            break;
          case 'no_pages':
            errorMessage = 'No Facebook pages found. You need a Facebook page linked to your Instagram business account.';
            break;
          case 'no_instagram_account':
            errorMessage = 'No Instagram business account connected to your Facebook page.';
            break;
          case 'no_youtube_channel':
            errorMessage = 'No YouTube channel found. Please make sure you have a YouTube channel.';
            break;
          case 'instagram_info_failed':
            errorMessage = 'Failed to retrieve your Instagram account information.';
            break;
          case 'youtube_info_failed':
            errorMessage = 'Failed to retrieve your YouTube channel information.';
            break;
          case 'instagram_processing_failed':
            errorMessage = 'Error processing Instagram data.';
            break;
          case 'youtube_processing_failed':
            errorMessage = 'Error processing YouTube data.';
            break;
          case 'no_twitter_account':
            errorMessage = 'No Twitter account found. Please make sure you have a Twitter account.';
            break;
          case 'twitter_info_failed':
            errorMessage = 'Failed to retrieve your Twitter account information.';
            break;
          case 'twitter_processing_failed':
            errorMessage = 'Error processing Twitter data.';
            break;
          case 'no_code_verifier':
            errorMessage = 'Authentication session expired. Please try connecting again.';
            break;
          case 'server_error':
            errorMessage = 'Server error occurred while connecting to social media.';
            break;
          case 'twitter_account_already_connected':
            errorMessage = 'This Twitter account is already linked to another user.';
            break;
          case 'instagram_account_already_connected':
            errorMessage = 'Instagram already linked with this account.';
            break;
          case 'facebook_account_already_connected':
            errorMessage = 'Facebook already linked with this account.';
            break;
        }
        
        setIsConnectingInstagram(false);
        setIsConnectingYouTube(false);
        setIsConnectingTwitter(false);
        toast.error(errorMessage);
        
        // Clean up URL parameters
        window.history.replaceState({}, document.title, '/creator-setup/social-media');
      }
    }
    
    // Try to load existing data if available
    const userDataString = localStorage.getItem('userData');
    if (userDataString) {
      try {
        const userData = JSON.parse(userDataString);
        if (userData.socialMedia) {
          setFormData(prev => {
            // Only set from localStorage if instagram is not already set (prevents overwriting after connect)
            if (prev.instagram) {
              return prev;
            }
            // --- Extract username from URL for Instagram ---
            let igUsername = userData.socialMedia.instagram || '';
            if (igUsername.startsWith('http')) {
              const parts = igUsername.split('/').filter(Boolean);
              igUsername = parts[parts.length - 1] || igUsername;
            }
            const updated = { ...prev, ...userData.socialMedia, instagram: igUsername };
            // Update form data from localStorage
            return updated;
          });
          if (userData.socialMedia.followerCounts) {
            setFollowerCounts(userData.socialMedia.followerCounts);
          }
          // Check if Instagram is connected
          if (userData.socialMedia.instagramConnected) {
            setInstagramConnected(true);
          }
        }
      } catch (err) {
        console.error("Error parsing user data:", err);
      }
    }

    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        // Fetch existing profile data from backend
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          if (response.status === 404) {
            // Profile doesn't exist yet, that's okay
            setIsLoading(false);
            return;
          }
          throw new Error('Failed to fetch profile data');
        }

        const data = await response.json();
        // Profile data fetched

        if (data.success && data.data) {
          const profile = data.data;
          
          // Prefill form data if it exists
          if (profile.socialMedia) {
            const socialMedia = profile.socialMedia;
            const newFormData = {
              website: socialMedia.socialProfiles?.website?.url || '',
              instagram: socialMedia.socialProfiles?.instagram?.url || '',
              instagramHandle: socialMedia.socialProfiles?.instagram?.handle || '',
              instagramFollowers: socialMedia.socialProfiles?.instagram?.followers || 0,
              youtube: socialMedia.socialProfiles?.youtube?.url || '',
              youtubeHandle: socialMedia.socialProfiles?.youtube?.handle || '',
              youtubeSubscribers: socialMedia.socialProfiles?.youtube?.subscribers || 0,
              twitter: socialMedia.socialProfiles?.twitter?.url || '',
              twitterHandle: socialMedia.socialProfiles?.twitter?.handle || '',
              twitterFollowers: socialMedia.socialProfiles?.twitter?.followers || 0,
              facebook: socialMedia.socialProfiles?.facebook?.url || '',
              facebookHandle: socialMedia.socialProfiles?.facebook?.handle || '',
              facebookFollowers: socialMedia.socialProfiles?.facebook?.followers || 0,
              linkedin: socialMedia.socialProfiles?.linkedin?.url || '',
              linkedinHandle: socialMedia.socialProfiles?.linkedin?.handle || '',
              linkedinConnections: socialMedia.socialProfiles?.linkedin?.connections || 0,
              other: [], // Initialize empty other array
              totalReach: socialMedia.totalReach || 0,
              primaryPlatform: socialMedia.primaryPlatform || '',
              ageRanges: socialMedia.audienceDemographics?.ageRanges || [],
              topCountries: socialMedia.audienceDemographics?.topCountries || [],
              malePercentage: socialMedia.audienceDemographics?.genderBreakdown?.male || 0,
              femalePercentage: socialMedia.audienceDemographics?.genderBreakdown?.female || 0,
              otherPercentage: socialMedia.audienceDemographics?.genderBreakdown?.other || 0
            };
            // Update form data from backend fetch
            setFormData(prev => ({
              ...newFormData,
              instagram: prev.instagram || newFormData.instagram
            }));
          }
        }
      } catch (err) {
        console.error("Error fetching profile data:", err);
        // Don't show error toast as this might be a new user
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []); // Empty dependency array means this runs once on mount
  
  const updateSocialProfile = (platform: keyof typeof formData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [platform]: value
    }));
  };
  
  const updateFollowerCount = (platform: keyof typeof followerCounts, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setFollowerCounts(prev => ({
      ...prev,
      [platform]: numericValue
    }));
  };
  
  // Handle LinkedIn follower range selection
  const handleLinkedinRangeSelect = (rangeValue: string) => {
    setSelectedLinkedinRange(rangeValue);
    
    // Extract the display value from the selected range
    const selectedRange = linkedinFollowerRanges.find(range => range.value === rangeValue);
    if (selectedRange) {
      // Update the follower count with the display value
      setFollowerCounts(prev => ({
        ...prev,
        linkedin: selectedRange.displayValue.toString()
      }));
    }
  };
  
  const handleAddOtherPlatform = () => {
    setFormData(prev => ({
      ...prev,
      other: [...prev.other, { platform: '', url: '' }]
    }));
  };
  
  const updateOtherPlatform = (index: number, field: 'platform' | 'url', value: string) => {
    const updatedOther = [...formData.other];
    updatedOther[index] = { ...updatedOther[index], [field]: value };
    setFormData(prev => ({
      ...prev,
      other: updatedOther
    }));
  };
  
  const updateOtherFollowerCount = (platform: string, value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/[^0-9]/g, '');
    
    setFollowerCounts(prev => ({
      ...prev,
      other: {
        ...prev.other,
        [platform]: numericValue
      }
    }));
  };
  
  const removeOtherPlatform = (index: number) => {
    const platformName = formData.other[index].platform;
    
    setFormData(prev => ({
      ...prev,
      other: prev.other.filter((_, i) => i !== index)
    }));
    
    // Also remove follower count if exists
    if (platformName && followerCounts.other && followerCounts.other[platformName]) {
      const newOtherCounts = { ...followerCounts.other };
      delete newOtherCounts[platformName];
      
      setFollowerCounts(prev => ({
        ...prev,
        other: newOtherCounts
      }));
    }
  };
  
  const validateUrl = (url: string) => {
    if (!url) return true; // Empty is fine
    
    // Simple URL validation
    try {
      const parsedUrl = new URL(url);
      return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:';
    } catch (e) {
      return false;
    }
  };

  // Utility to normalize Instagram username to full URL with www
  function getInstagramUrl(username: string) {
    if (!username) return '';
    // Remove protocol, www, slashes, and @
    let clean = username.trim()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .replace(/^instagram\.com\//, '')
      .replace(/^@/, '')
      .replace(/\/$/, '');
    return `https://www.instagram.com/${clean}`;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!formData.primaryPlatform) {
      setError("Please select your primary platform");
      toast.error("Primary platform is required");
      return;
    }
    
    if (!formData.instagram && !formData.twitter && !formData.facebook && !formData.linkedin && !formData.youtube) {
      setError("Please provide at least one social media profile");
      toast.error("At least one social media profile is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    // Check if at least one social media profile is filled
    const hasAnyProfile = !!(formData.instagram || formData.twitter || formData.facebook || formData.linkedin || formData.youtube);
    const completionStatus = hasAnyProfile;
    // Set social media completion status

    // Prepare update data (do not overwrite other completionStatus fields)
    let prevCompletion = {};
    try {
      const prevRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (prevRes.ok) {
        const prevJson = await prevRes.json();
        prevCompletion = prevJson.data?.completionStatus || {};
      }
    } catch {}

    // --- FIX: Calculate totalReach from all platforms ---
    const totalReach =
      (parseInt(followerCounts.instagram) || 0) +
      (parseInt(followerCounts.youtube) || 0) +
      (parseInt(followerCounts.twitter) || 0) +
      (parseInt(followerCounts.facebook) || 0) +
      (parseInt(followerCounts.linkedin) || 0);

    // --- Build full Instagram URL for backend ---
    const instagramUrl = formData.instagram ? getInstagramUrl(formData.instagram) : '';

    const updateData = {
      socialMedia: {
        socialProfiles: {
          instagram: {
            url: instagramUrl,
            handle: formData.instagramHandle || '',
            followers: parseInt(followerCounts.instagram) || 0
          },
          youtube: {
            url: formData.youtube || '',
            handle: formData.youtubeHandle || '',
            subscribers: parseInt(followerCounts.youtube) || 0
          },
          twitter: {
            url: formData.twitter || '',
            handle: formData.twitterHandle || '',
            followers: parseInt(followerCounts.twitter) || 0
          },
          facebook: {
            url: formData.facebook || '',
            handle: formData.facebookHandle || '',
            followers: parseInt(followerCounts.facebook) || 0
          },
          linkedin: {
            url: formData.linkedin || '',
            handle: formData.linkedinHandle || '',
            connections: parseInt(followerCounts.linkedin) || 0
          },
          website: {
            url: formData.website || ''
          }
        },
        totalReach: totalReach, // <-- use calculated value
        primaryPlatform: formData.primaryPlatform || '',
        audienceDemographics: {
          ageRanges: formData.ageRanges || [],
          topCountries: formData.topCountries || [],
          genderBreakdown: {
            male: formData.malePercentage || 0,
            female: formData.femalePercentage || 0,
            other: formData.otherPercentage || 0
          }
        }
      },
      completionStatus: {
        ...prevCompletion,
        socialMedia: completionStatus
      },
      onboardingStep: 'pricing'
    };

    // Prepare update data for submission

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      // Process update response

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      // Show success message
      toast.success('Social media information saved successfully!');
      
      // Redirect to the next step
      router.push('/creator-setup/pricing');
    } catch (error: any) {
      console.error('Error saving social media information:', error);
      setError(error.message || 'Failed to save social media information. Please try again.');
      toast.error(error.message || 'Failed to save social media information. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstagramConnectSuccess = (data: any) => {
    if (data && data.username) {
      setFormData(prev => ({
        ...prev,
        instagram: data.username
      }));
      
      if (data.followerCount) {
        setFollowerCounts(prev => ({
          ...prev,
          instagram: data.followerCount.toString()
        }));
      }
      
      setInstagramConnected(true);
      setIsConnectingInstagram(false);
      toast.success('Instagram account connected successfully!');
      fetchConnectedAccounts();
    }
  };

  const handleYouTubeConnectSuccess = (data: any) => {
    if (data && data.username) {
      setFormData(prev => ({
        ...prev,
        youtube: data.username
      }));
      
      if (data.subscriberCount) {
        setFollowerCounts(prev => ({
          ...prev,
          youtube: data.subscriberCount.toString()
        }));
      }
      
      setYoutubeConnected(true);
      setIsConnectingYouTube(false);
      toast.success('YouTube account connected successfully!');
      fetchConnectedAccounts();
    }
  };

  const handleTwitterConnectSuccess = (data: any) => {
    if (data && data.username) {
      setFormData(prev => ({
        ...prev,
        twitter: data.username
      }));
      
      if (data.followerCount) {
        setFollowerCounts(prev => ({
          ...prev,
          twitter: data.followerCount.toString()
        }));
      }
      
      setTwitterConnected(true);
      setIsConnectingTwitter(false);
      toast.success('Twitter account connected successfully!');
      fetchConnectedAccounts();
    }
  };

  // Helper function to format URLs correctly
  const formatUrlForPlatform = (url: string, platform: string) => {
    if (!url) return '';
    
    // If the URL already has a protocol, return it as is
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Add the appropriate prefix based on the platform
    switch (platform) {
      case 'instagram':
        return `https://instagram.com/${url.replace('@', '')}`;
      case 'twitter':
        return `https://twitter.com/${url.replace('@', '')}`;
      case 'facebook':
        return `https://facebook.com/${url}`;
      case 'youtube':
        return `https://youtube.com/${url}`;
      case 'linkedin':
        return `https://linkedin.com/in/${url}`;
      default:
        return `https://${url}`;
    }
  };

  // Store formData and followerCounts in localStorage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('creatorSocialMediaFormData', JSON.stringify(formData));
      localStorage.setItem('creatorSocialMediaFollowerCounts', JSON.stringify(followerCounts));
    }
  }, [formData, followerCounts]);

  // Fetch social media preferences on component mount
  useEffect(() => {
    const fetchSocialMediaPreferences = async () => {
      const prefs = await getSocialMediaPreferences();
      setSocialMediaPreferences(prefs);
    };
    fetchSocialMediaPreferences();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <OnboardingProgressBar currentStep={4} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Social Media Profiles</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Connect your social media accounts to showcase your online presence.
            This helps brands understand your reach and engagement across platforms.
          </p>
        </div>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                For each platform, you can provide either your profile URL (e.g., https://instagram.com/yourusername) 
                or just your username (e.g., @yourusername). Adding follower counts helps brands assess your reach.
              </p>
            </div>
            
            {/* Primary Platform */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Primary Platform <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.primaryPlatform}
                onChange={(e) => setFormData(prev => ({ ...prev, primaryPlatform: e.target.value }))}
                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
              >
                <option value="">Select Primary Platform</option>
                {socialMediaPreferences.map((p) => (
                  <option key={p.code} value={p.code}>{p.name}</option>
                ))}
              </select>
            </div>
            
            {/* Instagram */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Instagram className="w-5 h-5 mr-2 text-pink-500" />
                  Instagram
                  {instagramConnected && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  )}
                </label>
                {instagramConnected && formData.instagram && (
                  <div className="ml-1 mt-1 text-sm text-blue-700 font-semibold flex items-center gap-2">
                    <span>Username:</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded">
                      @{(() => {
                        // If it's a URL, extract the username part
                        const val = formData.instagram.trim();
                        if (val.startsWith('http')) {
                          const parts = val.split('/').filter(Boolean);
                          return parts[parts.length - 1] || val;
                        }
                        return val.replace(/^@/, '');
                      })()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => updateSocialProfile('instagram', e.target.value.replace(/^@/, '').replace(/^https?:\/\/(www\.)?instagram\.com\//, ''))}
                    placeholder="Instagram username"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <FacebookInstagramConnectButton
                    onSuccess={handleInstagramConnectSuccess}
                    isConnecting={isConnectingInstagram}
                    setIsConnecting={setIsConnectingInstagram}
                  />
                </div>
                {instagramConnected && (
                  <p className="text-xs text-green-600">
                    Instagram account connected. Follower count verified from your profile.
                  </p>
                )}
                {/* Debug information removed */}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Followers
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.instagram}
                    onChange={(e) => updateFollowerCount('instagram', e.target.value)}
                    placeholder="e.g. 10000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
                      instagramConnected ? 'bg-gray-50' : ''
                    }`}
                    readOnly={instagramConnected}
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.instagram).toLocaleString()} followers
                  </span>
                </div>
                {instagramConnected && (
                  <p className="text-xs text-gray-500">This count was verified via Facebook</p>
                )}
              </div>
            </div>
            
            {/* Youtube */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Youtube className="w-5 h-5 mr-2 text-red-500" />
                  YouTube
                  {youtubeConnected && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  )}
                </label>
                {youtubeConnected && formData.youtube && (
                  <div className="ml-1 mt-1 text-sm text-blue-700 font-semibold flex items-center gap-2">
                    <span>Channel:</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded">
                      {formData.youtube}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.youtube}
                    onChange={(e) => updateSocialProfile('youtube', e.target.value)}
                    placeholder="Channel URL or username"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
                      youtubeConnected ? 'bg-gray-50' : ''
                    }`}
                    readOnly={youtubeConnected}
                  />
                  <YouTubeConnectButton
                    onSuccess={handleYouTubeConnectSuccess}
                    isConnecting={isConnectingYouTube}
                    setIsConnecting={setIsConnectingYouTube}
                  />
                </div>
                {youtubeConnected && (
                  <p className="text-xs text-green-600">
                    YouTube account connected. Subscriber count verified from your channel.
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Subscribers
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.youtube}
                    onChange={(e) => updateFollowerCount('youtube', e.target.value)}
                    placeholder="e.g. 5000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
                      youtubeConnected ? 'bg-gray-50' : ''
                    }`}
                    readOnly={youtubeConnected}
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.youtube).toLocaleString()} subs
                  </span>
                </div>
                {youtubeConnected && (
                  <p className="text-xs text-gray-500">This count was verified via YouTube API</p>
                )}
              </div>
            </div>
            
            {/* Twitter */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Twitter className="w-5 h-5 mr-2 text-blue-400" />
                  Twitter / X
                  {twitterConnected && (
                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                      <LinkIcon className="w-3 h-3 mr-1" />
                      Connected
                    </span>
                  )}
                </label>
                {twitterConnected && formData.twitter && (
                  <div className="ml-1 mt-1 text-sm text-blue-700 font-semibold flex items-center gap-2">
                    <span>Username:</span>
                    <span className="bg-blue-50 px-2 py-0.5 rounded">
                      @{(() => {
                        // If it's a URL, extract the username part
                        const val = formData.twitter.trim();
                        if (val.startsWith('http')) {
                          const parts = val.split('/').filter(Boolean);
                          return parts[parts.length - 1] || val;
                        }
                        return val.replace(/^@/, '');
                      })()}
                    </span>
                  </div>
                )}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.twitter}
                    onChange={(e) => updateSocialProfile('twitter', e.target.value)}
                    placeholder="@username or full URL"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
                      twitterConnected ? 'bg-gray-50' : ''
                    }`}
                    readOnly={twitterConnected}
                  />
                  <TwitterConnectButton
                    onSuccess={handleTwitterConnectSuccess}
                    isConnecting={isConnectingTwitter}
                    setIsConnecting={setIsConnectingTwitter}
                  />
                </div>
                {twitterConnected && (
                  <p className="text-xs text-green-600">
                    Twitter account connected. Follower count verified from your profile.
                  </p>
                )}
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Followers
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.twitter}
                    onChange={(e) => updateFollowerCount('twitter', e.target.value)}
                    placeholder="e.g. 8000"
                    className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all ${
                      twitterConnected ? 'bg-gray-50' : ''
                    }`}
                    readOnly={twitterConnected}
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.twitter).toLocaleString()} followers
                  </span>
                </div>
                {twitterConnected && (
                  <p className="text-xs text-gray-500">This count was verified via Twitter API</p>
                )}
              </div>
            </div>
            
            {/* Facebook */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Facebook className="w-5 h-5 mr-2 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="text"
                  value={formData.facebook}
                  onChange={(e) => updateSocialProfile('facebook', e.target.value)}
                  placeholder="Page URL or username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Followers / Likes
                </label>
                <div className="flex">
                  <input
                    type="text"
                    value={followerCounts.facebook}
                    onChange={(e) => updateFollowerCount('facebook', e.target.value)}
                    placeholder="e.g. 15000"
                    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                  />
                  <span className="ml-2 flex items-center text-gray-500 text-sm">
                    {parseInt(followerCounts.facebook).toLocaleString()} likes
                  </span>
                </div>
              </div>
            </div>
            
            {/* LinkedIn */}
            <div className="grid md:grid-cols-5 gap-4 items-center">
              <div className="md:col-span-3 space-y-2">
                <label className="flex items-center text-sm font-medium text-gray-700">
                  <Linkedin className="w-5 h-5 mr-2 text-blue-700" />
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => updateSocialProfile('linkedin', e.target.value)}
                  placeholder="Profile URL or username"
                  className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all"
                />
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Connections Range
                </label>
                <div className="flex flex-col">
                  <div className="relative">
                    <select
                      value={selectedLinkedinRange}
                      onChange={(e) => handleLinkedinRangeSelect(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all appearance-none"
                    >
                      <option value="">Select a range</option>
                      {linkedinFollowerRanges.map((range) => (
                        <option key={range.value} value={range.value}>
                          {range.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown className="h-4 w-4" />
                    </div>
                  </div>
                  <span className="mt-1 text-gray-500 text-sm">
                    {parseInt(followerCounts.linkedin).toLocaleString()} connections
                  </span>
                </div>
              </div>
            </div>
            
            {/* Other platforms */}
            <div className="mt-8 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Other Platforms</h3>
                <button 
                  type="button"
                  onClick={handleAddOtherPlatform}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-1" /> Add Platform
                </button>
              </div>
              
              {formData.other.length > 0 ? (
                <div className="space-y-6">
                  {formData.other.map((platform, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center p-4 bg-gray-50 rounded-lg border border-gray-100 relative">
                      <button 
                        type="button" 
                        onClick={() => removeOtherPlatform(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      
                      <div className="col-span-12 md:col-span-3 space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Platform Name
                        </label>
                        <input
                          type="text"
                          value={platform.platform}
                          onChange={(e) => updateOtherPlatform(index, 'platform', e.target.value)}
                          placeholder="e.g. TikTok"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      
                      <div className="col-span-12 md:col-span-5 space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Profile URL
                        </label>
                        <input
                          type="text"
                          value={platform.url}
                          onChange={(e) => updateOtherPlatform(index, 'url', e.target.value)}
                          placeholder="https://platform.com/username"
                          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                        />
                      </div>
                      
                      <div className="col-span-12 md:col-span-4 space-y-1">
                        <label className="block text-xs font-medium text-gray-700">
                          Followers
                        </label>
                        <div className="flex">
                          <input
                            type="text"
                            value={platform.platform && followerCounts.other && followerCounts.other[platform.platform] || ''}
                            onChange={(e) => updateOtherFollowerCount(platform.platform, e.target.value)}
                            placeholder="e.g. 5000"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 transition-all text-sm"
                            disabled={!platform.platform}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 bg-gray-50 rounded-lg border border-gray-100 text-center">
                  <p className="text-gray-500">No other platforms added. Click the button above to add more platforms.</p>
                </div>
              )}
            </div>
            
            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center ${
                  isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Continue'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};