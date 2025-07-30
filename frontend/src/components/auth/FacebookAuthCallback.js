import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import ProfileImage from '../common/ProfileImage';

/**
 * Component to handle Facebook authentication callback
 * This component extracts the token from the URL and stores it in localStorage,
 * then redirects the user to the appropriate dashboard based on their role.
 */
const FacebookAuthCallback = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Parse query parameters from URL
        const searchParams = new URLSearchParams(location.search);
        const token = searchParams.get('token');
        const userId = searchParams.get('userId');
        const role = searchParams.get('role');

        if (!token) {
          setError('Authentication failed: No token received');
          setLoading(false);
          return;
        }

        // Store authentication data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId);
        
        // If we have the user's role, set it
        if (role) {
          localStorage.setItem('userRole', role);
        }

        // Fetch user profile data
        try {
          const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
          const response = await axios.get(`${apiBaseUrl}/api/users/me`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          // Store user data for display
          setUserData(response.data);
          
          if (response.data && response.data.role) {
            // Save role from API if not provided in URL
            if (!role) {
              localStorage.setItem('userRole', response.data.role);
            }
            
            // Wait a short delay to show successful login
            setTimeout(() => {
              // Redirect based on role
              switch (response.data.role) {
                case 'brand':
                  navigate('/brand/dashboard');
                  break;
                case 'creator':
                  navigate('/creator/dashboard');
                  break;
                default:
                  navigate('/dashboard');
              }
            }, 1500); // Show success for 1.5 seconds before redirecting
          } else {
            // Default redirect after delay
            setTimeout(() => {
              navigate('/dashboard');
            }, 1500);
          }
        } catch (apiError) {
          console.error('Error fetching user data:', apiError);
          setError('Error loading user profile');
          setLoading(false);
        }
      } catch (err) {
        console.error('Error processing authentication callback:', err);
        setError('Authentication failed. Please try again.');
        setLoading(false);
      }
    };

    handleCallback();
  }, [location, navigate]);

  // Helper function to get appropriate user avatar
  const getUserAvatar = () => {
    if (!userData) return null;
    
    // Use Facebook profile image if available (from socialProfiles)
    if (userData.socialProfiles?.facebook?.id) {
      return `https://graph.facebook.com/${userData.socialProfiles.facebook.id}/picture?type=large`;
    }
    
    // Fallback to regular avatar
    return userData.avatar;
  };

  if (userData) {
    // Success state
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="mb-4">
            <ProfileImage 
              src={getUserAvatar()} 
              alt={userData.fullName || 'User'} 
              size={80}
              className="mx-auto"
            />
          </div>
          <h2 className="text-2xl font-bold text-green-600 mb-2">Login Successful!</h2>
          <p className="mb-1 font-medium">{userData.fullName}</p>
          <p className="text-gray-500 text-sm mb-4">{userData.email}</p>
          <p className="text-sm text-blue-600">
            {userData.loginMethod === 'facebook' ? 'Logged in with Facebook' : 'Logged in successfully'}
          </p>
          <p className="text-xs text-gray-500 mt-4">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="spinner-border animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="mt-3">Completing your authentication...</p>
          <p className="text-xs text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg">
          <div className="text-red-600 mb-4">
            <svg className="h-12 w-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="mb-4">{error}</p>
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Return to Login
          </button>
        </div>
      </div>
    );
  }

  return null; // This will only briefly render before redirection
};

export default FacebookAuthCallback; 