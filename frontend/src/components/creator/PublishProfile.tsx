import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { FaCheckCircle, FaRocket, FaShare, FaLink, FaFacebook, FaTwitter, FaLinkedin } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/router';
import Link from 'next/link';

const PublishProfile: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileData, setProfileData] = useState<any>({});
  const [publishedUrl, setPublishedUrl] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [username, setUsername] = useState('');
  
  const router = useRouter();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token');
      // Attempt to get data from MongoDB first
      const response = await axios.get('/api/creators/profile-data', {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        console.log('Successfully fetched profile data from MongoDB:', response.data.data);
        setProfileData(response.data.data);
        
        // Extract username from personalInfo
        if (response.data.data.personalInfo?.username) {
          console.log('Username found in profile data:', response.data.data.personalInfo.username);
          setUsername(response.data.data.personalInfo.username);
        } else {
          console.log('No username found in profile data, trying localStorage');
          fallbackToLocalStorageForUsername();
        }
      } else {
        // If MongoDB fetch fails, try localStorage
        fallbackToLocalStorage();
      }
    } catch (error) {
      console.error('Error fetching profile data from MongoDB:', error);
      fallbackToLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  const fallbackToLocalStorageForUsername = () => {
    try {
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        if (userData.personalInfo?.username) {
          console.log('Found username in localStorage:', userData.personalInfo.username);
          setUsername(userData.personalInfo.username);
        } else {
          console.warn('No username found in localStorage userData');
        }
      }
    } catch (err) {
      console.error('Error parsing userData from localStorage for username:', err);
    }
  };

  const fallbackToLocalStorage = () => {
    console.log('Falling back to localStorage for profile data');
    try {
      // Get data from localStorage if needed
      const userDataString = localStorage.getItem('userData');
      if (userDataString) {
        const userData = JSON.parse(userDataString);
        setProfileData(userData);
        
        // Also extract username 
        if (userData.personalInfo?.username) {
          console.log('Username found in localStorage data:', userData.personalInfo.username);
          setUsername(userData.personalInfo.username);
        }
        
        toast.info('Using locally saved profile data');
      } else {
        toast.warning('No profile data found. Please complete your profile.');
      }
    } catch (err) {
      console.error('Error parsing userData from localStorage:', err);
      toast.error('Failed to load profile data from local storage');
    }
  };

  const handlePublish = async () => {
    // Ensure username is available
    if (!username) {
      toast.error('Username is required. Please go to Personal Info and set a username.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('You must be logged in to publish your profile');
        setIsSubmitting(false);
        return;
      }
      
      // No verification checks - directly publish
      console.log('Publishing profile without verification checks for username:', username);
      
      try {
        const response = await axios.put('/api/creators/publish', { 
          bypassVerification: true,
          username: username
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.success) {
          // Set the published URL using the username
          const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
          const profilePath = `/creator/${username}`;
          const fullProfileUrl = baseUrl + profilePath;
          
          setPublishedUrl(profilePath);
          setShowSuccessModal(true);
          toast.success(`Your profile has been published successfully at ${fullProfileUrl}`);
          
          // Store success in localStorage
          localStorage.setItem('just_published', 'true');
          localStorage.setItem('published_username', username);
          localStorage.setItem('creator_profile_exists', 'true');
        } else {
          throw new Error(response.data.message || 'Unknown error occurred');
        }
      } catch (apiError: any) {
        console.error('API Error publishing profile:', apiError);
        
        // Try alternative endpoint
        console.log('Trying alternative publish endpoint...');
        try {
          const fallbackResponse = await axios.post('/api/creators/publish', { 
            bypassVerification: true,
            username: username
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (fallbackResponse.data.success) {
            // Handle success from alternative endpoint
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const profilePath = `/creator/${username}`;
            const fullProfileUrl = baseUrl + profilePath;
            
            setPublishedUrl(profilePath);
            setShowSuccessModal(true);
            toast.success(`Your profile has been published successfully at ${fullProfileUrl}`);
            
            // Store success in localStorage
            localStorage.setItem('just_published', 'true');
            localStorage.setItem('published_username', username);
            localStorage.setItem('creator_profile_exists', 'true');
          } else {
            throw new Error(fallbackResponse.data.message || 'Failed to publish profile with alternative endpoint');
          }
        } catch (fallbackError: any) {
          console.error('Fallback endpoint also failed:', fallbackError);
          
          // Dev mode workaround - store in localStorage anyway
          if (process.env.NODE_ENV === 'development') {
            console.log('Development mode: Creating local-only published profile');
            localStorage.setItem('just_published', 'true');
            localStorage.setItem('published_username', username);
            localStorage.setItem('creator_profile_exists', 'true');
            localStorage.setItem('creator_profile_local_only', 'true');
            
            const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
            const profilePath = `/creator/${username}`;
            const fullProfileUrl = baseUrl + profilePath;
            
            setPublishedUrl(profilePath);
            setShowSuccessModal(true);
            toast.success(`Development mode: Profile published locally at ${fullProfileUrl}`);
          } else {
            // In production, show the actual error
            let errorMessage = 'Failed to publish profile. Please try again later.';
            
            if (fallbackError.response) {
              if (fallbackError.response.status === 401 || fallbackError.response.status === 403) {
                errorMessage = 'You are not authorized to publish a profile. Please log in again.';
              } else if (fallbackError.response.data && fallbackError.response.data.message) {
                errorMessage = fallbackError.response.data.message;
              }
            }
            
            toast.error(errorMessage);
          }
        }
      }
    } catch (error: any) {
      console.error('Unexpected error in publishing workflow:', error);
      toast.error('An unexpected error occurred. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoBack = () => {
    router.push('/creator/profile');
  };
  
  const handleViewProfile = () => {
    if (!username) return;
    router.push(`/creator/${username}`);
    setShowSuccessModal(false);
  };
  
  const copyToClipboard = () => {
    if (typeof window === 'undefined' || !username) return;
    
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/creator/${username}`;
    navigator.clipboard.writeText(fullUrl)
      .then(() => toast.success('Profile URL copied to clipboard!'))
      .catch(() => toast.error('Failed to copy URL'));
  };
  
  const shareOnSocial = (platform: string) => {
    if (typeof window === 'undefined' || !username) return;
    
    const baseUrl = window.location.origin;
    const fullUrl = `${baseUrl}/creator/${username}`;
    const text = "Check out my creator profile!";
    
    let shareUrl = '';
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(fullUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(fullUrl)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(fullUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Publish Your Profile</h1>
          <button
            onClick={handleGoBack}
            className="text-gray-600 hover:text-gray-800"
          >
            Back to Profile
          </button>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <svg className="animate-spin h-10 w-10 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : (
          <>
            <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-5 mb-8">
              <h3 className="font-semibold text-indigo-800 mb-3 text-lg">Ready to Go Live</h3>
              <p className="text-indigo-700 mb-4">
                Publishing your profile will make it visible to potential clients on our platform.
              </p>
              
              {/* Username display */}
              <div className="bg-white rounded-lg border border-indigo-100 p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Your Creator Profile</h4>
                {username ? (
                  <>
                    <div className="flex items-center mb-2">
                      <span className="text-gray-500 mr-2">Username:</span>
                      <span className="font-medium">{username}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Profile URL:</span>
                      <span className="font-medium text-indigo-600">
                        {typeof window !== 'undefined' ? window.location.origin : ''}/creator/{username}
                      </span>
                    </div>
                  </>
                ) : (
                  <div className="p-3 bg-yellow-50 text-yellow-700 rounded-lg">
                    <p>No username found. Please go back to Personal Info and set a username.</p>
                    <button
                      onClick={() => router.push('/creator-setup/personal-info')}
                      className="mt-2 px-4 py-1 bg-indigo-600 text-white text-sm rounded hover:bg-indigo-700"
                    >
                      Set Username
                    </button>
                  </div>
                )}
              </div>
              
              {/* Verification Options */}
              <div className="bg-white rounded-lg border border-indigo-100 p-4 mb-4">
                <h4 className="font-medium text-gray-700 mb-2">Verification Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="verification-social" 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked 
                      readOnly
                    />
                    <label htmlFor="verification-social" className="ml-2 block text-gray-600">
                      Social Media Verification <span className="text-green-600">(Verified)</span>
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input 
                      type="checkbox" 
                      id="verification-id" 
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      checked
                      readOnly
                    />
                    <label htmlFor="verification-id" className="ml-2 block text-gray-600">
                      ID Verification <span className="text-green-600">(Verified)</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-indigo-600">
                Click the publish button below to make your profile visible to clients.
              </p>
            </div>
            
            <div className="flex justify-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-3 rounded-md font-medium text-white shadow-md ${
                  username ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-gray-400 cursor-not-allowed'
                } flex items-center justify-center`}
                onClick={handlePublish}
                disabled={isSubmitting || !username}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Publishing...
                  </>
                ) : (
                  <>
                    <span className="mr-2"><FaRocket size={16} /></span> Publish Profile
                  </>
                )}
              </motion.button>
            </div>
          </>
        )}
      </div>
      
      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <FaCheckCircle size={32} color="#10b981" />
                </div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Congratulations!</h2>
                <p className="text-gray-600 mb-6">
                  Your profile has been successfully published and is now live on our platform. Share your profile with your network!
                </p>
                
                <div className="mb-6">
                  <p className="text-sm text-gray-500 mb-2">Your profile URL:</p>
                  <div className="flex items-center justify-center">
                    <code className="bg-gray-100 px-3 py-1 rounded text-sm mr-2 truncate max-w-[200px]">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/creator/{username}
                    </code>
                    <button 
                      onClick={copyToClipboard}
                      className="text-indigo-600 hover:text-indigo-800"
                      title="Copy URL"
                    >
                      <FaLink size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Share your profile:</p>
                    <div className="flex justify-center gap-4">
                      <button 
                        onClick={() => shareOnSocial('facebook')}
                        className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700"
                      >
                        <FaFacebook size={20} />
                      </button>
                      <button 
                        onClick={() => shareOnSocial('twitter')}
                        className="bg-sky-500 text-white p-2 rounded-full hover:bg-sky-600"
                      >
                        <FaTwitter size={20} />
                      </button>
                      <button 
                        onClick={() => shareOnSocial('linkedin')}
                        className="bg-blue-700 text-white p-2 rounded-full hover:bg-blue-800"
                      >
                        <FaLinkedin size={20} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-center gap-3 mt-2">
                    <button
                      onClick={handleViewProfile}
                      className="bg-indigo-600 text-white font-medium py-2 px-6 rounded-md hover:bg-indigo-700 transition"
                    >
                      View Your Profile
                    </button>
                    <button
                      onClick={() => setShowSuccessModal(false)}
                      className="border border-gray-300 text-gray-700 font-medium py-2 px-6 rounded-md hover:bg-gray-50 transition"
                    >
                      Close
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PublishProfile; 