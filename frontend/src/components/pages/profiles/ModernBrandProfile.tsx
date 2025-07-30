import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Camera, MapPin, Link2, Edit2, Eye, Star, MessageCircle, Briefcase, Facebook, Instagram, Twitter, Linkedin, ExternalLink, DollarSign, Users, Award, Shield, Mail, Phone, FileText, FileBadge, CheckCircle, AlertCircle, CreditCard } from "lucide-react";
import Link from "next/link";

// Define the API base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

// Interface for form data
interface BrandProfileFormData {
  name: string;
  username: string;
  about: string;
  establishedYear: string;
  industry: string;
  website: string;
  location: {
    country: string;
    city: string;
    state?: string;
    address?: string;
    postalCode?: string;
  };
  contactInfo: {
    email: string;
    phone: string;
    contactPerson?: string;
  };
  socialMedia: {
    instagram: string;
    facebook: string;
    twitter: string;
    linkedin: string;
    youtube?: string;
    tiktok?: string;
  };
  brandValues: string[];
  profileImage: string;
  coverImage: string;
  isVerified: boolean;
  metrics: {
    totalSpend: number;
    averageRating: number;
    reviewCount: number;
    profileViews: number;
    totalCampaigns: number;
    totalCreators: number;
    followersCount: number;
  };
  campaigns?: string[];
  opportunities?: string[];
  status?: string;
  openToNetworking: boolean;
  openToAdvising: boolean;
  marketingInterests: string[];
  createdAt?: string;
}

interface ModernBrandProfileProps {
  profileData?: BrandProfileFormData; // Make profileData optional, and type it correctly
}

const ModernBrandProfile: React.FC<ModernBrandProfileProps> = ({ profileData }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<BrandProfileFormData>({
    name: '',
    username: '',
    about: '',
    establishedYear: '',
    industry: '',
    website: '',
    location: {
      country: '',
      city: '',
    },
    contactInfo: {
      email: '',
      phone: '',
    },
    socialMedia: {
      instagram: '',
      twitter: '',
      linkedin: '',
      facebook: '',
    },
    brandValues: [],
    profileImage: '',
    coverImage: '',
    isVerified: false,
    metrics: {
      totalSpend: 0,
      averageRating: 0,
      reviewCount: 0,
      profileViews: 0,
      totalCampaigns: 0,
      totalCreators: 0,
      followersCount: 0,
    },
    openToNetworking: false,
    openToAdvising: false,
    marketingInterests: [],
  });
  const [notification, setNotification] = useState<{
    show: boolean;
    type: 'success' | 'error';
    message: string;
  }>({
    show: false,
    type: 'success',
    message: '',
  });
  const [isLoading, setIsLoading] = useState(true);
  const [newBrandValue, setNewBrandValue] = useState('');
  const [newMarketingInterest, setNewMarketingInterest] = useState('');
  const [verificationStatus, setVerificationStatus] = useState<any>(null);
  const [verificationLoading, setVerificationLoading] = useState(true);

  // Default data for demonstration if no API data or profileData is provided
  const defaultProfileData: BrandProfileFormData = {
    name: 'John Smith',
    username: 'john_smith',
    about: 'I\’m the model of the new CMO. I\’ve combined a deep background in brand management at blue chip CPG companies with eCommerce growth marketing at the world\’s biggest retailer. I\’ve run SingleFire I\’ve created world-class campaigns; I\’ve built digital marketing organizations from the ground up. I have over 20 years\’ experience leading teams…',
    establishedYear: 'Oxford International',
    industry: '',
    website: '',
    location: {
      country: 'NY',
      city: 'Virginia',
    },
    contactInfo: {
      email: 'jhon@contact.com',
      phone: '',
      contactPerson: '',
    },
    socialMedia: {
      instagram: 'john_smith',
      facebook: 'john.smith',
      twitter: 'john_smith',
      linkedin: 'john_smith',
    },
    brandValues: ['#leadership', '#advertising', '#public-relations', '#branding'],
    profileImage: 'https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png',
    coverImage: '',
    isVerified: true,
    metrics: {
      totalSpend: 150000,
      averageRating: 4.8,
      reviewCount: 0,
      profileViews: 0,
      totalCampaigns: 0,
      totalCreators: 0,
      followersCount: 12500,
    },
    openToNetworking: true,
    openToAdvising: true,
    marketingInterests: ['#event-marketing', '#performance-marketing', '#account-based-marketing'],
  };

  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const token = localStorage.getItem('token');
        console.log('Token:', token); // Debug log

        if (!token) {
          console.log("No token found, initializing with default data.");
          setFormData(profileData || defaultProfileData);
          setIsLoading(false);
          return;
        }

        let userNameFromProfile = ""; // Declare userNameFromProfile here
        let fullNameFromProfile = ""; // Declare fullNameFromProfile here

        // Fetch user data first to get fullName and username
        try {
          console.log('Attempting to fetch user profile...'); // Debug log
          const userResponse = await axios.get(`${API_BASE_URL}/users/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          console.log('User profile fetch response:', userResponse.data); // Debug log
          const { fullName, username } = userResponse.data;

          console.log('Fetched User Full Name:', fullName); // New Debug log
          console.log('Fetched User Username:', username); // New Debug log

          // Update formData with user's fullName and username
          setFormData(prevData => ({
            ...prevData,
            name: fullName || prevData.name,
            username: username || prevData.username,
          }));

          // Store these values temporarily for potential profile creation
          userNameFromProfile = username;
          fullNameFromProfile = fullName;

        } catch (error: any) {
          console.error('Error fetching user profile:', error.response || error);
          // Handle error, e.g., show a notification or use default values
        }

        // Then try to get the brand profile
        try {
          console.log('Attempting to fetch brand profile...'); // Debug log
          const response = await axios.get(`${API_BASE_URL}/brand-profiles`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });

          console.log('Profile fetch response:', response.data); // Debug log

          if (response.data) {
            setFormData(prevData => ({
              ...prevData,
              ...response.data,
              // Ensure fullName and username from user profile take precedence if available
              name: prevData.name || response.data.name,
              username: prevData.username || response.data.username,
            }));
          }
        } catch (error: any) {
          console.log('Error response:', error.response); // Debug log
          
          // If profile doesn't exist (404), create one
          if (error.response?.status === 404) {
            console.log("Profile not found, creating new profile...");
            
            // Use the fetched fullName and username for creation if available, otherwise fallback to defaults
            const nameToCreate = fullNameFromProfile || "user"
            const usernameToCreate = userNameFromProfile || "username";
            
            console.log('Creating new profile with data:', { name: nameToCreate, username: usernameToCreate }); // Debug log
            console.log('Values for POST request - name:', nameToCreate, 'username:', usernameToCreate); // New Debug log
            const createResponse = await axios.post(
              `${API_BASE_URL}/brand-profiles`,
              {
                name: nameToCreate,
                username: usernameToCreate
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                },
              }
            );

            console.log('Profile creation response:', createResponse.data); // Debug log

            if (createResponse.data) {
              setFormData(prevData => ({
                ...prevData,
                ...createResponse.data,
                // Ensure fullName and username from user profile take precedence if available
                name: prevData.name || createResponse.data.name,
                username: prevData.username || createResponse.data.username,
              }));
            } else {
              throw new Error('Failed to create profile');
            }
          } else {
            throw error;
          }
        }

        // Fetch verification status
        const fetchVerificationStatus = async () => {
          setVerificationLoading(true);
          try {
            const token = localStorage.getItem('token');
            if (!token) return;
            const res = await fetch(`${API_BASE_URL}/brand-verification`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              const data = await res.json();
              setVerificationStatus(data.verification || data.data || null);
            }
          } catch (e) {
            setVerificationStatus(null);
          } finally {
            setVerificationLoading(false);
          }
        };
        fetchVerificationStatus();
      } catch (error) {
        console.error('Error with profile data:', error);
        setNotification({
          show: true,
          type: 'error',
          message: 'Failed to load or create profile data.'
        });
        setFormData(profileData || defaultProfileData);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, [profileData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [section, field] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...((prev as any)[section] || {}),
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleToggleChange = (field: 'openToNetworking' | 'openToAdvising') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const addBrandValue = () => {
    if (newBrandValue.trim() && !formData.brandValues.includes(newBrandValue.trim())) {
      setFormData(prev => ({
        ...prev,
        brandValues: [...prev.brandValues, newBrandValue.trim()],
      }));
      setNewBrandValue('');
    }
  };

  const removeBrandValue = (valueToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      brandValues: prev.brandValues.filter(value => value !== valueToRemove),
    }));
  };

  const addMarketingInterest = () => {
    if (newMarketingInterest.trim() && !formData.marketingInterests.includes(newMarketingInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        marketingInterests: [...prev.marketingInterests, newMarketingInterest.trim()],
      }));
      setNewMarketingInterest('');
    }
  };

  const removeMarketingInterest = (interestToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      marketingInterests: prev.marketingInterests.filter(interest => interest !== interestToRemove),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'profileImage' | 'coverImage') => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Please upload a valid image file (JPEG, PNG, GIF, or WebP)'
      });
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setNotification({
        show: true,
        type: 'error',
        message: 'Image size should be less than 5MB'
      });
      return;
    }

    try {
      setIsLoading(true);

      // Create form data for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET || '');
      
      // Add folder based on image type
      const folder = type === 'profileImage' ? 'profile_images' : 'cover_images';
      formData.append('folder', folder);

      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData,
        {
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / (progressEvent.total || 1));
            console.log(`Upload Progress: ${percentCompleted}%`);
          },
        }
      );

      console.log('Cloudinary response:', response.data);

      if (response.data && response.data.secure_url) {
        // Update local state with the Cloudinary URL
        setFormData(prev => ({
          ...prev,
          [type]: response.data.secure_url
        }));

        // Update the profile in your backend
        const token = localStorage.getItem('token');
        if (token) {
          try {
            await axios.put(
              `${API_BASE_URL}/users/profile`,
              {
                [type === 'profileImage' ? 'avatar' : 'coverImage']: response.data.secure_url
              },
              {
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json',
                },
              }
            );
          } catch (error) {
            console.error('Error updating profile with new image URL:', error);
          }
        }

        setNotification({
          show: true,
          type: 'success',
          message: 'Image uploaded successfully!'
        });
      } else {
        throw new Error('Invalid response from Cloudinary');
      }
    } catch (error: any) {
      console.error('Error uploading image:', error);
      let errorMessage = 'Failed to upload image. Please try again.';
      
      if (error.response) {
        console.error('Cloudinary error response:', error.response.data);
        errorMessage = error.response.data?.error?.message || errorMessage;
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      setNotification({
        show: true,
        type: 'error',
        message: errorMessage
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      // First, update the user profile with basic information
      try {
        await axios.put(
          `${API_BASE_URL}/users/profile`,
          {
            fullName: formData.name,
            username: formData.username,
            avatar: formData.profileImage
          },
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );
      } catch (error) {
        console.error('Error updating user profile:', error);
        throw new Error('Failed to update user profile');
      }

      // Then update the brand profile
      const payload = {
        ...formData,
        establishedYear: formData.establishedYear ? Number(formData.establishedYear) : undefined,
        metrics: {
          ...formData.metrics,
          totalSpend: Number(formData.metrics.totalSpend),
          averageRating: Number(formData.metrics.averageRating),
          reviewCount: Number(formData.metrics.reviewCount),
          profileViews: Number(formData.metrics.profileViews),
          totalCampaigns: Number(formData.metrics.totalCampaigns),
          totalCreators: Number(formData.metrics.totalCreators),
          followersCount: Number(formData.metrics.followersCount),
        },
        location: formData.location || {},
        contactInfo: formData.contactInfo || {},
        socialMedia: formData.socialMedia || {},
      };

      const response = await axios.post(
        `${API_BASE_URL}/brand-profiles`,
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        setNotification({
          show: true,
          type: 'success',
          message: 'Profile data saved successfully!',
        });
        setTimeout(() => setNotification({ show: false, type: 'success', message: '' }), 3000);
        setIsEditing(false);
      } else {
        throw new Error('Failed to save profile data');
      }
    } catch (error) {
      console.error('Error saving profile data:', error);
      setNotification({
        show: true,
        type: 'error',
        message: 'Failed to save profile data. Please try again.'
      });
      setTimeout(() => setNotification({ show: false, type: 'error', message: '' }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Notification Area */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-3 rounded-lg shadow-lg text-white transform transition-all duration-300 ${
          notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
        }`}>
          {notification.message}
        </div>
      )}

      {/* Cover Image Section */}
      <div className="relative h-48 md:h-64 rounded-b-3xl overflow-hidden bg-gradient-to-r from-blue-500 to-indigo-600">
        {formData.coverImage ? (
          <img
            src={formData.coverImage}
            alt="Cover"
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/60 to-indigo-800/60 backdrop-blur-md" />
        {formData.isVerified && (
          <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md text-white px-4 py-1.5 rounded-full flex items-center gap-1.5 border border-white/30 text-sm shadow-lg">
            <Award className="w-4 h-4" />
            <span className="font-medium">Verified Brand</span>
          </div>
        )}
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 relative">
        {/* Profile Header Card */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl -mt-16 md:-mt-20 lg:-mt-24 mb-6 p-8 relative z-10 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-8">
            {/* SECTION 1: Brand Logo & Main Info */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8 flex-1">
              {/* Profile Image with Glow */}
              <div className="relative -mt-20 flex-shrink-0">
                <div className="rounded-xl p-1.5 bg-gradient-to-br from-blue-400/30 to-indigo-400/30 shadow-xl">
                  <img
                    src={formData.profileImage || "https://cdn.pixabay.com/photo/2016/08/08/09/17/avatar-1577909_1280.png"}
                    alt={formData.name || "Brand"}
                    className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg transition-transform duration-300 hover:scale-105"
                  />
                  {isEditing && (
                    <label className="absolute bottom-2 right-2 p-2 bg-black/60 rounded-full text-white cursor-pointer shadow-lg hover:bg-black/80 transition" title="Upload Profile Image">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, "profileImage")}
                      />
                      <Camera className="w-5 h-5" />
                    </label>
                  )}
                </div>
              </div>

              <div className="flex-1 text-center md:text-left pt-2 md:pt-0">
                {/* Name */}
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    name="name"
                    placeholder="Brand Name"
                    className="text-3xl font-extrabold text-gray-900 bg-gray-50 rounded-lg px-3 py-2 w-full max-w-sm mx-auto md:mx-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                    {formData.name}
                    {formData.isVerified && <Award className="w-5 h-5 text-blue-500" />}
                  </h1>
                )}

                {/* Username Display */}
                <div className="flex items-center mt-1 text-gray-500 justify-center md:justify-start">
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.username}
                      onChange={handleChange}
                      name="username"
                      placeholder="Username"
                      className="bg-gray-50 rounded-lg px-3 py-1.5 w-full max-w-xs focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                  ) : (
                    formData.username && (
                      <span className="text-base font-medium text-gray-600">@{formData.username}</span>
                    )
                  )}
                </div>

                {/* Industry/Title */}
                {isEditing ? (
                  <input
                    type="text"
                    value={formData.industry}
                    onChange={handleChange}
                    name="industry"
                    placeholder="Enter Industry/Title"
                    className="text-base text-gray-600 bg-gray-50 rounded-lg px-3 py-1.5 mt-1 w-full max-w-sm mx-auto md:mx-0 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                ) : (
                  <p className="text-base text-gray-600 mt-1 font-medium">{formData.industry}</p>
                )}

                {/* Location and Join Date */}
                <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-sm text-gray-500 justify-center md:justify-start">
                  {profileData?.createdAt && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-gray-500">Joined</span>
                      <span className="font-semibold">{new Date(profileData.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })}</span>
                    </div>
                  )}
                  {(formData.location.city || formData.location.country) && (
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {isEditing ? (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.location.city || ""}
                            onChange={(e) => handleChange(e)}
                            name="location.city"
                            placeholder="City"
                            className="bg-gray-50 rounded-lg px-2 py-1 w-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                          <input
                            type="text"
                            value={formData.location.country || ""}
                            onChange={(e) => handleChange(e)}
                            name="location.country"
                            placeholder="Country"
                            className="bg-gray-50 rounded-lg px-2 py-1 w-20 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      ) : (
                        <span className="font-medium">
                          {formData.location.city && `${formData.location.city}, `}
                          {formData.location.country}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Social Media Links as Icon Buttons */}
                <div className="flex gap-2 mt-3 justify-center md:justify-start">
                  {formData.socialMedia.instagram && (
                    <a href={`https://instagram.com/${formData.socialMedia.instagram}`} target="_blank" rel="noopener noreferrer" title="Instagram"
                      className="p-2 rounded-full bg-gradient-to-br from-pink-500 to-yellow-500 text-white shadow hover:scale-110 transition">
                      <Instagram className="w-5 h-5" />
                    </a>
                  )}
                  {formData.socialMedia.facebook && (
                    <a href={`https://facebook.com/${formData.socialMedia.facebook}`} target="_blank" rel="noopener noreferrer" title="Facebook"
                      className="p-2 rounded-full bg-gradient-to-br from-blue-600 to-blue-400 text-white shadow hover:scale-110 transition">
                      <Facebook className="w-5 h-5" />
                    </a>
                  )}
                  {formData.socialMedia.twitter && (
                    <a href={`https://twitter.com/${formData.socialMedia.twitter}`} target="_blank" rel="noopener noreferrer" title="Twitter"
                      className="p-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow hover:scale-110 transition">
                      <Twitter className="w-5 h-5" />
                    </a>
                  )}
                  {formData.socialMedia.linkedin && (
                    <a href={`https://linkedin.com/in/${formData.socialMedia.linkedin}`} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                      className="p-2 rounded-full bg-gradient-to-br from-blue-700 to-blue-400 text-white shadow hover:scale-110 transition">
                      <Linkedin className="w-5 h-5" />
                    </a>
                  )}
                </div>

                {/* Brand Values as Pills */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {formData.brandValues.map((value) => (
                    <span key={value} className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold shadow">
                      {value}
                    </span>
                  ))}
                </div>

                {/* Marketing Interests as Pills */}
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.marketingInterests.map((interest) => (
                    <span key={interest} className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold shadow">
                      {interest}
                    </span>
                  ))}
                </div>

                {/* --- Account Verification Status Section --- */}
                <div className="mt-2 mb-4">
                  {verificationLoading ? (
                    <span className="text-gray-500 text-sm flex items-center gap-2"><Shield className="w-4 h-4 animate-spin" />Loading verification status...</span>
                  ) : verificationStatus ? (
                    <div className="flex flex-wrap gap-2 items-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${verificationStatus.overallStatus === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.overallStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        <Shield className="w-4 h-4" />
                        {verificationStatus.overallStatus.charAt(0).toUpperCase() + verificationStatus.overallStatus.slice(1)}
                      </span>
                      {/* Individual verifications */}
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationStatus.email?.status === 'verified' ? 'bg-green-50 text-green-700' : verificationStatus.email?.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}><Mail className="w-3 h-3" />Email</span>
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationStatus.phone?.status === 'verified' ? 'bg-green-50 text-green-700' : verificationStatus.phone?.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}><Phone className="w-3 h-3" />Phone</span>
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationStatus.pan?.status === 'verified' ? 'bg-green-50 text-green-700' : verificationStatus.pan?.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}><FileText className="w-3 h-3" />PAN</span>
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationStatus.gst?.status === 'verified' ? 'bg-green-50 text-green-700' : verificationStatus.gst?.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}><FileBadge className="w-3 h-3" />GST</span>
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationStatus.idProof?.status === 'verified' ? 'bg-green-50 text-green-700' : verificationStatus.idProof?.status === 'rejected' ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}><FileText className="w-3 h-3" />ID Proof</span>
                      <span className={`px-2 py-0.5 rounded flex items-center gap-1 ${verificationStatus.payment?.upi?.status === 'verified' || verificationStatus.payment?.card?.status === 'verified' ? 'bg-green-50 text-green-700' : (verificationStatus.payment?.upi?.status === 'rejected' && verificationStatus.payment?.card?.status === 'rejected') ? 'bg-red-50 text-red-700' : 'bg-gray-100 text-gray-600'}`}><CreditCard className="w-3 h-3" />Payment</span>
                    </div>
                  ) : (
                    <span className="text-gray-500 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />Verification status unavailable</span>
                  )}
                </div>

                {/* Metrics Row */}
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 shadow-md border border-blue-100 flex items-center gap-3 hover:shadow-lg transition">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        ${typeof formData.metrics.totalSpend === 'number' ? formData.metrics.totalSpend.toLocaleString() : '0'}
                      </span>
                      <p className="text-xs text-gray-600">Total Spend</p>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-4 shadow-md border border-purple-100 flex items-center gap-3 hover:shadow-lg transition">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Star className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <span className="text-lg font-bold text-gray-900">
                        {formData.metrics.averageRating.toFixed(1)}
                      </span>
                      <p className="text-xs text-gray-600">Rating</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* SECTION 2: Action Buttons */}
            <div className="flex flex-col md:flex-row justify-between items-center w-full gap-3 mt-2 md:mt-0 md:w-auto md:flex-shrink-0">
              <div className="flex gap-3 justify-center md:justify-end flex-wrap">
                {isEditing ? (
                  <>
                    <button
                      onClick={saveProfileData}
                      disabled={isLoading}
                      className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-lg hover:from-emerald-600 hover:to-green-700 transition duration-200 shadow-lg flex items-center gap-2 font-semibold transform hover:scale-105"
                    >
                      {isLoading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                          Save Changes
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-5 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition duration-200 shadow-lg flex items-center gap-2 font-semibold"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                      </svg>
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    {formData.username && (
                      <Link href={`/brand/${formData.username}`}>
                        <button className="group px-5 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg hover:from-blue-600 hover:to-indigo-700 transition duration-200 shadow-lg flex items-center gap-2 font-semibold transform hover:scale-105" title="View Profile">
                          <Eye className="w-4 h-4 transform group-hover:scale-110 transition-transform" />
                          View Profile
                        </button>
                      </Link>
                    )}
                    <button
                      onClick={() => setIsEditing(true)}
                      className="group p-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition duration-200 shadow-lg flex items-center justify-center transform hover:scale-105"
                      title="Edit Profile"
                    >
                      <Edit2 className="w-5 h-5 transform group-hover:scale-110 transition-transform" />
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">
            {/* Left Column - About Section */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white/90 rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-500" />
                  About
                </h3>
                <div className="mb-4">
                  {isEditing ? (
                    <textarea
                      name="about"
                      value={formData.about}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-sm"
                      placeholder="Tell creators about your brand..."
                    />
                  ) : (
                    <div className="prose max-w-none text-gray-600">
                      <p className="whitespace-pre-line text-sm leading-relaxed">{formData.about || 'No description available.'}</p>
                      <a href="#" className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-1 mt-2 text-sm">
                        See more
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Account Verification Section */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white/90 rounded-2xl shadow-lg p-8 border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-500" />
                  Account Verification
                </h3>
                {verificationLoading ? (
                  <div className="text-gray-500 text-sm flex items-center gap-2"><Shield className="w-4 h-4 animate-spin" />Loading verification status...</div>
                ) : verificationStatus ? (
                  <>
                    <div className="mb-4 flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${verificationStatus.overallStatus === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.overallStatus === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        <Shield className="w-4 h-4" />
                        {verificationStatus.overallStatus.charAt(0).toUpperCase() + verificationStatus.overallStatus.slice(1)}
                      </span>
                    </div>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><Mail className="w-4 h-4" />Email</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verificationStatus.email?.status === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.email?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{verificationStatus.email?.status ? verificationStatus.email.status.charAt(0).toUpperCase() + verificationStatus.email.status.slice(1) : 'Pending'}</span>
                      </li>
                      <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><Phone className="w-4 h-4" />Phone</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verificationStatus.phone?.status === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.phone?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{verificationStatus.phone?.status ? verificationStatus.phone.status.charAt(0).toUpperCase() + verificationStatus.phone.status.slice(1) : 'Pending'}</span>
                      </li>
                      <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><FileText className="w-4 h-4" />PAN</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verificationStatus.pan?.status === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.pan?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{verificationStatus.pan?.status ? verificationStatus.pan.status.charAt(0).toUpperCase() + verificationStatus.pan.status.slice(1) : 'Pending'}</span>
                      </li>
                      <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><FileBadge className="w-4 h-4" />GST</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verificationStatus.gst?.status === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.gst?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{verificationStatus.gst?.status ? verificationStatus.gst.status.charAt(0).toUpperCase() + verificationStatus.gst.status.slice(1) : 'Pending'}</span>
                      </li>
                      <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><FileText className="w-4 h-4" />ID Proof</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${verificationStatus.idProof?.status === 'verified' ? 'bg-green-100 text-green-700' : verificationStatus.idProof?.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{verificationStatus.idProof?.status ? verificationStatus.idProof.status.charAt(0).toUpperCase() + verificationStatus.idProof.status.slice(1) : 'Pending'}</span>
                      </li>
                      <li className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-600 flex items-center gap-1"><CreditCard className="w-4 h-4" />Payment</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${(verificationStatus.payment?.upi?.status === 'verified' || verificationStatus.payment?.card?.status === 'verified') ? 'bg-green-100 text-green-700' : ((verificationStatus.payment?.upi?.status === 'rejected' && verificationStatus.payment?.card?.status === 'rejected') ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}`}>{(verificationStatus.payment?.upi?.status === 'verified' || verificationStatus.payment?.card?.status === 'verified') ? 'Verified' : ((verificationStatus.payment?.upi?.status === 'rejected' && verificationStatus.payment?.card?.status === 'rejected') ? 'Rejected' : 'Pending')}</span>
                      </li>
                    </ul>
                  </>
                ) : (
                  <div className="text-gray-500 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />Verification status unavailable</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Skeleton Loader for Loading State */}
      {isLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/60 z-50">
          <div className="animate-pulse space-y-4 w-full max-w-2xl mx-auto">
            <div className="h-10 bg-gray-200 rounded w-1/3 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded-xl w-full"></div>
            <div className="h-6 bg-gray-200 rounded w-1/4 mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernBrandProfile;
