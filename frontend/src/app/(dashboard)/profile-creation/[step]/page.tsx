'use client';

import { FC, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import axios from 'axios';
import { useAuth } from '@/context/AuthContext';

// Steps mapping for UI
const STEPS = {
  'basic-info': {
    label: 'Basic Info',
    step: 1,
    next: 'pricing',
  },
  'pricing': {
    label: 'Pricing',
    step: 2,
    next: 'description',
  },
  'description': {
    label: 'Description',
    step: 3,
    next: 'requirements',
  },
  'requirements': {
    label: 'Requirements',
    step: 4,
    next: 'gallery',
  },
  'gallery': {
    label: 'Gallery',
    step: 5,
    next: 'social-info',
  },
  'social-info': {
    label: 'Social Info',
    step: 6,
    next: 'personal-info',
  },
  'personal-info': {
    label: 'Personal Info',
    step: 7,
    next: 'publish',
  },
  'publish': {
    label: 'Publish',
    step: 8,
    next: '',
  },
};

type StepKey = keyof typeof STEPS;

const ProfileCreationPage: FC = () => {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  
  const [currentStep, setCurrentStep] = useState<StepKey | null>(null);
  const [completionStatus, setCompletionStatus] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<any>(null);
  
  useEffect(() => {
    if (params && params.step && typeof params.step === 'string') {
      setCurrentStep(params.step as StepKey);
    }
  }, [params]);
  
  useEffect(() => {
    // Check authentication and redirect if not logged in
    if (!loading && !isAuthenticated) {
      router.push('/login?callback=/profile-creation/basic-info');
      return;
    }
    
    // Fetch profile data and completion status
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const [completionRes, profileRes] = await Promise.all([
          axios.get('/api/creators/completion-status'),
          axios.get('/api/creators/profile-data')
        ]);
        
        setCompletionStatus(completionRes.data.data.completionStatus);
        setProfileData(profileRes.data.data);
      } catch (error) {
        console.error('Error fetching profile data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated) {
      fetchProfileData();
    }
  }, [isAuthenticated, loading, router]);
  
  // Render the appropriate component based on the current step
  const renderStepComponent = () => {
    if (!currentStep) return null;
    
    switch (currentStep) {
      case 'basic-info':
        return <BasicInfoStep profileData={profileData} onComplete={handleComplete} />;
      case 'pricing':
        return <PricingStep profileData={profileData} onComplete={handleComplete} />;
      case 'description':
        return <DescriptionStep profileData={profileData} onComplete={handleComplete} />;
      case 'requirements':
        return <RequirementsStep profileData={profileData} onComplete={handleComplete} />;
      case 'gallery':
        return <GalleryStep profileData={profileData} onComplete={handleComplete} />;
      case 'social-info':
        return <SocialInfoStep profileData={profileData} onComplete={handleComplete} />;
      case 'personal-info':
        return <PersonalInfoStep profileData={profileData} onComplete={handleComplete} />;
      case 'publish':
        return <PublishStep profileData={profileData} completionStatus={completionStatus} />;
      default:
        return <div>Invalid step</div>;
    }
  };
  
  const handleComplete = async () => {
    // Refresh completion status
    try {
      const res = await axios.get('/api/creators/completion-status');
      setCompletionStatus(res.data.data.completionStatus);
      
      // Navigate to next step if available
      if (currentStep && STEPS[currentStep].next) {
        router.push(`/profile-creation/${STEPS[currentStep].next}`);
      }
    } catch (error) {
      console.error('Error updating completion status:', error);
    }
  };
  
  // Helper to determine step status for progress bar
  const getStepStatus = (stepKey: StepKey) => {
    if (!currentStep || !completionStatus) return 'upcoming';
    
    const currentStepNumber = STEPS[currentStep].step;
    const targetStepNumber = STEPS[stepKey].step;
    
    if (targetStepNumber < currentStepNumber) {
      return completionStatus[stepKey.replace('-', '')] ? 'completed' : 'incomplete';
    } else if (targetStepNumber === currentStepNumber) {
      return 'current';
    } else {
      return 'upcoming';
    }
  };
  
  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-white">
      <Header />
      
      {/* Progress Bar */}
      <div className="bg-gray-50 border-b">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex flex-wrap gap-4 justify-center md:justify-between">
            {Object.entries(STEPS).map(([key, step]) => (
              <div 
                key={key}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer
                  ${getStepStatus(key as StepKey) === 'current' 
                    ? 'bg-purple-100 text-purple-700' 
                    : getStepStatus(key as StepKey) === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-500'
                  }`}
                onClick={() => {
                  // Only allow navigation to completed steps or current step
                  if (getStepStatus(key as StepKey) !== 'upcoming' || key === currentStep) {
                    router.push(`/profile-creation/${key}`);
                  }
                }}
              >
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs
                  ${getStepStatus(key as StepKey) === 'current'
                    ? 'bg-purple-600 text-white'
                    : getStepStatus(key as StepKey) === 'completed'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-300 text-gray-600'
                  }`}
                >
                  {getStepStatus(key as StepKey) === 'completed' ? '✓' : step.step}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-w-3xl mx-auto px-4 py-12">
        {renderStepComponent()}
      </div>
      
      <Footer />
    </div>
  );
};

// Placeholder components for each step - these would be imported from separate files in a real implementation
const BasicInfoStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Basic Information</h1>
    <p className="text-gray-600">
      This is where you'll set up the foundation of your creator profile.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Basic Info Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const PricingStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Pricing</h1>
    <p className="text-gray-600">
      Set up your pricing packages to let clients know what you offer.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Pricing Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const DescriptionStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Description</h1>
    <p className="text-gray-600">
      Explain your services and answer common questions clients might have.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Description Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const RequirementsStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Requirements</h1>
    <p className="text-gray-600">
      Let clients know what information you need to start working on their projects.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Requirements Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const GalleryStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Gallery</h1>
    <p className="text-gray-600">
      Showcase your best work with images, videos, and portfolio links.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Gallery Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const SocialInfoStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Social Information</h1>
    <p className="text-gray-600">
      Connect your social media accounts to boost your credibility.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Social Info Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const PersonalInfoStep = ({ profileData, onComplete }: any) => (
  <div className="space-y-6">
    <h1 className="text-2xl font-bold">Personal Information</h1>
    <p className="text-gray-600">
      Share details about yourself to create a personal connection with clients.
    </p>
    
    {/* Form would go here */}
    <div className="p-8 border rounded-lg bg-gray-50 text-center">
      <p>Personal Info Form Placeholder</p>
      <button 
        className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
        onClick={onComplete}
      >
        Save & Continue
      </button>
    </div>
  </div>
);

const PublishStep = ({ profileData, completionStatus }: any) => {
  const router = useRouter();
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const isReadyToPublish = completionStatus && 
    Object.values(completionStatus).every((value: any) => value === true);
  
  const handlePublish = async () => {
    try {
      setIsPublishing(true);
      setError('');
      
      const response = await axios.put('/api/creators/publish');
      
      if (response.data.success) {
        setSuccess(true);
        // Redirect to published profile after 2 seconds
        setTimeout(() => {
          router.push(`/creator/${response.data.data.profile.personalInfo.username}`);
        }, 2000);
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to publish profile');
    } finally {
      setIsPublishing(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Publish Your Profile</h1>
      <p className="text-gray-600">
        Review your profile and make it live for potential clients to see.
      </p>
      
      {/* Completion status */}
      <div className="p-6 border rounded-lg bg-white">
        <h2 className="text-xl font-medium mb-4">Completion Status</h2>
        
        <div className="space-y-3">
          {completionStatus && Object.entries(completionStatus).map(([key, value]: [string, any]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className={`flex items-center ${value ? 'text-green-600' : 'text-red-600'}`}>
                {value ? (
                  <>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Complete
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Incomplete
                  </>
                )}
              </span>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg">
              {error}
            </div>
          )}
          
          {success ? (
            <div className="p-3 bg-green-100 text-green-700 rounded-lg">
              Your profile has been published successfully! Redirecting...
            </div>
          ) : (
            <button 
              className={`px-6 py-3 rounded-lg font-medium ${
                isReadyToPublish ? 'bg-purple-600 text-white hover:bg-purple-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'
              }`}
              disabled={!isReadyToPublish || isPublishing}
              onClick={handlePublish}
            >
              {isPublishing ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></span>
                  Publishing...
                </span>
              ) : (
                'Publish Profile'
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileCreationPage; 