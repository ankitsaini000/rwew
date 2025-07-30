import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import ProfileImage from '../common/ProfileImage';

/**
 * Component to display user profile information after authentication
 * Safely handles Facebook profile images
 */
const UserProfileDisplay = ({ userId, token }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId || !token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001';
        const response = await axios.get(`${apiBaseUrl}/api/users/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user profile:', err);
        setError('Failed to load user profile');
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, token]);

  // Helper function to get the appropriate avatar URL
  const getAvatarUrl = () => {
    if (!user) return null;
    
    // Check for Facebook profile image in socialProfiles
    if (user.socialProfiles?.facebook?.id) {
      // Use Facebook Graph API to get profile picture
      return `https://graph.facebook.com/${user.socialProfiles.facebook.id}/picture?type=large`;
    }
    
    // Use regular avatar if available
    return user.avatar || null;
  };

  if (loading) {
    return <div className="animate-pulse bg-gray-200 w-10 h-10 rounded-full"></div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <div className="flex items-center space-x-3">
      <ProfileImage
        src={getAvatarUrl()}
        alt={user.fullName || 'User'}
        size={40}
      />
      <div>
        <p className="font-medium">{user.fullName}</p>
        {user.loginMethod === 'facebook' && (
          <p className="text-xs text-blue-600">Connected with Facebook</p>
        )}
      </div>
    </div>
  );
};

UserProfileDisplay.propTypes = {
  userId: PropTypes.string,
  token: PropTypes.string
};

export default UserProfileDisplay; 