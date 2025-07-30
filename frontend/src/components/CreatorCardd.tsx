import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaStar, FaHeart, FaRegHeart } from 'react-icons/fa';
import { FaInstagram, FaTwitter, FaLinkedin, FaYoutube, FaFacebook } from 'react-icons/fa';
import { CreatorCardData } from '@/types/creator';

interface CreatorCardProps {
  creator: CreatorCardData;
  onLike?: (id: string) => void;
}

const CreatorCard: React.FC<CreatorCardProps> = ({ creator, onLike }) => {
  const {
    id,
    username,
    fullName,
    avatar,
    category,
    level,
    description,
    rating,
    reviewCount,
    startingPrice,
    isLiked,
    socialLinks,
  } = creator;

  const defaultAvatar = '/images/avatar-placeholder.png';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden transition-all hover:shadow-lg">
      <div className="relative">
        {/* Profile Image */}
        <div className="h-36 bg-gradient-to-r from-blue-500 to-purple-600"></div>
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
          <div className="w-20 h-20 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden">
            <Image
              src={avatar || defaultAvatar}
              alt={fullName}
              width={80}
              height={80}
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="pt-12 p-4">
        {/* Creator Info */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{fullName}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{`@${username}`}</p>
          <div className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-2">
            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 px-2 py-0.5 rounded">
              {category || 'Creator'}
            </span>
            <span className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 px-2 py-0.5 rounded">
              {level || 'Creator'}
            </span>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2 mb-3">{description}</p>
        )}

        {/* Rating */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <FaStar className="text-yellow-400 mr-1" />
            <span className="text-sm font-medium">
              {rating?.toFixed(1) || '0.0'} ({reviewCount || 0} reviews)
            </span>
          </div>
          <div>
            <span className="text-sm font-bold text-gray-900 dark:text-white">From {startingPrice}</span>
          </div>
        </div>

        {/* Social Media */}
        {socialLinks && (
          <div className="flex items-center justify-center space-x-3 mb-3">
            {socialLinks.instagram && (
              <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600">
                <FaInstagram />
              </a>
            )}
            {socialLinks.twitter && (
              <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500">
                <FaTwitter />
              </a>
            )}
            {socialLinks.youtube && (
              <a href={socialLinks.youtube} target="_blank" rel="noopener noreferrer" className="text-red-600 hover:text-red-700">
                <FaYoutube />
              </a>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <Link 
            href={`/profile/${username}`}
            className="text-sm bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-md font-medium"
          >
            View Profile
          </Link>
          <button
            onClick={() => onLike && onLike(id)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            {isLiked ? (
              <FaHeart className="text-red-500" />
            ) : (
              <FaRegHeart className="text-gray-400 hover:text-red-500" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatorCard; 