'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowLeft, Check, CheckCircle, X } from 'lucide-react';
import { createNewCreatorProfile } from '../../services/api';
import toast from 'react-hot-toast';

export const CreatorReviewSubmit = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Load all creator data from localStorage
    const loadData = () => {
      setIsLoading(true);
      const data: any = {};
      
      // Personal info
      try {
        const personalInfo = localStorage.getItem('creatorPersonalInfo');
        if (personalInfo) {
          data.personalInfo = JSON.parse(personalInfo);
        }
      } catch (e) {
        console.error('Error loading personal info:', e);
      }
      
      // Professional info
      try {
        const professionalInfo = localStorage.getItem('creatorProfessionalInfo');
        if (professionalInfo) {
          data.basicInfo = JSON.parse(professionalInfo);
        }
      } catch (e) {
        console.error('Error loading professional info:', e);
      }
      
      // Description & FAQ
      try {
        const descriptionFaq = localStorage.getItem('creatorDescriptionFaq');
        if (descriptionFaq) {
          data.description = JSON.parse(descriptionFaq);
        }
      } catch (e) {
        console.error('Error loading description & FAQ:', e);
      }
      
      // Pricing
      try {
        const pricing = localStorage.getItem('creatorPricing');
        if (pricing) {
          data.pricing = JSON.parse(pricing);
        }
      } catch (e) {
        console.error('Error loading pricing:', e);
      }
      
      // Gallery
      try {
        const gallery = localStorage.getItem('creatorGallery');
        if (gallery) {
          data.gallery = JSON.parse(gallery);
        }
      } catch (e) {
        console.error('Error loading gallery:', e);
      }
      
      // Portfolio
      try {
        const portfolio = localStorage.getItem('creatorPortfolio');
        if (portfolio) {
          data.portfolio = JSON.parse(portfolio);
        }
      } catch (e) {
        console.error('Error loading portfolio:', e);
      }
      
      // Social media
      try {
        const socialInfo = localStorage.getItem('creatorSocialMedia');
        if (socialInfo) {
          data.socialInfo = JSON.parse(socialInfo);
        }
      } catch (e) {
        console.error('Error loading social media info:', e);
      }
      
      setProfileData(data);
      setIsLoading(false);
    };
    
    loadData();
  }, []);
  
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      // Prepare data for API submission
      const submissionData = {
        ...profileData,
        status: 'published'
      };
      
      // Send data to API
      const result = await createNewCreatorProfile(submissionData);
      
      if (result.success) {
        // Set flag in localStorage to indicate profile is published
        localStorage.setItem('creator_profile_exists', 'true');
        localStorage.setItem('just_published', 'true');
        
        // Show success message
        toast.success('Your creator profile has been published!');
        
        // Redirect to profile page
        const username = profileData.personalInfo?.username;
        if (username) {
          router.push(`/${username}`);
        } else {
          router.push('/dashboard');
        }
      } else {
        setSubmitError(result.message || 'Failed to publish your profile.');
        toast.error(result.message || 'Failed to publish your profile.');
      }
    } catch (error: any) {
      console.error('Error submitting profile:', error);
      setSubmitError(error.message || 'An unexpected error occurred.');
      toast.error(error.message || 'An unexpected error occurred.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getCompletionStatus = (section: string) => {
    if (!profileData) return false;
    
    switch (section) {
      case 'personalInfo':
        return !!(profileData.personalInfo?.fullName && profileData.personalInfo?.username);
      case 'basicInfo':
        return !!(profileData.basicInfo?.title && profileData.basicInfo?.category);
      case 'description':
        return !!profileData.description?.detailed;
      case 'pricing':
        return !!(profileData.pricing?.packages?.basic?.price);
      case 'gallery':
        return !!(
          (profileData.gallery?.images && profileData.gallery.images.length > 0) ||
          (profileData.gallery?.videos && profileData.gallery.videos.length > 0)
        );
      case 'portfolio':
        return !!(profileData.portfolio && profileData.portfolio.length > 0);
      case 'socialInfo':
        return !!profileData.socialInfo;
      default:
        return false;
    }
  };
  
  const isReadyToSubmit = () => {
    // Check if essential sections are complete
    return (
      getCompletionStatus('personalInfo') &&
      getCompletionStatus('basicInfo') &&
      getCompletionStatus('pricing')
    );
  };
  
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin h-12 w-12 border-4 border-purple-600 rounded-full border-t-transparent"></div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Progress indicator */}
      <div className="mb-8">
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-purple-600 rounded-full" style={{ width: '100%' }}></div>
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-500">
          <span>Step 8 of 8</span>
          <span>Review & Submit</span>
        </div>
      </div>
      
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Review and Submit Your Profile</h1>
        <p className="text-gray-600 mb-6">Check that everything is correct before publishing your creator profile.</p>
        
        <div className="grid gap-6 mb-8">
          {/* Personal Info */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <div className="flex items-center">
                {getCompletionStatus('personalInfo') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <X className="w-5 h-5 mr-1" />
                    Incomplete
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/personal-info')}
                >
                  Edit
                </Button>
              </div>
            </div>
            {profileData?.personalInfo && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Full Name:</span> {profileData.personalInfo.fullName || 'Not provided'}</p>
                <p><span className="font-medium">Username:</span> {profileData.personalInfo.username || 'Not provided'}</p>
                <p><span className="font-medium">Bio:</span> {profileData.personalInfo.bio || 'Not provided'}</p>
              </div>
            )}
          </div>
          
          {/* Basic Info */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Professional Information</h2>
              <div className="flex items-center">
                {getCompletionStatus('basicInfo') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <X className="w-5 h-5 mr-1" />
                    Incomplete
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/professional-info')}
                >
                  Edit
                </Button>
              </div>
            </div>
            {profileData?.basicInfo && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Title:</span> {profileData.basicInfo.title || 'Not provided'}</p>
                <p><span className="font-medium">Category:</span> {profileData.basicInfo.category || 'Not provided'}</p>
                <p><span className="font-medium">Experience Level:</span> {profileData.basicInfo.level || 'Not provided'}</p>
              </div>
            )}
          </div>
          
          {/* Description & FAQ */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Description & FAQ</h2>
              <div className="flex items-center">
                {getCompletionStatus('description') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <X className="w-5 h-5 mr-1" />
                    Incomplete
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/description-faq')}
                >
                  Edit
                </Button>
              </div>
            </div>
            {profileData?.description && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Brief Description:</span> {profileData.description.brief || 'Not provided'}</p>
                <p><span className="font-medium">FAQ Count:</span> {profileData.description.faq?.length || 0} questions</p>
              </div>
            )}
          </div>
          
          {/* Pricing */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Pricing Packages</h2>
              <div className="flex items-center">
                {getCompletionStatus('pricing') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-red-500 flex items-center">
                    <X className="w-5 h-5 mr-1" />
                    Incomplete
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/pricing')}
                >
                  Edit
                </Button>
              </div>
            </div>
            {profileData?.pricing?.packages && (
              <div className="text-sm text-gray-600">
                <p><span className="font-medium">Basic Package:</span> ${profileData.pricing.packages.basic?.price || 'Not set'}</p>
                <p><span className="font-medium">Standard Package:</span> ${profileData.pricing.packages.standard?.price || 'Not set'}</p>
                <p><span className="font-medium">Premium Package:</span> ${profileData.pricing.packages.premium?.price || 'Not set'}</p>
              </div>
            )}
          </div>
          
          {/* Gallery */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Gallery</h2>
              <div className="flex items-center">
                {getCompletionStatus('gallery') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-yellow-500 flex items-center">
                    <Check className="w-5 h-5 mr-1" />
                    Optional
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/gallery')}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Images:</span> {profileData?.gallery?.images?.length || 0} uploaded</p>
              <p><span className="font-medium">Videos:</span> {profileData?.gallery?.videos?.length || 0} uploaded</p>
            </div>
          </div>
          
          {/* Portfolio */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Portfolio</h2>
              <div className="flex items-center">
                {getCompletionStatus('portfolio') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-yellow-500 flex items-center">
                    <Check className="w-5 h-5 mr-1" />
                    Optional
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/portfolio')}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Portfolio Items:</span> {profileData?.portfolio?.length || 0} added</p>
            </div>
          </div>
          
          {/* Social Media */}
          <div className="border rounded-lg p-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold">Social Media</h2>
              <div className="flex items-center">
                {getCompletionStatus('socialInfo') ? (
                  <span className="text-green-500 flex items-center">
                    <CheckCircle className="w-5 h-5 mr-1" />
                    Complete
                  </span>
                ) : (
                  <span className="text-yellow-500 flex items-center">
                    <Check className="w-5 h-5 mr-1" />
                    Optional
                  </span>
                )}
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="ml-4"
                  onClick={() => router.push('/creator-setup/social-media')}
                >
                  Edit
                </Button>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p><span className="font-medium">Social Platforms:</span> {
                Object.entries(profileData?.socialInfo || {})
                  .filter(([key, value]) => key !== 'other' && value)
                  .length
              } connected</p>
            </div>
          </div>
        </div>
        
        {submitError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <X className="h-5 w-5 text-red-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-col space-y-4">
          <Button
            onClick={handleSubmit}
            className="w-full py-4 text-lg font-medium"
            disabled={!isReadyToSubmit() || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin mr-2">⟳</span>
                Publishing...
              </>
            ) : (
              'Publish Creator Profile'
            )}
          </Button>
          
          {!isReadyToSubmit() && (
            <p className="text-red-500 text-sm text-center">
              Please complete required sections: Personal Information, Professional Information, and Pricing.
            </p>
          )}
        </div>
      </div>
      
      <div className="flex justify-start">
        <Button
          variant="outline"
          onClick={() => router.push('/creator-setup/portfolio')}
          className="flex items-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous Step</span>
        </Button>
      </div>
    </div>
  );
}; 