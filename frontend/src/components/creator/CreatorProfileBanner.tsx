import React from 'react';
import { CheckCircle } from 'lucide-react';

interface CreatorProfileBannerProps {
  fullName: string;
  username: string;
  profileImage?: string;
  isPublished: boolean;
  title?: string;
  rating?: number;
  reviews?: number;
}

const CreatorProfileBanner: React.FC<CreatorProfileBannerProps> = ({
  fullName,
  username,
  profileImage,
  isPublished,
  title,
  rating,
  reviews
}) => {
  return (
    <div className="w-full">
      {/* Status Banner - Only shows when published */}
      {isPublished && (
        <div className="bg-green-500 text-white text-center py-2 text-sm font-medium">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
            <CheckCircle size={16} className="mr-2" />
            This profile has been successfully published and is now visible to the public
          </div>
        </div>
      )}
      
      {/* Creator Banner */}
      <div className="bg-gradient-to-r from-purple-700 to-indigo-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
            {/* Profile Image */}
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden flex-shrink-0 border-4 border-white shadow-lg">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt={fullName} 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/default-avatar.png';
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-4xl">
                  {fullName.charAt(0)}
                </div>
              )}
            </div>
            
            <div className="text-center md:text-left flex-1">
              {/* Creator Name and Verification Badge */}
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold">
                  {fullName || 'Unnamed Creator'}
                </h1>
                {isPublished && (
                  <span className="inline-flex items-center bg-green-500/20 backdrop-blur-sm text-white text-sm px-3 py-1 rounded-full font-medium ml-0 md:ml-3 self-center">
                    <CheckCircle size={14} className="mr-1" />
                    Verified Creator
                  </span>
                )}
              </div>
              
              {/* Username */}
              <div className="text-xl text-white/90 mb-4">
                @{username}
              </div>
              
              {/* Creator Title */}
              {title && (
                <p className="text-lg text-white/80 mb-4">
                  {title}
                </p>
              )}
              
              {/* Stats Row */}
              {rating !== undefined && (
                <div className="flex justify-center md:justify-start gap-4 text-white/90">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-300 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.462a1 1 0 00.95-.69l1.07-3.292z" />
                    </svg>
                    <div>
                      <span className="font-bold">{rating.toFixed(1)}</span>
                      <span className="ml-1">({reviews || '0'} reviews)</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatorProfileBanner; 