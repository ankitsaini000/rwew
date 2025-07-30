import React from 'react';
import { BaseProfile } from '../../types/profiles';
import SocialMediaLinks from '../ui/social-media-links';
import { FaMapMarkerAlt, FaGlobe, FaCheckCircle } from 'react-icons/fa';

interface ProfileHeaderProps {
  profile: BaseProfile;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ profile }) => {
  return (
    <div className="relative mb-8">
      {/* Cover Image */}
      <div className="h-64 bg-gray-200 rounded-t-lg overflow-hidden">
        {profile.coverImage ? (
          <img 
            src={profile.coverImage}
            alt={`${profile.name}'s cover`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-primary-300 to-primary-500" />
        )}
      </div>
      
      {/* Profile Info */}
      <div className="px-6 pb-6">
        <div className="flex flex-col md:flex-row md:items-end">
          {/* Profile Image */}
          <div className="relative -mt-16 md:-mt-24">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white bg-white overflow-hidden">
              {profile.profileImage ? (
                <img 
                  src={profile.profileImage}
                  alt={profile.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            {profile.isVerified && (
              <div className="absolute bottom-2 right-2 text-primary-500 bg-white rounded-full">
                <FaCheckCircle size={24} />
              </div>
            )}
          </div>
          
          {/* Profile Details */}
          <div className="mt-4 md:mt-0 md:ml-6 md:flex-grow">
            <div className="flex items-center">
              <h1 className="text-2xl md:text-3xl font-bold">{profile.name}</h1>
              {profile.isVerified && (
                <span className="ml-2 text-primary-500 md:hidden">
                  <FaCheckCircle size={18} />
                </span>
              )}
            </div>
            
            <p className="text-gray-600 text-sm md:text-base">@{profile.username}</p>
            
            {profile.bio && (
              <p className="mt-2 text-gray-700">{profile.bio}</p>
            )}
            
            <div className="mt-4 flex flex-wrap items-center text-sm text-gray-600 gap-4">
              {profile.location && (
                <div className="flex items-center">
                  <FaMapMarkerAlt className="mr-1" />
                  <span>{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center">
                  <FaGlobe className="mr-1" />
                  <a 
                    href={profile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-500 hover:underline"
                  >
                    {new URL(profile.website).hostname}
                  </a>
                </div>
              )}
            </div>
            
            {/* Social Media Links */}
            {profile.socialLinks && (
              <div className="mt-4">
                <SocialMediaLinks links={profile.socialLinks} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader; 