'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '../ui/button';
import { ArrowRight, ArrowLeft, Plus, Trash2, Check } from 'lucide-react';
import { OnboardingProgressBar } from '../OnboardingProgressBar';
import { toast } from 'react-hot-toast';
import { useCreatorProfileStore } from '../../store/creatorProfileStore';

// Define types for the pricing packages
interface PricingPackage {
  name: string;
  price: number;
  description: string;
  deliveryTime: number;
  revisions: number;
  features: string[];
}

interface PricingPackages {
  basic: PricingPackage;
  standard: PricingPackage;
  premium: PricingPackage;
}

const FEATURE_SUGGESTIONS = [
  "Instagram Reels",
    "Feed Post (Photo or Video)",
    "Carousel Post",
    "Instagram Stories",
    "Unboxing Video",
    "Tutorial / How-to Video",
    "Testimonial / Review",
    "Before & After Content",
    "Transformation / Results-based Posts",
    "Meme or Trend Integration",
    "Behind-the-Scenes Content",
    "Voiceover Reels or Lip Sync",
    "Stop-Motion Video",
    "UGC Creation (brand will post)",
    "Dedicated YouTube Video",
    "Product Review Video",
    "Mention in Existing Video (Mid-roll/Shoutout)",
    "Haul / Collection Video Featuring Brand",
    "Challenge or Trend Video with Product",
    "Vlog Integration (Lifestyle / Travel)",
    "YouTube Shorts (Brand Focused)"
];

export const CreatorPricing = () => {
  const router = useRouter();
  const { updateCurrentProfile } = useCreatorProfileStore();
  
  const [packages, setPackages] = useState<PricingPackages>({
    basic: {
      name: '',
      price: 0,
      description: '',
      deliveryTime: 1,
      revisions: 0,
      features: []
    },
    standard: {
      name: '',
      price: 0,
      description: '',
      deliveryTime: 1,
      revisions: 0,
      features: []
    },
    premium: {
      name: '',
      price: 0,
      description: '',
      deliveryTime: 1,
      revisions: 0,
      features: []
    }
  });
  
  const [customOffers, setCustomOffers] = useState(true);
  const [newFeature, setNewFeature] = useState('');
  const [activePackage, setActivePackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch existing data when component mounts
  useEffect(() => {
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
        console.log('Fetched profile data:', data); // Debug log

        if (data.success && data.data) {
          const profile = data.data;
          
          // Prefill form data if it exists
          if (profile.pricing) {
            const pricing = profile.pricing;
            // Update packages with fetched data
            const newPackages = {
              basic: {
                name: 'Basic Package',
                price: pricing.basic?.price || 0,
                description: pricing.basic?.description || '',
                deliveryTime: pricing.basic?.deliveryTime || 1,
                revisions: pricing.basic?.revisions || 0,
                features: pricing.basic?.deliverables || []
              },
              standard: {
                name: 'Standard Package',
                price: pricing.standard?.price || 0,
                description: pricing.standard?.description || '',
                deliveryTime: pricing.standard?.deliveryTime || 1,
                revisions: pricing.standard?.revisions || 0,
                features: pricing.standard?.deliverables || []
              },
              premium: {
                name: 'Premium Package',
                price: pricing.premium?.price || 0,
                description: pricing.premium?.description || '',
                deliveryTime: pricing.premium?.deliveryTime || 1,
                revisions: pricing.premium?.revisions || 0,
                features: pricing.premium?.deliverables || []
              }
            };
            setPackages(newPackages);
            setCustomOffers(pricing.customPackages !== undefined ? pricing.customPackages : true);
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

  const updatePackage = (pkg: 'basic' | 'standard' | 'premium', field: string, value: any) => {
    setPackages({
      ...packages,
      [pkg]: {
        ...packages[pkg],
        [field]: value
      }
    });
  };
  
  const addFeature = () => {
    if (!newFeature.trim()) return;
    
    const updatedPackages = { ...packages };
    updatedPackages[activePackage].features.push(newFeature.trim());
    
    setPackages(updatedPackages);
    setNewFeature('');
  };
  
  const removeFeature = (pkg: 'basic' | 'standard' | 'premium', index: number) => {
    const updatedPackages = { ...packages };
    updatedPackages[pkg].features.splice(index, 1);
    
    setPackages(updatedPackages);
  };
  
  const validatePricing = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    // Check for required fields
    ['basic', 'standard', 'premium'].forEach((pkg) => {
      const pkgData = packages[pkg as keyof typeof packages];
      
      if (!pkgData.name.trim()) {
        newErrors[`${pkg}.name`] = 'Package name is required';
      }
      
      if (!pkgData.price || pkgData.price <= 0) {
        newErrors[`${pkg}.price`] = 'Valid price is required';
      }
      
      if (!pkgData.description.trim()) {
        newErrors[`${pkg}.description`] = 'Description is required';
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async () => {
    if (validatePricing()) {
      setIsSubmitting(true);
      setApiError(null);
      
      try {
        // Check if all three packages are filled
        const allPackagesFilled = (['basic', 'standard', 'premium'] as Array<'basic' | 'standard' | 'premium'>).every(pkg => {
          const p = packages[pkg];
          return p.name && p.price > 0 && p.description;
        });
        const completionStatus = allPackagesFilled;
        console.log('Pricing completionStatus:', completionStatus);
        if (!allPackagesFilled) {
          setApiError('Please fill all required fields for all packages (name, price, description)');
          toast.error('All packages must be complete');
          setIsSubmitting(false);
          return;
        }

        // Prepare update data (do not overwrite other completionStatus fields)
        let prevCompletion = {};
        try {
          const token = localStorage.getItem('token');
          const prevRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (prevRes.ok) {
            const prevJson = await prevRes.json();
            prevCompletion = prevJson.data?.completionStatus || {};
          }
        } catch {}

        const updateData = {
          pricing: {
            ...packages
          },
          completionStatus: {
            ...prevCompletion,
            pricing: completionStatus
          }
        };
        
        // Log the data being sent to the database
        console.log('Saving pricing data to database:', updateData);
        
        // Save to database using the API
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creators/me`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });

        const result = await response.json();
        console.log('Pricing data saved successfully to MongoDB:', result);

        if (!response.ok) {
          throw new Error(result.message || 'Failed to update profile');
        }
        
        // Update store
        updateCurrentProfile('pricing', updateData.pricing);
        
        // Show success message
        toast.success('Pricing information saved successfully to the database!');
        
        // Navigate to the next step
        router.push('/creator-setup/gallery-portfolio');
      } catch (error: any) {
        console.error('Error saving pricing data to database:', error);
        setApiError(error.message || 'Failed to save pricing data. Please try again.');
        toast.error('Failed to save pricing data. Please try again.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };

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
      <OnboardingProgressBar currentStep={5} />

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Set Your Pricing</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Define your service packages and pricing to attract the right clients.
          </p>
        </div>
      
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Package Tabs */}
          <div className="flex mb-6 border-b">
            {['basic', 'standard', 'premium'].map((pkg) => (
              <button
                key={pkg}
                className={`px-6 py-3 font-medium capitalize ${
                  activePackage === pkg
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActivePackage(pkg as 'basic' | 'standard' | 'premium')}
              >
                {pkg}
              </button>
            ))}
          </div>

          {/* Active Package Editor */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Package Name</label>
                <input
                  type="text"
                  value={packages[activePackage].name}
                  onChange={(e) => updatePackage(activePackage, 'name', e.target.value)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${activePackage}.name`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Basic Package"
                />
                {errors[`${activePackage}.name`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`${activePackage}.name`]}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                <input
                  type="number"
                  value={packages[activePackage].price}
                  onChange={(e) => updatePackage(activePackage, 'price', parseInt(e.target.value) || 0)}
                  className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors[`${activePackage}.price`] ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="1"
                  step="1"
                />
                {errors[`${activePackage}.price`] && (
                  <p className="mt-1 text-sm text-red-500">{errors[`${activePackage}.price`]}</p>
                )}
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={packages[activePackage].description}
                onChange={(e) => updatePackage(activePackage, 'description', e.target.value)}
                className={`w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors[`${activePackage}.description`] ? 'border-red-500' : 'border-gray-300'
                }`}
                rows={3}
                placeholder="Describe what's included in this package"
              ></textarea>
              {errors[`${activePackage}.description`] && (
                <p className="mt-1 text-sm text-red-500">{errors[`${activePackage}.description`]}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Time (days)</label>
                <input
                  type="number"
                  value={packages[activePackage].deliveryTime}
                  onChange={(e) => updatePackage(activePackage, 'deliveryTime', parseInt(e.target.value) || 1)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                  max="30"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Revisions</label>
                <input
                  type="number"
                  value={packages[activePackage].revisions}
                  onChange={(e) => updatePackage(activePackage, 'revisions', parseInt(e.target.value) || 0)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Features</label>
              <div className="mb-4 flex flex-wrap gap-2">
                {packages[activePackage].features.map((feature, index) => (
                  <span key={index} className="flex items-center bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs">
                    {feature}
                    <button
                      type="button"
                      onClick={() => removeFeature(activePackage, index)}
                      className="ml-2 text-blue-500 hover:text-red-500 focus:outline-none"
                      aria-label={`Remove ${feature}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>

              {/* Autocomplete input for features */}
              <div className="relative mb-2">
                <input
                  type="text"
                  value={newFeature}
                  onChange={(e) => setNewFeature(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Type to search or add a custom feature"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newFeature.trim()) {
                      e.preventDefault();
                      const val = newFeature.trim();
                      if (
                        val &&
                        !packages[activePackage].features.includes(val)
                      ) {
                        updatePackage(activePackage, 'features', [...packages[activePackage].features, val]);
                        setNewFeature('');
                      }
                    }
                  }}
                />
                {/* Autocomplete dropdown */}
                {newFeature.trim() && (
                  <div className="absolute z-10 mt-1 w-full bg-white border border-gray-200 rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {FEATURE_SUGGESTIONS.filter(
                      (s) =>
                        s.toLowerCase().includes(newFeature.trim().toLowerCase()) &&
                        !packages[activePackage].features.includes(s)
                    ).length === 0 ? (
                      <div className="px-4 py-2 text-gray-400 text-sm">No suggestions</div>
                    ) : (
                      FEATURE_SUGGESTIONS.filter(
                        (s) =>
                          s.toLowerCase().includes(newFeature.trim().toLowerCase()) &&
                          !packages[activePackage].features.includes(s)
                      ).map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          className="w-full text-left px-4 py-2 hover:bg-blue-50 text-sm text-gray-700"
                          onClick={() => {
                            updatePackage(activePackage, 'features', [...packages[activePackage].features, suggestion]);
                            setNewFeature('');
                          }}
                        >
                          {suggestion}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500">Select from suggestions or add your own. Press Enter to add.</p>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="customOffers"
                checked={customOffers}
                onChange={(e) => setCustomOffers(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="customOffers" className="ml-2 text-sm text-gray-700">
                Allow custom offers (clients can request services outside of these packages)
              </label>
            </div>
          </div>
          
          {/* API Error Message */}
          {apiError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {apiError}
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/creator-setup/description-faq')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous Step</span>
          </Button>
          
          <Button
            type="button"
            onClick={handleSubmit}
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
              <>
                <span>Continue</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};
