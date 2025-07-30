"use client";

import React, { useState, useEffect } from "react";
import { DashboardLayout } from "../layout/DashboardLayout";
import { 
  Upload, 
  Save, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Globe, 
  MapPin, 
  X, 
  Plus, 
  Trash2, 
  Loader2,
  DollarSign,
  Clock,
  CheckCircle,
  Image as ImageIcon,
  Video,
  Star
} from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import { API_BASE_URL } from '../../config';
import { getLanguages, getCategories, getTargetAudienceGenders, getTargetAudienceAgeRanges, getSocialMediaPreferences } from '../../services/api';
import { useRouter } from 'next/navigation';

interface CreatorProfile {
  personalInfo: {
    firstName?: string;
    lastName?: string;
    username?: string;
    location?: {
      city?: string;
      state?: string;
      country?: string;
    };
    languages?: { language: string; level: string }[];
    profileImage?: string;
    yearsOfExperience?: number;
  };
  professionalInfo: {
    title?: string;
    category?: string;
    subcategory?: string;
    yearsExperience?: number;
    skills?: string[];
    eventAvailability?: {
      available?: boolean;
      eventTypes?: string[];
      pricing?: string;
      requirements?: string;
      travelWillingness?: boolean;
      preferredLocations?: string[];
    };
    targetAudienceGender?: string;
    targetAudienceAgeRange?: string;
    socialMediaPreference?: string;
    contentType?: string[];
    tags?: string[];
  };
  descriptionFaq: {
    briefDescription?: string;
    longDescription?: string;
    faqs?: Array<{
      question: string;
      answer: string;
    }>;
  };
  socialMedia: {
    instagram?: string;
    youtube?: string;
    subscribers?: number;
    twitter?: string;
    facebook?: string;
    linkedin?: string;
    website?: string;
    primaryPlatform?: string;
  };
  pricing: {
    basic?: {
      price?: number;
      deliveryTime?: string;
      revisions?: number;
      description?: string;
      deliverables?: string[];
    };
    standard?: {
      price?: number;
      deliveryTime?: string;
      revisions?: number;
      description?: string;
      deliverables?: string[];
    };
    premium?: {
      price?: number;
      deliveryTime?: string;
      revisions?: number;
      description?: string;
      deliverables?: string[];
    };
  };
  galleryPortfolio: {
    images?: string[];
    videos?: string[];
    featured?: string[];
  };
}

export const CreatorProfileEdit = () => {
  const { user, token } = useAuth();
  const [profile, setProfile] = useState<CreatorProfile>({
    personalInfo: {},
    professionalInfo: {},
    descriptionFaq: {},
    socialMedia: {},
    pricing: {},
    galleryPortfolio: {}
  });
  const [activeTab, setActiveTab] = useState<string>("personal");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  // Add state for availableLanguages
  const [availableLanguages, setAvailableLanguages] = useState<{ name: string; code: string; levels: string[] }[]>([]);
  // Add state for availableCategories
  const [availableCategories, setAvailableCategories] = useState<{ name: string; subcategories: { name: string }[] }[]>([]);
  // Add state for availableGenders
  const [availableGenders, setAvailableGenders] = useState<{ name: string; code: string }[]>([]);
  // Add state for availableAgeRanges
  const [availableAgeRanges, setAvailableAgeRanges] = useState<{ name: string; code: string }[]>([]);
  // Add state for availableSocialMediaPreferences
  const [availableSocialMediaPreferences, setAvailableSocialMediaPreferences] = useState<{ name: string; code: string }[]>([]);
  const [galleryUploading, setGalleryUploading] = useState(false);

  const router = useRouter();

  // Fetch profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user || !token) return;
      
      try {
        const response = await axios.get(`${API_BASE_URL}/creators/me`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (response.data?.data) {
          setProfile(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        if (axios.isAxiosError(error) && error.response?.status === 403) {
          toast.error("Please log in to access your profile");
        } else if (axios.isAxiosError(error) && error.response?.status === 404) {
          // If profile doesn't exist, create one
          try {
            const createResponse = await axios.post(`${API_BASE_URL}/creators`, {}, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            if (createResponse.data?.data) {
              setProfile(createResponse.data.data);
            }
          } catch (createError) {
            console.error("Error creating profile:", createError);
            toast.error("Failed to create profile");
          }
        } else {
          toast.error("Failed to load profile data");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user, token]);

  // Fetch languages on mount
  useEffect(() => {
    const fetchLanguages = async () => {
      const langs = await getLanguages();
      setAvailableLanguages(langs);
    };
    fetchLanguages();
  }, []);

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      const cats = await getCategories();
      setAvailableCategories(cats);
    };
    fetchCategories();
  }, []);

  // Fetch genders on mount
  useEffect(() => {
    const fetchGenders = async () => {
      const genders = await getTargetAudienceGenders();
      setAvailableGenders(genders);
    };
    fetchGenders();
  }, []);

  // Fetch age ranges on mount
  useEffect(() => {
    const fetchAgeRanges = async () => {
      const ageRanges = await getTargetAudienceAgeRanges();
      setAvailableAgeRanges(ageRanges);
    };
    fetchAgeRanges();
  }, []);

  // Fetch social media preferences on mount
  useEffect(() => {
    const fetchSocialMediaPreferencesList = async () => {
      const prefs = await getSocialMediaPreferences();
      setAvailableSocialMediaPreferences(prefs);
    };
    fetchSocialMediaPreferencesList();
  }, []);

  // Handle input changes
  const handleInputChange = (section: keyof CreatorProfile, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  // Handle nested input changes
  const handleNestedInputChange = (section: keyof CreatorProfile, nestedSection: string, field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [nestedSection]: {
          ...(prev[section] as Record<string, any>)[nestedSection],
          [field]: value
        }
      }
    }));
  };

  // Handle array input changes (for skills, languages, etc.)
  const handleArrayInputChange = (section: keyof CreatorProfile, field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    handleInputChange(section, field, array);
  };

  // Handle nested array input changes
  const handleNestedArrayInputChange = (section: keyof CreatorProfile, nestedSection: string, field: string, value: string) => {
    const array = value.split(',').map(item => item.trim()).filter(Boolean);
    handleNestedInputChange(section, nestedSection, field, array);
  };

  // Handle file upload
  const handleFileUpload = async (file: File, type: 'profile' | 'gallery'): Promise<string> => {
    if (!token) {
      throw new Error('No authentication token available');
    }

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/single`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Upload failed');
      }

      // Return the Cloudinary URL directly
      return response.data.data.fileUrl;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error("Please log in to upload files");
      } else {
        toast.error("Failed to upload file");
      }
      throw error;
    }
  };

  // Handle profile image upload
  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);
    formData.append('imageType', 'profileImage');

    try {
      const response = await axios.post(`${API_BASE_URL}/upload/single`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        // Use the Cloudinary URL directly from the response
        const imageUrl = response.data.data.fileUrl;
        setProfile(prev => ({
          ...prev,
          personalInfo: {
            ...prev.personalInfo,
            profileImage: imageUrl
          }
        }));
        toast.success('Profile image updated successfully');
      } else {
        toast.error('Failed to upload profile image');
      }
    } catch (error) {
      console.error('Error uploading profile image:', error);
      toast.error('Failed to upload profile image');
    }
  };

  // Handle gallery upload
  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'images' | 'videos' | 'featured') => {
    const files = e.target.files;
    if (!files?.length) return;

    setGalleryUploading(true);
    try {
      const uploadPromises = Array.from(files).map(file => handleFileUpload(file, 'gallery'));
      const urls = await Promise.all(uploadPromises);
      const currentUrls = profile.galleryPortfolio[type] || [];
      handleInputChange('galleryPortfolio', type, [...currentUrls, ...urls]);
      toast.success(`${type} uploaded successfully`);
    } catch (error) {
      console.error(`Error uploading ${type}:`, error);
      toast.error(`Failed to upload ${type}`);
    } finally {
      setGalleryUploading(false);
    }
  };

  // Handle FAQ changes
  const handleFaqChange = (index: number, field: 'question' | 'answer', value: string) => {
    setProfile(prev => ({
      ...prev,
      descriptionFaq: {
        ...prev.descriptionFaq,
        faqs: prev.descriptionFaq.faqs?.map((faq, i) => 
          i === index ? { ...faq, [field]: value } : faq
        ) || []
      }
    }));
  };

  const addFaq = () => {
    setProfile(prev => ({
      ...prev,
      descriptionFaq: {
        ...prev.descriptionFaq,
        faqs: [...(prev.descriptionFaq.faqs || []), { question: '', answer: '' }]
      }
    }));
  };

  const removeFaq = (index: number) => {
    setProfile(prev => ({
      ...prev,
      descriptionFaq: {
        ...prev.descriptionFaq,
        faqs: prev.descriptionFaq.faqs?.filter((_, i) => i !== index) || []
      }
    }));
  };

  // Save profile
  const handleSave = async () => {
    if (!user || !token) {
      toast.error("You must be logged in to save your profile");
      return;
    }

    setSaving(true);
    try {
      // Ensure images are objects with a url property
      const fixedProfile = {
        ...profile,
        galleryPortfolio: {
          ...profile.galleryPortfolio,
          images: (profile.galleryPortfolio.images || []).map(img =>
            typeof img === 'string'
              ? { url: img, title: '', description: '', tags: [], order: 0 }
              : img
          ),
          // Optionally, do the same for videos/featured if needed
        }
      };
      const response = await axios.put(`${API_BASE_URL}/creators/me`, fixedProfile, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.data?.data) {
        setProfile(response.data.data);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      if (axios.isAxiosError(error) && error.response?.status === 403) {
        toast.error("Please log in to save your profile");
      } else {
        toast.error("Failed to update profile");
      }
    } finally {
      setSaving(false);
    }
  };

  // TODO: Replace static content type options with dynamic fetch from backend when endpoint is available
  const contentTypeOptions = [
    'Reels', 'Posts', 'Shorts', 'Stories', 'Live', 'Blog', 'Podcast', 'Video', 'Photo', 'Article', 'Other'
  ];

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pt-6 pb-20">
        <div className="max-w-5xl mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit Your Creator Profile</h1>
              <p className="text-gray-600">Update your profile information</p>
            </div>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="flex overflow-x-auto">
              {[
                { id: "personal", label: "Personal Info" },
                { id: "professional", label: "Professional Info" },
                { id: "description", label: "Description & FAQs" },
                { id: "social", label: "Social Media" },
                { id: "pricing", label: "Pricing" },
                { id: "gallery", label: "Gallery & Portfolio" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-3 text-sm font-medium whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-purple-600 border-b-2 border-purple-600"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6">
              {/* Personal Info Tab */}
              {activeTab === "personal" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Personal Information</h2>
                  {/* Profile Image */}
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <label className="w-24 h-24 flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full cursor-pointer overflow-hidden">
                        {profile.personalInfo?.profileImage ? (
                          <img
                            src={profile.personalInfo.profileImage}
                            alt="Profile"
                            className="w-24 h-24 object-cover rounded-full"
                          />
                        ) : (
                          <Upload className="w-6 h-6 text-gray-500" />
                        )}
                        <span className="text-xs text-gray-500 mt-1">Upload Photo</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={handleProfileImageUpload}
                        />
                      </label>
                    </div>
                    <div>
                      <h3 className="font-medium">Profile Picture</h3>
                      <p className="text-sm text-gray-500">Recommended size: 400x400px</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">First Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Your first name"
                        value={profile.personalInfo?.firstName || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'firstName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Last Name <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Your last name"
                        value={profile.personalInfo?.lastName || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'lastName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="@username"
                        value={profile.personalInfo?.username || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'username', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Your state or province"
                        value={profile.personalInfo?.location?.state || ''}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'location', 'state', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Your country"
                        value={profile.personalInfo?.location?.country || ''}
                        onChange={(e) => handleNestedInputChange('personalInfo', 'location', 'country', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Years of experience"
                        value={profile.personalInfo?.yearsOfExperience || ''}
                        onChange={(e) => handleInputChange('personalInfo', 'yearsOfExperience', Number(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Languages</label>
                      {(Array.isArray(profile.personalInfo?.languages) && profile.personalInfo.languages.length > 0) ? (
                        profile.personalInfo.languages.map((lang, idx) => (
                          <div key={idx} className="flex gap-2 mb-2">
                            <select
                              className="w-1/2 p-2 border border-gray-300 rounded-md"
                              value={lang.language}
                              onChange={(e) => {
                                const newLangs = Array.isArray(profile.personalInfo.languages) ? [...profile.personalInfo.languages] : [];
                                newLangs[idx] = { ...newLangs[idx], language: e.target.value };
                                handleInputChange('personalInfo', 'languages', newLangs);
                              }}
                            >
                              <option value="">Select Language</option>
                              {availableLanguages.map((l) => (
                                <option key={l.code} value={l.code}>{l.name}</option>
                              ))}
                            </select>
                            <select
                              className="w-1/2 p-2 border border-gray-300 rounded-md"
                              value={lang.level}
                              onChange={(e) => {
                                const newLangs = Array.isArray(profile.personalInfo.languages) ? [...profile.personalInfo.languages] : [];
                                newLangs[idx] = { ...newLangs[idx], level: e.target.value };
                                handleInputChange('personalInfo', 'languages', newLangs);
                              }}
                            >
                              <option value="">Proficiency Level</option>
                              {(availableLanguages.find(l => l.code === lang.language)?.levels || ["Beginner", "Intermediate", "Fluent"]).map(level => (
                                <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                              ))}
                            </select>
                            <button
                              type="button"
                              className="text-red-500 ml-2"
                              onClick={() => {
                                const newLangs = Array.isArray(profile.personalInfo.languages) ? [...profile.personalInfo.languages] : [];
                                newLangs.splice(idx, 1);
                                handleInputChange('personalInfo', 'languages', newLangs);
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 mb-2">No languages specified</div>
                      )}
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded"
                        onClick={() => {
                          const newLangs = Array.isArray(profile.personalInfo.languages) ? [...profile.personalInfo.languages] : [];
                          newLangs.push({ language: '', level: '' });
                          handleInputChange('personalInfo', 'languages', newLangs);
                        }}
                      >
                        + Add Language
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Professional Info Tab */}
              {activeTab === "professional" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Professional Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Title</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="e.g., Fashion Influencer"
                        value={profile.professionalInfo?.title}
                        onChange={(e) => handleInputChange('professionalInfo', 'title', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={profile.professionalInfo?.category || ''}
                        onChange={(e) => handleInputChange('professionalInfo', 'category', e.target.value)}
                        required
                      >
                        <option value="">Select a category</option>
                        {availableCategories.map((cat) => (
                          <option key={cat.name} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={profile.professionalInfo?.subcategory || ''}
                        onChange={(e) => handleInputChange('professionalInfo', 'subcategory', e.target.value)}
                        required
                        disabled={!profile.professionalInfo?.category}
                      >
                        <option value="">Select a subcategory</option>
                        {availableCategories
                          .find(cat => cat.name === profile.professionalInfo?.category)?.subcategories
                          .map((sub) => (
                            <option key={sub.name} value={sub.name}>{sub.name}</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience Gender</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={profile.professionalInfo?.targetAudienceGender || ''}
                        onChange={(e) => handleInputChange('professionalInfo', 'targetAudienceGender', e.target.value)}
                        required
                      >
                        <option value="">Select gender</option>
                        {availableGenders.map((g) => (
                          <option key={g.code} value={g.code}>{g.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience Age Range</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={profile.professionalInfo?.targetAudienceAgeRange || ''}
                        onChange={(e) => handleInputChange('professionalInfo', 'targetAudienceAgeRange', e.target.value)}
                        required
                      >
                        <option value="">Select an age range</option>
                        {availableAgeRanges.map((age) => (
                          <option key={age.code} value={age.code}>{age.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Social Media Preference</label>
                      <select
                        className="w-full p-2 border border-gray-300 rounded-md"
                        value={profile.professionalInfo?.socialMediaPreference || ''}
                        onChange={(e) => handleInputChange('professionalInfo', 'socialMediaPreference', e.target.value)}
                        required
                      >
                        <option value="">Select Social Media</option>
                        {availableSocialMediaPreferences.map((p) => (
                          <option key={p.code} value={p.code}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Content Type</label>
                      <div className="flex flex-wrap gap-4">
                        {contentTypeOptions.map(type => (
                          <label key={type} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={profile.professionalInfo?.contentType?.includes(type) || false}
                              onChange={e => {
                                const prev = Array.isArray(profile.professionalInfo?.contentType) ? [...profile.professionalInfo.contentType] : [];
                                if (e.target.checked) {
                                  prev.push(type);
                                } else {
                                  const idx = prev.indexOf(type);
                                  if (idx > -1) prev.splice(idx, 1);
                                }
                                handleInputChange('professionalInfo', 'contentType', prev);
                              }}
                              className="accent-blue-600"
                            />
                            {type}
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="Add tags (comma separated)"
                        value={profile.professionalInfo?.tags?.join(', ')}
                        onChange={(e) => handleArrayInputChange('professionalInfo', 'tags', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Event Availability Section */}
                  <div className="mt-8">
                    <h3 className="text-md font-medium mb-4">Event Availability</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Available for Events</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={profile.professionalInfo?.eventAvailability?.available ? 'yes' : 'no'}
                          onChange={(e) => handleNestedInputChange('professionalInfo', 'eventAvailability', 'available', e.target.value === 'yes')}
                        >
                          <option value="yes">Yes</option>
                          <option value="no">No</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Event Types</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="e.g., Fashion Shows, Brand Launches"
                          value={profile.professionalInfo?.eventAvailability?.eventTypes?.join(', ')}
                          onChange={(e) => handleNestedArrayInputChange('professionalInfo', 'eventAvailability', 'eventTypes', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pricing</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Your event pricing"
                          value={profile.professionalInfo?.eventAvailability?.pricing}
                          onChange={(e) => handleNestedInputChange('professionalInfo', 'eventAvailability', 'pricing', e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Travel Willingness</label>
                        <select
                          className="w-full p-2 border border-gray-300 rounded-md"
                          value={typeof profile.professionalInfo?.eventAvailability?.travelWillingness === 'string' 
                            ? profile.professionalInfo.eventAvailability.travelWillingness 
                            : 'local'}
                          onChange={(e) => handleNestedInputChange('professionalInfo', 'eventAvailability', 'travelWillingness', e.target.value)}
                        >
                          <option value="local">Local Only</option>
                          <option value="national">National</option>
                          <option value="international">International</option>
                        </select>
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Locations</label>
                        <input
                          type="text"
                          className="w-full p-2 border border-gray-300 rounded-md"
                          placeholder="Add preferred locations (comma separated)"
                          value={profile.professionalInfo?.eventAvailability?.preferredLocations?.join(', ')}
                          onChange={(e) => handleNestedArrayInputChange('professionalInfo', 'eventAvailability', 'preferredLocations', e.target.value)}
                        />
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
                        <textarea
                          className="w-full p-2 border border-gray-300 rounded-md"
                          rows={3}
                          placeholder="List your event requirements"
                          value={profile.professionalInfo?.eventAvailability?.requirements}
                          onChange={(e) => handleNestedInputChange('professionalInfo', 'eventAvailability', 'requirements', e.target.value)}
                        ></textarea>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Description & FAQs Tab */}
              {activeTab === "description" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Description & FAQs</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Brief Description</label>
                      <input
                        type="text"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        placeholder="A short one-liner about your services"
                        value={profile.descriptionFaq?.briefDescription}
                        onChange={(e) => handleInputChange('descriptionFaq', 'briefDescription', e.target.value)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Detailed Description</label>
                      <textarea
                        className="w-full p-2 border border-gray-300 rounded-md"
                        rows={6}
                        placeholder="Describe your services and expertise"
                        value={profile.descriptionFaq?.longDescription}
                        onChange={(e) => handleInputChange('descriptionFaq', 'longDescription', e.target.value)}
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">FAQs</label>
                      <div className="space-y-4">
                        {profile.descriptionFaq?.faqs?.map((faq, index) => (
                          <div key={index} className="p-4 bg-gray-50 rounded-lg">
                            <input
                              type="text"
                              className="w-full p-2 border border-gray-300 rounded-md mb-2"
                              placeholder="Question"
                              value={faq.question}
                              onChange={(e) => handleFaqChange(index, 'question', e.target.value)}
                            />
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md"
                              rows={2}
                              placeholder="Answer"
                              value={faq.answer}
                              onChange={(e) => handleFaqChange(index, 'answer', e.target.value)}
                            ></textarea>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                removeFaq(index);
                              }}
                              className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                            >
                              <X className="w-4 h-4" />
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          onClick={addFaq}
                          className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                        >
                          <Plus className="w-4 h-4" />
                          Add FAQ
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Social Media Tab */}
              {activeTab === "social" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Social Media</h2>
                  <div className="p-4 bg-gray-50 rounded-lg flex flex-col items-center">
                    <button
                      type="button"
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                      onClick={() => router.push('/creator-setup/social-media')}
                    >
                      Manage & Link Social Media Accounts
                    </button>
                    <p className="mt-2 text-sm text-gray-600">Click to link or manage your social media accounts.</p>
                  </div>
                </div>
              )}

              {/* Pricing Tab */}
              {activeTab === "pricing" && (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium">Pricing Packages</h2>
                  {["basic", "standard", "premium"].map((tier) => (
                    <div key={tier} className="p-6 bg-gray-50 rounded-lg">
                      <h3 className="text-md font-medium mb-4 capitalize">{tier} Package</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</span>
                            <input
                              type="number"
                              className="w-full p-2 pl-8 border border-gray-300 rounded-md"
                              placeholder="0.00"
                              value={profile.pricing?.[tier as keyof typeof profile.pricing]?.price}
                              onChange={(e) => handleNestedInputChange('pricing', tier, 'price', Number(e.target.value))}
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 3-5 days"
                            value={profile.pricing?.[tier as keyof typeof profile.pricing]?.deliveryTime}
                            onChange={(e) => handleNestedInputChange('pricing', tier, 'deliveryTime', e.target.value)}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Revisions</label>
                          <input
                            type="number"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="e.g., 2"
                            value={profile.pricing?.[tier as keyof typeof profile.pricing]?.revisions}
                            onChange={(e) => handleNestedInputChange('pricing', tier, 'revisions', Number(e.target.value))}
                          />
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder={`Describe what's included in the ${tier} package`}
                            value={profile.pricing?.[tier as keyof typeof profile.pricing]?.description}
                            onChange={(e) => handleNestedInputChange('pricing', tier, 'description', e.target.value)}
                          ></textarea>
                        </div>
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Deliverables</label>
                          <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded-md"
                            placeholder="Add deliverables (comma separated)"
                            value={profile.pricing?.[tier as keyof typeof profile.pricing]?.deliverables?.join(', ')}
                            onChange={(e) => handleNestedArrayInputChange('pricing', tier, 'deliverables', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Gallery & Portfolio Tab */}
              {activeTab === "gallery" && (console.log('Gallery Images:', profile.galleryPortfolio.images),
                <div className="bg-white rounded-lg shadow p-8 mt-8 mb-8">
                  {galleryUploading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white bg-opacity-70">
                      <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                    </div>
                  )}
                  
                  {/* Images Section */}
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Images</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profile.galleryPortfolio.images?.map((image, index) => {
                        let imageUrl = "";
                        if (typeof image === "string") {
                          imageUrl = image;
                        } else if (Array.isArray(image)) {
                          imageUrl = (image as string[]).join("");
                        } else if (image && typeof image === "object" && "url" in image && typeof (image as any).url === "string") {
                          imageUrl = (image as { url: string }).url;
                        } else if (image && typeof (image as any)[0] === "string") {
                          imageUrl = Object.values(image).filter(v => typeof v === "string").join("");
                        }
                        return (
                          <div key={index} className="relative">
                            <img
                              src={imageUrl}
                              alt={`Image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                const newImages = profile.galleryPortfolio.images?.filter((_, i) => i !== index);
                                handleInputChange('galleryPortfolio', 'images', newImages);
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                      <label className="aspect-square flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                        <ImageIcon className="w-6 h-6 text-gray-500" />
                        <span className="text-xs text-gray-500 mt-1">Upload Image</span>
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleGalleryUpload(e, 'images')} />
                      </label>
                    </div>
                  </div>

                  {/* Videos Section
                  <div className="space-y-4">
                    <h3 className="text-md font-medium">Videos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {profile.galleryPortfolio.videos?.map((video, index) => (
                        <div key={index} className="relative">
                          <video
                            src={video}
                            className="w-full h-32 object-cover rounded-lg"
                            controls
                            title={`Video ${index + 1}`}
                          ></video>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              const newVideos = profile.galleryPortfolio.videos?.filter((_, i) => i !== index);
                              handleInputChange('galleryPortfolio', 'videos', newVideos);
                            }}
                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <label className="aspect-square flex flex-col items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-lg cursor-pointer">
                        <Video className="w-6 h-6 text-gray-500" />
                        <span className="text-xs text-gray-500 mt-1">Upload Video</span>
                        <input type="file" accept="video/*" className="hidden" onChange={(e) => handleGalleryUpload(e, 'videos')} />
                      </label>
                    </div>
                  </div> */}

                  {/* Featured Work section removed */}
                  <div className="mt-8 mb-2">
                    <h2 className="text-xl font-bold">Portfolio Management</h2>
                    <p className="text-gray-600 mt-2">To add a portfolio, please click the "Add Portfolio" button below.</p>
                  </div>
                  <div className="mt-4 flex justify-end">
                    <button
                      className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-base font-semibold shadow"
                      onClick={() => router.push('/creator-setup/gallery-portfolio')}
                    >
                      Add Portfolio
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
